import google.generativeai as genai
from typing import Optional
import json
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
from pypdf import PdfReader
import numpy as np


class GeminiClient:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR and analysis - handles shadows, alignment, quality issues"""
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large (max 4096 pixels on longest side for Gemini)
            max_size = 4096
            if max(image.size) > max_size:
                ratio = max_size / max(image.size)
                new_size = tuple(int(dim * ratio) for dim in image.size)
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # Enhance contrast to handle shadows and poor lighting
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
            
            # Enhance brightness for dark/shadowed images
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(1.2)
            
            # Enhance sharpness for blurry images
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.5)
            
            # Apply slight denoising
            image = image.filter(ImageFilter.MedianFilter(size=3))
            
            print(f"Image preprocessed: {image.size}, mode: {image.mode}")
            return image
            
        except Exception as e:
            print(f"Image preprocessing warning: {e}. Using original image.")
            return image
        
    def _get_language_name(self, code: str) -> str:
        """Get full language name from code"""
        languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'hi': 'Hindi',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'mr': 'Marathi',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'it': 'Italian',
        }
        return languages.get(code, 'English')
    
    def _get_analysis_prompt(self, language: str = 'en', is_image: bool = False) -> str:
        lang_name = self._get_language_name(language)
        
        image_instructions = ""
        if is_image:
            image_instructions = """
SPECIAL INSTRUCTIONS FOR IMAGE ANALYSIS:
- This may be a user-taken photo with shadows, reflections, or poor alignment
- The image might be rotated, skewed, or have uneven lighting
- Text might be partially visible, handwritten, or in various orientations
- Look carefully at ALL visible text, numbers, and medical terms
- If text is unclear, make your best interpretation based on context
- Pay attention to table structures, headers, and reference ranges
- Extract ALL visible lab parameters, even if partially obscured
- If you see handwritten notes or stamps, include them in instructions
- Handle multiple languages or mixed scripts if present
"""
        
        return f"""You are MedLens AI, a medical report explainer assistant.

Analyze the uploaded medical document and extract:
1. Lab parameters with values, reference ranges, and abnormality status
2. Diagnoses mentioned
3. Medications with dosage and frequency
4. Doctor instructions
5. Any visible signs if an image (e.g., X-ray abnormalities)
{image_instructions}
IMPORTANT: Provide ALL explanations, messages, and recommendations in {lang_name} language.
- The "explanation" field must be in {lang_name}
- All "message" fields in risk_flags must be in {lang_name}
- All recommendation items must be in {lang_name}
- All items in "questions_for_doctor" array must be in {lang_name}
- Keep medical terms and values in their original form, but explain them in {lang_name}

**PATIENT-FRIENDLY EXPLANATION MODE**:
For each abnormal value, explain in simple {lang_name}:
- What the parameter means
- Why it matters for health
- Whether it is normal, low, or high
- What symptoms may relate to this value
Example: "Your hemoglobin is 9.8 g/dL, which is low. This means your blood has less oxygen-carrying capacity, which can cause tiredness, weakness, or dizziness."

**RISK FLAGS & ALERTS SYSTEM**:
Identify health risks using a colored flag system:
- 🟢 **Normal**: All parameters within healthy range
- 🟡 **Caution**: Some parameters are borderline or slightly abnormal, needs monitoring
- 🔴 **Critical**: Parameters significantly abnormal, requires immediate medical attention

Specifically identify these conditions when present:
- **Potential Anemia**: Low hemoglobin, low RBC count, low hematocrit
- **Kidney Stress**: Elevated creatinine, high BUN, abnormal eGFR
- **Elevated Cholesterol**: High total cholesterol, high LDL, high triglycerides
- **Diabetes Risks**: High fasting glucose, high HbA1c, high postprandial glucose
- **Signs of Infection**: Elevated WBC count, high neutrophils, high CRP/ESR
- **High BP Indicators**: Mention if BP readings are elevated
- **Liver Issues**: Elevated liver enzymes (ALT, AST, ALP), high bilirubin
- **Thyroid Imbalance**: Abnormal TSH, T3, T4 levels
- **Vitamin Deficiencies**: Low vitamin D, B12, iron, folate
- **Electrolyte Imbalance**: Abnormal sodium, potassium, calcium levels

For each risk flag, provide:
- Category name (e.g., "Anemia Risk", "Kidney Function Alert")
- Level: normal, caution, or critical
- Clear message explaining the risk in {lang_name}
- List of affected parameters

**PERSONALIZED HEALTH GUIDANCE**:
Based on the extracted data, provide SPECIFIC and ACTIONABLE advice:

