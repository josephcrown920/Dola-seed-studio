'use client'

import { useEffect, useState } from 'react'
import CodeEditor from './components/CodeEditor'
import ModelSelector from './components/ModelSelector'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: '👋 Welcome to Dola Seed 2.1 Pro. Ask me anything, or generate images/videos!' }
  ])
  const [input, setInput] = useState('')
  const [prompt, setPrompt] = useState('')
  const [gallery, setGallery] = useState([])
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedChatModel, setSelectedChatModel] = useState('dola-seed-2.1-pro')
  const [selectedImageModel, setSelectedImageModel] = useState('seedream-5.0-pro')
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    setApiEndpoint(localStorage.getItem('dola_api_endpoint') || '')
    setIsHydrated(true)
  }, [])

  const tabs = [
    { id: 'chat', name: '🧠 Dola Seed Chat' },
    { id: 'image', name: '🖼️ Seedream 5.0' },
    { id: 'motion', name: '🎮 Motion Video' },
    { id: 'code', name: '💻 AI Code Editor' },
    { id: 'settings', name: '⚙️ Settings' }
  ]

  const sendMessage = async () => {
    const message = input.trim()
    if (!message || isChatLoading) return

    const newHistory = [...chatHistory, { role: 'user', content: message }]
    setChatHistory(newHistory)
    setInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/modelark/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedChatModel, prompt: message })
      })
      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content ||
        data?.error?.message ||
        'ModelArk returned no message.'
      setChatHistory(history => [...history, { role: 'ai', content }])
    } catch (error) {
      setChatHistory(history => [...history, {
        role: 'ai',
        content: `ModelArk request failed: ${error.message}`
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const generateImage = () => {
    if (!prompt.trim()) return alert('Enter a prompt first')
    const newImage = `https://placehold.co/600x600/1e1e2e/89b4fa?text=Seedream+5.0+Generated+Image+${gallery.length + 1}`
    setGallery([newImage, ...gallery])
    alert('Image generated! Added to gallery.')
  }

  const saveSettings = () => {
    localStorage.setItem('dola_api_endpoint', apiEndpoint)
    alert('Settings saved!')
  }

  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#11111b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#89b4fa'
        }}
      >
        Loading Dola Seed Studio...
      </div>
    )
  }

  return (
    <div>
      <div className="nav">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </div>
        ))}
      </div>

      <div className="main">
        {activeTab === 'chat' && (
          <div>
            <h1 style={{ marginBottom: 20 }}>🧠 Dola Seed 2.1 Assistant</h1>
            <label htmlFor="chat-model">ModelArk chat model:</label>
            <ModelSelector
              type="chat"
              selected={selectedChatModel}
              onSelect={setSelectedChatModel}
            />
            <div className="card" style={{ height: '50vh', overflowY: 'auto' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ margin: '12px 0' }}>
                  <strong style={{ color: msg.role === 'user' ? '#a6e3a1' : '#89b4fa' }}>
                    {msg.role === 'user' ? 'You:' : 'Dola Seed:'}
                  </strong>
                  <p style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              ))}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={sendMessage} disabled={isChatLoading}>
                {isChatLoading ? 'Thinking…' : 'Send'}
              </button>
              <button className="secondary" onClick={() => setPrompt(input)}>Send to Seedream</button>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div>
            <h1 style={{ marginBottom: 20 }}>🖼️ Seedream 5.0 Image Generator</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 20 }}>
              <div>
                <div className="card">
                  <label>Prompt:</label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe the image you want to generate..."
                  />
                  <label>Model:</label>
                  <ModelSelector
                    type="image"
                    selected={selectedImageModel}
                    onSelect={setSelectedImageModel}
                  />
                  <label>Style:</label>
                  <select>
                    <option>Realistic</option>
                    <option>Cyberpunk</option>
                    <option>Anime</option>
                    <option>80s Neon Retro</option>
                    <option>Film Grain</option>
                  </select>
                  <button onClick={generateImage} style={{ width: '100%', marginTop: 12 }}>
                    🚀 Generate Image
                  </button>
                </div>
              </div>
              <div>
                <div className="card">
                  <h3>Preview</h3>
                  {gallery[0] ? (
                    <img src={gallery[0]} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c7086' }}>
                      Generated image will appear here
                    </div>
                  )}
                </div>
                <h3 style={{ marginTop: 20 }}>History Gallery</h3>
                <div className="grid">
                  {gallery.map((img, i) => (
                    <div key={i} className="gallery-item">
                      <img src={img} alt={`gen-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'motion' && (
          <div>
            <h1 style={{ marginBottom: 20 }}>🎮 Motion Control + Video Generation</h1>
            <div className="card">
              <h3>Camera Motion Presets:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, margin: '12px 0' }}>
                {['Zoom In', 'Zoom Out', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Orbit', 'Dolly Zoom'].map(preset => (
                  <button key={preset} className="secondary" onClick={() => alert(`${preset} preset applied!`)}>
                    {preset}
                  </button>
                ))}
              </div>
              <p style={{ color: '#f9e2af', margin: '12px 0' }}>💡 Click on the canvas below to add custom keyframes for your motion path:</p>
              <canvas className="motion-canvas" />
              <button style={{ marginTop: 16 }}>🚀 Generate Video</button>
            </div>
          </div>
        )}

        {activeTab === 'code' && <CodeEditor />}

        {activeTab === 'settings' && (
          <div>
            <h1 style={{ marginBottom: 20 }}>⚙️ Settings</h1>
            <div className="card" style={{ maxWidth: 500 }}>
              <label>API Endpoint:</label>
              <input
                value={apiEndpoint}
                onChange={e => setApiEndpoint(e.target.value)}
                placeholder="https://api.seed.bytedance.com/v1"
              />
              <button onClick={saveSettings} style={{ marginTop: 12 }}>Save Settings</button>
              <p style={{ marginTop: 12, fontSize: 12, color: '#6c7086' }}>
                The endpoint preference is stored locally in your browser.
              </p>
            </div>
            <div className="card" style={{ maxWidth: 500 }}>
              <h3>BytePlus ModelArk</h3>
              <p style={{ marginTop: 8, color: '#bac2de' }}>
                ModelArk credentials are kept server-side and are never stored in this browser.
                Configure <code>BYTEPLUS_ACCESS_KEY</code> and <code>BYTEPLUS_SECRET_KEY</code> as Replit secrets to enable live models.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}