"""
Data Loader - Populates MySQL database from extracted prospectuses and web scraped data
"""

import json
import sys
import logging
from pathlib import Path
from typing import Dict, List
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.db_manager import DatabaseManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """Load extracted data into database"""
    
    UNIVERSITY_MAPPING = {
        'National University of Lesotho': 1,
        'Lerotholi Polytechnic': 2,
        'Lesotho College of Education': 3,
        'Botho University Lesotho': 4,
        'Limkokwing University of Creative Technology': 5,
        'African University College of Communications': 6,
        # Alternate names
        'NUL': 1,
        'LP': 2,
        'LCE': 3,
        'Botho': 4,
        'LUCT': 5,
        'AUC': 6,
        'National University of Lesotho (NUL)': 1,
        'Lerotholi Polytechnic (LP)': 2,
    }
    
    def __init__(self):
        """Initialize data loader"""
        self.db = DatabaseManager()
        self.extracted_data = {}
        self.stats = {
            'universities_added': 0,
            'programs_added': 0,
            'errors': 0
        }
    
    def load_extracted_data(self, json_file: str):
        """Load extracted data from JSON file"""
        try:
            with open(json_file, 'r') as f:
                self.extracted_data = json.load(f)
            logger.info(f"Loaded data from {json_file}")
            return True
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return False
    
    def connect_database(self) -> bool:
        """Connect to database"""
        if self.db.connect():
            logger.info("Database connection established")
            return True
        else:
            logger.error("Failed to connect to database")
            return False
    
    def populate_database(self):
        """Populate database with extracted data"""
        if not self.extracted_data:
            logger.error("No extracted data loaded")
            return False
        
        try:
            for source_name, programs in self.extracted_data.items():
                logger.info(f"\nProcessing: {source_name}")
                
                # Map source to university ID
                university_id = self._get_university_id(source_name)
                
                if not university_id:
                    logger.warning(f"Could not map {source_name} to university")
                    continue
                
                # Process each program
                for program in programs:
                    try:
                        self._add_program(program, university_id, source_name)
                    except Exception as e:
                        logger.error(f"Error adding program: {e}")
                        self.stats['errors'] += 1
            
            logger.info(f"\nData population complete")
            logger.info(f"  Programs added: {self.stats['programs_added']}")
            logger.info(f"  Errors: {self.stats['errors']}")
            
            return True
        except Exception as e:
            logger.error(f"Database population failed: {e}")
            return False
    
    def _get_university_id(self, source_name: str) -> int:
        """Get university ID from source name"""
        # Direct mapping first
        if source_name in self.UNIVERSITY_MAPPING:
            return self.UNIVERSITY_MAPPING[source_name]
        
        # Fuzzy matching
        source_lower = source_name.lower()
        for key, uni_id in self.UNIVERSITY_MAPPING.items():
            if key.lower() in source_lower or source_lower in key.lower():
                return uni_id
        
        return None
    
    def _add_program(self, program: Dict, university_id: int, source_name: str):
        """Add a single program to database"""
        # Normalize program data
        program_data = {
            'name': program.get('name', 'Unknown Program')[:255],
            'field_of_study': self._normalize_field(program.get('field_of_study', 'Science')),
            'qualification_type': self._normalize_qualification(program.get('qualification_type', 'Bachelor')),
            'duration_years': program.get('duration_years', 3),
            'description': program.get('description', '')[:500],
            'entry_requirements': program.get('entry_requirements', '')[:500],
            'compulsory_subjects': program.get('compulsory_subjects', []),
            'subject_requirements': program.get('subject_requirements', {}),
            'minimum_score': program.get('minimum_score', 10),
            'admission_email': program.get('admission_email', ''),
            'programme_code': program.get('programme_code', '')
        }
        
        # Add to database
        result = self.db.add_program(program_data, university_id)
        
        if result > 0:
            self.stats['programs_added'] += 1
            
            # Track data source
            source_info = {
                'university_id': university_id,
                'source_type': program.get('source_type', 'extracted_data'),
                'source_url': program.get('source_url', ''),
                'source_file': source_name,
                'extraction_date': datetime.now().date(),
                'data_quality_score': 80
            }
            self.db.add_data_source(source_info)
            
            logger.info(f"  ✓ Added: {program_data['name'][:60]}")
        else:
            self.stats['errors'] += 1
            logger.warning(f"  ✗ Failed to add: {program_data['name'][:60]}")
    
    def _normalize_field(self, field: str) -> str:
        """Normalize field of study name"""
        field_mapping = {
            'engineering': 'Engineering',
            'medicine': 'Medicine',
            'business': 'Business',
            'education': 'Education',
            'law': 'Law',
            'science': 'Science',
            'humanities': 'Humanities',
            'agriculture': 'Agriculture',
            'it': 'IT/Computer Science',
            'computer': 'IT/Computer Science',
            'environmental': 'Environmental Science',
            'arts': 'Arts',
            'tourism': 'Tourism & Hospitality',
            'social': 'Social Sciences'
        }
        
        field_lower = field.lower()
        for key, normalized in field_mapping.items():
            if key in field_lower:
                return normalized
        
        return 'Science'  # Default
    
    def _normalize_qualification(self, qualification: str) -> str:
        """Normalize qualification type"""
        qual_mapping = {
            'bachelor': 'Bachelor',
            'diploma': 'Diploma',
            'certificate': 'Certificate',
            'masters': 'Masters',
            'honours': 'Honours',
            'phd': 'PhD'
        }
        
        qual_lower = qualification.lower()
        for key, normalized in qual_mapping.items():
            if key in qual_lower:
                return normalized
        
        return 'Bachelor'  # Default


def load_pdf_extracted_data():
    """Load data extracted from PDFs"""
    logger.info("=" * 60)
    logger.info("Loading PDF Extracted Data")
    logger.info("=" * 60)
    
    loader = DataLoader()
    
    if not loader.connect_database():
        return False
    
    # Load PDF extracted data
    pdf_data_file = "data_extraction/extracted_data.json"
    if Path(pdf_data_file).exists():
        if loader.load_extracted_data(pdf_data_file):
            loader.populate_database()
    else:
        logger.warning(f"PDF data file not found: {pdf_data_file}")
    
    loader.db.disconnect()
    return True


def load_web_scraped_data():
    """Load data from web scraping"""
    logger.info("=" * 60)
    logger.info("Loading Web Scraped Data")
    logger.info("=" * 60)
    
    loader = DataLoader()
    
    if not loader.connect_database():
        return False
    
    # Load web scraped data
    web_data_file = "data_extraction/scraped_data.json"
    if Path(web_data_file).exists():
        if loader.load_extracted_data(web_data_file):
            loader.populate_database()
    else:
        logger.warning(f"Web data file not found: {web_data_file}")
    
    loader.db.disconnect()
    return True


def load_all_data():
    """Load all extracted data into database"""
    logger.info("\n" + "=" * 60)
    logger.info("APS DATABASE POPULATION")
    logger.info("=" * 60)
    
    success = True
    
    # Try to load PDF data
    if not load_pdf_extracted_data():
        success = False
    
    # Try to load web scraped data
    if not load_web_scraped_data():
        success = False
    
    logger.info("\n" + "=" * 60)
    if success:
        logger.info("✓ Data loading completed")
    else:
        logger.info("✗ Data loading completed with errors")
    logger.info("=" * 60)
    
    return success


if __name__ == "__main__":
    load_all_data()
