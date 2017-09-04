ENGINE.Device = class {
    constructor(canvas) {
        this.workingCanvas = canvas
        this.workingWidth = canvas.width
        this.workingHeight = canvas.height
        this.workingContext = canvas.getContext('2d')
    }

    clear() {
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight)
        this.backBuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight)
    }

    present() {
        this.workingContext.putImageData(this.backBuffer, 0, 0)
    }

    putPixel(x, y, color) {
        this.backBufferData = this.backBuffer.data

        const index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4

        this.backBufferData[index + 0] = color.r * 255
        this.backBufferData[index + 1] = color.g * 255
        this.backBufferData[index + 2] = color.b * 255
        this.backBufferData[index + 3] = color.a * 255
    }

    project(coord, transMat) {
        const point = ENGINE.Vector3.TransformCoordinates(coord, transMat)
        const x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0
        const y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0

        return new ENGINE.Vector2(x, y)
    }

    drawPoint(point) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
            this.putPixel(point.x, point.y, new ENGINE.Color4(1, 1, 0, 1))
        }
    }

    drawLine(point0, point1) {
        let x0 = point0.x >> 0
        let y0 = point0.y >> 0
        const x1 = point1.x >> 0
        const y1 = point1.y >> 0
        const dx = Math.abs(x1 - x0)
        const dy = Math.abs(y1 - y0)
        const sx = (x0 < x1) ? 1 : -1
        const sy = (y0 < y1) ? 1 : -1
        let err = dx - dy

        while (true) {
            this.drawPoint(new ENGINE.Vector2(x0, y0))
            if ((x0 == x1) && (y0 == y1)) break
            const e2 = 2 * err
            if (e2 > -dy) {
                err -= dy
                x0 += sx
            }
            if (e2 < dx) {
                err += dx
                y0 += sy
            }
        }
    }

    render(camera, meshes) {
        const viewMatrix = ENGINE.Matrix.LookAtLH(camera.position, camera.target, ENGINE.Vector3.Up())
        const projectionMatrix = ENGINE.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0)

        for (let index = 0; index < meshes.length; index++) {
            const mesh = meshes[index]
            const worldMatrix = ENGINE.Matrix.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z).multiply(ENGINE.Matrix.Translation(mesh.position.x, mesh.position.y, mesh.position.z))
            const transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix)

            for (let indexFaces = 0; indexFaces < mesh.faces.length; indexFaces++) {
                const currentFace = mesh.faces[indexFaces]
                const vertexA = mesh.vertices[currentFace.A]
                const vertexB = mesh.vertices[currentFace.B]
                const vertexC = mesh.vertices[currentFace.C]

                const pixelA = this.project(vertexA, transformMatrix)
                const pixelB = this.project(vertexB, transformMatrix)
                const pixelC = this.project(vertexC, transformMatrix)

                this.drawLine(pixelA, pixelB)
                this.drawLine(pixelB, pixelC)
                this.drawLine(pixelC, pixelA)
            }
        }
    }
}