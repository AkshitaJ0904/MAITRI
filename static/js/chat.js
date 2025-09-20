// Enhanced Chat Interface with Voice Support - Compatible with existing MAITRI structure
class AstronautChatInterface {
    constructor() {
        this.currentPersona = null;
        this.astronautId = 'ASTRO001';
        this.voiceEnabled = true;
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        
        // Gender customization (can be modified by user preferences)
        this.personaGenderPreferences = {
            'mother': 'female',
            'father': 'male', 
            'best_friend': 'male',      // Default - can be customized
            'sibling': 'female',        // Default - can be customized  
            'celebrity_mentor': 'male', // Default - can be customized
            'grandparent': 'male'       // Default - can be customized (grandfather vs grandmother)
        };
        
        this.initializeElements();
        this.initializeVoices();
        this.attachEventListeners();
    }
    
    initializeElements() {
        this.contactItems = document.querySelectorAll('.contact-item');
        this.chatHeader = document.getElementById('chatHeader');
        this.chatAvatar = document.getElementById('chatAvatar');
        this.chatName = document.getElementById('chatName');
        this.chatStatus = document.getElementById('chatStatus');
        this.emotionalStatus = document.getElementById('emotionalStatus');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.inputArea = document.getElementById('inputArea');
        this.messageInput = document.getElementById('messageInput');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.sendBtn = document.getElementById('sendButton');
        this.voiceToggle = document.getElementById('voiceToggle');
        this.crisisAlert = document.getElementById('crisisAlert');
    }

    initializeVoices() {
        // Initialize speech synthesis voices for Hindi-English mix with gender-specific voices
        const setVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            
            // Initialize gender-specific voice collections
            this.maleVoices = {
                indian: voices.filter(voice => 
                    (voice.lang.includes('en-IN') || voice.lang.includes('hi-IN')) &&
                    (voice.name.toLowerCase().includes('male') || 
                     voice.name.toLowerCase().includes('man') ||
                     voice.name.toLowerCase().includes('ravi') ||
                     voice.name.toLowerCase().includes('raj'))
                ),
                english: voices.filter(voice => 
                    voice.lang.includes('en') &&
                    (voice.name.toLowerCase().includes('alex') ||
                     voice.name.toLowerCase().includes('daniel') ||
                     voice.name.toLowerCase().includes('tom') ||
                     voice.name.toLowerCase().includes('david') ||
                     voice.name.toLowerCase().includes('male'))
                )
            };
            
            this.femaleVoices = {
                indian: voices.filter(voice => 
                    (voice.lang.includes('en-IN') || voice.lang.includes('hi-IN')) &&
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('woman') ||
                     voice.name.toLowerCase().includes('priya') ||
                     voice.name.toLowerCase().includes('kavya'))
                ),
                english: voices.filter(voice => 
                    voice.lang.includes('en') &&
                    (voice.name.toLowerCase().includes('samantha') ||
                     voice.name.toLowerCase().includes('victoria') ||
                     voice.name.toLowerCase().includes('karen') ||
                     voice.name.toLowerCase().includes('susan') ||
                     voice.name.toLowerCase().includes('emma') ||
                     voice.name.toLowerCase().includes('female'))
                )
            };
            
            // Set default voice (preferably Indian English female for emotional support)
            this.currentVoice = voices.find(voice => 
                voice.lang.includes('en-IN') && voice.name.toLowerCase().includes('female')
            ) || voices.find(voice => 
                voice.lang.includes('en-IN')
            ) || voices.find(voice => 
                voice.name.toLowerCase().includes('samantha')
            ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
            
            console.log('🔊 Gender-aware voice system initialized');
            console.log('👨 Male voices available:', this.maleVoices.indian.length + this.maleVoices.english.length);
            console.log('👩 Female voices available:', this.femaleVoices.indian.length + this.femaleVoices.english.length);
            console.log('📝 Sample voices:', voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
        };

        // Some browsers load voices asynchronously
        if (this.speechSynthesis.getVoices().length > 0) {
            setVoices();
        } else {
            this.speechSynthesis.addEventListener('voiceschanged', setVoices);
        }
        
        // Update voice button initial state
        this.updateVoiceButton(false);
    }
    
