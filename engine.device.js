var cc = 0;
ENGINE.Device = class {
    constructor(canvas) {
        this.workingCanvas = canvas
        this.workingWidth = canvas.width
        this.workingHeight = canvas.height
        this.workingContext = canvas.getContext('2d')
        this.depthBuffer = new Array(this.workingWidth * this.workingHeight)
    }

    clear() {
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight)
        this.backBuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight)

        for (let i = 0; i < this.depthBuffer.length; i++) {
            this.depthBuffer[i] = 10000000
        }
    }

    clamp(value, min, max) {
        if (typeof min === 'undefined') min = 0
        if (typeof max === 'undefined') max = 1

        return Math.max(min, Math.min(value, max))
    }

    interpolate(min, max, gradient) {
        return min + (max - min) * this.clamp(gradient)
    }

    computeNDotL(vertex, normal, lightPosition) {
        const lightDirection = lightPosition.subtract(vertex)

        normal.normalize()
        lightDirection.normalize()

        return Math.max(0, ENGINE.Vector3.Dot(normal, lightDirection))
    }

    present() {
        this.workingContext.putImageData(this.backBuffer, 0, 0)
    }

    processScanLine(data, va, vb, vc, vd, color) {
        const pa = va.Coordinates
        const pb = vb.Coordinates
        const pc = vc.Coordinates
        const pd = vd.Coordinates
        const gradient1 = pa.y != pb.y ? (data.currentY - pa.y) / (pb.y - pa.y) : 1
        const gradient2 = pc.y != pd.y ? (data.currentY - pc.y) / (pd.y - pc.y) : 1
        const sx = this.interpolate(pa.x, pb.x, gradient1) >> 0
        const ex = this.interpolate(pc.x, pd.x, gradient2) >> 0
        const z1 = this.interpolate(pa.z, pb.z, gradient1)
        const z2 = this.interpolate(pc.z, pd.z, gradient2)

        for (let x = sx; x < ex; x++) {
            const gradient = (x - sx) / (ex - sx)
            const z = this.interpolate(z1, z2, gradient)
            const ndotl = data.ndotla

            this.drawPoint(new ENGINE.Vector3(x, data.currentY, z), new ENGINE.Color4(color.r * ndotl, color.g * ndotl, color.b * ndotl, 1))
        }
    }

    putPixel(x, y, z, color) {
        this.backBufferData = this.backBuffer.data

        const index = (x >> 0) + (y >> 0) * this.workingWidth
        const index4 = index * 4

        if (this.depthBuffer[index] < z) return

        this.depthBuffer[index] = z
        this.backBufferData[index4] = color.r * 255
        this.backBufferData[index4 + 1] = color.g * 255
        this.backBufferData[index4 + 2] = color.b * 255
        this.backBufferData[index4 + 3] = color.a * 255
    }

    project(vertex, transMat, world) {
        const point2d = ENGINE.Vector3.TransformCoordinates(vertex.Coordinates, transMat)
        const point3DWorld = ENGINE.Vector3.TransformCoordinates(vertex.Coordinates, world)
        const normal3DWorld = ENGINE.Vector3.TransformCoordinates(vertex.Normal, world)

        const x = point2d.x * this.workingWidth + this.workingWidth / 2.0
        const y = -point2d.y * this.workingHeight + this.workingHeight / 2.0

        return {
            Coordinates: new ENGINE.Vector3(x, y, point2d.z),
            Normal: normal3DWorld,
            WorldCoordinates: point3DWorld
        }
    }

    drawPoint(point, color) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
            this.putPixel(point.x, point.y, point.z, color)
        }
    }

    drawTriangle(v1, v2, v3, color) {
        let temp, dP1P2 = 0, dP1P3 = 0

        if (v1.Coordinates.y > v2.Coordinates.y) {
            temp = v2
            v2 = v1
            v1 = temp
        }
        if (v2.Coordinates.y > v3.Coordinates.y) {
            temp = v2
            v2 = v3
            v3 = temp
        }
        if (v1.Coordinates.y > v2.Coordinates.y) {
            temp = v2
            v2 = v1
            v1 = temp
        }

        const p1 = v1.Coordinates
        const p2 = v2.Coordinates
        const p3 = v3.Coordinates
        const vnFace = (v1.Normal.add(v2.Normal.add(v3.Normal))).scale(1 / 3)
        const centerPoint = (v1.WorldCoordinates.add(v2.WorldCoordinates.add(v3.WorldCoordinates))).scale(1 / 3)
        const lightPosition = new ENGINE.Vector3(0, 10, 10)
        const ndotl = this.computeNDotL(centerPoint, vnFace, lightPosition)
        const data = {
            ndotla: ndotl
        }

        if (p2.y > p1.y) {
            dP1P2 = (p2.x - p1.x) / (p2.y - p1.y)
        }
        if (p3.y > p1.y) {
            dP1P3 = (p3.x - p1.x) / (p3.y - p1.y)
        }
        if (dP1P2 > dP1P3) {
            for (let y = p1.y >> 0; y <= p3.y >> 0; y++) {
                data.currentY = y
                if (y < p2.y) {
                    this.processScanLine(data, v1, v3, v1, v2, color)
                } else {
                    this.processScanLine(data, v1, v3, v2, v3, color)
                }
            }
        } else {
            for (let y = p1.y >> 0; y <= p3.y >> 0; y++) {
                data.currentY = y
                if (y < p2.y) {
                    this.processScanLine(data, v1, v2, v1, v3, color)
                } else {
                    this.processScanLine(data, v2, v3, v1, v3, color)
                }
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

                const pixelA = this.project(vertexA, transformMatrix, worldMatrix)
                const pixelB = this.project(vertexB, transformMatrix, worldMatrix)
                const pixelC = this.project(vertexC, transformMatrix, worldMatrix)

                const color = 1 // 0.25 + ((indexFaces % mesh.faces.length) / mesh.faces.length) * 0.75

                this.drawTriangle(pixelA, pixelB, pixelC, new ENGINE.Color4(color, color, color, 1))
            }
        }
    }

    createMeshesFromJSON(jsonObject) {
        const meshes = []

        for (let meshIndex = 0; meshIndex < jsonObject.meshes.length; meshIndex++) {
            const verticesArray = jsonObject.meshes[meshIndex].vertices
            const indicesArray = jsonObject.meshes[meshIndex].indices
            const uvCount = jsonObject.meshes[meshIndex].uvCount
            let verticesStep = 1

            switch (uvCount) {
                case 0:
                    verticesStep = 6
                    break
                case 1:
                    verticesStep = 8
                    break
                case 2:
                    verticesStep = 10
                    break
            }

            const verticesCount = verticesArray.length / verticesStep
            const facesCount = indicesArray.length / 3
            const mesh = new ENGINE.Mesh(jsonObject.meshes[meshIndex].name, verticesCount, facesCount)

            for (let index = 0; index < verticesCount; index++) {
                const x = verticesArray[index * verticesStep]
                const y = verticesArray[index * verticesStep + 1]
                const z = verticesArray[index * verticesStep + 2]
                const nx = verticesArray[index * verticesStep + 3]
                const ny = verticesArray[index * verticesStep + 4]
                const nz = verticesArray[index * verticesStep + 5]
                
                mesh.vertices[index] = {
                    Coordinates: new ENGINE.Vector3(x, y, z),
                    Normal: new ENGINE.Vector3(nx, ny, nz)
                }
            }
            for (let index = 0; index < facesCount; index++) {
                const A = indicesArray[index * 3]
                const B = indicesArray[index * 3 + 1]
                const C = indicesArray[index * 3 + 2]
                mesh.faces[index] = { A: A, B: B, C: C }
            }

            const position = jsonObject.meshes[meshIndex].position

            mesh.position = new ENGINE.Vector3(position[0], position[1], position[2])
            meshes.push(mesh)
        }
        
        return meshes
    }

    loadJSON(filename, callback) {
        let jsonObject = {}
        const xhr = new XMLHttpRequest()

        xhr.open('GET', filename, true)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                jsonObject = JSON.parse(xhr.responseText)
                callback(this.createMeshesFromJSON(jsonObject))
            }
        }
        xhr.send(null)
    }
}