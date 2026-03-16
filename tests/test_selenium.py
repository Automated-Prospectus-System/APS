"""
APS Selenium Test Suite
Tests: 8 end-to-end scenarios covering APIs, login, registration,
       eligibility modal, and programs page APS highlighting.
"""

import json
import os
import subprocess
import sys
import time
import threading
import unittest

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "http://localhost:5001"
USERS_JSON = os.path.join(BASE_DIR, "Database", "users.json")
TEST_USERNAME = "selenium_test_user"
TEST_EMAIL = "selenium_test@aps.test"
TEST_PASSWORD = "testpass99"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_session_auth(driver, username="admin"):
    """Inject authentication into sessionStorage so protected pages load."""
    driver.execute_script(f"""
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', '{username}');
        sessionStorage.setItem('loginTime', new Date().toISOString());
        sessionStorage.setItem('userInfo', JSON.stringify({{
            success: true,
            username: '{username}',
            fullName: 'Test Admin'
        }}));
    """)


def _remove_test_user():
    """Remove test users from users.json (cleanup)."""
    try:
        with open(USERS_JSON) as f:
            data = json.load(f)
        data["users"] = [
            u for u in data["users"]
            if u["username"] not in (TEST_USERNAME, "another_user_xyz")
            and u.get("email", "") != TEST_EMAIL
        ]
        with open(USERS_JSON, "w") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Flask server fixture (module-level)
# ---------------------------------------------------------------------------

_server_proc = None


def start_server():
    global _server_proc
    env = os.environ.copy()
    env["FLASK_ENV"] = "testing"
    _server_proc = subprocess.Popen(
        [sys.executable, os.path.join(BASE_DIR, "Backend", "app_dev.py")],
        env={**env, "APS_TEST_PORT": "5001"},
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Wait until server is accepting connections
    for _ in range(20):
        try:
            requests.get(f"{BASE_URL}/api/health", timeout=1)
            return
        except Exception:
            time.sleep(0.5)
    raise RuntimeError("Flask server failed to start on port 5001")


def stop_server():
    if _server_proc:
        _server_proc.terminate()
        _server_proc.wait()


# ---------------------------------------------------------------------------
# Base test class
# ---------------------------------------------------------------------------

class APSTestCase(unittest.TestCase):
    """Base class: shared driver + wait helper."""

    @classmethod
    def setUpClass(cls):
        opts = Options()
        opts.add_argument("--headless=new")
        opts.add_argument("--no-sandbox")
        opts.add_argument("--disable-dev-shm-usage")
        opts.add_argument("--window-size=1280,900")
        service = Service(ChromeDriverManager().install())
        cls.driver = webdriver.Chrome(service=service, options=opts)
        cls.driver.implicitly_wait(3)
        cls.wait = WebDriverWait(cls.driver, 10)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def go(self, path=""):
        self.driver.get(f"{BASE_URL}/{path}")

    def authenticated_get(self, path=""):
        """Navigate to path with session auth already set."""
        # Set auth on login.html (no redirect there), then go to target page.
        self.go("login.html")
        _set_session_auth(self.driver)
        self.go(path)


# ===========================================================================
# TEST 1 – API: /api/universities returns exactly 3 universities
# ===========================================================================

class Test01UniversitiesAPI(unittest.TestCase):
    def test_exactly_three_universities(self):
        resp = requests.get(f"{BASE_URL}/api/universities")
        self.assertEqual(resp.status_code, 200)
        unis = resp.json()
        self.assertEqual(len(unis), 3, f"Expected 3 universities, got {len(unis)}")
        names = {u["name"] for u in unis}
        self.assertIn("National University of Lesotho", names)
        self.assertIn("Lerotholi Polytechnic", names)
        self.assertIn("Botho University Lesotho", names)


# ===========================================================================
# TEST 2 – API: /api/programs returns 258 programs
# ===========================================================================

class Test02ProgramsAPI(unittest.TestCase):
    def test_258_programs(self):
        resp = requests.get(f"{BASE_URL}/api/programs")
        self.assertEqual(resp.status_code, 200)
        programs = resp.json()
        self.assertEqual(
            len(programs), 258,
            f"Expected 258 programs, got {len(programs)}"
        )

    def test_programs_have_aps_scores(self):
        resp = requests.get(f"{BASE_URL}/api/programs")
        programs = resp.json()
        scores = [p["minimum_score"] for p in programs if p.get("minimum_score") is not None]
        self.assertEqual(len(scores), len(programs), "Some programs are missing minimum_score")
        self.assertTrue(all(9 <= s <= 20 for s in scores),
                        f"Scores out of expected range 9-20: {set(scores)}")


# ===========================================================================
# TEST 3 – Login: valid credentials redirect to home
# ===========================================================================

class Test03LoginValid(APSTestCase):
    def test_valid_login_redirects_to_home(self):
        self.go("login.html")
        self.driver.find_element(By.ID, "username").send_keys("admin")
        self.driver.find_element(By.ID, "password").send_keys("password123")
        self.driver.find_element(By.ID, "loginBtn").click()

        # Success message should appear
        success = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".success-message.show"))
        )
        self.assertIn("Welcome", success.text)

        # Should redirect to home.html within 3 s
        self.wait.until(EC.url_contains("home.html"))
        self.assertIn("home.html", self.driver.current_url)


