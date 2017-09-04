ENGINE.Mesh = class {
    constructor(name, verticesCount, facesCount) {
        this.name = name
        this.vertices = new Array(verticesCount)
        this.faces = new Array(facesCount)
        this.rotation = ENGINE.Vector3.Zero()
        this.position = ENGINE.Vector3.Zero()
    }
}