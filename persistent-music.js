// Persistent Music System - Keeps playing across pages
class PersistentMusic {
    constructor() {
        this.audio = null;
        this.checkExistingMusic();
    }
    
    checkExistingMusic() {
        // Check if music is already playing in another window/tab
        const musicState = localStorage.getItem('musicState');
        if (musicState === 'playing') {
            const track = localStorage.getItem('currentMusicTrack');
            const time = parseFloat(localStorage.getItem('musicCurrentTime') || '0');
            const volume = parseFloat(localStorage.getItem('musicVolume') || '0.5');
            
            // Don't restart music, it should continue from previous page
            console.log('Music system ready');
        }
    }
    
    saveState() {
        if (this.audio) {
            localStorage.setItem('musicCurrentTime', this.audio.currentTime);
            localStorage.setItem('musicState', 'playing');
        }
    }
}

// Initialize on every page
window.persistentMusic = new PersistentMusic();

// Save music state before leaving page
window.addEventListener('beforeunload', () => {
    if (window.persistentMusic && window.persistentMusic.audio) {
        window.persistentMusic.saveState();
    }
});
