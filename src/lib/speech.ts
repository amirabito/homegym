export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech synthesis isn't available/allowed in this context — the beep/vibration/
    // notification alerts elsewhere in the timer still cover the actual completion.
  }
}
