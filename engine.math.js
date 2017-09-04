ENGINE.Point = class {
    constructor(initialX, initialY) {
        this.x = initialX
        this.y = initialY
    }

    toString() {
        return `{x: ${this.x} y: ${this.y}}`
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    scale(scale) {
        return new ENGINE.Vector2(this.x * scale, this.y * scale)
    }

    add(otherVector) {
        return new ENGINE.Vector2(this.x + otherVector.x, this.y + otherVector.y)
    }

    subtract(otherVector) {
        return new ENGINE.Vector2(this.x - otherVector.x, this.y - otherVector.y)
    }
}

ENGINE.Color4 = class {
    constructor(initialR, initialG, initialB, initialA) {
        this.r = initialR
        this.g = initialG
        this.b = initialB
        this.a = initialA
    }

    toString() {
        return `{r: ${this.r} g: ${this.g} b: ${this.b} a: ${this.a}}`
    }
}

ENGINE.Vector2 = class extends ENGINE.Point {

}

ENGINE.Vector3 = class extends ENGINE.Point {
    constructor(initialX, initialY, initialZ) {
        super(initialX, initialY)
        this.z = initialZ
    }

    toString() {
        return `{x: ${this.x} y: ${this.y} z: ${this.z}}`
    }

    static Zero() {
        return new ENGINE.Vector3(0, 0, 0)
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    normalize() {
        const len = this.length()

        if (len === 0) return

        const num = 1.0 / len

        this.x *= num
        this.y *= num
        this.z *= num
    }

    scale(scale) {
        return new ENGINE.Vector3(this.x * scale, this.y * scale, this.z * scale)
    }

    add(otherVector) {
        return new ENGINE.Vector3(this.x + otherVector.x, this.y + otherVector.y, this.z + otherVector.z)
    }

    subtract(otherVector) {
        return new ENGINE.Vector3(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z)
    }

    multiply(otherVector) {
        return new ENGINE.Vector3(this.x * otherVector.x, this.y * otherVector.y, this.z * otherVector.z)
    }

    static Up() {
        return new ENGINE.Vector3(0, 1.0, 0)
    }

    static Dot(left, right) {
        return (left.x * right.x + left.y * right.y + left.z * right.z)
    }

    static Cross(left, right) {
        const x = left.y * right.z - left.z * right.y
        const y = left.z * right.x - left.x * right.z
        const z = left.x * right.y - left.y * right.x

        return new ENGINE.Vector3(x, y, z)
    }

    static TransformCoordinates(vector, transformation) {
        const x = (vector.x * transformation.m[0]) + (vector.y * transformation.m[4]) + (vector.z * transformation.m[8]) + transformation.m[12]
        const y = (vector.x * transformation.m[1]) + (vector.y * transformation.m[5]) + (vector.z * transformation.m[9]) + transformation.m[13]
        const z = (vector.x * transformation.m[2]) + (vector.y * transformation.m[6]) + (vector.z * transformation.m[10]) + transformation.m[14]
        const w = (vector.x * transformation.m[3]) + (vector.y * transformation.m[7]) + (vector.z * transformation.m[11]) + transformation.m[15]

        return new ENGINE.Vector3(x / w, y / w, z / w)
    }
}

ENGINE.Matrix = class {
    constructor() {
        this.m = []
    }

    static Identity() {
        return ENGINE.Matrix.FromValues(1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
    }

    static Zero() {
        return ENGINE.Matrix.FromValues(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    }

    multiply(other) {
        const result = new ENGINE.Matrix()

        result.m[0] = this.m[0] * other.m[0] + this.m[1] * other.m[4] + this.m[2] * other.m[8] + this.m[3] * other.m[12]
        result.m[1] = this.m[0] * other.m[1] + this.m[1] * other.m[5] + this.m[2] * other.m[9] + this.m[3] * other.m[13]
        result.m[2] = this.m[0] * other.m[2] + this.m[1] * other.m[6] + this.m[2] * other.m[10] + this.m[3] * other.m[14]
        result.m[3] = this.m[0] * other.m[3] + this.m[1] * other.m[7] + this.m[2] * other.m[11] + this.m[3] * other.m[15]
        result.m[4] = this.m[4] * other.m[0] + this.m[5] * other.m[4] + this.m[6] * other.m[8] + this.m[7] * other.m[12]
        result.m[5] = this.m[4] * other.m[1] + this.m[5] * other.m[5] + this.m[6] * other.m[9] + this.m[7] * other.m[13]
        result.m[6] = this.m[4] * other.m[2] + this.m[5] * other.m[6] + this.m[6] * other.m[10] + this.m[7] * other.m[14]
        result.m[7] = this.m[4] * other.m[3] + this.m[5] * other.m[7] + this.m[6] * other.m[11] + this.m[7] * other.m[15]
        result.m[8] = this.m[8] * other.m[0] + this.m[9] * other.m[4] + this.m[10] * other.m[8] + this.m[11] * other.m[12]
        result.m[9] = this.m[8] * other.m[1] + this.m[9] * other.m[5] + this.m[10] * other.m[9] + this.m[11] * other.m[13]
        result.m[10] = this.m[8] * other.m[2] + this.m[9] * other.m[6] + this.m[10] * other.m[10] + this.m[11] * other.m[14]
        result.m[11] = this.m[8] * other.m[3] + this.m[9] * other.m[7] + this.m[10] * other.m[11] + this.m[11] * other.m[15]
        result.m[12] = this.m[12] * other.m[0] + this.m[13] * other.m[4] + this.m[14] * other.m[8] + this.m[15] * other.m[12]
        result.m[13] = this.m[12] * other.m[1] + this.m[13] * other.m[5] + this.m[14] * other.m[9] + this.m[15] * other.m[13]
        result.m[14] = this.m[12] * other.m[2] + this.m[13] * other.m[6] + this.m[14] * other.m[10] + this.m[15] * other.m[14]
        result.m[15] = this.m[12] * other.m[3] + this.m[13] * other.m[7] + this.m[14] * other.m[11] + this.m[15] * other.m[15]

        return result
    }

    static LookAtLH(eye, target, up) {
        const zAxis = target.subtract(eye)
        zAxis.normalize()
        const xAxis = ENGINE.Vector3.Cross(up, zAxis)
        xAxis.normalize()
        const yAxis = ENGINE.Vector3.Cross(zAxis, xAxis)
        yAxis.normalize()
        const ex = -ENGINE.Vector3.Dot(xAxis, eye)
        const ey = -ENGINE.Vector3.Dot(yAxis, eye)
        const ez = -ENGINE.Vector3.Dot(zAxis, eye)

        return ENGINE.Matrix.FromValues(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.x, zAxis.z, 0, ex, ey, ez, 1)
    }

    static PerspectiveLH(width, height, znear, zfar) {
        const matrix = ENGINE.Matrix.Zero()

        matrix.m[0] = (2.0 * znear) / width
        matrix.m[1] = matrix.m[2] = matrix.m[3] = 0.0
        matrix.m[5] = (2.0 * znear) / height
        matrix.m[4] = matrix.m[6] = matrix.m[7] = 0.0
        matrix.m[8] = matrix.m[9] = 0.0
        matrix.m[11] = 1.0
        matrix.m[12] = matrix.m[13] = matrix.m[15] = 0.0
        matrix.m[14] = (znear * zfar) / (znear - zfar)

        return matrix
    }

    static PerspectiveFovLH(fov, aspect, znear, zfar) {
        const matrix = ENGINE.Matrix.Zero()
        const tan = 1.0 / (Math.tan(fov * 0.5))

        matrix.m[0] = tan / aspect
        matrix.m[1] = matrix.m[2] = matrix.m[3] = 0.0
        matrix.m[5] = tan
        matrix.m[4] = matrix.m[6] = matrix.m[7] = 0.0
        matrix.m[8] = matrix.m[9] = 0.0
        matrix.m[11] = 1.0
        matrix.m[12] = matrix.m[13] = matrix.m[15] = 0.0
        matrix.m[14] = (znear * zfar) / (znear - zfar)

        return matrix
    }

    static RotationYawPitchRoll(yaw, pitch, roll) {
        return ENGINE.Matrix.RotationZ(roll).multiply(ENGINE.Matrix.RotationX(pitch)).multiply(ENGINE.Matrix.RotationY(yaw))
    }

    static RotationX(angle) {
        const result = ENGINE.Matrix.Zero()
        const s = Math.sin(angle)
        const c = Math.cos(angle)

        result.m[0] = 1.0
        result.m[15] = 1.0
        result.m[5] = c
        result.m[10] = c
        result.m[9] = -s
        result.m[6] = s

        return result
    }

    static RotationY(angle) {
        const result = ENGINE.Matrix.Zero()
        const s = Math.sin(angle)
        const c = Math.cos(angle)

        result.m[5] = 1.0
        result.m[15] = 1.0
        result.m[0] = c
        result.m[2] = -s
        result.m[8] = s
        result.m[10] = c

        return result
    }

    static RotationZ(angle) {
        const result = ENGINE.Matrix.Zero()
        const s = Math.sin(angle)
        const c = Math.cos(angle)

        result.m[10] = 1.0
        result.m[15] = 1.0
        result.m[0] = c
        result.m[1] = s
        result.m[4] = -s
        result.m[5] = c

        return result
    }

    static Translation(x, y, z) {
        const result = ENGINE.Matrix.Identity()

        result.m[12] = x
        result.m[13] = y
        result.m[14] = z

        return result
    }

    static FromValues(initialM11, initialM12, initialM13, initialM14, initialM21, initialM22, initialM23, initialM24, initialM31, initialM32, initialM33, initialM34, initialM41, initialM42, initialM43, initialM44) {
        const result = new ENGINE.Matrix()

        result.m[0] = initialM11
        result.m[1] = initialM12
        result.m[2] = initialM13
        result.m[3] = initialM14
        result.m[4] = initialM21
        result.m[5] = initialM22
        result.m[6] = initialM23
        result.m[7] = initialM24
        result.m[8] = initialM31
        result.m[9] = initialM32
        result.m[10] = initialM33
        result.m[11] = initialM34
        result.m[12] = initialM41
        result.m[13] = initialM42
        result.m[14] = initialM43
        result.m[15] = initialM44

        return result
    }
}