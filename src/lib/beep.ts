let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  if (!ctx) ctx = new AudioCtor()
  return ctx
}

export function playBeep(times = 3): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') void audioCtx.resume()

  for (let i = 0; i < times; i++) {
    const start = audioCtx.currentTime + i * 0.28
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(start)
    osc.stop(start + 0.24)
  }

  if ('vibrate' in navigator) {
    navigator.vibrate([120, 80, 120, 80, 180])
  }
}
