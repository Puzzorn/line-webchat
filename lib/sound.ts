// Web Audio API Synthesizer Sound Utility for real-time incoming message notification
let audioCtx: AudioContext | null = null;

export function playNotificationSound() {
  try {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';

    // Pleasant dual-tone chime (587.33Hz D5 -> 880Hz A5)
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Unable to play notification sound:', err);
  }
}
