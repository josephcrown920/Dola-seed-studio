import WorkflowLibrary from '../components/WorkflowLibrary'

export default function WorkflowsPage() {
  return <main style={{minHeight:'100vh',padding:32,background:'#05070d',color:'#edf2ff'}}><div style={{maxWidth:1280,margin:'0 auto'}}><h1 style={{fontSize:36,marginBottom:8}}>Workflow Studio</h1><p style={{opacity:.7}}>Per-agent ComfyUI workflow library. Import exported ComfyUI API JSON, create workflows, edit them, and execute them against your configured ComfyUI server.</p><WorkflowLibrary /></div></main>
}
