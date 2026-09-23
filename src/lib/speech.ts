let primed = false

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
 * the engine, so later timer-driven announcements go through.
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
