// Web Audio API Chime Synthesizer
export function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: High frequency
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Tone 2: Harmonious lower frequency chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

// Request System Notification Permissions
export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch (err) {
      console.warn("Notification permission error:", err);
    }
  }
}

// Send Native Desktop / Mobile Push Notification
export function sendSystemNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
        tag: "queuewise-alert"
      });
    } catch (err) {
      console.warn("Failed to trigger native notification:", err);
    }
  }
}

// Mobile Device Haptic Vibration
export function triggerHapticVibration() {
  if ("navigator" in window && "vibrate" in navigator) {
    try {
      navigator.vibrate([300, 100, 300, 100, 400]);
    } catch (err) {
      console.warn("Vibration error:", err);
    }
  }
}
