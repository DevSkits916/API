class MusicComposer {
    constructor() {
        this.composition = '';
        this.isPlaying = false;
        this.audioContext = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Piano key listeners
        document.querySelectorAll('.white-key, .black-key').forEach(key => {
            key.addEventListener('mousedown', (e) => {
                this.addNoteToComposition(e.target.dataset.note);
                e.target.classList.add('active');
            });
            
            key.addEventListener('mouseup', (e) => {
                e.target.classList.remove('active');
            });
            
            key.addEventListener('mouseleave', (e) => {
                e.target.classList.remove('active');
            });
        });

        // Control buttons
        document.getElementById('playBtn').addEventListener('click', () => this.playComposition());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopComposition());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearComposition());
        document.getElementById('generateMidiBtn').addEventListener('click', () => this.generateMIDI());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveComposition());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadComposition());

        // Composition textarea
        document.getElementById('composition').addEventListener('input', (e) => {
            this.composition = e.target.value;
        });
    }

    addNoteToComposition(note) {
        const textarea = document.getElementById('composition');
        const currentPos = textarea.selectionStart;
        const currentValue = textarea.value;
        
        const newValue = currentValue.substring(0, currentPos) + 
                        (currentValue.substring(0, currentPos).endsWith(' ') || currentPos === 0 ? '' : ' ') + 
                        note + 
                        currentValue.substring(currentPos);
        
        textarea.value = newValue;
        this.composition = newValue;
        
        // Update cursor position
        textarea.selectionStart = currentPos + note.length + (currentPos === 0 || currentValue.substring(0, currentPos).endsWith(' ') ? 0 : 1);
        textarea.selectionEnd = textarea.selectionStart;
        textarea.focus();
    }

    async playComposition() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.showStatus('Playing composition...', 'success');
        
        // Simple tone generation for demo
        // In a real app, you'd use Web Audio API with proper synthesis
        const notes = this.composition.split(/\s+/).filter(note => note && note !== '|');
        
        for (let i = 0; i < notes.length && this.isPlaying; i++) {
            const note = notes[i];
            if (note === '|') continue;
            
            // Visual feedback
            this.highlightNote(note);
            
            // Simulate note playback (would be real audio in production)
            await this.delay(500); // 500ms per note
            
            this.removeHighlight(note);
        }
        
        this.isPlaying = false;
        this.showStatus('Playback finished', 'success');
    }

    stopComposition() {
        this.isPlaying = false;
        this.showStatus('Playback stopped', 'error');
        
        // Remove all highlights
        document.querySelectorAll('.white-key, .black-key').forEach(key => {
            key.classList.remove('active');
        });
    }

    clearComposition() {
        document.getElementById('composition').value = '';
        this.composition = '';
        this.showStatus('Composition cleared', 'success');
    }

    async generateMIDI() {
        const composition = document.getElementById('composition').value;
        const tempo = document.getElementById('tempo').value;
        
        if (!composition.trim()) {
            this.showStatus('Please enter a composition first', 'error');
            return;
        }

        this.showStatus('Generating MIDI file...', 'success');

        try {
            const response = await fetch('/api/generate-midi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    composition: composition,
                    tempo: parseInt(tempo)
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus('MIDI generated successfully!', 'success');
                
                // Create download link
                const midiData = data.midi_data;
                const filename = data.filename;
                
                // In a real app, you'd decode the base64 and create a blob
                // For demo, we'll just show a mock download link
                this.showDownloadLink(filename);
            } else {
                this.showStatus('Error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showStatus('Network error: ' + error.message, 'error');
        }
    }

    async saveComposition() {
        const composition = document.getElementById('composition').value;
        const name = prompt('Enter a name for your composition:', 'My Composition');
        
        if (!name) return;

        if (!composition.trim()) {
            this.showStatus('Cannot save empty composition', 'error');
            return;
        }

        try {
            const response = await fetch('/api/save-composition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    composition: composition,
                    name: name
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus('Composition saved successfully!', 'success');
            } else {
                this.showStatus('Error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showStatus('Network error: ' + error.message, 'error');
        }
    }

    async loadComposition() {
        // In a real app, you'd show a list of saved compositions
        // For demo, we'll load a sample
        try {
            const response = await fetch('/api/load-composition?id=sample');
            const data = await response.json();

            if (data.success) {
                document.getElementById('composition').value = data.composition;
                document.getElementById('tempo').value = data.tempo;
                this.composition = data.composition;
                this.showStatus('Composition loaded successfully!', 'success');
            } else {
                this.showStatus('Error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showStatus('Network error: ' + error.message, 'error');
        }
    }

    highlightNote(note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.add('active');
        }
    }

    removeHighlight(note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.remove('active');
        }
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }

    showDownloadLink(filename) {
        const downloadLink = document.getElementById('downloadLink');
        const midiDownload = document.getElementById('midiDownload');
        
        midiDownload.textContent = `Download ${filename}`;
        midiDownload.download = filename;
        
        // In a real app, you'd set the actual href to the MIDI blob
        // For demo, we'll make it a functional button that shows a message
        midiDownload.href = '#';
        midiDownload.onclick = (e) => {
            e.preventDefault();
            this.showStatus('MIDI download functionality would be implemented in production', 'success');
        };
        
        downloadLink.style.display = 'block';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the composer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicComposer();
});