export function speakAgentReply(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 1600)
  if (!clean) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(clean)
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}

export function stopAgentVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}