# ===========================================================================
# TEST 4 – Login: invalid credentials show error, stay on page
# ===========================================================================

class Test04LoginInvalid(APSTestCase):
    def test_invalid_login_shows_error(self):
        self.go("login.html")
        self.driver.find_element(By.ID, "username").send_keys("nobody")
        self.driver.find_element(By.ID, "password").send_keys("wrongpassword")
        self.driver.find_element(By.ID, "loginBtn").click()

        error = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".error-message.show"))
        )
        self.assertTrue(len(error.text) > 0, "Error message should not be empty")
        self.assertIn("login.html", self.driver.current_url)


# ===========================================================================
# TEST 5 – Home page: eligibility form has exactly 6 subject rows
# ===========================================================================

class Test05EligibilityFormStructure(APSTestCase):
    def test_six_subject_rows(self):
        self.authenticated_get("home.html")

        rows = self.wait.until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "#subjectRows .subject-row")
            )
        )
        self.assertEqual(len(rows), 6, f"Expected 6 subject rows, got {len(rows)}")

    def test_each_row_has_subject_and_grade_selects(self):
        self.authenticated_get("home.html")
        self.wait.until(EC.presence_of_element_located((By.ID, "subjectRows")))

        for i in range(1, 7):
            subj = self.driver.find_element(By.ID, f"subjName{i}")
            grade = self.driver.find_element(By.ID, f"subjGrade{i}")
            self.assertIsNotNone(subj)
            self.assertIsNotNone(grade)

        # Verify LGCSE subjects appear in the first dropdown
        select = Select(self.driver.find_element(By.ID, "subjName1"))
        options = [o.get_attribute("value") for o in select.options]
        self.assertIn("Mathematics", options)
        self.assertIn("English Language", options)
        self.assertIn("Biology", options)


# ===========================================================================
# TEST 6 – Home page: fill 6 subjects → eligibility modal appears with score
# ===========================================================================

class Test06EligibilityModal(APSTestCase):
    def test_modal_appears_with_aps_score(self):
        self.authenticated_get("home.html")
        self.wait.until(EC.presence_of_element_located((By.ID, "subjectRows")))

        subjects = [
            ("Mathematics", "A"),
            ("English Language", "B"),
            ("Biology", "C"),
            ("Chemistry", "B"),
            ("Physics", "A"),
            ("History", "C"),
        ]
        for i, (subj, grade) in enumerate(subjects, start=1):
            Select(self.driver.find_element(By.ID, f"subjName{i}")).select_by_value(subj)
            Select(self.driver.find_element(By.ID, f"subjGrade{i}")).select_by_value(grade)

        # A=4, B=3, C=2, D=1, E=0 → 4+3+2+3+4+2 = 18
        expected_score = 18

        self.driver.find_element(
            By.XPATH, "//button[contains(., 'Check Results')]"
        ).click()

        # Modal should become visible
        modal = self.wait.until(
            EC.visibility_of_element_located((By.ID, "eligibilityModal"))
        )
        self.assertIn("active", modal.get_attribute("class"))

        # Score display should show correct value
        score_el = self.wait.until(
            EC.presence_of_element_located((By.ID, "modalScore"))
        )
        self.assertEqual(score_el.text, f"{expected_score}/24")

        # Modal content should list at least one programme
        content = self.wait.until(
            EC.presence_of_element_located((By.ID, "modalContent"))
        )
        self.wait.until(lambda d: "prog-item" in content.get_attribute("innerHTML") or
                                  "No programmes" in content.text)
        prog_items = self.driver.find_elements(By.CSS_SELECTOR, "#modalContent .prog-item")
        self.assertGreater(len(prog_items), 0, "No programme items rendered in modal")


