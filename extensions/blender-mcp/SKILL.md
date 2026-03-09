# Blender MCP Skill

Connect to local Blender via MCP socket and control 3D modeling with AI assistance.

## Core Workflow

**ALWAYS follow this loop when working with Blender:**

1. Call `blender_get_scene_info` to understand current state
2. Call `blender_execute_code` to make changes
3. Call `blender_export_glb` to export and view the interactive 3D model
4. Iterate based on feedback

**3D Viewer URL:** `http://localhost:18789/__openclaw__/canvas/blender-viewer.html`

- Fully interactive: rotate, zoom, pan
- Auto-updates when you call `blender_export_glb` again (just reload the page)

## Key Rules

- After EVERY code execution that modifies the scene, call `blender_get_screenshot` to see the result
- Use `bpy.data` instead of `bpy.ops` to avoid context errors
- Always clear the scene before creating new models: `for obj in list(bpy.data.objects): bpy.data.objects.remove(obj, do_unlink=True)`
- Use `bmesh` for precise geometry creation

## Code Patterns

### Create object with material

```python
import bpy, bmesh

mesh = bpy.data.meshes.new("MyMesh")
obj = bpy.data.objects.new("MyObject", mesh)
bpy.context.collection.objects.link(obj)

bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1)
bm.to_mesh(mesh)
bm.free()

mat = bpy.data.materials.new("MyMat")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.8, 0.8, 0.8, 1)
bsdf.inputs["Metallic"].default_value = 0.9
bsdf.inputs["Roughness"].default_value = 0.2
mesh.materials.append(mat)
```

### Add lighting + camera

```python
ld = bpy.data.lights.new("Light", "AREA")
ld.energy = 300
lo = bpy.data.objects.new("Light", ld)
bpy.context.collection.objects.link(lo)
lo.location = (0.4, -0.4, 0.5)

cd = bpy.data.cameras.new("Camera")
co = bpy.data.objects.new("Camera", cd)
bpy.context.collection.objects.link(co)
co.location = (0.4, -0.4, 0.3)
co.rotation_euler = (1.1, 0, 0.785)
bpy.context.scene.camera = co
```

### Bevel (rounded edges)

```python
bevel = obj.modifiers.new("Bevel", "BEVEL")
bevel.width = 0.01
bevel.segments = 4
```

## Available Tools

- `blender_get_scene_info` — list all objects, materials, lights
- `blender_get_object_info` — details of a specific object
- `blender_execute_code` — run Python in Blender
- `blender_get_screenshot` — capture viewport as image (call after every change)
- `blender_search_polyhaven` — search free 3D assets/textures
- `blender_download_polyhaven` — import asset into scene
- `blender_generate_3d_model` — text-to-3D via Hyper3D Rodin
