// Web Audio API Sound Synthesizer for rich instant sound alerts without external audio files
export function playNotificationSound(type: string = 'bell', volume: number = 0.8) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.3, now);
    gainNode.connect(ctx.destination);

    if (type === 'bell') {
      // Pleasant dual-tone bell (E6 & B6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(1318.51, now); // E6
      osc2.frequency.setValueAtTime(1975.53, now); // B6
      
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else if (type === 'chime') {
      // 3-note ascending cheerful chime
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        noteGain.gain.setValueAtTime(volume * 0.25, now + idx * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } else if (type === 'urgent' || type === 'alert') {
      // Double beep alert
      [880, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);
        noteGain.gain.setValueAtTime(volume * 0.35, now + idx * 0.18);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.15);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.15);
      });
    } else {
      // Gentle soft tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
