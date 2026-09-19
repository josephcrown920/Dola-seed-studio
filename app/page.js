'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: '👋 Welcome to Dola Seed 2.1 Pro. Ask me anything, or generate images/videos!' }
  ])
  const [input, setInput] = useState('')
  const [prompt, setPrompt] = useState('')
  const [gallery, setGallery] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')

  useEffect(() => {
    setApiKey(localStorage.getItem('dola_api_key') || '')
    setApiEndpoint(localStorage.getItem('dola_api_endpoint') || '')
  }, [])

  const tabs = [
    { id: 'chat', name: '🧠 Dola Seed Chat' },
    { id: 'image', name: '🖼️ Seedream 5.0' },
    { id: 'motion', name: '🎮 Motion Video' },
    { id: 'settings', name: '⚙️ Settings' }
  ]

  const sendMessage = () => {
    if (!input.trim()) return
    const newHistory = [...chatHistory, { role: 'user', content: input }]
    setChatHistory(newHistory)
    setInput('')
    setTimeout(() => {
      setChatHistory([...newHistory, {
        role: 'ai',
        content: `🤖 Dola Seed 2.1 response:
I understand your request: "${input.slice(0, 50)}..."
✅ You can send this prompt to Seedream or the video editor directly.`
      }])
    }, 1000)
  }

  const generateImage = () => {
    if (!prompt.trim()) return alert('Enter a prompt first')
    const newImage = `https://placehold.co/600x600/1e1e2e/89b4fa?text=Seedream+5.0+Generated+Image+${gallery.length + 1}`
    setGallery([newImage, ...gallery])
    alert('Image generated! Added to gallery.')
  }

  const saveSettings = () => {
    localStorage.setItem('dola_api_key', apiKey)
    localStorage.setItem('dola_api_endpoint', apiEndpoint)
    alert('Settings saved!')
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
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={sendMessage}>Send</button>
              <button className="secondary" onClick={() => setPrompt(input)}>Send to Seedream</button>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div>
            <h1 style={{ marginBottom: 20 }}>🖼️ Seedream 5.0 Image Generator</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
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
                  <select>
                    <option>Pro</option>
                    <option>Lite</option>
                    <option>Pro Max (4K)</option>
                  </select>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '12px 0' }}>
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
              <label>API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key (saved locally in your browser)"
              />
              <button onClick={saveSettings} style={{ marginTop: 12 }}>Save Settings</button>
              <p style={{ marginTop: 12, fontSize: 12, color: '#6c7086' }}>
                🔒 Your API key is stored only in your browser, never sent to any server except for official API calls.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}