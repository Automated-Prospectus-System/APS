"""
Web Scraper for Lesotho Universities
Extracts program and institution data from university websites
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from typing import List, Dict, Optional
from urllib.parse import urljoin
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UniversityScraper:
    """Base class for university web scrapers"""
    
    def __init__(self, base_url: str, timeout: int = 10):
        """Initialize scraper with base URL"""
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs - to be overridden by subclasses"""
        raise NotImplementedError


class NULScraper(UniversityScraper):
    """Scraper for National University of Lesotho (NUL)"""
    
    def __init__(self):
        super().__init__("https://nul.ls/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from NUL"""
        programs = []
        
        # Faculty URLs
        faculties = {
            'Agriculture': 'https://www.nul.ls/agric/',
            'Education': 'https://www.nul.ls/education/',
            'Health Sciences': 'https://www.nul.ls/health/',
            'Humanities': 'https://www.nul.ls/humanities/',
            'Law': 'https://www.nul.ls/law/',
            'Science & Technology': 'https://www.nul.ls/technology/',
            'Social Sciences': 'https://nul.ls/faculty-of-social-sciences/academic-programmes/'
        }
        
        for faculty_name, faculty_url in faculties.items():
            logger.info(f"Scraping NUL - {faculty_name}")
            soup = self.fetch_page(faculty_url)
            
            if soup:
                # Extract programme links and information
                programme_links = soup.find_all(['a', 'li', 'p'], class_=re.compile('program|course|degree'))
                
                for link in programme_links:
                    text = link.get_text(strip=True)
                    
                    # Basic filtering for programme-like text
                    if len(text) > 10 and any(keyword in text.lower() for keyword in 
                                             ['bachelor', 'diploma', 'certificate', 'degree']):
                        program = {
                            'name': text[:150],
                            'university': 'National University of Lesotho',
                            'faculty': faculty_name,
                            'field_of_study': self._map_faculty_to_field(faculty_name),
                            'source_url': faculty_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs
    
    def _map_faculty_to_field(self, faculty_name: str) -> str:
        """Map faculty name to field of study"""
        mapping = {
            'Agriculture': 'Agriculture',
            'Education': 'Education',
            'Health Sciences': 'Medicine',
            'Humanities': 'Humanities',
            'Law': 'Law',
            'Science & Technology': 'Science',
            'Social Sciences': 'Social Sciences'
        }
        return mapping.get(faculty_name, 'Science')


class LPScraper(UniversityScraper):
    """Scraper for Lerotholi Polytechnic (LP)"""
    
    def __init__(self):
        super().__init__("https://www.lp.ac.ls/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from LP"""
        programs = []
        
        # Main programmes page
        programmes_url = "https://www.lp.ac.ls/programmes/"
        logger.info("Scraping Lerotholi Polytechnic Programmes")
        
        soup = self.fetch_page(programmes_url)
        if soup:
            # Look for programme listings
            programme_items = soup.find_all(['div', 'li', 'article'], 
                                          class_=re.compile('program|course|offer|item'))
            
            for item in programme_items:
                title = item.find(['h2', 'h3', 'h4', 'a'])
                
                if title:
                    program_name = title.get_text(strip=True)
                    
                    if len(program_name) > 5:
                        program = {
                            'name': program_name[:150],
                            'university': 'Lerotholi Polytechnic',
                            'qualification_type': 'Diploma',  # LP primarily offers diplomas
                            'field_of_study': self._extract_field_from_name(program_name),
                            'source_url': programmes_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs
    
    def _extract_field_from_name(self, program_name: str) -> str:
        """Extract field of study from program name"""
        fields = {
            'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'electronic'],
            'Business': ['business', 'commerce', 'accounting', 'management'],
            'IT': ['it', 'computer', 'software', 'programming', 'informatics'],
            'Tourism': ['tourism', 'hospitality', 'hotel'],
            'Agriculture': ['agriculture', 'farming', 'agronomy']
        }
        
        program_lower = program_name.lower()
        for field, keywords in fields.items():
            if any(keyword in program_lower for keyword in keywords):
                return field
        
        return 'Engineering'  # Default for polytechnic


class LCEScraper(UniversityScraper):
    """Scraper for Lesotho College of Education (LCE)"""
    
    def __init__(self):
        super().__init__("http://www.lce.ac.ls/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from LCE"""
        programs = []
        
        # Faculty URLs
        faculties = {
            'Education': 'https://www.lce.ac.ls/study-at-lce/',
            'Science': 'http://www.lce.ac.ls/FSciences/',
            'Social Sciences': 'http://www.lce.ac.ls/fSocial/'
        }
        
        for faculty_name, faculty_url in faculties.items():
            logger.info(f"Scraping LCE - {faculty_name}")
            soup = self.fetch_page(faculty_url)
            
            if soup:
                # Extract programme content
                content = soup.find_all(['p', 'li', 'div'], class_=re.compile('program|course|content'))
                
                for item in content:
                    text = item.get_text(strip=True)
                    
                    if 50 < len(text) < 500 and any(keyword in text.lower() 
                        for keyword in ['diploma', 'bachelor', 'degree']):
                        program = {
                            'name': text[:150],
                            'university': 'Lesotho College of Education',
                            'faculty': faculty_name,
                            'field_of_study': 'Education',
                            'source_url': faculty_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs


class BothScraper(UniversityScraper):
    """Scraper for Botho University Lesotho"""
    
    def __init__(self):
        super().__init__("https://lesotho.bothouniversity.com/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from Botho"""
        programs = []
        
        courses_url = "https://lesotho.bothouniversity.com/courses/"
        logger.info("Scraping Botho University Courses")
        
        soup = self.fetch_page(courses_url)
        if soup:
            # Find course listings
            course_items = soup.find_all(['div', 'article', 'li'], 
                                        class_=re.compile('course|program|item'))
            
            for item in course_items:
                title = item.find(['h2', 'h3', 'h4', 'a', 'strong'])
                
                if title:
                    course_name = title.get_text(strip=True)
                    
                    if len(course_name) > 5:
                        program = {
                            'name': course_name[:150],
                            'university': 'Botho University Lesotho',
                            'qualification_type': 'Bachelor',
                            'field_of_study': self._extract_field_from_name(course_name),
                            'source_url': courses_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs
    
    def _extract_field_from_name(self, program_name: str) -> str:
        """Extract field from program name"""
        program_lower = program_name.lower()
        
        if any(word in program_lower for word in ['business', 'commerce', 'management', 'accounting']):
            return 'Business'
        elif any(word in program_lower for word in ['engineering', 'technology', 'it', 'computer']):
            return 'Engineering'
        elif any(word in program_lower for word in ['law']):
            return 'Law'
        
        return 'Business'  # Default for Botho


class LimkokwingScraper(UniversityScraper):
    """Scraper for Limkokwing University"""
    
    def __init__(self):
        super().__init__("https://www.limkokwing.net/lesotho/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from Limkokwing"""
        programs = []
        
        courses_url = "https://www.limkokwing.net/lesotho/academic/courses/"
        logger.info("Scraping Limkokwing University Courses")
        
        soup = self.fetch_page(courses_url)
        if soup:
            # Find course listings
            course_items = soup.find_all(['div', 'article', 'li'], 
                                        class_=re.compile('course|program|item|card'))
            
            for item in course_items:
                title = item.find(['h2', 'h3', 'h4', 'a', 'strong'])
                
                if title:
                    course_name = title.get_text(strip=True)
                    
                    if len(course_name) > 5:
                        program = {
                            'name': course_name[:150],
                            'university': 'Limkokwing University of Creative Technology',
                            'field_of_study': 'Arts',  # Limkokwing specializes in creative programs
                            'source_url': courses_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs


class AUCScraper(UniversityScraper):
    """Scraper for African University College"""
    
    def __init__(self):
        super().__init__("https://www.aucc.ac.ls/")
    
    def extract_programs(self) -> List[Dict]:
        """Extract programs from African University College"""
        programs = []
        
        programmes_url = "https://www.aucc.ac.ls/programmes/"
        logger.info("Scraping African University College Programmes")
        
        soup = self.fetch_page(programmes_url)
        if soup:
            # Find programme listings
            programme_items = soup.find_all(['div', 'article', 'li'], 
                                           class_=re.compile('program|course|item'))
            
            for item in programme_items:
                title = item.find(['h2', 'h3', 'h4', 'a', 'strong'])
                
                if title:
                    prog_name = title.get_text(strip=True)
                    
                    if len(prog_name) > 5:
                        program = {
                            'name': prog_name[:150],
                            'university': 'African University College of Communications',
                            'field_of_study': 'Humanities',
                            'source_url': programmes_url,
                            'source_type': 'website_scrape'
                        }
                        programs.append(program)
        
        return programs


def scrape_all_universities() -> Dict[str, List[Dict]]:
    """Scrape all supported universities"""
    results = {}
    
    scrapers = [
        ('National University of Lesotho', NULScraper()),
        ('Lerotholi Polytechnic', LPScraper()),
        ('Lesotho College of Education', LCEScraper()),
        ('Botho University Lesotho', BothScraper()),
        ('Limkokwing University', LimkokwingScraper()),
        ('African University College', AUCScraper()),
    ]
    
    for uni_name, scraper in scrapers:
        try:
            logger.info(f"Scraping {uni_name}...")
            programs = scraper.extract_programs()
            results[uni_name] = programs
            logger.info(f"  ✓ Found {len(programs)} programs")
            time.sleep(2)  # Be respectful to servers
        except Exception as e:
            logger.error(f"Error scraping {uni_name}: {e}")
            results[uni_name] = []
    
    return results


if __name__ == "__main__":
    import re
    
    # Scrape all universities
    results = scrape_all_universities()
    
    # Save to JSON
    output_file = "./scraped_data.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nScraping complete! Results saved to {output_file}")
    print(f"Total universities: {len(results)}")
    for uni, programs in results.items():
        print(f"  {uni}: {len(programs)} programs found")
