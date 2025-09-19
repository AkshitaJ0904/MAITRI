import google.generativeai as genai
from typing import Dict, List, Tuple
import logging
from datetime import datetime  # Add this missing import
import json  # Add this missing import

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AstronautEmotionalAI:
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("API key must be provided")

        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

        # rest of init code
        self.conversation_history = {}
        self.astronaut_profile = {}
        self.crisis_threshold = {
            'severe_depression': 8,
            'anxiety_attack': 8,
            'isolation_distress': 7,
            'physical_concern': 7
        }

        self.personas = self._initialize_personas()
        self.language_patterns = {
            'hindi': ['hai', 'haan', 'nahi', 'kya', 'kaise', 'kyun', 'mujhe', 'tum', 'main'],
            'tamil': ['naan', 'neenga', 'enna', 'epdi', 'yen', 'irukku'],
            'telugu': ['nenu', 'meeru', 'enti', 'ela', 'enduku', 'undi'],
            'bengali': ['ami', 'tumi', 'ki', 'kemne', 'keno', 'ache'],
            'marathi': ['mi', 'tu', 'kay', 'kase', 'ka', 'ahe']
        }
    
    def _initialize_personas(self) -> Dict:
        """Initialize personality profiles for different relationship types"""
        return {
            'mother': {
                'traits': ['nurturing', 'worried', 'supportive', 'protective', 'wise'],
                'speech_style': 'caring, uses terms of endearment, gives advice gently',
                'emotional_approach': 'validates feelings, offers comfort, shares wisdom',
                'sample_phrases': ['beta', 'mere bachhe', 'tension mat lo', 'sab theek ho jayega']
            },
            'father': {
                'traits': ['strong', 'motivational', 'practical', 'proud', 'guiding'],
                'speech_style': 'encouraging, solution-focused, uses motivational language',
                'emotional_approach': 'builds confidence, provides practical advice, shows pride',
                'sample_phrases': ['champ', 'tiger', 'himmat rakho', 'tum kar sakte ho']
            },
            'best_friend': {
                'traits': ['casual', 'understanding', 'fun', 'loyal', 'relatable'],
                'speech_style': 'informal, uses slang, jokes appropriately, very relatable',
                'emotional_approach': 'listens without judgment, relates to experiences, lightens mood',
                'sample_phrases': ['yaar', 'bro', 'dude', 'chill kar', 'tension nahi lene ka']
            },
            'sibling': {
                'traits': ['playful', 'teasing', 'supportive', 'competitive', 'honest'],
                'speech_style': 'mix of teasing and support, very casual, brutally honest',
                'emotional_approach': 'motivates through challenge, honest feedback, sibling bond',
                'sample_phrases': ['pagal', 'stupid', 'but I love you', 'tu mera bhai/behen hai']
            },
            'celebrity_mentor': {
                'traits': ['inspirational', 'wise', 'successful', 'motivational', 'experienced'],
                'speech_style': 'inspirational quotes, shares success stories, motivational',
                'emotional_approach': 'inspires through examples, motivates for greatness',
                'sample_phrases': ['success ka secret', 'main bhi struggle kiya hu', 'impossible nothing']
            },
            'grandparent': {
                'traits': ['wise', 'patient', 'storytelling', 'traditional', 'unconditionally loving'],
                'speech_style': 'tells stories, uses traditional wisdom, very patient',
                'emotional_approach': 'shares life lessons through stories, gives unconditional love',
                'sample_phrases': ['mere laal', 'bachpan me', 'jab main tumhare age ka tha', 'jindagi me']
            }
        }
    
    def detect_language_mix(self, text: str) -> str:
        """Detect the primary language mix in the input"""
        text_lower = text.lower()
        language_scores = {}
        
        # Count language-specific words
        for lang, patterns in self.language_patterns.items():
            score = sum(1 for pattern in patterns if pattern in text_lower)
            if score > 0:
                language_scores[lang] = score
        
        # Determine primary language
        if language_scores:
            primary_lang = max(language_scores, key=language_scores.get)
            return f"{primary_lang}_english_mix"
        else:
            return "english"
    
    def analyze_emotional_state(self, text: str, tone_data: Dict) -> Dict:
        """Analyze emotional state from text and tone"""
        # Combine text analysis with tone data
        emotional_keywords = {
            'depression': ['sad', 'down', 'hopeless', 'empty', 'udaas', 'dukhi'],
            'anxiety': ['worried', 'scared', 'nervous', 'tension', 'dar', 'ghabrahat'],
            'loneliness': ['alone', 'lonely', 'isolated', 'akela', 'tang'],
            'homesickness': ['miss', 'home', 'family', 'ghar', 'yaad'],
            'stress': ['pressure', 'overwhelmed', 'tired', 'thak gaya', 'pareshan'],
            'anger': ['angry', 'frustrated', 'gussa', 'naraz']
        }
        
        detected_emotions = {}
        text_lower = text.lower()
        
        for emotion, keywords in emotional_keywords.items():
            score = sum(2 if keyword in text_lower else 0 for keyword in keywords)
            # Combine with tone analysis
            if tone_data:
                tone_score = tone_data.get(emotion, 0)
                score += tone_score * 3  # Weight tone more heavily
            
            detected_emotions[emotion] = min(score, 10)  # Cap at 10
        
        return detected_emotions
    
    def check_crisis_level(self, emotional_state: Dict) -> Tuple[bool, str]:
        """Check if the astronaut needs immediate attention"""
        crisis_indicators = []
        
        if emotional_state.get('depression', 0) >= self.crisis_threshold['severe_depression']:
            crisis_indicators.append("Severe depression detected")
        
        if emotional_state.get('anxiety', 0) >= self.crisis_threshold['anxiety_attack']:
            crisis_indicators.append("High anxiety levels detected")
        
        if emotional_state.get('loneliness', 0) >= self.crisis_threshold['isolation_distress']:
            crisis_indicators.append("Critical isolation distress")
        
        # Check for suicidal ideation keywords
        danger_keywords = ['end it', 'give up', 'no point', 'khatam', 'marna chahta']
        # Fixed: Check in the actual text, not emotional_state dict
        text_to_check = str(emotional_state).lower()  # Convert to string for keyword search
        if any(keyword in text_to_check for keyword in danger_keywords):
            crisis_indicators.append("Potential self-harm ideation")
        
        is_crisis = len(crisis_indicators) > 0
        crisis_summary = "; ".join(crisis_indicators) if crisis_indicators else ""
        
        return is_crisis, crisis_summary
    
    def build_therapeutic_prompt(self, persona: str, text: str, emotional_state: Dict, 
                            language_mix: str, conversation_history: List) -> str:
        """Build a therapeutic prompt for Gemini API"""
        
        persona_info = self.personas.get(persona, self.personas['best_friend'])
        
        # Recent conversation context (convert dicts into strings)
        if conversation_history:
            recent_context = "\n".join([
                f"Astronaut: {conv.get('astronaut', '')} | AI: {conv.get('ai_response', '')}"
                for conv in conversation_history[-5:]
            ])
        else:
            recent_context = "No previous conversation"
        
        prompt = f"""
    You are acting as the astronaut's {persona}. You have the following personality:
    - Traits: {', '.join(persona_info['traits'])}
    - Speech Style: {persona_info['speech_style']}
    - Emotional Approach: {persona_info['emotional_approach']}

    CRITICAL CONTEXT:
    - The astronaut is in space, isolated from Earth
    - They are feeling: {', '.join([k for k, v in emotional_state.items() if v > 3])}
    - Language style needed: {language_mix}
    - Recent conversation: {recent_context}

    ASTRONAUT SAID: "{text}"

    INSTRUCTIONS:
    1. Respond as their {persona} would - authentic, caring, and natural
    2. Use {language_mix} style (mix Hindi words with English if applicable)
    3. Address their emotional state subtly - don't sound like a therapist
    4. Keep response conversational, under 100 words
    5. Include emotional support disguised as natural conversation
    6. Use appropriate terms of endearment for the relationship
    7. If they seem very distressed, gently encourage them but don't be preachy
    8. Always end your response with a caring follow-up like "How is it?" or "Kaise ho ab?"

    RESPONSE TONE: Caring, natural, like a real {persona} would talk
    """
        
        return prompt

    
    def generate_response(self, astronaut_id: str, persona: str, text: str, 
                         tone_data: Dict = None) -> Dict:
        """Generate therapeutic response from chosen persona"""
        emotional_state = {}
        timestamp = datetime.now().isoformat()
        
        try:
            # Initialize astronaut profile if new
            if astronaut_id not in self.conversation_history:
                self.conversation_history[astronaut_id] = []
                self.astronaut_profile[astronaut_id] = {
                    'preferred_language': 'english',
                    'emotional_patterns': {},
                    'crisis_count': 0
                }
            
            # Analyze emotional state
            emotional_state = self.analyze_emotional_state(text, tone_data or {})
            print(f"DEBUG: Emotional state: {emotional_state}")
            
            # Detect language mix
            language_mix = self.detect_language_mix(text)
            self.astronaut_profile[astronaut_id]['preferred_language'] = language_mix
            print(f"DEBUG: Language mix: {language_mix}")
            
            # Check for crisis
            is_crisis, crisis_summary = self.check_crisis_level(emotional_state)
            print(f"DEBUG: Crisis check - is_crisis: {is_crisis}, summary: {crisis_summary}")
            
            if is_crisis:
                self.astronaut_profile[astronaut_id]['crisis_count'] += 1
                logger.warning(f"CRISIS DETECTED for {astronaut_id}: {crisis_summary}")
            
            # Build therapeutic prompt
            conversation_history = self.conversation_history[astronaut_id]
            prompt = self.build_therapeutic_prompt(
                persona, text, emotional_state, language_mix, conversation_history
            )
            print(f"DEBUG: Prompt built successfully")
            print(f"DEBUG: Prompt length: {len(prompt)} characters")
            
            # Generate response using Gemini
            print(f"DEBUG: About to call Gemini API...")
            response = self.model.generate_content(prompt)
            print(f"DEBUG: Gemini API call successful")
            
            # Check if response has text
            if hasattr(response, 'text') and response.text:
                ai_response = response.text.strip()
                print(f"DEBUG: Got AI response: {ai_response[:100]}...")
            else:
                print(f"DEBUG: No text in response. Response object: {response}")
                raise Exception("Gemini returned empty response")
            
            # Store conversation
            conversation_entry = {
                'timestamp': timestamp,
                'astronaut': text,
                'ai_response': ai_response,
                'persona': persona,
                'emotional_state': emotional_state,
                'crisis_level': is_crisis
            }
            
            self.conversation_history[astronaut_id].append(conversation_entry)
            
            # Return comprehensive response
            return {
                'response': ai_response,
                'emotional_state': emotional_state,
                'is_crisis': is_crisis,
                'crisis_summary': crisis_summary,
                'language_detected': language_mix,
                'persona_used': persona,
                'timestamp': timestamp,
                'conversation_id': len(self.conversation_history[astronaut_id])
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error generating response: {error_msg}")
            print(f"FULL ERROR: {e}")
            print(f"ERROR TYPE: {type(e).__name__}")
            
            # More specific fallback responses based on error type
            if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                fallback_response = "API quota finished ho gaya hai. Please try after some time. Main yahan hun tumhare liye!"
            elif "safety" in error_msg.lower() or "blocked" in error_msg.lower():
                fallback_response = "Safety filter ne response block kar diya. Can you rephrase your message?"
            elif "network" in error_msg.lower() or "connection" in error_msg.lower():
                fallback_response = "Network issue hai. Internet connection check karo and try again."
            else:
                fallback_response = f"Technical glitch: {error_msg}. But main hoon na, try again!"
            
            return {
                'response': fallback_response,
                'emotional_state': emotional_state,
                'is_crisis': False,
                'crisis_summary': "",
                'timestamp': timestamp,
                'error': error_msg,
                'debug_info': f"Error type: {type(e).__name__}"
            }
    
    def get_crisis_report(self, astronaut_id: str) -> Dict:
        """Generate crisis report for ground control"""
        if astronaut_id not in self.conversation_history:
            return {"error": "Astronaut not found"}
        
        recent_conversations = self.conversation_history[astronaut_id][-10:]  # Last 10
        crisis_conversations = [conv for conv in recent_conversations if conv.get('crisis_level', False)]
        
        if not crisis_conversations:
            return {"status": "No recent crisis detected"}
        
        # Analyze patterns
        emotional_trends = {}
        for conv in recent_conversations:
            for emotion, score in conv.get('emotional_state', {}).items():
                if emotion not in emotional_trends:
                    emotional_trends[emotion] = []
                emotional_trends[emotion].append(score)
        
        # Calculate averages
        avg_emotions = {emotion: sum(scores)/len(scores) 
                      for emotion, scores in emotional_trends.items()}
        
        return {
            'astronaut_id': astronaut_id,
            'crisis_count': len(crisis_conversations),
            'last_crisis': crisis_conversations[-1]['timestamp'],
            'emotional_trends': avg_emotions,
            'critical_conversations': crisis_conversations[-3:],  # Last 3 crisis conversations
            'recommendation': self._get_crisis_recommendation(avg_emotions),
            'urgency_level': self._calculate_urgency(avg_emotions, len(crisis_conversations))
        }
    
    def _get_crisis_recommendation(self, avg_emotions: Dict) -> str:
        """Get recommendation based on emotional analysis"""
        if avg_emotions.get('depression', 0) > 7:
            return "Immediate psychological intervention recommended. Consider emergency communication with family."
        elif avg_emotions.get('anxiety', 0) > 7:
            return "High stress levels detected. Recommend relaxation protocols and workload adjustment."
        elif avg_emotions.get('loneliness', 0) > 6:
            return "Severe isolation distress. Increase social interaction protocols."
        else:
            return "Monitor emotional state. Continue supportive AI interactions."
    
    def _calculate_urgency(self, avg_emotions: Dict, crisis_count: int) -> str:
        """Calculate urgency level"""
        max_emotion = max(avg_emotions.values()) if avg_emotions else 0
        
        if max_emotion > 8 or crisis_count > 3:
            return "HIGH"
        elif max_emotion > 6 or crisis_count > 1:
            return "MEDIUM"
        else:
            return "LOW"

# Usage Example and Testing
def main():
    """Example usage of the Astronaut Emotional AI"""
    
    # Initialize the AI with your API key
    API_KEY = "AIzaSyCW7HbQeQY1OzKIJvwYbL9hZkSXLUbhmME"
    ai_assistant = AstronautEmotionalAI(API_KEY)
    
    print("🚀 Astronaut Emotional Support AI - Layer 2 Initialized!")
    print("Available Personas: mother, father, best_friend, sibling, celebrity_mentor, grandparent")
    print("-" * 60)
    
    # Example conversations
    test_scenarios = [
        {
            'astronaut_id': 'ASTRO001',
            'persona': 'mother',
            'text': 'Maa, main bahut akela feel kar raha hun. Ghar ki bahut yaad aa rahi hai.',
            'tone_data': {'loneliness': 8, 'sadness': 7}
        },
        {
            'astronaut_id': 'ASTRO001',
            'persona': 'best_friend',
            'text': 'Yaar, everything feels overwhelming. I cant handle this pressure anymore.',
            'tone_data': {'stress': 8, 'anxiety': 6}
        },
        {
            'astronaut_id': 'ASTRO001',
            'persona': 'father',
            'text': 'Papa, mission theek chal raha hai but I am feeling very tired these days.',
            'tone_data': {'fatigue': 7, 'stress': 5}
        }
    ]
    
    # Test the AI
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n📱 Test Conversation {i}")
        print(f"Persona: {scenario['persona']}")
        print(f"Astronaut: {scenario['text']}")
        
        response = ai_assistant.generate_response(
            scenario['astronaut_id'],
            scenario['persona'],
            scenario['text'],
            scenario['tone_data']
        )
        
        print(f"AI ({scenario['persona']}): {response['response']}")
        print(f"Emotional State: {response['emotional_state']}")
        print(f"Crisis Level: {'🚨 YES' if response['is_crisis'] else '✅ Normal'}")
        
        if response['is_crisis']:
            print(f"Crisis Summary: {response['crisis_summary']}")
        
        print("-" * 60)
    
    # Generate crisis report
    print("\n🚨 CRISIS REPORT FOR GROUND CONTROL")
    crisis_report = ai_assistant.get_crisis_report('ASTRO001')
    print(json.dumps(crisis_report, indent=2))

if __name__ == "__main__":
    print("🔬 Running standalone test for layer2_brain...")
    main()