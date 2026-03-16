"""
PDF Prospectus Data Extraction Script
Extracts program data from university prospectuses (PDFs)
"""

import PyPDF2
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple

class ProspectusExtractor:
    """Extract program and requirement data from PDF prospectuses"""
    
    # Grade point mapping
    GRADE_POINTS = {'A': 4, 'B': 3, 'C': 2, 'D': 1, 'E': 0}
    
    # Common subject names in Lesotho secondary education
    COMMON_SUBJECTS = [
        'Mathematics', 'English', 'Science', 'Biology', 'Chemistry', 'Physics',
        'Geography', 'History', 'Economics', 'Accounting', 'Government',
        'Computer Science', 'Agricultural Science', 'Home Economics'
    ]
    
    # Common qualification types
    QUALIFICATION_TYPES = ['Bachelor', 'Diploma', 'Certificate', 'Masters', 'Honours']
    
    # Common fields of study
    FIELDS_OF_STUDY = [
        'Engineering', 'Medicine', 'Business', 'Education', 'Law', 'Science',
        'Humanities', 'Agriculture', 'IT', 'Environmental Science', 'Arts',
        'Tourism', 'Social Sciences'
    ]
    
    def __init__(self, pdf_path: str):
        """Initialize with PDF file path"""
        self.pdf_path = pdf_path
        self.text = self._extract_text()
    
    def _extract_text(self) -> str:
        """Extract all text from PDF"""
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_programs(self) -> List[Dict]:
        """
        Extract program information from prospectus text
        Returns list of program dictionaries
        """
        programs = []
        
        # Split text into potential program sections
        sections = self._split_into_sections()
        
        for section in sections:
            program_data = self._parse_program_section(section)
            if program_data:
                programs.append(program_data)
        
        return programs
    
    def _split_into_sections(self) -> List[str]:
        """Split prospectus text into program sections"""
        # Look for program-starting patterns
        patterns = [
            r'(?:Programme|Program|Degree|Course)\s*[:—-].*?(?=(?:Programme|Program|Degree|Course)\s*[:—-]|$)',
            r'(?:Bachelor|Diploma|Certificate).*?(?=(?:Bachelor|Diploma|Certificate)|$)'
        ]
        
        sections = []
        for pattern in patterns:
            matches = re.finditer(pattern, self.text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                sections.append(match.group(0))
        
        return sections if sections else [self.text]
    
    def _parse_program_section(self, section: str) -> Dict:
        """Parse a program section to extract structured data"""
        data = {
            'name': self._extract_program_name(section),
            'qualification_type': self._extract_qualification_type(section),
            'field_of_study': self._extract_field_of_study(section),
            'duration_years': self._extract_duration(section),
            'compulsory_subjects': self._extract_compulsory_subjects(section),
            'subject_requirements': self._extract_subject_requirements(section),
            'minimum_score': self._extract_minimum_score(section),
            'entry_requirements': self._extract_entry_requirements(section),
            'description': self._extract_description(section)
        }
        
        # Only return if name was found
        if data['name']:
            return data
        return None
    
    def _extract_program_name(self, section: str) -> str:
        """Extract program name"""
        # Look for lines starting with "Bachelor", "Diploma", "Certificate", etc.
        patterns = [
            r'(?:(?:Bachelor|Diploma|Certificate|Master).*?(?:in|of)\s+([A-Za-z\s&,]+?)(?:\n|$))',
            r'^([A-Za-z\s&,\-]+(?:Programme|Program|Degree))$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, section, re.MULTILINE | re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 3 and len(name) < 200:
                    return name
        
        return ""
    
    def _extract_qualification_type(self, section: str) -> str:
        """Extract qualification type (Bachelor, Diploma, etc)"""
        for qual_type in self.QUALIFICATION_TYPES:
            if re.search(qual_type, section, re.IGNORECASE):
                return qual_type
        return "Bachelor"  # Default
    
    def _extract_field_of_study(self, section: str) -> str:
        """Extract field of study"""
        for field in self.FIELDS_OF_STUDY:
            if re.search(field, section, re.IGNORECASE):
                return field
        return "Science"  # Default
    
    def _extract_duration(self, section: str) -> int:
        """Extract program duration in years"""
        matches = re.findall(r'(\d+)\s*(?:year|yr)', section, re.IGNORECASE)
        if matches:
            durations = [int(m) for m in matches]
            # Return the most common duration (typically between 2-5 years)
            valid_durations = [d for d in durations if 1 <= d <= 6]
            return valid_durations[0] if valid_durations else 3
        return 3  # Default
    
    def _extract_compulsory_subjects(self, section: str) -> List[str]:
        """Extract compulsory subjects"""
        compulsory = []
        
        # Look for "compulsory", "required", "must" patterns
        patterns = [
            r'(?:Compulsory|Required|Must)[^:]*:(.+?)(?=\n\n|\n[A-Z])',
            r'(?:Compulsory|Required)[^:]*:?([^\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, section, re.IGNORECASE | re.DOTALL)
            for match in matches:
                subjects_str = match.group(1)
                # Clean and extract subject names
                for subject in self.COMMON_SUBJECTS:
                    if subject.lower() in subjects_str.lower():
                        if subject not in compulsory:
                            compulsory.append(subject)
        
        return compulsory
    
    def _extract_subject_requirements(self, section: str) -> Dict:
        """Extract subject-specific requirements"""
        requirements = {}
        
        for subject in self.COMMON_SUBJECTS:
            # Look for patterns like "Mathematics: Grade B" or "Mathematics (B)"
            patterns = [
                rf'{subject}[:\s]+(?:Grade\s+)?([A-E])',
                rf'{subject}\s*\(([A-E])\)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, section, re.IGNORECASE)
                if match:
                    requirements[subject] = match.group(1).upper()
                    break
        
        return requirements
    
    def _extract_minimum_score(self, section: str) -> int:
        """Extract minimum total score required"""
        patterns = [
            r'Minimum\s+(?:total\s+)?(?:score|points?):?\s*(\d+)',
            r'(?:score|points?)\s+(?:of|of at least)?:?\s*(\d+)',
            r'(\d+)\s+(?:points?|score)(?:\s+(?:and|or)\s+above)?'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, section, re.IGNORECASE)
            if matches:
                # Use the last match (usually most specific)
                score = int(matches[-1])
                if 5 <= score <= 20:  # Reasonable range for LGCSE scores
                    return score
        
        return 10  # Default minimum score
    
    def _extract_entry_requirements(self, section: str) -> str:
        """Extract general entry requirements"""
        patterns = [
            r'(?:Entry\s+Requirements?|Requirements?|Admission\s+Requirements?)[:\n](.+?)(?=\n\n|[A-Z][a-z]+[:\n])',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, section, re.IGNORECASE | re.DOTALL)
            if match:
                text = match.group(1).strip()
                if len(text) > 10:
                    return text[:500]  # Limit to 500 chars
        
        return ""
    
    def _extract_description(self, section: str) -> str:
        """Extract program description"""
        # Get first paragraph that looks like a description
        lines = section.split('\n')
        description = ""
        
        for line in lines:
            line = line.strip()
            if len(line) > 20 and not any(keyword in line.upper() for keyword in 
                                          ['GRADE', 'SCORE', 'YEAR', 'DURATION']):
                description = line[:300]
                break
        
        return description


def batch_extract_prospectuses(prospectus_dir: str) -> Dict[str, List[Dict]]:
    """
    Extract data from all prospectuses in a directory
    Returns dictionary with university name as key and programs list as value
    """
    results = {}
    
    prospectus_path = Path(prospectus_dir)
    if not prospectus_path.exists():
        print(f"Directory not found: {prospectus_dir}")
        return results
    
    pdf_files = list(prospectus_path.glob('*.pdf'))
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        try:
            extractor = ProspectusExtractor(str(pdf_file))
            programs = extractor.extract_programs()
            
            # Use filename stem as key
            results[pdf_file.stem] = programs
            print(f"  ✓ Extracted {len(programs)} programs")
        except Exception as e:
            print(f"  ✗ Error processing {pdf_file.name}: {e}")
    
    return results


if __name__ == "__main__":
    # Test extraction
    import os
    prospectus_dir = os.path.join(os.path.dirname(__file__), "prospectuses")
    results = batch_extract_prospectuses(prospectus_dir)
    
    # Save results to JSON
    output_file = os.path.join(os.path.dirname(__file__), "..", "extracted_data.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nExtraction complete! Results saved to {output_file}")
    print(f"Total universities: {len(results)}")
    for uni, programs in results.items():
        print(f"  {uni}: {len(programs)} programs")
