'use client'

import { useState } from 'react'
import ModelSelector from './ModelSelector'

function getResponseText(data) {
  return data?.result?.output_text ||
    data?.result?.choices?.[0]?.message?.content ||
    data?.result?.output ||
    data?.choices?.[0]?.message?.content ||
    data?.output ||
    data?.error?.message ||
    (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your code here, or ask Aurora Codex to generate/debug')
  const [aiPrompt, setAiPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('deepseek-coder-v2')
  const [mode, setMode] = useState('review')
  const [filePath, setFilePath] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const runCodingAgent = async action => {
    setIsLoading(true)
    setOutput('')

    try {
      const response = await fetch('/api/aurora/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          filePath,
          code,
          instruction: action + '. ' + (aiPrompt || 'Work on the supplied code.')
        })
      })
      const data = await response.json()
      setOutput(getResponseText(data))
    } catch (error) {
      setOutput('Request failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>💻 Codex Aurora</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Agentic coding inside Dola Seed Studio — reviewable first, execution later.</p>
        </div>
        <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(0,245,212,.12)', color: '#00f5d4', fontSize: 12 }}>
          Aurora Director
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div>
              <h3 style={{ marginBottom: 4 }}>Code Workspace</h3>
              <input
                value={filePath}
                onChange={event => setFilePath(event.target.value)}
                placeholder="Optional file path, e.g. app/page.js"
                style={{ width: '100%', maxWidth: 420 }}
              />
            </div>
            <button onClick={() => runCodingAgent('Generate or modify code')} disabled={isLoading}>
              {isLoading ? 'Working…' : 'Ask Aurora'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={event => setCode(event.target.value)}
            rows={24}
            style={{ fontFamily: 'monospace', fontSize: 14 }}
          />
        </div>

        <div>
          <div className="card">
            <h3>🤖 Aurora Coding Agent</h3>
            <label htmlFor="code-mode">Mode:</label>
            <select id="code-mode" value={mode} onChange={event => setMode(event.target.value)}>
              <option value="plan">Plan</option>
              <option value="edit">Edit</option>
              <option value="review">Review</option>
              <option value="debug">Debug</option>
            </select>

            <label htmlFor="code-model">Reasoning model:</label>
            <ModelSelector type="code" selected={selectedModel} onSelect={setSelectedModel} />

            <label htmlFor="code-prompt">Instruction:</label>
            <textarea
              id="code-prompt"
              value={aiPrompt}
              onChange={event => setAiPrompt(event.target.value)}
              rows={4}
              placeholder="Describe what you want Aurora to do with this code..."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {[
                ['Plan', 'Create an implementation plan'],
                ['Review', 'Review code for bugs/security'],
                ['Debug', 'Diagnose and propose a minimal fix'],
                ['Edit', 'Produce a reviewable code change']
              ].map(([name, action]) => (
                <button key={name} className="secondary" onClick={() => { setMode(name.toLowerCase()); runCodingAgent(action) }} disabled={isLoading}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Output / Proposed Change</h3>
              <span style={{ fontSize: 11, opacity: 0.6 }}>No automatic repo write</span>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#a6e3a1', maxHeight: 520, overflow: 'auto' }}>
              {output || 'Aurora output, plan, review, or proposed patch will appear here.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
