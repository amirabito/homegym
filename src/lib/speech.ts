let primed = false

/**
 * Unofficial, best-effort attempt to get iOS to play audio even with the physical silent
 * (ringer) switch on. iOS splits sound into an "ambient" category — page alerts, UI sounds,
 * and speechSynthesis by default — which respects the silent switch on purpose, versus a
 * "playback" category (Spotify, Podcasts, etc.) which doesn't, because those apps were
 * deliberately opened to play audio. There is no supported web API to request the
 * "playback" category; native apps get it, web pages don't. What some sites have found
 * works, inconsistently and undocumented, on a number of iOS versions: play a real (not
 * literally-silent) <audio> element from a direct user gesture, which sometimes promotes
 * the whole page's audio session and lets later sounds — including speechSynthesis — ride
 * along and ignore the switch too. Not guaranteed, and Apple could close it at any time;
 * if it doesn't work, the timer's visual countdown is still there regardless.
 */
export function tryUnlockSilentSwitch(): void {
  if (typeof document === 'undefined') return
  try {
    const audio = document.createElement('audio')
    audio.src = `${import.meta.env.BASE_URL}audio/unlock.wav`
    audio.volume = 0.05
    void audio.play().catch(() => {
      // Blocked even with a gesture — nothing more to try here.
    })
  } catch {
    // ignore
  }
}

/**
 * iOS WebKit (Safari, and — since Apple requires every iOS browser to use the same engine
 * — Chrome, Firefox, Edge, etc. too) only reliably allows speechSynthesis.speak() calls
 * that happen directly inside a user gesture, or after the engine has already been warmed
 * up by an earlier gesture-triggered call on the page. Rest-timer announcements mostly
 * fire later from a timer tick, not a tap, so without this the very first call — and on
 * some iOS versions, every call — is silently dropped: no error, no sound, nothing.
 *
 * Call this once as early as possible (e.g. on app mount). It just arms a listener for
 * the user's first tap/click anywhere on the page and uses that real gesture to warm up
 * the engine, so later timer-driven announcements go through — and also makes the
 * best-effort silent-switch unlock attempt above, piggybacking on the same first tap.
 */
export function primeSpeechOnFirstGesture(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (primed) return
  primed = true

  const unlock = () => {
    try {
      const warmup = new SpeechSynthesisUtterance(' ')
      warmup.volume = 0.01
      window.speechSynthesis.speak(warmup)
    } catch {
      // ignore — speak() below still has its own fallback story
    }
    tryUnlockSilentSwitch()
  }
  document.addEventListener('pointerdown', unlock, { once: true })
}

/**
 * Nudges a WebKit speech queue that's gone idle — a widely reported bug where
 * speechSynthesis silently stops accepting new speak() calls after sitting quiet for a
 * while (e.g. the ~50s gap between a "30 seconds" warning and the final countdown).
 * Harmless no-op everywhere else. Call this periodically (about once a second) while a
 * countdown with voice announcements pending is running.
 */
export function keepSpeechAlive(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.pause()
    window.speechSynthesis.resume()
  } catch {
    // ignore
  }
}

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    // Canceling any pending utterance and nudging the queue with resume() before every
    // speak() guards against the same stuck-queue bug keepSpeechAlive() targets.
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech synthesis isn't available/allowed in this context — the beep/vibration/
    // notification alerts elsewhere in the timer still cover the actual completion.
  }
}
