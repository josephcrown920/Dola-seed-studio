'use client'

import { useEffect, useMemo, useState } from 'react'
import { createBlankWorkflow, loadStoredWorkflows, parseComfyWorkflow, saveStoredWorkflows, validateWorkflow } from '../lib/comfy-workflows'

export default function WorkflowLibrary() {
  const [workflows, setWorkflows] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [jsonText, setJsonText] = useState('')
  const [name, setName] = useState('New ComfyUI Workflow')
  const [status, setStatus] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const stored = loadStoredWorkflows()
    if (stored.length) { setWorkflows(stored); select(stored[0]) }
    else { const blank = createBlankWorkflow(); setWorkflows([blank]); select(blank) }
  }, [])

  function select(workflow) {
    setSelectedId(workflow.id)
    setName(workflow.name)
    setJsonText(JSON.stringify(workflow.prompt || workflow.ui || {}, null, 2))
    setStatus('')
  }

  function persist(next) { setWorkflows(next); saveStoredWorkflows(next) }

  function newWorkflow() {
    const wf = createBlankWorkflow()
    const next = [wf, ...workflows]
    persist(next); select(wf); setStatus('Blank workflow created.')
  }

  function importFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const wf = parseComfyWorkflow(JSON.parse(String(reader.result)), file.name.replace(/\.json$/i, ''))
        const next = [wf, ...workflows]
        persist(next); select(wf); setStatus('Imported ' + file.name + '.')
      } catch (error) { setStatus(error?.message || 'Import failed.') }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function saveCurrent() {
    const current = workflows.find((item) => item.id === selectedId)
    if (!current) return
    try {
      const parsed = JSON.parse(jsonText)
      const nextWorkflow = { ...current, name: name.trim() || current.name, prompt: current.format === 'ui' ? current.prompt : parsed, updatedAt: new Date().toISOString() }
      const next = workflows.map((item) => item.id === current.id ? nextWorkflow : item)
      persist(next); select(nextWorkflow); setStatus('Workflow saved locally.')
    } catch (error) { setStatus('JSON is invalid: ' + error.message) }
  }

  async function runCurrent() {
    const current = workflows.find((item) => item.id === selectedId)
    if (!current) return
    const validation = validateWorkflow(current)
    if (!validation.ok) { setStatus(validation.errors.join(' ')); return }
    setRunning(true); setStatus('Sending workflow to ComfyUI…')
    try {
      const response = await fetch('/api/comfy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflow: current.prompt, wait: true }) })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.error || data?.error?.message || 'ComfyUI run failed.')
      setStatus('Run complete · ' + data.promptId)
    } catch (error) { setStatus(error?.message || 'ComfyUI run failed.') }
    finally { setRunning(false) }
  }

  const selected = useMemo(() => workflows.find((item) => item.id === selectedId) || workflows[0], [workflows, selectedId])

  return <section style={{ marginTop: 20, padding: 20, borderRadius: 18, background: 'rgba(18,22,32,.94)', border: '1px solid rgba(255,255,255,.08)' }}>
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', flexWrap:'wrap' }}>
      <div><div style={{fontSize:11,opacity:.65,textTransform:'uppercase',letterSpacing:'.14em'}}>ComfyUI Workflows</div><h2 style={{margin:'6px 0 0',fontSize:26}}>Import · Create · Run</h2></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type='button' onClick={newWorkflow}>New</button><label style={{padding:'8px 12px',border:'1px solid rgba(255,255,255,.1)',borderRadius:9,cursor:'pointer'}}>Import JSON<input type='file' accept='.json,application/json' onChange={importFile} hidden /></label><button type='button' onClick={runCurrent} disabled={running}>{running ? 'Running…' : 'Run in ComfyUI'}</button></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'240px minmax(0,1fr)',gap:16,marginTop:16}}>
      <aside style={{display:'grid',gap:8,alignContent:'start'}}>{workflows.map((wf)=><button key={wf.id} type='button' onClick={()=>select(wf)} style={{textAlign:'left',padding:12,borderRadius:10,border:wf.id===selected?.id?'1px solid rgba(124,243,219,.45)':'1px solid rgba(255,255,255,.07)',background:wf.id===selected?.id?'rgba(124,243,219,.1)':'rgba(255,255,255,.02)',color:'#edf2ff'}}><strong>{wf.name}</strong><div style={{fontSize:11,opacity:.65,marginTop:4}}>{wf.format} · {wf.source}</div></button>)}</aside>
      <div style={{minWidth:0}}><input value={name} onChange={e=>setName(e.target.value)} placeholder='Workflow name' style={{width:'100%',marginBottom:10,padding:10,borderRadius:9,background:'rgba(0,0,0,.25)',color:'#edf2ff',border:'1px solid rgba(255,255,255,.1)'}} /><textarea value={jsonText} onChange={e=>setJsonText(e.target.value)} spellCheck={false} style={{width:'100%',minHeight:360,padding:12,borderRadius:10,background:'#080b12',color:'#dfe7ff',border:'1px solid rgba(255,255,255,.1)',fontFamily:'ui-monospace,monospace',fontSize:12}} /><div style={{display:'flex',justifyContent:'space-between',gap:10,marginTop:10}}><button type='button' onClick={saveCurrent}>Save workflow</button><span style={{fontSize:12,opacity:.7}}>{status}</span></div></div>
    </div>
  </section>
}
