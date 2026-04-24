// Lightweight Web Audio API utility for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playClickSound = () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playWinSound = () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  
  notes.forEach((freq, i) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.value = freq;
    
    const startTime = audioCtx.currentTime + (i * 0.1);
    
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.4);
  });
};