    attachEventListeners() {
        // Contact selection
        this.contactItems.forEach(item => {
            item.addEventListener('click', () => this.selectContact(item));
        });
        
        // Message input
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Send button
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Voice toggle button
        if (this.voiceToggle) {
            this.voiceToggle.addEventListener('click', () => this.toggleVoice());
        }
        
        // Voice recording (simplified for now)
        if (this.voiceBtn) {
            this.voiceBtn.addEventListener('click', () => {
                alert('Voice recording feature coming soon! Please use text chat for now.');
            });
        }
    }
    
    selectContact(contactItem) {
        // Remove active class from all contacts
        this.contactItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected contact
        contactItem.classList.add('active');
        
        // Get persona data
        const persona = contactItem.dataset.persona;
        const name = contactItem.querySelector('.contact-name').textContent;
        const avatarClass = contactItem.querySelector('.contact-avatar').className;
        const emoji = contactItem.querySelector('.contact-avatar').textContent;
        
        this.currentPersona = persona;
        
        // Update chat header
        this.chatName.textContent = name;
        this.chatAvatar.className = avatarClass.replace('contact-avatar', 'chat-avatar');
        this.chatAvatar.textContent = emoji;
        
        // Show chat interface
        if (this.welcomeScreen) this.welcomeScreen.style.display = 'none';
        if (this.chatHeader) this.chatHeader.style.display = 'flex';
        if (this.inputArea) this.inputArea.style.display = 'block';
        
        // Clear messages and show greeting
        this.messagesContainer.innerHTML = '';
        this.showGreeting(name, persona);
        
        // Focus on input
        if (this.messageInput) this.messageInput.focus();
        
        console.log(`🎭 Switched to ${persona} persona`);
    }
    
    showGreeting(name, persona) {
        const greetings = {
            mother: "Beta, how are you feeling today? Sab theek hai na? Main bahut miss kar rahi hun tumhe.",
            father: "Son, how's the mission going? I'm so proud of you! Papa hamesha tumhare saath hai.",
            best_friend: "Yaar! Kya haal hai space mein? Missing all the fun here! Tell me everything!",
            sibling: "Hey stupid astronaut! 😄 Dekho kitna famous ho gaya. But still my annoying brother/sister!",
            celebrity_mentor: "My dear student, space is where dreams meet reality. How are you finding this incredible journey?",
            grandparent: "Mere laal, space mein kaise ho? Dada bahut proud hai. Khana theek se khaa rahe ho na?"
        };
        
        setTimeout(() => {
            const greeting = greetings[persona] || "Hello! How are you doing up there?";
            this.addMessage(greeting, 'ai');
            
            // Speak greeting if voice is enabled
            if (this.voiceEnabled) {
                setTimeout(() => this.speakText(greeting, persona), 500);
            }
        }, 1000);
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.currentPersona) return;
        
        // Add user message
        this.addMessage(message, 'astronaut');
        
