export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    // WebKit (Safari and, since it's required to use the same engine, every iOS browser
    // including Chrome) has a known bug where the speech queue can end up silently stuck
    // — especially after the tab was backgrounded. Canceling any pending utterance and
    // nudging the queue with resume() before every speak() is the standard workaround;
    // it's a harmless no-op on browsers that don't need it.
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
