'use client'
import { useState, useRef, useEffect } from 'react'
import WorkflowLibrary from './components/WorkflowLibrary'
import { speakAgentReply, stopAgentVoice } from './lib/agent-voice'

export default function Home() {
  // Persistent long-context memory (survives refreshes)
  const [longTermMemory, setLongTermMemory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_dola_long_memory')
      return saved ? JSON.parse(saved) : {
        chatHistory: [],
        generatedAssets: [],
        workflowRuns: [],
        userPreferences: {},
        knowledgeBase: []
      }
    }
    return { chatHistory: [], generatedAssets: [], workflowRuns: [], userPreferences: {}, knowledgeBase: [] }
  })

  const [activeTab, setActiveTab] = useState('chat')
  const [chatHistory, setChatHistory] = useState(longTermMemory.chatHistory.length ? longTermMemory.chatHistory : [
    { role: 'ai', content: '👋 Welcome to Nexus Dola Studio. Ask me anything, or generate images/videos! All your data is saved to long-term memory automatically.' }
  ])
  const [input, setInput] = useState('')
  const [chatModel, setChatModel] = useState('dola-seed-2-1-turbo-260628')
  const [imgPrompt, setImgPrompt] = useState('')
  const [imgModel, setImgModel] = useState('seedream-5.0-pro')
  const [imgStyle, setImgStyle] = useState('realistic')
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [workflowProgress, setWorkflowProgress] = useState({})
  const [workflowLogs, setWorkflowLogs] = useState([])

  const tabs = [
    { id: 'chat', name: '🧠 AI Assistant' },
    { id: 'image', name: '🖼️ Image Gen' },
    { id: 'video', name: '🎬 Video Editor' },
    { id: 'orchestrator', name: '🔮 Agent Orchestrator' },
    { id: 'memory', name: '🧠 Long Memory' },
    { id: 'code', name: '💻 Code Editor' },
    { id: 'vision', name: '👁️ Vision + Agents' },
    { id: 'workflows', name: '🧩 ComfyUI Workflows' },
    { id: 'settings', name: '⚙️ Settings' }
  ]

  // Save long-term memory automatically every time it changes
  useEffect(() => {
    localStorage.setItem('nexus_dola_long_memory', JSON.stringify(longTermMemory))
  }, [longTermMemory])

  // Chat functions
  const sendMessage = async () => {
    if (!input.trim()) return
    const message = input.trim()
    const newHistory = [...chatHistory, { role: 'user', content: message, timestamp: new Date().toISOString() }]
    setChatHistory(newHistory)
    setInput('')
    setLongTermMemory(prev => ({
      ...prev,
      chatHistory: newHistory,
      knowledgeBase: [...prev.knowledgeBase, { type: 'chat', content: message, timestamp: new Date().toISOString() }]
    }))

    try {
      const response = await fetch('/api/modelark/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: chatModel, messages: newHistory.map(item => ({ role: item.role === 'ai' ? 'assistant' : item.role, content: item.content })) })
      })
      const data = await response.json()
      const aiReply = data?.choices?.[0]?.message?.content || data?.output_text || ('🤖 Nexus Dola response:\n' + message)
      const finalHistory = [...newHistory, { role: 'ai', content: aiReply, timestamp: new Date().toISOString() }]
      setChatHistory(finalHistory)
      setLongTermMemory(prev => ({ ...prev, chatHistory: finalHistory }))
      if (voiceEnabled) speakAgentReply(aiReply)
    } catch (error) {
      const aiReply = 'ModelArk request failed: ' + (error?.message || 'Unknown error')
      const finalHistory = [...newHistory, { role: 'ai', content: aiReply, timestamp: new Date().toISOString() }]
      setChatHistory(finalHistory)
      if (voiceEnabled) speakAgentReply(aiReply)
    }
  }

  // Image generation
  const generateImage = () => {
    if (!imgPrompt.trim()) return alert('Enter a prompt first')
    const newImg = {
      id: Date.now(),
      url: `https://picsum.photos/seed/${Date.now()}/600/600`,
      prompt: imgPrompt,
      timestamp: new Date().toISOString()
    }
    setGeneratedImages([newImg, ...generatedImages])
    setSelectedImage(newImg.url)
    
    // Save to long-term memory
    setLongTermMemory(prev => ({
      ...prev,
      generatedAssets: [...prev.generatedAssets, { type: 'image', ...newImg }]
    }))
  }

  // Full agentic workflow execution
  const workflowNodes = [
    { id: 'memory', label: 'Memory Agent', x: 120, y: 60, color: '#00f5d4', duration: 1500 },
    { id: 'context', label: 'Context Agent', x: 120, y: 220, color: '#9d4edd', duration: 2000 },
    { id: 'domain', label: 'Domain Agent', x: 420, y: 140, color: '#ffb703', duration: 2500 },
    { id: 'safety', label: 'Safety Layer', x: 420, y: 280, color: '#7b2cbf', duration: 1800 },
    { id: 'review', label: 'Human Review', x: 120, y: 380, color: '#00bbf9', duration: 1000 }
  ]

  const runAgenticWorkflow = async () => {
    if (isWorkflowRunning) return
    setIsWorkflowRunning(true)
    setWorkflowProgress({})
    setWorkflowLogs([])
    const runId = Date.now()
    const logs = []

    // Run all agents in sequence, fully autonomous
    for (let i = 0; i < workflowNodes.length; i++) {
      const node = workflowNodes[i]
      setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting ${node.label}...`])
      
      // Simulate agent working autonomously
      await new Promise(resolve => setTimeout(resolve, node.duration))
      
      setWorkflowProgress(prev => ({ ...prev, [node.id]: 'complete' }))
      setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ ${node.label} completed successfully`])
      
      // Auto-pass data to next node
      if (i < workflowNodes.length - 1) {
        setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📡 Data passed to next agent node`])
      }
    }

    setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 Full workflow completed! All agents executed autonomously.`])
    
    // Save run to long-term memory
    setLongTermMemory(prev => ({
      ...prev,
      workflowRuns: [{ id: runId, timestamp: new Date().toISOString(), logs: workflowLogs, status: 'complete' }, ...prev.workflowRuns]
    }))

    setIsWorkflowRunning(false)
  }

  // Code editor
  const [code, setCode] = useState('// Write your code here\n// Ask AI to generate, explain, debug, optimize, or refactor')
  const [codeModel, setCodeModel] = useState('deepseek-coder-v2')
  const [codePrompt, setCodePrompt] = useState('')
  const [codeOutput, setCodeOutput] = useState('AI output will appear here')

  // Multimodal production analysis
  const [visionUrl, setVisionUrl] = useState('')
  const [visionType, setVisionType] = useState('image')
  const [visionInstruction, setVisionInstruction] = useState('Analyze this media for subjects, actions, camera, lighting, character continuity, blocking, props, edit points and timeline opportunities.')
  const [visionModel, setVisionModel] = useState('deepseek-v4-1-flash-260910')
  const [visionOutput, setVisionOutput] = useState('Vision analysis will appear here.')
  const [visionBusy, setVisionBusy] = useState(false)

  const runVisionAnalysis = async () => {
    if (!visionUrl.trim()) return
    setVisionBusy(true)
    try {
      const content = [
        { type: 'text', text: visionInstruction },
        visionType === 'image'
          ? { type: 'image_url', image_url: { url: visionUrl.trim(), detail: 'high' } }
          : { type: 'video_url', video_url: { url: visionUrl.trim(), fps: 1 } }
      ]
      const response = await fetch('/api/modelark/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: visionModel, content })
      })
      const data = await response.json()
      const text = data?.choices?.[0]?.message?.content || data?.output_text || JSON.stringify(data, null, 2)
      setVisionOutput(text)
      setLongTermMemory(prev => ({
        ...prev,
        knowledgeBase: [
          ...prev.knowledgeBase,
          { type: 'multimodal-analysis', mediaType: visionType, url: visionUrl.trim(), model: visionModel, instruction: visionInstruction, output: text, timestamp: new Date().toISOString() }
        ]
      }))
    } catch (error) {
      setVisionOutput('Vision analysis failed: ' + (error?.message || 'Unknown error'))
    } finally {
      setVisionBusy(false)
    }
  }

  const buildMultiAgentPlan = (brief) => [
    { role: 'director', model: 'dola-seed-2-1-turbo-260628', task: 'Define intent and acceptance criteria.' },
    { role: 'vision', model: 'deepseek-v4-1-flash-260910', task: 'Analyze visual evidence and shot structure.' },
    { role: 'character continuity', model: 'glm-5-3-flash-260828', task: 'Lock identity, wardrobe, blocking and interaction.' },
    { role: 'world continuity', model: 'glm-5-3-flash-260828', task: 'Lock environment, props, lighting and camera language.' },
    { role: 'storyboard', model: 'dola-seed-2-1-turbo-260628', task: 'Create image/video shot prompts and coverage.' },
    { role: 'editor', model: 'dola-seed-2-1-turbo-260628', task: 'Map the plan to reversible layered timeline edits.' },
    { role: 'audio', model: 'glm-5-3-flash-260828', task: 'Plan dialogue, music and SFX layers.' },
    { role: 'qa', model: 'deepseek-v4-1-flash-260910', task: 'Inspect results and request targeted repairs.' }
  ].map(agent => ({ ...agent, brief }))

  const runCodeAction = (action) => {
    const output = `🤖 AI (${codeModel}) ${action} result:\n\nUsing long-context memory to reference your previous code projects...\n\nFull analysis will appear here when connected to ModelArk.`
    setCodeOutput(output)
    setLongTermMemory(prev => ({
      ...prev,
      generatedAssets: [...prev.generatedAssets, { type: 'code', action, output, timestamp: new Date().toISOString() }]
    }))
  }

  // Settings
  const [apiKey, setApiKey] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')

  const saveSettings = () => {
    localStorage.setItem('dola_api_key', apiKey)
    localStorage.setItem('dola_api_endpoint', apiEndpoint)
    setLongTermMemory(prev => ({ ...prev, userPreferences: { ...prev.userPreferences, apiKey, apiEndpoint } }))
    alert('Settings saved to long-term memory!')
  }

  useEffect(() => {
    setApiKey(localStorage.getItem('dola_api_key') || '')
    setApiEndpoint(localStorage.getItem('dola_api_endpoint') || '')
  }, [])

  const clearMemory = () => {
    if (confirm('Are you sure you want to clear all long-term memory? This cannot be undone.')) {
      localStorage.removeItem('nexus_dola_long_memory')
      setLongTermMemory({ chatHistory: [], generatedAssets: [], workflowRuns: [], userPreferences: {}, knowledgeBase: [] })
      setChatHistory([{ role: 'ai', content: '👋 Long-term memory cleared. Fresh start!' }])
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar glass-panel">
        <div className="sidebar-header">
          <h2>NEXUS DOLA</h2>
          <span className="badge">PRO</span>
        </div>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </div>
        ))}
        <div className="sidebar-footer">
          <div className="memory-status">
            <span style={{ fontSize: 11, color: '#8892b0' }}>🧠 Long Memory Active</span>
            <span style={{ fontSize: 10, color: '#00f5d4' }}>
              {longTermMemory.knowledgeBase.length + longTermMemory.generatedAssets.length + longTermMemory.workflowRuns.length} items stored
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="page">
            <div className="top-bar glass-panel">
              <div>
                <h1>🧠 AI Assistant</h1>
                <p className="subtitle">Long-term memory enabled • All chat saved permanently</p>
              </div>
              <select value={chatModel} onChange={e => setChatModel(e.target.value)}>
                <option value="dola-seed-2-1-turbo-260628">Dola Seed 2.1 Turbo — Director</option>
                <option value="deepseek-v4-1-flash-260910">DeepSeek V4.1 Flash — Reasoning + Vision</option>
                <option value="glm-5-3-flash-260828">GLM 5.3 Flash — Multimodal + Tools</option>
              </select>
            </div>
            <div className="chat-window glass-panel">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  <strong>{msg.role === 'user' ? 'You:' : 'Nexus Dola:'}</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="chat-input glass-panel">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message... (auto-saved to long-term memory)"
                rows={2}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={sendMessage}>Send</button>
                <button className="secondary" onClick={() => { setImgPrompt(input); setActiveTab('image') }}>Send to Image Gen</button>
                <button className="secondary" onClick={() => setActiveTab('orchestrator')}>Send to Workflow</button>
              </div>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <div className="page">
            <div className="editor-layout">
              <div className="left-panel">
                <div className="glass-panel">
                  <h3>✨ Image Generation</h3>
                  <label>Prompt:</label>
                  <textarea value={imgPrompt} onChange={e => setImgPrompt(e.target.value)} rows={5} placeholder="Describe the image you want..." />
                  <label>Model:</label>
                  <select value={imgModel} onChange={e => setImgModel(e.target.value)}>
                    <option value="seedream-5.0-pro">Seedream 5.0 Pro</option>
                    <option value="seedream-5.0-pro-max">Seedream 5.0 Pro Max (4K)</option>
                  </select>
                  <label>Style:</label>
                  <select value={imgStyle} onChange={e => setImgStyle(e.target.value)}>
                    <option value="realistic">Cinematic Realistic</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="neon-retro">80s Neon Retro</option>
                    <option value="anime">Anime</option>
                  </select>
                  <button onClick={generateImage} style={{ width: '100%', marginTop: 12 }}>🚀 Generate Image</button>
                  <p style={{ fontSize: 10, color: '#8892b0', marginTop: 8 }}>💾 Auto-saved to long-term memory</p>
                </div>
              </div>

              <div className="center-panel">
                <div className="preview-window glass-panel">
                  <div className="preview-header">
                    <span>Preview</span>
                    <span style={{ fontSize: 12, color: '#8892b0' }}>4K UHD • 24 FPS</span>
                  </div>
                  {selectedImage ? (
                    <img src={selectedImage} alt="preview" className="preview-img" />
                  ) : (
                    <div className="empty-state">Generated image preview will appear here</div>
                  )}
                </div>
              </div>

              <div className="right-panel">
                <div className="glass-panel inspector">
                  <h3>INSPECTOR</h3>
                  <p className="inspector-label">AI SCENE INFO</p>
                  <div className="inspector-item"><span>Objects</span><span>12</span></div>
                  <div className="inspector-item"><span>Motion</span><span>Medium</span></div>
                  <div className="inspector-item"><span>Lighting</span><span>Cinematic</span></div>
                  <p className="inspector-label" style={{ marginTop: 16 }}>COLOR PALETTE</p>
                  <div className="color-palette">
                    <span className="color-dot" style={{ background: '#00f5d4' }}></span>
                    <span className="color-dot" style={{ background: '#9d4edd' }}></span>
                    <span className="color-dot" style={{ background: '#ffb703' }}></span>
                    <span className="color-dot" style={{ background: '#00bbf9' }}></span>
                    <span className="color-dot" style={{ background: '#7b2cbf' }}></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ marginTop: 16 }}>
              <h3>📚 History Gallery (saved to long-term memory)</h3>
              <div className="gallery-grid">
                {generatedImages.map((img, i) => (
                  <div key={img.id || i} className="gallery-item" onClick={() => setSelectedImage(img.url)}>
                    <img src={img.url} alt={`gen-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Editor Tab */}
        {activeTab === 'video' && (
          <div className="page video-page">
            <div className="top-bar glass-panel">
              <div>
                <h1>🎬 Video Editor</h1>
                <p className="subtitle">Project: Nova_01</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="secondary">📤 Import Media</button>
                <button>💾 Export</button>
              </div>
            </div>

            <div className="editor-layout">
              <div className="left-panel">
                <div className="glass-panel">
                  <h3>✨ AI ASSIST</h3>
                  {['Scene Analysis', 'Shot Detection', 'Emotion Mapping'].map(item => (
                    <div key={item} className="ai-assist-item checked">
                      <span>{item}</span><span className="check">✓</span>
                    </div>
                  ))}
                  <div className="ai-assist-item">
                    <span>Auto Reframe</span><span className="check">⟳</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ marginTop: 16 }}>
                  <h3>🎞️ AI KEYFRAMES</h3>
                  <div className="scene-list">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="scene-item">
                        <img src={`https://picsum.photos/seed/scene${i}/80/50`} alt="" />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600 }}>Scene 0{i}</p>
                          <p style={{ fontSize: 10, color: '#8892b0' }}>Confidence {95 + i}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="secondary" style={{ width: '100%', marginTop: 12 }}>✨ Generate Highlights</button>
                </div>
              </div>

              <div className="center-panel">
                <div className="preview-window glass-panel">
                  <div className="preview-header">
                    <span>4K UHD • 23.976 FPS</span>
                    <div style={{ display: 'flex', gap: 8 }}><span>🔍</span><span>🔊</span><span>⚙️</span></div>
                  </div>
                  <img src="https://picsum.photos/seed/city/800/450" alt="video preview" className="preview-img" />
                  <div className="preview-controls">
                    <span>00:00:18:22</span>
                    <div className="control-buttons">
                      <button className="tiny-btn">⏮</button>
                      <button className="tiny-btn">⏪</button>
                      <button className="play-btn">▶</button>
                      <button className="tiny-btn">⏩</button>
                      <button className="tiny-btn">⏭</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="range" style={{ width: 60 }} min="0" max="100" />
                      <span>🔊</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-container glass-panel">
                  <div className="timeline-ruler">
                    {Array.from({length: 6}).map((_, i) => (
                      <span key={i} style={{ fontSize: 10, color: '#8892b0' }}>00:0{i}:00</span>
                    ))}
                  </div>
                  {[
                    { name: 'VIDEO', icon: '🔊', type: 'video' },
                    { name: 'AUDIO', icon: '', type: 'audio' },
                    { name: 'MUSIC', icon: '🎵', type: 'music' },
                    { name: 'SFX', icon: '', type: 'sfx' }
                  ].map(track => (
                    <div key={track.type} className={`timeline-track ${track.type}-track`}>
                      <div className="track-label">{track.name} {track.icon}</div>
                      <div className="track-body waveform">
                        <div className="waveform-line"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="right-panel">
                <div className="glass-panel inspector">
                  <h3>INSPECTOR</h3>
                  <p className="inspector-label">AI SCENE INFO</p>
                  <div className="inspector-item"><span>Scene 02</span><span>98%</span></div>
                  <div className="inspector-item"><span>Objects</span><span>12</span></div>
                  <div className="inspector-item"><span>Faces</span><span>0</span></div>
                  <div className="inspector-item"><span>Motion</span><span>Medium</span></div>
                  <div className="inspector-item"><span>Lighting</span><span>Cinematic</span></div>
                  <div className="inspector-item"><span>Emotion</span><span>Epic</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Orchestrator Tab (FULLY AGENTIC) */}
        {activeTab === 'orchestrator' && (
          <div className="page">
            <div className="top-bar glass-panel">
              <div>
                <h1>🔮 Agent Orchestrator</h1>
                <p className="subtitle">Fully agentic • Auto-executing workflow • All agents run autonomously</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="secondary" disabled={isWorkflowRunning}>+ New Agent</button>
                <button className="secondary" disabled={isWorkflowRunning}>Save Workflow</button>
                <button onClick={runAgenticWorkflow} disabled={isWorkflowRunning}>
                  {isWorkflowRunning ? '⏳ Running...' : '🚀 Deploy & Run Workflow'}
                </button>
              </div>
            </div>

            <div className="orchestrator-layout">
              <div className="left-panel">
                <div className="glass-panel">
                  <h3>📦 Components Library</h3>
                  <div className="component-list">
                    {['🧠 Memory Agent', '📝 Context Agent', '🎯 Domain Agent', '🛡️ Safety Layer', '👀 Safety Review Node', '🧑‍💼 Human Review Node'].map(item => (
                      <div key={item} className="component-item">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ marginTop: 16 }}>
                  <h3>📊 Workflow Status</h3>
                  {Object.keys(workflowProgress).length === 0 ? (
                    <p style={{ fontSize: 12, color: '#8892b0' }}>Click "Deploy & Run Workflow" to start autonomous execution</p>
                  ) : (
                    workflowNodes.map(node => (
                      <div key={node.id} className="ai-assist-item">
                        <span>{node.label}</span>
                        <span className="check">{workflowProgress[node.id] === 'complete' ? '✓' : isWorkflowRunning ? '⟳' : '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="canvas-container glass-panel">
                <div className="canvas-grid">
                  <svg className="connection-lines" width="100%" height="100%">
                    <path d="M 200 100 C 300 100, 300 180, 380 180" stroke="#00f5d4" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                    <path d="M 200 260 C 300 260, 300 180, 380 180" stroke="#9d4edd" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                    <path d="M 200 420 C 300 420, 300 320, 380 320" stroke="#00bbf9" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                    <path d="M 200 100 C 300 100, 300 320, 380 320" stroke="#7b2cbf" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                    <path d="M 200 260 C 300 260, 300 320, 380 320" stroke="#ffb703" fill="none" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                  {workflowNodes.map(node => (
                    <div
                      key={node.id}
                      className={`orchestrator-node ${workflowProgress[node.id] === 'complete' ? 'complete' : ''}`}
                      style={{ left: node.x, top: node.y, borderColor: node.color }}
                    >
                      <span className="node-icon">🧬</span>
                      <span style={{ fontWeight: 600 }}>{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="right-panel">
                <div className="glass-panel inspector">
                  <h3>⚙️ Configuration</h3>
                  <p className="inspector-label">Domain Data Sources</p>
                  <select><option>Long-term memory</option></select>
                  <select style={{ marginTop: 8 }}><option>Knowledge base</option></select>
                  
                  <p className="inspector-label" style={{ marginTop: 16 }}>Auto-execution</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12 }}>Enabled</span>
                    <div className="toggle active"></div>
                  </div>

                  <p className="inspector-label">Live Traceability Logs</p>
                  <div className="logs-container">
                    {workflowLogs.length === 0 ? (
                      <p style={{ fontSize: 11, color: '#5a5f7a' }}>Logs will appear here when workflow runs...</p>
                    ) : (
                      workflowLogs.map((log, i) => <div key={i} style={{ fontSize: 10, padding: '4px 0', color: '#c0c5d6' }}>{log}</div>)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Long-Term Memory Tab */}
        {activeTab === 'memory' && (
          <div className="page">
            <div className="top-bar glass-panel">
              <div>
                <h1>🧠 Long-Term Context Memory</h1>
                <p className="subtitle">Persistent storage • Survives refreshes • Unlimited context</p>
              </div>
              <button className="secondary" onClick={clearMemory}>🗑️ Clear All Memory</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="glass-panel">
                <h3>💬 Chat History</h3>
                <p className="memory-count">{longTermMemory.chatHistory.length} messages stored</p>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                  {longTermMemory.chatHistory.slice(0, 5).map((msg, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <strong style={{ color: msg.role === 'user' ? '#9d4edd' : '#00f5d4' }}>{msg.role}:</strong>
                      <span style={{ color: '#c0c5d6' }}> {msg.content.slice(0, 40)}...</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel">
                <h3>🖼️ Generated Assets</h3>
                <p className="memory-count">{longTermMemory.generatedAssets.length} items stored</p>
                <div className="gallery-grid" style={{ marginTop: 8 }}>
                  {longTermMemory.generatedAssets.filter(a => a.type === 'image').slice(0, 6).map((img, i) => (
                    <div key={i} className="gallery-item" style={{ height: 60 }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel">
                <h3>⚡ Workflow Runs</h3>
                <p className="memory-count">{longTermMemory.workflowRuns.length} completed runs</p>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                  {longTermMemory.workflowRuns.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#8892b0' }}>No workflows run yet</p>
                  ) : (
                    longTermMemory.workflowRuns.slice(0, 5).map((run, i) => (
                      <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#a6e3a1' }}>✅ {new Date(run.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-panel">
                <h3>📚 Knowledge Base</h3>
                <p className="memory-count">{longTermMemory.knowledgeBase.length} knowledge entries</p>
                <p style={{ fontSize: 12, color: '#8892b0', marginTop: 8 }}>
                  All your conversations, generated assets, and project data are stored here permanently. The AI can reference any of this at any time, no context window limits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="page">
            <h1>💻 AI Code Editor</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <div className="glass-panel">
                <h3>Code Editor</h3>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: 14, minHeight: 400 }}
                />
              </div>
              <div>
                <div className="glass-panel">
                  <h3>AI Code Assistant</h3>
                  <label>Model:</label>
                  <select value={codeModel} onChange={e => setCodeModel(e.target.value)}>
                    <option value="deepseek-coder-v2">DeepSeek Coder V2</option>
                    <option value="glm-5.1">GLM 5.1</option>
                    <option value="dola-seed-2.1-code">Dola Seed 2.1 Code</option>
                  </select>
                  <label>Prompt:</label>
                  <textarea value={codePrompt} onChange={e => setCodePrompt(e.target.value)} rows={3} placeholder="Describe what you want to do..." />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    {['Explain', 'Debug', 'Optimize', 'Refactor'].map(action => (
                      <button key={action} className="secondary" onClick={() => runCodeAction(action)}>{action}</button>
                    ))}
                  </div>
                </div>
                <div className="glass-panel">
                  <h3>AI Output</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{codeOutput}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vision + Multi-Agent Tab */}
        {activeTab === 'vision' && (
          <div className="page">
            <div className="top-bar glass-panel">
              <div>
                <h1>👁️ Vision + Multi-Agent Director</h1>
                <p className="subtitle">DeepSeek + GLM visual analysis • multi-character continuity • layered edit planning</p>
              </div>
              <button onClick={() => setVisionOutput(JSON.stringify(buildMultiAgentPlan(visionInstruction), null, 2))}>
                🧠 Build Agent Plan
              </button>
            </div>

            <div className="editor-layout">
              <div className="left-panel">
                <div className="glass-panel">
                  <h3>🎯 Visual Evidence</h3>
                  <select value={visionType} onChange={e => setVisionType(e.target.value)}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  <input value={visionUrl} onChange={e => setVisionUrl(e.target.value)} placeholder="Paste an image/video URL or ModelArk file URL..." />
                  <select value={visionModel} onChange={e => setVisionModel(e.target.value)}>
                    <option value="deepseek-v4-1-flash-260910">DeepSeek V4.1 Flash — Vision</option>
                    <option value="glm-5-3-flash-260828">GLM 5.3 Flash — Multimodal</option>
                    <option value="dola-seed-2-1-turbo-260628">Dola Seed 2.1 Turbo — Director</option>
                  </select>
                  <textarea value={visionInstruction} onChange={e => setVisionInstruction(e.target.value)} rows={5} />
                  <button onClick={runVisionAnalysis} disabled={visionBusy || !visionUrl.trim()} style={{ width: '100%', marginTop: 10 }}>
                    {visionBusy ? '⏳ Analyzing…' : '👁️ Analyze Media'}
                  </button>
                </div>
              </div>

              <div className="center-panel">
                <div className="glass-panel">
                  <h3>🔎 Analysis / Agent Graph</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.55 }}>{visionOutput}</pre>
                </div>
              </div>

              <div className="right-panel">
                <div className="glass-panel inspector">
                  <h3>🧩 Production Skills</h3>
                  {[
                    'Multimodal vision',
                    'Image creation',
                    'Video creation',
                    'Multi-character scenes',
                    'Character continuity',
                    'World continuity',
                    'Layered timeline editing',
                    'Targeted regeneration',
                    'QA + repair'
                  ].map(skill => (
                    <div key={skill} className="ai-assist-item"><span>{skill}</span><span className="check">✓</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'workflows' && (
          <div className="page">
            <div className="top-bar glass-panel">
              <div>
                <h1>🧩 ComfyUI Workflow Studio</h1>
                <p className="subtitle">This workflow library belongs only to the Dola agent. Import, create, edit, and run ComfyUI graphs.</p>
              </div>
              <button onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) stopAgentVoice(); else speakAgentReply('Voice replies are now enabled.'); }}>{voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}</button>
            </div>
            <WorkflowLibrary />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="page">
            <h1>⚙️ Settings</h1>
            <div className="glass-panel" style={{ maxWidth: 500 }}>
              <h3>ModelArk API Credentials</h3>
              <label>API Endpoint:</label>
              <input value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} placeholder="https://api.byteplus.com/v1/modelark" />
              <label>API Key:</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Your API key" />
              <button onClick={saveSettings} style={{ marginTop: 12 }}>Save Settings</button>
              <p style={{ marginTop: 12, fontSize: 12, color: '#8892b0' }}>🔒 Saved to your long-term memory (local browser only)</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .app-container {
          display: flex;
          min-height: 100vh;
          background: #0a0a0f;
          color: #e6e6f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(0, 245, 212, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(157, 78, 221, 0.05) 0%, transparent 50%);
        }
        .glass-panel {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }
        .sidebar {
          width: 240px;
          padding: 20px 12px;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding: 0 8px; }
        .sidebar-header h2 {
          font-size: 18px;
          background: linear-gradient(90deg, #00f5d4, #9d4edd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .badge { background: linear-gradient(90deg, #00f5d4, #00bbf9); color: #0a0a0f; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
        .nav-item {
          padding: 12px 16px;
          margin: 4px 0;
          border-radius: 8px;
          cursor: pointer;
          color: #8892b0;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-item.active, .nav-item:hover {
          background: rgba(0, 245, 212, 0.1);
          color: #00f5d4;
          border-left: 3px solid #00f5d4;
        }
        .memory-status { display: flex; flex-direction: column; gap: 4px; }
        .main-content { margin-left: 240px; padding: 24px; width: 100%; }
        .page { max-width: 100%; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        h3 { font-size: 14px; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .subtitle { color: #8892b0; font-size: 13px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .top-bar select { width: 240px; }
        button {
          background: linear-gradient(135deg, #00f5d4, #00bbf9);
          color: #0a0a0f;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        button.secondary { background: rgba(255, 255, 255, 0.08); color: #e6e6f0; border: 1px solid rgba(255,255,255,0.1); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,245,212,0.2); }
        input, textarea, select {
          background: rgba(10, 10, 15, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e6e6f0;
          padding: 10px;
          border-radius: 6px;
          width: 100%;
          margin: 6px 0;
          font-family: inherit;
          font-size: 14px;
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #00f5d4;
          box-shadow: 0 0 0 3px rgba(0,245,212,0.1);
        }
        .chat-window { height: 55vh; overflow-y: auto; margin-bottom: 16px; }
        .chat-bubble { margin: 14px 0; }
        .chat-bubble strong { color: #00f5d4; font-size: 13px; }
        .chat-bubble.user strong { color: #9d4edd; }
        .editor-layout { display: grid; grid-template-columns: 220px 1fr 240px; gap: 16px; }
        .preview-window { padding: 0; overflow: hidden; }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 12px;
          color: #8892b0;
        }
        .preview-img { width: 100%; height: 320px; object-fit: cover; }
        .preview-controls {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .control-buttons { display: flex; gap: 6px; align-items: center; }
        .tiny-btn { width: 32px; height: 32px; padding: 0; background: rgba(255,255,255,0.08); color: white; border-radius: 4px; font-size: 14px; }
        .play-btn { width: 40px; height: 40px; padding: 0; border-radius: 50%; font-size: 16px; }
        .inspector-label { font-size: 10px; font-weight: 700; color: #8892b0; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .inspector-item { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #c0c5d6; }
        .color-palette { display: flex; gap: 8px; }
        .color-dot { width: 24px; height: 24px; border-radius: 50%; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 12px; }
        .gallery-item {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
        }
        .gallery-item:hover { border-color: #00f5d4; transform: scale(1.02); }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .empty-state { height: 320px; display: flex; align-items: center; justify-content: center; color: #5a5f7a; font-size: 14px; }
        .timeline-container { margin-top: 16px; padding: 12px; }
        .timeline-ruler { display: flex; justify-content: space-between; padding: 4px 80px 4px 0; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 8px; }
        .timeline-track { display: flex; align-items: center; margin: 4px 0; height: 40px; }
        .track-label { width: 70px; font-size: 11px; font-weight: 600; color: #8892b0; }
        .track-body { flex: 1; height: 36px; border-radius: 4px; position: relative; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); }
        .waveform { display: flex; align-items: center; padding: 0 8px; }
        .waveform-line { width: 100%; height: 20px; background: repeating-linear-gradient(90deg, #a6e3a1 0px, #a6e3a1 2px, transparent 2px, transparent 4px); opacity: 0.6; }
        .ai-assist-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .ai-assist-item .check { color: #a6e3a1; font-size: 12px; }
        .scene-list { display: flex; flex-direction: column; gap: 8px; }
        .scene-item { display: flex; gap: 8px; padding: 6px; border-radius: 6px; background: rgba(255,255,255,0.05); cursor: pointer; }
        .scene-item img { width: 60px; height: 38px; border-radius: 4px; object-fit: cover; }
        /* Orchestrator */
        .orchestrator-layout { display: grid; grid-template-columns: 240px 1fr 280px; gap: 16px; }
        .component-list { display: flex; flex-direction: column; gap: 6px; }
        .component-item { padding: 10px; border-radius: 6px; background: rgba(255,255,255,0.05); font-size: 13px; cursor: grab; }
        .component-item:hover { background: rgba(0,245,212,0.1); color: #00f5d4; }
        .canvas-container { position: relative; height: 500px; padding: 0; overflow: hidden; }
        .canvas-grid {
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          position: relative;
        }
        .connection-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .orchestrator-node {
          position: absolute;
          width: 160px;
          height: 50px;
          background: rgba(20, 20, 30, 0.9);
          border: 2px solid #00f5d4;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          font-size: 13px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        .orchestrator-node.complete {
          background: rgba(0, 245, 212, 0.2);
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
        }
        .node-icon { font-size: 18px; }
        .logs-container { max-height: 200px; overflow-y: auto; }
        .toggle { width: 36px; height: 20px; border-radius: 10px; background: rgba(0,245,212,0.2); position: relative; border: 1px solid #00f5d4; }
        .toggle::after {
          content: '';
          position: absolute;
          right: 2px;
          top: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00f5d4;
        }
        .memory-count { font-size: 24px; font-weight: 800; color: #00f5d4; margin: 8px 0; }
        @media (max-width: 1024px) {
          .editor-layout, .orchestrator-layout { grid-template-columns: 1fr; }
          .sidebar { width: 100%; height: auto; position: relative; flex-direction: row; overflow-x: auto; }
          .sidebar-header, .sidebar-footer { display: none; }
          .nav-item { white-space: nowrap; }
          .main-content { margin-left: 0; padding: 16px; }
        }
      `}</style>
    </div>
  )
}