1. **Diet Recommendations**: Specific foods to eat or avoid
   - For low hemoglobin: "Eat more spinach, eggs, beetroot, lentils, red meat, and iron-rich foods"
   - For high cholesterol: "Increase oats, nuts, fatty fish, reduce saturated fats and fried foods"
   - For diabetes: "Choose whole grains, leafy greens, avoid refined sugars and white bread"
   - For kidney issues: "Limit protein intake, reduce salt, stay hydrated"

2. **Lifestyle Changes**: Specific activities with duration and frequency
   - "Walk 30 minutes daily after dinner to control blood sugar"
   - "Practice stress-reduction techniques like meditation for 15 minutes daily"
   - "Ensure 7-8 hours of sleep nightly"
   - "Avoid smoking and limit alcohol consumption"

3. **Follow-up Tests**: Specific tests to repeat and when
   - "Repeat CBC after 1 month to monitor hemoglobin levels"
   - "Recheck lipid profile in 3 months after dietary changes"
   - "Monitor HbA1c every 3 months for diabetes management"
   - "Check kidney function (creatinine, eGFR) in 2 weeks"

4. **Questions for Doctor**: Relevant questions based on findings
   - "Should I take iron supplements for my low hemoglobin?"
   - "Is my fatigue related to my anemia?"
   - "Do I need medication for my high cholesterol?"
   - "Should I adjust my diabetes medication based on these results?"

Return a JSON structure with these fields:
{{
  "lab_values": [{{"name": "", "value": "", "range": "", "status": "normal|low|high", "explanation": "patient-friendly explanation in {lang_name}"}}],
  "diagnoses": [],
  "medications": [{{"name": "", "dose": "", "frequency": ""}}],
  "instructions": [],
  "risk_flags": [
    {{
      "category": "Risk category name",
      "level": "normal|caution|critical",
      "message": "Detailed explanation in {lang_name}",
      "parameters_affected": ["Parameter1", "Parameter2"]
    }}
  ],
  "explanation": "Overall patient-friendly summary in {lang_name}",
  "diet_recommendations": ["Specific food recommendation in {lang_name}"],
  "lifestyle_recommendations": ["Specific lifestyle change with duration in {lang_name}"],
  "followup_tests": ["Specific test with timeline in {lang_name}"],
  "general_recommendations": ["Other general advice in {lang_name}"],
  "questions_for_doctor": ["Relevant question in {lang_name}"]
}}
"""
    
    async def analyze_medical_report(self, content: bytes, file_type: str, language: str = 'en') -> dict:
        """Analyze medical report using Gemini with multi-language support and enhanced image processing"""
        try:
            # Handle PDF
            if 'pdf' in file_type.lower() or file_type == 'application/pdf':
                print("Processing PDF file...")
                prompt = self._get_analysis_prompt(language, is_image=False)
                pdf_reader = PdfReader(BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                
                print(f"Extracted text length: {len(text)}")
                response = self.model.generate_content([prompt, text])
            
            # Handle images with preprocessing
            elif 'image' in file_type.lower() or file_type in ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']:
                print("Processing image file with enhancement...")
                prompt = self._get_analysis_prompt(language, is_image=True)
                
                # Load and preprocess image
                original_image = Image.open(BytesIO(content))
                print(f"Original image size: {original_image.size}, mode: {original_image.mode}")
                
                # Preprocess for better OCR
                processed_image = self._preprocess_image(original_image)
                
                # Use Gemini's vision capabilities with enhanced image
                response = self.model.generate_content([prompt, processed_image])
            
            # Handle text files (for testing)
            elif 'text' in file_type.lower():
                print("Processing text file...")
                prompt = self._get_analysis_prompt(language, is_image=False)
                text = content.decode('utf-8')
                response = self.model.generate_content([prompt, text])
            
            else:
                raise ValueError(f"Unsupported file type: {file_type}. Please upload a PDF, image (JPEG/PNG), or text file.")
            
            # Parse JSON from response
            result_text = response.text
            print(f"Gemini response length: {len(result_text)}")
            
            # Extract JSON if wrapped in markdown
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response text: {result_text[:500]}")
            # Fallback if JSON parsing fails
            return {
                "explanation": response.text,
                "lab_values": [],
                "diagnoses": [],
                "medications": [],
                "risk_flags": [],
                "diet_recommendations": [],
                "lifestyle_recommendations": [],
                "followup_tests": [],
                "general_recommendations": [],
                "questions_for_doctor": []
            }
        except Exception as e:
            print(f"Error in analyze_medical_report: {e}")
            raise
    
    async def chat_about_report(self, message: str, context: Optional[dict] = None) -> str:
        """Interactive chat about medical report"""
        prompt = f"""You are MedLens AI, helping a patient understand their medical report.

