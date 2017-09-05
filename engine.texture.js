ENGINE.Texture = class {
    constructor(filename, width, height) {
        this.width = width
        this.height = height
        this.load(filename)
    }

    load(filename) {
        const imageTexture = new Image()

        imageTexture.width = this.width
        imageTexture.height = this.height

        imageTexture.onload = () => {
            const internalCanvas = document.createElement('canvas')
            const internalContext = internalCanvas.getContext('2d')

            internalCanvas.width = this.width
            internalCanvas.height = this.height

            internalContext.drawImage(imageTexture, 0, 0)
            this.internalBuffer = internalContext.getImageData(0, 0, this.width, this.height)
        }
        imageTexture.src = filename
    }

    map(tu, tv) {
        if (this.internalBuffer) {
            const u = Math.abs((tu * this.width) % this.width) >> 0
            const v = Math.abs((tv * this.height) % this.height) >> 0
            const position = (u + v * this.width) * 4
            const r = this.internalBuffer.data[position]
            const g = this.internalBuffer.data[position + 1]
            const b = this.internalBuffer.data[position + 2]
            const a = this.internalBuffer.data[position + 3]

            return new ENGINE.Color4(r / 255.0, g / 255.0, b / 255.0, a / 255.0)
        } else {
            return new ENGINE.Color4(1, 1, 1, 1)
        }
    }
}