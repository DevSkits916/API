from flask import Flask, render_template, request, jsonify, send_file
import os
import io
import base64
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate-midi', methods=['POST'])
def generate_midi():
    try:
        data = request.json
        composition = data.get('composition', '')
        tempo = data.get('tempo', 120)
        
        # In a real implementation, you would generate actual MIDI here
        # For demo purposes, we'll return a success response
        midi_data = generate_mock_midi(composition, tempo)
        
        return jsonify({
            'success': True,
            'message': 'MIDI generated successfully',
            'midi_data': base64.b64encode(midi_data).decode('utf-8'),
            'filename': f'composition_{datetime.now().strftime("%Y%m%d_%H%M%S")}.mid'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_mock_midi(composition, tempo):
    """Generate mock MIDI data - replace with actual MIDI generation"""
    # This is a placeholder - in a real app, you'd use a MIDI library
    # like mido or pretty_midi to generate actual MIDI files
    mock_data = f"Mock MIDI for: {composition} at {tempo} BPM".encode('utf-8')
    return mock_data

@app.route('/api/save-composition', methods=['POST'])
def save_composition():
    try:
        data = request.json
        composition = data.get('composition', '')
        name = data.get('name', 'Untitled')
        
        # In a real app, you'd save to a database
        # For demo, we'll just return success
        return jsonify({
            'success': True,
            'message': 'Composition saved successfully',
            'id': f"comp_{datetime.now().timestamp()}"
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/load-composition', methods=['GET'])
def load_composition():
    try:
        composition_id = request.args.get('id')
        # In a real app, you'd load from database
        # For demo, return mock data
        return jsonify({
            'success': True,
            'composition': 'C4 E4 G4 C5 | E4 G4 C5 E5',
            'name': 'Sample Composition',
            'tempo': 120
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Music Composer API'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False').lower() == 'true')