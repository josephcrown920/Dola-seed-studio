'use client'

import { useState } from 'react'
import ModelSelector from './ModelSelector'

function getResponseText(data) {
  return data?.choices?.[0]?.message?.content ||
    data?.output ||
    data?.error?.message ||
    (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
}

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your code here, or ask AI to generate/debug')
  const [aiPrompt, setAiPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('deepseek-coder-v2')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const runAiAction = async action => {
    setIsLoading(true)
    setOutput('')

    try {
      const response = await fetch('/api/modelark/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `${action}\n\nUser instructions:\n${aiPrompt || 'Work on the supplied code.'}\n\nCode:\n${code}`
        })
      })
      const data = await response.json()
      setOutput(getResponseText(data))
    } catch (error) {
      setOutput(`Request failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>💻 AI Code Editor</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h3>Code Editor</h3>
            <button onClick={() => runAiAction('Generate code')} disabled={isLoading}>
              {isLoading ? 'Working…' : 'Generate'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={event => setCode(event.target.value)}
            rows={20}
            style={{ fontFamily: 'monospace', fontSize: 14 }}
          />
        </div>

        <div>
          <div className="card">
            <h3>AI Code Assistant</h3>
            <label htmlFor="code-model">Model:</label>
            <ModelSelector
              type="code"
              selected={selectedModel}
              onSelect={setSelectedModel}
            />
            <label htmlFor="code-prompt">Prompt:</label>
            <textarea
              id="code-prompt"
              value={aiPrompt}
              onChange={event => setAiPrompt(event.target.value)}
              rows={3}
              placeholder="Describe what you want to do with the code..."
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {['Explain code', 'Debug code', 'Optimize code', 'Refactor code'].map(action => (
                <button
                  key={action}
                  className="secondary"
                  onClick={() => runAiAction(action)}
                  disabled={isLoading}
                >
                  {action.replace(' code', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Output</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#a6e3a1' }}>
              {output || 'AI output will appear here'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}