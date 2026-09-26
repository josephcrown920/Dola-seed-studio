# Dola Seed Studio — ComfyUI Workflow Studio

The Dola agent keeps its own ComfyUI workflow library. Workflows can be imported, edited, created from scratch and executed against a ComfyUI server.

## Configure

Set `COMFYUI_BASE_URL` to the ComfyUI server, for example:

`COMFYUI_BASE_URL=http://127.0.0.1:8188`

The browser UI is available at `/workflows`.

## Import

Use a ComfyUI JSON export. API-format graphs are executable directly. Editor-format workflow JSON is preserved for reference, but must be exported from ComfyUI as API format before execution.

ComfyUI's execution API accepts a prompt graph at `/prompt`, returns a `prompt_id`, and exposes completed results through `/history/{prompt_id}`. The Dola route uses that pattern.

## Agent routing

The multimodal agent catalog now includes a ComfyUI workflow role. The director can route a shot to a saved workflow before the editor assembles the result.
