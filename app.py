# app.py - Main Flask application
print("👀 app.py started")

import sys
print("✅ Python version:", sys.version)

from flask import Flask
print("✅ Flask imported")

from flask_socketio import SocketIO
print("✅ SocketIO imported")

from layer2_brain import AstronautEmotionalAI
print("✅ layer2_brain imported")

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import os
from datetime import datetime
import uuid

# Import Layer 2 brain directly
from layer2_brain import AstronautEmotionalAI

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize AI system (using Layer2 directly for now)
GEMINI_API_KEY = "AIzaSyCW7HbQeQY1OzKIJvwYbL9hZkSXLUbhmME"
ai_system = AstronautEmotionalAI(GEMINI_API_KEY)

# Global variables for active sessions
active_sessions = {}

@app.route('/')
def index():
    """Main chat interface"""
    return render_template('index.html')

@app.route('/api/send_message', methods=['POST'])
def send_message():
    """Handle text messages from the UI"""
    try:
        data = request.json
        astronaut_id = data.get('astronaut_id', 'ASTRO001')
        persona = data.get('persona', 'best_friend')
        message = data.get('message', '')
        
        if not message.strip():
            return jsonify({'error': 'Empty message'}), 400
        
        # Process through AI Brain
        response = ai_system.generate_response(astronaut_id, persona, message, {})
        
        return jsonify({
            'response': response['response'],
            'emotional_state': response['emotional_state'],
            'is_crisis': response['is_crisis'],
            'crisis_summary': response.get('crisis_summary', ''),
            'timestamp': response['timestamp'],
            'persona': persona
        })
        
    except Exception as e:
        print(f"Error in send_message: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_crisis_report/<astronaut_id>')
def get_crisis_report(astronaut_id):
    """Get crisis report for ground control"""
    try:
        report = ai_system.get_crisis_report(astronaut_id)
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# WebSocket events for real-time communication
@socketio.on('connect')
def handle_connect():
    print('👨‍🚀 Astronaut connected to support system')
    emit('status', {'message': 'Connected to emotional support system', 'timestamp': datetime.now().isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    print('👨‍🚀 Astronaut disconnected')

@socketio.on('join_session')
def handle_join_session(data):
    astronaut_id = data.get('astronaut_id', 'ASTRO001')
    active_sessions[request.sid] = astronaut_id
    emit('session_joined', {'astronaut_id': astronaut_id})

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static/voices', exist_ok=True)
    os.makedirs('static/temp_audio', exist_ok=True)
    os.makedirs('voice_samples', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    print("🚀 Starting Astronaut Emotional Support System...")
    print("🌐 Web Interface: http://localhost:5000")
    print("🧠 AI Brain: Layer 2 initialized")
    print("📊 Crisis Detection: Active")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