Context from their report:
{json.dumps(context, indent=2) if context else "No report uploaded yet"}

Patient question: {message}

Provide a clear, empathetic, and accurate response. Use simple language.
If the question is about specific values, reference the context.
If they ask about diet, provide specific foods to eat or avoid.
If they ask about lifestyle, provide specific activities and habits.
If they ask about follow-up, suggest specific tests and timelines.
Always remind them to consult their doctor for medical decisions.
"""
        
        response = self.model.generate_content(prompt)
        return response.text
    
    async def translate_analysis(self, result: dict, target_language: str) -> dict:
        """Translate analysis results to target language"""
        lang_name = self._get_language_name(target_language)
        
        prompt = f"""Translate the following medical report analysis to {lang_name}.

IMPORTANT:
- Translate ALL text fields to {lang_name}
- Keep medical terms and values unchanged
- Maintain the exact JSON structure
- Translate: explanation, risk_flags messages, diet_recommendations, lifestyle_recommendations, followup_tests, general_recommendations, questions_for_doctor

Original analysis:
{json.dumps(result, indent=2)}

Return the translated JSON with the same structure."""

        response = self.model.generate_content(prompt)
        result_text = response.text
        
        # Extract JSON if wrapped in markdown
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        translated = json.loads(result_text)
        return translated

    
    async def check_medication_interactions(self, medications: list) -> dict:
        """Check for interactions between medications"""
        prompt = f"""You are a medical AI assistant. Analyze the following medications for potential interactions:

Medications: {', '.join(medications)}

Provide a detailed analysis including:
1. Potential interactions between these medications
2. Severity level (high/moderate/low)
3. Specific recommendations for each interaction
4. General advice for taking these medications

Return JSON format:
{{
  "interactions": [
    {{
      "medications": ["Med1", "Med2"],
      "severity": "high|moderate|low",
      "description": "Description of interaction",
      "recommendation": "What to do"
    }}
  ],
  "general_advice": ["advice1", "advice2"]
}}
"""
        
        response = self.model.generate_content(prompt)
        result_text = response.text
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(result_text)
        except:
            return {"interactions": [], "general_advice": [result_text]}
    
    async def generate_diet_plan(self, conditions: list, diet_type: str, cuisine: str, language: str) -> dict:
        """Generate personalized diet plan"""
        lang_name = self._get_language_name(language)
        
        prompt = f"""You are a nutrition AI assistant. Create a personalized 7-day meal plan in {lang_name}.

Health Conditions: {', '.join(conditions)}
Diet Type: {diet_type}
Cuisine: {cuisine}

Provide:
1. 7-day meal plan with breakfast, lunch, dinner, and snacks
2. Nutritional guidelines specific to the conditions
3. Foods to avoid
4. Portion recommendations

Return JSON format in {lang_name}:
{{
  "meal_plan": [
    {{
      "day": "Day 1",
      "breakfast": "meal description",
      "lunch": "meal description",
      "dinner": "meal description",
      "snacks": "snack options"
    }}
  ],
  "guidelines": ["guideline1", "guideline2"],
  "avoid": ["food1", "food2"]
}}
"""
        
        response = self.model.generate_content(prompt)
        result_text = response.text
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(result_text)
        except:
            return {"meal_plan": [], "guidelines": [result_text], "avoid": []}
    
    async def analyze_health_trends(self, reports_data: list, language: str) -> dict:
        """Analyze health trends across multiple reports with comprehensive patient-friendly analysis"""
        lang_name = self._get_language_name(language)
        
        prompt = f"""You are MedLens AI, a medical trend analyzer. Analyze health trends across these reports in {lang_name}.

IMPORTANT: Extract dates from each report to provide chronological analysis.

Reports Data:
{json.dumps(reports_data, indent=2)}

Provide a COMPREHENSIVE analysis with:

1. **Timeline with Dates**: Extract report dates and show parameter progression chronologically
   - Sort by date (oldest to newest)
   - Show values with dates
   - Calculate time intervals between reports

2. **Patient-Friendly Explanation**: For EACH parameter trend, explain in simple {lang_name}:
   - What the parameter means
   - Why it matters for health
   - Whether the trend is normal, concerning, or improving
   - What symptoms may relate to these changes
   Example: "Your hemoglobin is declining from 12.5 to 11.8 over 3 months, which means your blood has less oxygen-carrying capacity. This can cause tiredness, weakness, or dizziness."

