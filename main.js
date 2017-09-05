const canvas = document.getElementById('c')
const device = new ENGINE.Device(canvas)
const camera = new ENGINE.Camera()

let meshes = []
let isMouseDown = false
let positionX = 0

camera.position = new ENGINE.Vector3(0, 0, 10)

canvas.addEventListener('mousedown', function (e) {
    isMouseDown = true
    positionX = e.x
})

canvas.addEventListener('mouseup', function () {
    isMouseDown = false
    positionX = 0
})

canvas.addEventListener('mousemove', function (e) {
    if (isMouseDown) {
        const y = e.x - positionX < 0 ? 0.1 : -0.1

        for (let i = 0; i < meshes.length; i++) {
            meshes[i].rotation.y += y
        }
        positionX = e.x
    }
})

function render() {
    device.clear()
    device.render(camera, meshes)
    device.present()

    requestAnimationFrame(render)
}

device.loadJSON('monkey.json', function (meshesLoaded) {
    meshes = meshesLoaded
    requestAnimationFrame(render)
})