        // Clear input
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    astronaut_id: this.astronautId,
                    persona: this.currentPersona,
                    message: message
                })
            });
            
            const data = await response.json();
            
            this.removeTypingIndicator();
            
            if (response.ok) {
                this.addMessage(data.response, 'ai', data);
                this.updateEmotionalStatus(data.emotional_state);
                
                if (data.is_crisis) {
                    this.showCrisisAlert(data.crisis_summary);
                }
                
                // Speak the response if voice is enabled
                if (this.voiceEnabled && data.response) {
                    setTimeout(() => this.speakText(data.response, this.currentPersona, data.emotional_state), 300);
                }
                
            } else {
                this.addMessage('Sorry, technical glitch ho gaya. Try again please!', 'ai');
                console.error('API Error:', data.error);
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Connection issue hai. Internet check karo and try again.', 'ai');
            console.error('Network error:', error);
        }
    }
    
    addMessage(text, sender, data = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const now = new Date();
        const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${text}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        // Add crisis indicator if needed
        if (data.is_crisis) {
            const crisisDiv = document.createElement('div');
            crisisDiv.className = 'crisis-indicator';
            crisisDiv.textContent = '⚠️ Crisis Detected';
            messageDiv.appendChild(crisisDiv);
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="loading-indicator">
                    <span>Thinking</span>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    updateEmotionalStatus(emotional_state) {
        if (!emotional_state || !this.emotionalStatus) return;
        
        const emotions = Object.values(emotional_state);
        const maxEmotion = emotions.length > 0 ? Math.max(...emotions) : 0;
        
        if (maxEmotion > 7) {
            this.emotionalStatus.className = 'emotional-indicator crisis';
            this.emotionalStatus.textContent = '🚨 High Stress';
        } else if (maxEmotion > 4) {
            this.emotionalStatus.className = 'emotional-indicator stress';
            this.emotionalStatus.textContent = '⚠️ Moderate Stress';
        } else {
            this.emotionalStatus.className = 'emotional-indicator normal';
            this.emotionalStatus.textContent = '✅ Normal';
        }
    }
    
    showCrisisAlert(summary) {
        if (!this.crisisAlert) return;
        
        this.crisisAlert.textContent = `🚨 Crisis Alert: ${summary || 'High emotional distress detected'} - Ground Control notified`;
        this.crisisAlert.classList.add('show');
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            this.crisisAlert.classList.remove('show');
        }, 8000);
    }
    
    adjustTextareaHeight() {
        if (!this.messageInput) return;
        
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Enhanced Voice functionality for human-like speech
    speakText(text, persona = null, emotional_state = null) {
        if (!this.speechSynthesis || !this.voiceEnabled) return;

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        // Enhanced text processing for Hindi-English mixed speech
        const naturalText = this.makeTextMoreNatural(text);

        if (!naturalText) return;

        const utterance = new SpeechSynthesisUtterance(naturalText);
        
        // Detect if text contains Hindi words
        const containsHindi = this.detectHindiContent(naturalText);
        
        // Get human-like voice settings adapted for Hindi-English mix
        const voiceSettings = this.getHumanVoiceSettings(persona, emotional_state, containsHindi);
        
        // Select best voice for this persona and language mix
        const selectedVoice = this.selectBilingualVoice(persona, containsHindi);
        
        // Configure for natural Hindi-English mixed speech
        utterance.voice = selectedVoice || this.currentVoice;
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        
        // Set language appropriately for mixed content
        if (containsHindi && selectedVoice && selectedVoice.lang.includes('hi')) {
            utterance.lang = 'hi-IN';
        } else if (selectedVoice && selectedVoice.lang.includes('en-IN')) {
            utterance.lang = 'en-IN';
        }
        
        // Add natural speech variation
        this.addSpeechVariation(utterance, naturalText);

        // Add event listeners
        utterance.onstart = () => {
            console.log('�️ Speaking naturally:', naturalText.substring(0, 50) + '...');
            this.updateVoiceButton(true);
        };

        utterance.onend = () => {
            console.log('🔇 Finished speaking');
            this.updateVoiceButton(false);
        };

        utterance.onerror = (event) => {
            console.error('🚫 Speech error:', event.error);
            this.updateVoiceButton(false);
        };

        // Speak with slight delay for more natural feel
        setTimeout(() => {
            this.speechSynthesis.speak(utterance);
        }, 100);
    }

    makeTextMoreNatural(text) {
        return text
            // Handle Hindi-English mixed text naturally
            // Improve Hindi pronunciation with phonetic spellings
            .replace(/\bkya\b/gi, 'kyaa')  // Extended for better pronunciation
            .replace(/\bhai\b/gi, 'hai')
            .replace(/\baur\b/gi, 'aur')
            .replace(/\bmein\b/gi, 'main')
            .replace(/\btum\b/gi, 'tum')
            .replace(/\bthik\b/gi, 'theek')
            .replace(/\bsab\b/gi, 'sab')
            .replace(/\bbeta\b/gi, 'baytaa')  // Phonetic for better pronunciation
            .replace(/\byaar\b/gi, 'yaar')
            .replace(/\bhamesha\b/gi, 'hameshaa')
            .replace(/\bbahut\b/gi, 'bahoot')  // Better pronunciation
            .replace(/\bnahin\b/gi, 'naheen')  // Phonetic spelling
            .replace(/\bnahi\b/gi, 'nahee')
            .replace(/\bdekho\b/gi, 'dekho')
            .replace(/\blaal\b/gi, 'laal')
            .replace(/\bmere\b/gi, 'mayray')   // Better pronunciation
            .replace(/\bpapa\b/gi, 'papa')
            .replace(/\bmama\b/gi, 'mama')
            .replace(/\bdada\b/gi, 'dada')
            .replace(/\baccha\b/gi, 'achha')   // Common correction
            .replace(/\bkaise\b/gi, 'kaisay')  // Better pronunciation
            .replace(/\bkahan\b/gi, 'kahaan')
            .replace(/\bkyun\b/gi, 'kyoon')
            .replace(/\bkab\b/gi, 'kab')
            .replace(/\bho\b/gi, 'ho')
            .replace(/\bhoon\b/gi, 'hoon')
            .replace(/\bhun\b/gi, 'hoon')      // Common variation
            .replace(/\bhain\b/gi, 'hain')
            // Add natural pauses for Hindi-English transitions
            .replace(/(\w+)\s+(kya|hai|aur|main|tum|theek|sab)/gi, '$1, $2')
            .replace(/(kya|hai|aur|main|tum|theek|sab)\s+(\w+)/gi, '$1, $2')
            // Standard text processing
            .replace(/\. /g, ', ')
            .replace(/! /g, '. ')
            .replace(/\? /g, '. ')
            // Convert common abbreviations to full words
            .replace(/\bu\b/gi, 'you')
            .replace(/\bur\b/gi, 'your')
            .replace(/\br\b/gi, 'are')
            .replace(/\bn\b/gi, 'and')
            // Add breathing spaces around punctuation
            .replace(/,/g, ', ')
            .replace(/\./g, '. ')
            .replace(/;/g, '; ')
            .replace(/:/g, ': ')
            // Remove excessive exclamation marks
            .replace(/!+/g, '.')
            // Clean up multiple spaces
            .replace(/\s+/g, ' ')
            // Keep Hindi characters and English characters
            .replace(/[^\w\s.,!?;:\-']/g, '')
            .trim();
    }

    addSpeechVariation(utterance, text) {
        // Add slight randomization for more human-like speech
        const baseRate = utterance.rate;
        const basePitch = utterance.pitch;
        
        // Vary rate slightly based on text length and content
        if (text.includes('?')) {
            utterance.pitch = basePitch + 0.1; // Slightly higher for questions
        }
        
        if (text.includes('...') || text.includes('hmm') || text.includes('well')) {
            utterance.rate = baseRate * 0.9; // Slower for thoughtful speech
        }
        
        if (text.includes('!') && !text.includes('crisis') && !text.includes('emergency')) {
            utterance.rate = baseRate * 1.05; // Slightly faster for excitement
            utterance.pitch = basePitch + 0.05;
        }
        
        // Add subtle randomness (±5%) for natural variation
        const rateVariation = 1 + (Math.random() - 0.5) * 0.1;
        const pitchVariation = 1 + (Math.random() - 0.5) * 0.08;
        
        utterance.rate = Math.max(0.3, Math.min(2.0, utterance.rate * rateVariation));
        utterance.pitch = Math.max(0.1, Math.min(2.0, utterance.pitch * pitchVariation));
    }

    detectHindiContent(text) {
        // Common Hindi words and patterns
        const hindiWords = [
            'kya', 'hai', 'aur', 'main', 'mein', 'tum', 'theek', 'thik', 'sab', 
            'beta', 'yaar', 'hamesha', 'bahut', 'nahin', 'nahi', 'dekho', 
            'laal', 'mere', 'papa', 'mama', 'dada', 'nana', 'nani', 
            'kitna', 'kaise', 'kahan', 'kyun', 'kab', 'accha', 'achha',
            'bhai', 'behen', 'dost', 'ghar', 'paani', 'khana', 'jana',
            'aana', 'jaana', 'karna', 'hona', 'lena', 'dena', 'kehna',
            'sunna', 'dekhna', 'samjhna', 'pata', 'malum', 'zaroor',
            'bilkul', 'shayad', 'lagta', 'lagti', 'rahega', 'rahegi',
            'ho', 'hoon', 'hun', 'hain', 'tha', 'thi', 'the'
        ];
        
        const words = text.toLowerCase().split(/\s+/);
        const hindiCount = words.filter(word => 
            hindiWords.some(hindi => word.includes(hindi))
        ).length;
        
        // Consider it Hindi-mixed if more than 20% are Hindi words
        const hindiPercentage = hindiCount / words.length;
        return hindiPercentage > 0.2;
    }

    selectBilingualVoice(persona, containsHindi) {
        // Use customizable gender preferences
        const gender = this.personaGenderPreferences[persona] || 'female'; // Default to female for emotional support
        const voiceCollection = gender === 'male' ? this.maleVoices : this.femaleVoices;
        
        console.log(`🎭 Selecting ${gender} voice for ${persona}`);
        
        // Priority selection based on content and gender
        let selectedVoice = null;
        
        if (containsHindi) {
            // First priority: Gender-specific Indian voices for Hindi content
            selectedVoice = voiceCollection.indian[0];
            
            if (selectedVoice) {
                console.log(`🇮🇳👨👩 Selected ${gender} Indian voice for Hindi mix:`, selectedVoice.name);
                return selectedVoice;
            }
            
            // Second priority: Any Indian voice of correct gender
            const voices = this.speechSynthesis.getVoices();
            selectedVoice = voices.find(v => 
                (v.lang.includes('en-IN') || v.lang.includes('hi-IN')) &&
                this.isVoiceGender(v, gender)
            );
            
            if (selectedVoice) {
                console.log(`🇮🇳 Selected ${gender} Indian voice:`, selectedVoice.name);
                return selectedVoice;
            }
        }
        
        // Third priority: Gender-specific English voices
        selectedVoice = voiceCollection.english[0];
        
        if (selectedVoice) {
            console.log(`👨👩 Selected ${gender} English voice:`, selectedVoice.name);
            return selectedVoice;
        }
        
        // Fallback: Find any voice of the correct gender
        const voices = this.speechSynthesis.getVoices();
        selectedVoice = voices.find(v => 
            v.lang.includes('en') && this.isVoiceGender(v, gender)
        );
        
        if (selectedVoice) {
            console.log(`🔄 Fallback ${gender} voice:`, selectedVoice.name);
            return selectedVoice;
        }
        
        // Final fallback to current voice
        console.log('⚠️ Using default voice as fallback');
        return this.currentVoice;
    }
    
    isVoiceGender(voice, targetGender) {
        const voiceName = voice.name.toLowerCase();
        
        const maleIndicators = ['male', 'man', 'alex', 'daniel', 'tom', 'david', 'ravi', 'raj', 'amit', 'rohan'];
        const femaleIndicators = ['female', 'woman', 'samantha', 'victoria', 'karen', 'susan', 'emma', 'priya', 'kavya', 'sara'];
        
        if (targetGender === 'male') {
            return maleIndicators.some(indicator => voiceName.includes(indicator));
        } else {
            return femaleIndicators.some(indicator => voiceName.includes(indicator));
        }
    }

    getHumanVoiceSettings(persona, emotional_state, containsHindi = false) {
        // Base settings adjusted for Hindi-English mix
        let settings = { 
            rate: containsHindi ? 0.7 : 0.75,    // Slower for Hindi pronunciation
            pitch: 0.95,   // Slightly lower, more conversational
            volume: 0.85   // Clear but not overwhelming
        };

        // Hindi-specific adjustments for natural pronunciation
        if (containsHindi) {
            settings.rate *= 0.9;  // Even slower for mixed language clarity
            settings.pitch *= 1.02; // Slightly higher for Hindi intonation
        }

        // Emotional state adjustments for natural human speech
        if (emotional_state) {
            const emotions = emotional_state;
            const stress = emotions.stress || 0;
            const sadness = emotions.sadness || 0;
            const joy = emotions.joy || 0;
            const anger = emotions.anger || 0;

            if (stress > 7 || sadness > 7) {
                // Crisis mode - very gentle, slower, comforting
                settings.rate = containsHindi ? 0.55 : 0.6;
                settings.pitch = 0.85;
                settings.volume = 0.75;
            } else if (stress > 4 || sadness > 4) {
                // Moderate concern - slightly slower, gentler
                settings.rate = containsHindi ? 0.6 : 0.65;
                settings.pitch = 0.9;
                settings.volume = 0.8;
            } else if (joy > 6) {
                // Happy/excited - slightly faster, higher
                settings.rate = containsHindi ? 0.75 : 0.85;
                settings.pitch = 1.05;
            } else if (anger > 4) {
                // Concerned but controlled
                settings.rate = containsHindi ? 0.65 : 0.7;
                settings.pitch = 0.9;
            }
        }

        // Persona-specific human-like characteristics
        const personaSettings = {
            mother: { 
                rate: 0.7,     // Motherly, careful speech
                pitch: 1.08,   // Slightly higher, nurturing
                volume: 0.9    // Clear and comforting
            },
            father: { 
                rate: 0.75,    // Steady, reassuring
                pitch: 0.85,   // Lower, authoritative but kind
                volume: 0.9 
            },
            best_friend: { 
                rate: 0.8,     // Natural conversation pace
                pitch: 1.0,    // Normal, relatable
                volume: 0.85 
            },
            sibling: { 
                rate: 0.85,    // Slightly faster, more casual
                pitch: 1.02,   // Slightly animated
                volume: 0.85 
            },
            celebrity_mentor: { 
                rate: 0.73,    // Thoughtful, wise pace
                pitch: 0.95,   // Mature, inspiring
                volume: 0.9 
            },
            grandparent: { 
                rate: 0.65,    // Slower, more deliberate
                pitch: 1.05,   // Warm, gentle
                volume: 0.85 
            }
        };

        // Apply persona modifications
        if (persona && personaSettings[persona]) {
            const pSettings = personaSettings[persona];
            settings.rate = pSettings.rate;
            settings.pitch = settings.pitch * pSettings.pitch;
            settings.volume = Math.max(settings.volume, pSettings.volume);
        }

        // Ensure values stay within reasonable bounds
        settings.rate = Math.max(0.3, Math.min(1.2, settings.rate));
        settings.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
        settings.volume = Math.max(0.3, Math.min(1.0, settings.volume));

        return settings;
    }

    selectPersonaVoice(persona) {
        // Define detailed persona characteristics including gender
        const personaCharacteristics = {
            mother: {
                gender: 'female',
                preferences: ['indian-female', 'en-in-female', 'hindi-female', 'samantha', 'karen', 'susan', 'priya'],
                description: 'Warm, nurturing mother'
            },
            father: {
                gender: 'male', 
                preferences: ['indian-male', 'en-in-male', 'hindi-male', 'alex', 'daniel', 'tom', 'ravi'],
                description: 'Strong, supportive father'
            },
            best_friend: {
                gender: 'male',  // Can be customized
                preferences: ['indian-male', 'en-in-male', 'alex', 'daniel', 'natural-male'],
                description: 'Friendly, casual best friend'
            },
            sibling: {
                gender: 'female',  // Can be customized - assuming sister
                preferences: ['indian-female', 'en-in-female', 'emma', 'karen', 'young-female'],
                description: 'Playful sibling'
            },
            celebrity_mentor: {
                gender: 'male',  // Can be customized
                preferences: ['indian-male', 'en-in-male', 'alex', 'daniel', 'professional-male'],
                description: 'Inspiring mentor figure'
            },
            grandparent: {
                gender: 'male',  // Assuming grandfather, can be customized
                preferences: ['indian-male', 'en-in-male', 'gentle-male', 'tom', 'warm-male'],
                description: 'Wise, caring grandparent'
            }
        };

        const characteristics = personaCharacteristics[persona] || {
            gender: 'female',
            preferences: ['indian-female', 'natural-female'],
            description: 'Default support person'
        };
        
        console.log(`🎭 Selecting voice for ${characteristics.description} (${characteristics.gender})`);
        
        const voices = this.speechSynthesis.getVoices();
        
        // Try each preference in order
        for (const pref of characteristics.preferences) {
            let voice = null;
            
            if (pref.includes('indian-')) {
                const gender = pref.split('-')[1];
                voice = voices.find(v => 
                    (v.lang.includes('en-IN') || v.lang.includes('hi-IN')) &&
                    this.isVoiceGender(v, gender)
                );
            } else if (pref.includes('en-in-')) {
                const gender = pref.split('-')[2];
                voice = voices.find(v => 
                    v.lang.includes('en-IN') &&
                    this.isVoiceGender(v, gender)
                );
            } else if (pref.includes('hindi-')) {
                const gender = pref.split('-')[1];
                voice = voices.find(v => 
                    (v.lang.includes('hi-IN') || v.lang.includes('hi')) &&
                    this.isVoiceGender(v, gender)
                );
            } else if (pref.includes('-male') || pref.includes('-female')) {
                const gender = pref.split('-')[1];
                voice = voices.find(v => 
                    v.lang.includes('en') &&
                    this.isVoiceGender(v, gender)
                );
            } else {
                // Specific voice name
                voice = voices.find(v => 
                    v.name.toLowerCase().includes(pref.toLowerCase()) &&
                    this.isVoiceGender(v, characteristics.gender)
                );
            }
            
            if (voice) {
                console.log(`🎭✅ Selected ${pref} voice for ${persona}:`, voice.name, `(${voice.lang})`);
                return voice;
            }
        }
        
        // Final fallback: any voice of the correct gender
        const fallbackVoice = voices.find(v => 
            v.lang.includes('en') && this.isVoiceGender(v, characteristics.gender)
        );
        
        if (fallbackVoice) {
            console.log(`🔄 Fallback ${characteristics.gender} voice for ${persona}:`, fallbackVoice.name);
            return fallbackVoice;
        }
        
        // Ultimate fallback
        return this.currentVoice;
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        
        // Cancel any ongoing speech when disabled
        if (!this.voiceEnabled) {
            this.speechSynthesis.cancel();
        }

        this.updateVoiceButton(false);
        console.log('🔊 Voice', this.voiceEnabled ? 'enabled' : 'disabled');
    }

    updateVoiceButton(speaking = false) {
        if (!this.voiceToggle) return;

        if (speaking) {
            this.voiceToggle.innerHTML = '🔊';
            this.voiceToggle.title = 'Speaking...';
            this.voiceToggle.classList.add('speaking');
        } else {
            this.voiceToggle.classList.remove('speaking');
            if (this.voiceEnabled) {
                this.voiceToggle.innerHTML = '🔊';
                this.voiceToggle.title = 'Voice enabled (click to disable)';
            } else {
                this.voiceToggle.innerHTML = '🔇';
                this.voiceToggle.title = 'Voice disabled (click to enable)';
            }
        }
    }
}

// Initialize the chat interface when page loads
document.addEventListener('DOMContentLoaded', () => {
    const chatInterface = new AstronautChatInterface();
    window.chatInterface = chatInterface;
    console.log('🚀 MAITRI Chat Interface with Voice Support Ready!');
});

// Add additional styles for voice features
const additionalStyles = `
.crisis-indicator {
    background: rgba(255, 152, 0, 0.2);
    color: #ff9800;
    padding: 5px 10px;
    border-radius: 12px;
    font-size: 12px;
    margin-top: 5px;
    text-align: center;
    border: 1px solid rgba(255, 152, 0, 0.3);
}

.voice-toggle-btn.speaking {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
`;

// Add styles to document
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);
