# Text-to-Speech Engine for MAITRI
# This module provides server-side TTS functionality as an alternative to Web Speech API

import os
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TTSEngine:
    """
    Text-to-Speech engine for generating audio files from text.
    Uses Web Speech API on the frontend by default for better browser compatibility.
    This class can be extended for server-side TTS if needed in the future.
    """
    
    def __init__(self, voice_dir="static/temp_audio"):
        self.voice_dir = voice_dir
        self.ensure_voice_directory()
        
    def ensure_voice_directory(self):
        """Create voice directory if it doesn't exist"""
        os.makedirs(self.voice_dir, exist_ok=True)
        
    def generate_speech_filename(self):
        """Generate unique filename for audio files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        return f"speech_{timestamp}_{unique_id}.wav"
    
    def text_to_speech_web_api(self, text):
        """
        Returns JavaScript code for Web Speech API (client-side TTS)
        This is the preferred method as it works across all browsers without server dependencies.
        """
        # Clean text for better speech synthesis
        clean_text = text.replace('"', '\\"').replace('\n', ' ').strip()
        
        js_code = f"""
        if ('speechSynthesis' in window) {{
            const utterance = new SpeechSynthesisUtterance("{clean_text}");
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Select a suitable voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('alex') ||
                voice.lang.includes('en')
            ) || voices[0];
            
            if (preferredVoice) {{
                utterance.voice = preferredVoice;
            }}
            
            speechSynthesis.speak(utterance);
        }}
        """
        return js_code
    
    def get_emotional_voice_settings(self, emotional_state):
        """
        Adjust voice parameters based on emotional state
        Returns settings for client-side speech synthesis
        """
        if not emotional_state:
            return {"rate": 0.9, "pitch": 1.0, "volume": 0.8}
            
        # Calculate emotional intensity
        emotions = emotional_state if isinstance(emotional_state, dict) else {}
        stress_level = emotions.get('stress', 0)
        sadness_level = emotions.get('sadness', 0)
        
        # Adjust voice parameters based on context
        if stress_level > 7 or sadness_level > 7:
            # Slower, softer voice for crisis situations
            return {"rate": 0.7, "pitch": 0.9, "volume": 0.7}
        elif stress_level > 4:
            # Slightly modified voice for moderate stress
            return {"rate": 0.8, "pitch": 0.95, "volume": 0.75}
        else:
            # Normal voice settings
            return {"rate": 0.9, "pitch": 1.0, "volume": 0.8}
    
    def generate_persona_voice_js(self, text, persona, emotional_state=None):
        """
        Generate JavaScript code for persona-specific voice synthesis
        """
        voice_settings = self.get_emotional_voice_settings(emotional_state)
        clean_text = text.replace('"', '\\"').replace('\n', ' ').strip()
        
        # Persona-specific voice preferences
        persona_voices = {
            'mother': {'preference': 'female', 'rate': 0.8, 'pitch': 1.1},
            'father': {'preference': 'male', 'rate': 0.9, 'pitch': 0.9},
            'best_friend': {'preference': 'any', 'rate': 1.0, 'pitch': 1.0},
            'psychologist': {'preference': 'female', 'rate': 0.8, 'pitch': 1.0},
            'ground_control': {'preference': 'male', 'rate': 0.9, 'pitch': 0.9},
            'fellow_astronaut': {'preference': 'any', 'rate': 0.9, 'pitch': 1.0}
        }
        
        persona_config = persona_voices.get(persona, {'preference': 'any', 'rate': 0.9, 'pitch': 1.0})
        
        # Merge persona and emotional settings
        final_rate = min(persona_config['rate'], voice_settings['rate'])
        final_pitch = persona_config['pitch'] * voice_settings['pitch']
        final_volume = voice_settings['volume']
        
        js_code = f"""
        if ('speechSynthesis' in window && window.chatInterface && window.chatInterface.voiceEnabled) {{
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance("{clean_text}");
            utterance.rate = {final_rate};
            utterance.pitch = {final_pitch};
            utterance.volume = {final_volume};
            
            // Voice selection based on persona
            const voices = speechSynthesis.getVoices();
            let selectedVoice = null;
            
            // Try to find persona-appropriate voice
            if ('{persona_config["preference"]}' === 'female') {{
                selectedVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('samantha') ||
                    voice.name.toLowerCase().includes('victoria')
                );
            }} else if ('{persona_config["preference"]}' === 'male') {{
                selectedVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('male') ||
                    voice.name.toLowerCase().includes('alex') ||
                    voice.name.toLowerCase().includes('daniel')
                );
            }}
            
            // Fallback to any English voice
            if (!selectedVoice) {{
                selectedVoice = voices.find(voice => voice.lang.includes('en')) || voices[0];
            }}
            
            if (selectedVoice) {{
                utterance.voice = selectedVoice;
            }}
            
            // Event handlers
            utterance.onstart = () => console.log('🔊 Speaking as {persona}:', "{clean_text}"[:50] + "...");
            utterance.onend = () => console.log('🔇 Finished speaking');
            utterance.onerror = (e) => console.error('🚫 Speech error:', e.error);
            
            speechSynthesis.speak(utterance);
        }}
        """
        return js_code
    
    def cleanup_old_files(self, max_age_minutes=60):
        """
        Clean up old temporary audio files
        """
        try:
            current_time = datetime.now()
            for filename in os.listdir(self.voice_dir):
                if filename.startswith('speech_') and filename.endswith('.wav'):
                    file_path = os.path.join(self.voice_dir, filename)
                    file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                    age_minutes = (current_time - file_time).total_seconds() / 60
                    
                    if age_minutes > max_age_minutes:
                        os.remove(file_path)
                        logger.info(f"Cleaned up old audio file: {filename}")
                        
        except Exception as e:
            logger.error(f"Error cleaning up audio files: {e}")

# Global TTS engine instance
tts_engine = TTSEngine()