# ===========================================================================
# TEST 7 – Registration: new user saves to users.json and can log in
# ===========================================================================

class Test07Registration(APSTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        _remove_test_user()  # ensure clean slate

    @classmethod
    def tearDownClass(cls):
        _remove_test_user()
        super().tearDownClass()

    def test_a_register_saves_and_login_works(self):
        # --- Step 1: register via UI ---
        self.go("register.html")
        self.driver.find_element(By.ID, "fullName").send_keys("Selenium Tester")
        self.driver.find_element(By.ID, "username").send_keys(TEST_USERNAME)
        self.driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
        self.driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        self.driver.find_element(By.ID, "confirmPassword").send_keys(TEST_PASSWORD)
        self.driver.find_element(By.CSS_SELECTOR, ".register-btn").click()

        success = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".message.success"))
        )
        self.assertIn("successful", success.text.lower())

        # --- Step 2: verify user saved in users.json ---
        with open(USERS_JSON) as f:
            data = json.load(f)
        usernames = [u["username"] for u in data["users"]]
        self.assertIn(TEST_USERNAME, usernames, "User not saved to users.json")

        # --- Step 3: login with new credentials ---
        self.go("login.html")
        self.driver.find_element(By.ID, "username").send_keys(TEST_USERNAME)
        self.driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        self.driver.find_element(By.ID, "loginBtn").click()

        login_success = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".success-message.show"))
        )
        self.assertIn("Welcome", login_success.text)

    def test_b_duplicate_email_rejected(self):
        resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "username": "another_user_xyz",
                "email": TEST_EMAIL,
                "password": "pass123",
            },
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Email", resp.json().get("error", ""))


# ===========================================================================
# TEST 8 – Programs page: Min APS shown on cards; ?score=16 highlights eligible
# ===========================================================================

class Test08ProgramsPage(APSTestCase):
    def test_min_aps_shown_on_cards(self):
        self.authenticated_get("programs.html")

        # Wait for at least one card to render
        self.wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#programsContainer .program-card")
            )
        )
        cards = self.driver.find_elements(
            By.CSS_SELECTOR, "#programsContainer .program-card"
        )
        self.assertGreater(len(cards), 0)

        # Every card should contain "Min APS:" text
        for card in cards[:10]:  # check first 10 to keep test fast
            self.assertIn("Min APS:", card.text,
                          f"Card missing 'Min APS:': {card.text[:80]}")

    def test_score_param_shows_banner_and_highlights(self):
        self.authenticated_get("programs.html?score=16")

        # Score banner should be visible
        banner = self.wait.until(
            EC.visibility_of_element_located((By.ID, "scoreBanner"))
        )
        self.assertIn("16/24", banner.text)

        # Wait for cards
        self.wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "#programsContainer .program-card")
            )
        )

        # At least some cards should have .eligible class
        eligible_cards = self.driver.find_elements(
            By.CSS_SELECTOR, "#programsContainer .program-card.eligible"
        )
        self.assertGreater(
            len(eligible_cards), 0,
            "No cards marked as eligible for score=16"
        )

        # Eligible cards should show the 'Eligible' badge
        first_badge = eligible_cards[0].find_element(
            By.CSS_SELECTOR, ".eligible-badge"
        )
        self.assertIsNotNone(first_badge)


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("APS Selenium Test Suite")
    print("=" * 60)

    print("\n[setup] Cleaning up any leftover test users ...")
    _remove_test_user()

    print("[setup] Starting Flask server on port 5001 ...")
    start_server()
    print("[setup] Server ready.\n")

    try:
        loader = unittest.TestLoader()
        suite = unittest.TestSuite()
        for cls in [
            Test01UniversitiesAPI,
            Test02ProgramsAPI,
            Test03LoginValid,
            Test04LoginInvalid,
            Test05EligibilityFormStructure,
            Test06EligibilityModal,
            Test07Registration,
            Test08ProgramsPage,
        ]:
            suite.addTests(loader.loadTestsFromTestCase(cls))

        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
    finally:
        print("\n[teardown] Stopping server ...")
        stop_server()
        print("[teardown] Done.")

    sys.exit(0 if result.wasSuccessful() else 1)
