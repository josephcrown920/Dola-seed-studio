'use client'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: '👋 Welcome to Dola Seed 2.1 Pro. Ask me anything, or generate images/videos!' }
  ])
  const [input, setInput] = useState('')
  const [chatModel, setChatModel] = useState('dola-seed-2.1-pro')
  const [imgPrompt, setImgPrompt] = useState('')
  const [imgModel, setImgModel] = useState('seedream-5.0-pro')
  const [imgStyle, setImgStyle] = useState('realistic')
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [timelineClips, setTimelineClips] = useState({
    video: [],
    audio: [],
    subtitle: [],
    effect: []
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  const tabs = [
    { id: 'chat', name: '🧠 Dola Seed Chat' },
    { id: 'image', name: '🖼️ Seedream 5.0' },
    { id: 'video', name: '🎬 Video Editor' },
    { id: 'code', name: '💻 AI Code Editor' },
    { id: 'settings', name: '⚙️ Settings' }
  ]

  // Chat functions
  const sendMessage = () => {
    if (!input.trim()) return
    const newHistory = [...chatHistory, { role: 'user', content: input }]
    setChatHistory(newHistory)
    setInput('')
    setTimeout(() => {
      setChatHistory([...newHistory, {
        role: 'ai',
        content: `🤖 Dola Seed 2.1 response:\nI understand your request: "${input.slice(0,50)}..."\n✅ You can send this prompt to Seedream or the video editor directly.`
      }])
    }, 1000)
  }

  // Image generation
  const generateImage = () => {
    if (!imgPrompt.trim()) return alert('Enter a prompt first')
    const newImg = `https://picsum.photos/seed/${Date.now()}/600/600`
    setGeneratedImages([newImg, ...generatedImages])
    setSelectedImage(newImg)
  }

  // Video editor functions
  const uploadMedia = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
      url: URL.createObjectURL(file),
      thumbnail: file.type.startsWith('video') 
        ? 'https://picsum.photos/seed/vid/120/80' 
        : URL.createObjectURL(file)
    }))
    setMediaLibrary([...mediaLibrary, ...newMedia])
  }

  const addClipToTrack = (media, trackType) => {
    const newClip = {
      id: Date.now(),
      name: media.name,
      url: media.url,
      start: 0,
      duration: 5
    }
    setTimelineClips(prev => ({
      ...prev,
      [trackType]: [...prev[trackType], newClip]
    }))
    if (trackType === 'video' && media.type === 'video') {
      setSelectedImage(media.thumbnail)
    }
  }

  const runAITool = (tool) => {
    const toolNames = {
      auto_edit: 'AI Auto Edit',
      beat_sync: 'Beat Sync Cut',
      subtitles: 'Auto Subtitles',
      enhance: '4K Quality Enhance',
      interpolate: 'Frame Interpolation',
      style_transfer: 'Style Transfer',
      remove_object: 'Object Removal',
      text: 'Add Text Layer'
    }
    alert(`${toolNames[tool]} tool activated! Applied to timeline clips.`)
  }

  // Code editor
  const [code, setCode] = useState('// Write your code here\n// Ask AI to generate, explain, debug, optimize, or refactor')
  const [codeModel, setCodeModel] = useState('deepseek-coder-v2')
  const [codePrompt, setCodePrompt] = useState('')
  const [codeOutput, setCodeOutput] = useState('AI output will appear here')

  const runCodeAction = (action) => {
    setCodeOutput(`🤖 AI (${codeModel}) ${action} result:\n\n(Connect your ModelArk API key in Settings for real results)\n\nAnalysis of your code will appear here.`)
  }

  // Settings
  const [apiKey, setApiKey] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')

  const saveSettings = () => {
    localStorage.setItem('dola_api_key', apiKey)
    localStorage.setItem('dola_api_endpoint', apiEndpoint)
    alert('Settings saved!')
  }

  useEffect(() => {
    setApiKey(localStorage.getItem('dola_api_key') || '')
    setApiEndpoint(localStorage.getItem('dola_api_endpoint') || '')
  }, [])

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
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

      {/* Main Content */}
      <div className="main-content">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="page">
            <h1>🧠 Dola Seed 2.1 Assistant</h1>
            <div className="card">
              <label>Model:</label>
              <select value={chatModel} onChange={e => setChatModel(e.target.value)}>
                <option value="dola-seed-2.1-pro">Dola Seed 2.1 Pro — All-purpose flagship</option>
                <option value="dola-seed-2.1-lite">Dola Seed 2.1 Lite — Fast</option>
                <option value="dola-seed-2.1-code">Dola Seed 2.1 Code — Programming</option>
                <option value="glm-5.1">GLM 5.1 — High-end reasoning</option>
              </select>
            </div>
            <div className="chat-window card">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  <strong>{msg.role === 'user' ? 'You:' : 'Dola Seed:'}</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
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
              <button className="secondary" onClick={() => { setImgPrompt(input); setActiveTab('image') }}>Send to Seedream</button>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="page">
            <h1>🖼️ Seedream 5.0 Image Generator</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
              <div>
                <div className="card">
                  <label>Prompt:</label>
                  <textarea
                    value={imgPrompt}
                    onChange={e => setImgPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe the image you want to generate..."
                  />
                  <label>Model:</label>
                  <select value={imgModel} onChange={e => setImgModel(e.target.value)}>
                    <option value="seedream-5.0-pro">Seedream 5.0 Pro</option>
                    <option value="seedream-5.0-lite">Seedream 5.0 Lite</option>
                    <option value="seedream-5.0-pro-max">Seedream 5.0 Pro Max (4K)</option>
                  </select>
                  <label>Style:</label>
                  <select value={imgStyle} onChange={e => setImgStyle(e.target.value)}>
                    <option value="realistic">Realistic</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="anime">Anime</option>
                    <option value="neon-retro">80s Neon Retro</option>
                    <option value="film">Film Grain</option>
                  </select>
                  <button onClick={generateImage} style={{ width: '100%', marginTop: 12 }}>
                    🚀 Generate Image
                  </button>
                </div>
              </div>
              <div>
                <div className="card">
                  <h3>Preview (Previs)</h3>
                  {selectedImage ? (
                    <img src={selectedImage} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
                  ) : (
                    <div className="empty-state">Generated image preview will appear here</div>
                  )}
                </div>
                <h3 style={{ marginTop: 20 }}>History Gallery (Previs)</h3>
                <div className="gallery-grid">
                  {generatedImages.map((img, i) => (
                    <div key={i} className="gallery-item" onClick={() => setSelectedImage(img)}>
                      <img src={img} alt={`gen-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Editor Tab (Full Upgrades + Previs) */}
        {activeTab === 'video' && (
          <div className="page">
            <h1>🎬 Full Timeline Video Editor</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 220px', gap: 12, marginBottom: 16 }}>
              {/* Media Library */}
              <div className="card">
                <h3>📁 Media Library</h3>
                <label className="upload-btn">
                  📤 Import Media
                  <input type="file" multiple accept="video/*,audio/*,image/*" onChange={uploadMedia} hidden />
                </label>
                <div className="media-list">
                  {mediaLibrary.map(media => (
                    <div key={media.id} className="media-item">
                      <img src={media.thumbnail} alt={media.name} className="media-thumb" />
                      <span style={{ fontSize: 12 }}>{media.name}</span>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <button className="tiny-btn" onClick={() => addClipToTrack(media, 'video')}>+ Video</button>
                        <button className="tiny-btn" onClick={() => addClipToTrack(media, 'audio')}>+ Audio</button>
                      </div>
                    </div>
                  ))}
                  {mediaLibrary.length === 0 && <p style={{ fontSize: 12, color: '#6c7086' }}>Import media to get started</p>}
                </div>
              </div>

              {/* Preview Player (Previs) */}
              <div className="card">
                <h3>👁️ Preview (Previs)</h3>
                <div className="preview-player">
                  {selectedImage ? (
                    <img src={selectedImage} alt="video preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="empty-state">Video preview will appear here</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <button className="secondary" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <input type="range" style={{ flex: 1 }} min="0" max="100" />
                  <span style={{ fontSize: 12 }}>00:00 / 00:30</span>
                </div>
              </div>

              {/* AI Tools */}
              <div className="card">
                <h3>🤖 AI Tools</h3>
                <div className="tool-list">
                  <button className="secondary" onClick={() => runAITool('auto_edit')}>🎬 Auto Edit</button>
                  <button className="secondary" onClick={() => runAITool('beat_sync')}>🎵 Beat Sync Cut</button>
                  <button className="secondary" onClick={() => runAITool('subtitles')}>📝 Auto Subtitles</button>
                  <button className="secondary" onClick={() => runAITool('enhance')}>✨ 4K Enhance</button>
                  <button className="secondary" onClick={() => runAITool('interpolate')}>🔄 Frame Interpolation</button>
                  <button className="secondary" onClick={() => runAITool('style_transfer')}>🎭 Style Transfer</button>
                  <button className="secondary" onClick={() => runAITool('remove_object')}>🗑️ Remove Object</button>
                  <button className="secondary" onClick={() => runAITool('text')}>💬 Add Text</button>
                </div>
              </div>
            </div>

            {/* Timeline Editor */}
            <div className="card">
              <h3>⏱️ Timeline Editor</h3>
              <div className="timeline-ruler"></div>
              {[
                { name: 'Video', color: '#89b4fa', type: 'video' },
                { name: 'Audio', color: '#a6e3a1', type: 'audio' },
                { name: 'Subtitles', color: '#f9e2af', type: 'subtitle' },
                { name: 'Effects', color: '#cba6f7', type: 'effect' }
              ].map(track => (
                <div key={track.type} className="timeline-track">
                  <div className="track-label">{track.name}</div>
                  <div className="track-body" style={{ borderColor: track.color + '60', backgroundColor: track.color + '10' }}>
                    {timelineClips[track.type].map(clip => (
                      <div key={clip.id} className="timeline-clip" style={{ backgroundColor: track.color, borderColor: track.color }}>
                        {clip.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Motion Control Section */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3>🎮 Motion Control (Image to Video)</h3>
              <p style={{ color: '#f9e2af', fontSize: 12 }}>💡 Upload a reference image, use presets or draw custom motion paths</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 16 }}>
                <div>
                  <p style={{ marginBottom: 8 }}>Quick Presets:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['Zoom In', 'Zoom Out', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Orbit', 'Dolly Zoom'].map(preset => (
                      <button key={preset} className="secondary tiny-btn" onClick={() => alert(`${preset} applied`)}>
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="motion-canvas">
                  {selectedImage ? (
                    <img src={selectedImage} alt="motion preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div className="empty-state">Motion canvas — upload image to draw keyframes</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="page">
            <h1>💻 AI Code Editor</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <div className="card">
                <h3>Code Editor</h3>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: 14, minHeight: 400 }}
                />
              </div>
              <div>
                <div className="card">
                  <h3>AI Code Assistant</h3>
                  <label>Model:</label>
                  <select value={codeModel} onChange={e => setCodeModel(e.target.value)}>
                    <option value="deepseek-coder-v2">DeepSeek Coder V2 — Code specialized</option>
                    <option value="glm-5.1">GLM 5.1</option>
                    <option value="code-llama-70b">Code Llama 70B</option>
                    <option value="dola-seed-2.1-code">Dola Seed 2.1 Code</option>
                  </select>
                  <label>Prompt:</label>
                  <textarea
                    value={codePrompt}
                    onChange={e => setCodePrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe what you want to do..."
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <button className="secondary" onClick={() => runCodeAction('Explain')}>Explain</button>
                    <button className="secondary" onClick={() => runCodeAction('Debug')}>Debug</button>
                    <button className="secondary" onClick={() => runCodeAction('Optimize')}>Optimize</button>
                    <button className="secondary" onClick={() => runCodeAction('Refactor')}>Refactor</button>
                  </div>
                </div>
                <div className="card">
                  <h3>AI Output</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{codeOutput}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="page">
            <h1>⚙️ Settings</h1>
            <div className="card" style={{ maxWidth: 500 }}>
              <h3>ModelArk API Credentials</h3>
              <label>API Endpoint:</label>
              <input
                value={apiEndpoint}
                onChange={e => setApiEndpoint(e.target.value)}
                placeholder="https://api.byteplus.com/v1/modelark"
              />
              <label>API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Your API key (stored locally in your browser only)"
              />
              <button onClick={saveSettings} style={{ marginTop: 12 }}>Save Settings</button>
              <p style={{ marginTop: 12, fontSize: 12, color: '#6c7086' }}>
                🔒 Your API key is stored only in your browser, never sent to any server except for official API calls.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: #11111b;
          color: #cdd6f4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .sidebar {
          width: 240px;
          background: #181825;
          padding: 20px 0;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
        }
        .nav-item {
          padding: 14px 20px;
          margin: 4px 12px;
          border-radius: 8px;
          cursor: pointer;
          color: #bac2de;
        }
        .nav-item.active, .nav-item:hover {
          background: #313244;
          color: white;
        }
        .main-content {
          margin-left: 240px;
          padding: 30px;
          width: 100%;
        }
        .page { max-width: 1400px; }
        h1 { margin-bottom: 20px; font-size: 24px; }
        h3 { margin-bottom: 10px; }
        .card {
          background: #181825;
          border: 1px solid #313244;
          border-radius: 8px;
          padding: 20px;
          margin: 12px 0;
        }
        button {
          background: linear-gradient(180deg, #89b4fa, #74c7ec);
          color: #11111b;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }
        button.secondary {
          background: #313244;
          color: #cdd6f4;
        }
        button:hover { opacity: 0.9; }
        input, textarea, select {
          background: #1e1e2e;
          border: 1px solid #313244;
          color: #cdd6f4;
          padding: 8px;
          border-radius: 6px;
          width: 100%;
          margin: 6px 0;
          font-family: inherit;
          font-size: 14px;
        }
        .chat-window {
          height: 50vh;
          overflow-y: auto;
        }
        .chat-bubble { margin: 12px 0; }
        .chat-bubble strong { color: #89b4fa; }
        .chat-bubble.user strong { color: #a6e3a1; }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .gallery-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #313244;
        }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .empty-state {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c7086;
        }
        .upload-btn {
          background: #313244;
          padding: 8px;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 12px;
          display: block;
        }
        .media-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .media-item {
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 8px;
          background: #1e1e2e;
        }
        .media-thumb {
          width: 100%;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .tiny-btn {
          font-size: 10px;
          padding: 4px 6px;
          flex: 1;
        }
        .preview-player {
          height: 300px;
          background: #11111b;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tool-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .timeline-ruler {
          height: 20px;
          background: #1e1e2e;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .timeline-track {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }
        .track-label {
          width: 70px;
          font-size: 12px;
          font-weight: bold;
        }
        .track-body {
          flex: 1;
          height: 40px;
          border-radius: 4px;
          border: 1px solid;
          position: relative;
        }
        .timeline-clip {
          position: absolute;
          left: 20px;
          top: 5px;
          height: 30px;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          color: #11111b;
          font-weight: bold;
          border: 1px solid;
        }
        .motion-canvas {
          height: 250px;
          background: #181825;
          border-radius: 8px;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            display: flex;
            overflow-x: auto;
            padding: 10px;
          }
          .nav-item { white-space: nowrap; }
          .main-content { margin-left: 0; padding: 20px; }
        }
      `}</style>
    </div>
  )
}