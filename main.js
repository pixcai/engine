const canvas = document.getElementById('c')
const device = new ENGINE.Device(canvas)
const camera = new ENGINE.Camera()

let meshes = []
// const mesh = new ENGINE.Mesh('cube', 8, 12)

// mesh.vertices[0] = new ENGINE.Vector3(-1, 1, 1)
// mesh.vertices[1] = new ENGINE.Vector3(1, 1, 1)
// mesh.vertices[2] = new ENGINE.Vector3(-1, -1, 1)
// mesh.vertices[3] = new ENGINE.Vector3(1, -1, 1)
// mesh.vertices[4] = new ENGINE.Vector3(-1, 1, -1)
// mesh.vertices[5] = new ENGINE.Vector3(1, 1, -1)
// mesh.vertices[6] = new ENGINE.Vector3(1, -1, -1)
// mesh.vertices[7] = new ENGINE.Vector3(-1, -1, -1)

// mesh.faces[0] = { A: 0, B: 1, C: 2 }
// mesh.faces[1] = { A: 1, B: 2, C: 3 }
// mesh.faces[2] = { A: 1, B: 3, C: 6 }
// mesh.faces[3] = { A: 1, B: 5, C: 6 }
// mesh.faces[4] = { A: 0, B: 1, C: 4 }
// mesh.faces[5] = { A: 1, B: 4, C: 5 }

// mesh.faces[6] = { A: 2, B: 3, C: 7 }
// mesh.faces[7] = { A: 3, B: 6, C: 7 }
// mesh.faces[8] = { A: 0, B: 2, C: 7 }
// mesh.faces[9] = { A: 0, B: 4, C: 7 }
// mesh.faces[10] = { A: 4, B: 5, C: 6 }
// mesh.faces[11] = { A: 4, B: 6, C: 7 }

// meshes.push(mesh)
camera.position = new ENGINE.Vector3(0, 0, 10)

function render() {
    device.clear()

    for (let i = 0; i < meshes.length; i++) {
        meshes[i].rotation.x += 0.01
        meshes[i].rotation.y += 0.01
    }
    device.render(camera, meshes)
    device.present()

    requestAnimationFrame(render)
}

device.loadJSON('monkey.json', function (meshesLoaded) {
    meshes = meshesLoaded
    requestAnimationFrame(render)
})