3. **Risk Flags & Alerts**: Identify health risks with colored flag system:
   - 🟢 Normal: Parameters within healthy range and stable
   - 🟡 Caution: Parameters showing concerning trends or borderline values
   - 🔴 Critical: Parameters requiring immediate attention
   Include specific conditions like:
   - Potential anemia (low hemoglobin trend)
   - Kidney stress (creatinine rising)
   - Elevated cholesterol
   - Diabetes risks (high glucose/HbA1c)
   - Signs of infection (high WBC)
   - High BP indicators

4. **Personalized Health Guidance** based on trends:
   - **Diet Recommendations**: Specific foods to address declining parameters
     Example: "For declining hemoglobin, increase intake of spinach, eggs, beetroot, lentils, and iron-rich foods"
   - **Lifestyle Changes**: Specific activities with duration
     Example: "Walk 30 minutes daily after dinner to help control rising blood sugar levels"
   - **Follow-up Tests**: Specific tests with timelines based on trend severity
     Example: "Repeat CBC in 1 month to monitor hemoglobin trend. If still declining, check for iron deficiency"
   - **Questions for Doctor**: Relevant questions based on trends
     Example: "Should I take iron supplements?" "Could my fatigue be related to declining hemoglobin?"

5. **Overall Health Summary**: Based on the MOST RECENT report, provide:
   - Current health status
   - Most concerning trends
   - Positive improvements
   - Priority actions

Return JSON format in {lang_name}:
{{
  "report_dates": [
    {{
      "filename": "report1.pdf",
      "date": "2024-01-15",
      "date_extracted": true
    }}
  ],
  "timeline": [
    {{
      "parameter": "Hemoglobin",
      "unit": "g/dL",
      "values": [
        {{"date": "2024-01-15", "value": "12.5", "status": "normal"}},
        {{"date": "2024-03-20", "value": "12.1", "status": "low"}},
        {{"date": "2024-05-10", "value": "11.8", "status": "low"}}
      ],
      "trend": "declining",
      "explanation": "Patient-friendly explanation in {lang_name}",
      "concern_level": "caution"
    }}
  ],
  "risk_flags": [
    {{
      "category": "Anemia Risk",
      "level": "caution|critical|normal",
      "message": "Detailed explanation in {lang_name}",
      "parameters_affected": ["Hemoglobin", "RBC"]
    }}
  ],
  "patterns": [
    {{
      "type": "warning|improvement|stable",
      "message": "Pattern description in {lang_name}"
    }}
  ],
  "diet_recommendations": ["Specific food recommendation in {lang_name}"],
  "lifestyle_recommendations": ["Specific lifestyle change with duration in {lang_name}"],
  "followup_tests": ["Specific test with timeline in {lang_name}"],
  "questions_for_doctor": ["Relevant question in {lang_name}"],
  "overall_summary": "Comprehensive summary based on most recent report in {lang_name}",
  "most_recent_date": "2024-05-10",
  "time_span": "4 months"
}}
"""
        
        response = self.model.generate_content(prompt)
        result_text = response.text
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(result_text)
        except:
            return {
                "report_dates": [],
                "timeline": [],
                "risk_flags": [],
                "patterns": [],
                "diet_recommendations": [],
                "lifestyle_recommendations": [],
                "followup_tests": [],
                "questions_for_doctor": [],
                "overall_summary": result_text,
                "most_recent_date": None,
                "time_span": None
            }
    
    async def check_symptoms(self, symptoms: str, report_data: dict, language: str) -> dict:
        """Check symptoms and correlate with report data"""
        lang_name = self._get_language_name(language)
        
        context = f"\n\nPatient's Lab Results:\n{json.dumps(report_data, indent=2)}" if report_data else ""
        
        prompt = f"""You are a medical AI assistant. Analyze these symptoms in {lang_name}:

Symptoms: {symptoms}{context}

Provide:
1. Possible causes of these symptoms
2. Correlation with lab results (if provided)
3. Recommendations for what to do
4. Urgency level (high/moderate/low)

Return JSON format in {lang_name}:
{{
  "possible_causes": [
    {{
      "condition": "condition name",
      "explanation": "why this might cause symptoms"
    }}
  ],
  "report_correlation": "how symptoms relate to lab results",
  "recommendations": ["what to do"],
  "urgency": "high|moderate|low"
}}
"""
        
        response = self.model.generate_content(prompt)
        result_text = response.text
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        try:
            return json.loads(result_text)
        except:
            return {
                "possible_causes": [],
                "report_correlation": result_text,
                "recommendations": [],
                "urgency": "moderate"
            }
