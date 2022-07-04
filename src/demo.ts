import vertShader from './shaders/triangle.vert.wgsl?raw'
import fragShader from './shaders/red.frag.wgsl?raw'

// 定义一个渲染类 
class Renderer {
    canvas: HTMLCanvasElement
    device: GPUDevice | undefined
    context: GPUCanvasContext | undefined
    format: GPUTextureFormat | undefined

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

   async initWebGPU() : Promise<void> {
        if(!navigator.gpu) 
            throw new Error("No gpu in navigator.")
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
            // powerPreference: 'low-power'
        })
        if (!adapter)
            throw new Error('No Adapter Found')
        this.device = await adapter.requestDevice()
        this.context = this.canvas.getContext('webgpu') as GPUCanvasContext
        this.format = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : this.context.getPreferredFormat(adapter)
        const devicePixelRatio = window.devicePixelRatio || 1
        this.canvas.width = this.canvas.clientWidth * devicePixelRatio
        this.canvas.height = this.canvas.clientHeight * devicePixelRatio
        this.context.configure({
            // json specific format when key and value are the same
            device: this.device, 
            format: this.format,
            // prevent chrome warning
            alphaMode: "opaque"
        })
   }

   async createPipeline() : Promise<GPURenderPipeline> {
        if (!this.device) 
            throw new Error("No init GPUDevice.")
        if (!this.format)
            throw new Error("No init GPUFormat")
        const descriptor: GPURenderPipelineDescriptor = {
            layout: "auto",
            vertex: {
                module: this.device.createShaderModule({
                    code: vertShader
                }),
                entryPoint: "main"
            },
            primitive: {
                topology: "triangle-list" // try point-list, line-list, line-strip, triangle-strip?
            },
            fragment: {
                module: this.device.createShaderModule({
                    code: fragShader
                }),
                entryPoint: "main",
                targets: [
                    {
                        format: this.format
                    }
                ]
            }
        }
        return await this.device.createRenderPipelineAsync(descriptor)
   }

   async draw() : Promise<void> {
         if (!this.device) 
            throw new Error("No init GPUDevice.")
        if (!this.context)
            throw new Error("No init GPUContent.")
        // 1. create pipeline
        const pipeline = await this.createPipeline()
        // 2. xxx
        const commandEncoder = this.device.createCommandEncoder()
        const view = this.context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: view,
                    clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
                    loadOp: 'clear', // clear/load
                    storeOp: 'store' // store/discard
                }
            ]
        }
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
        passEncoder.setPipeline(pipeline)
        // 3. vertex form a triangle
        passEncoder.draw(3)
        passEncoder.end()
        // 4. webgpu run in a separate process, all the commands will be executed after submit
        this.device.queue.submit([commandEncoder.finish()])
   }
}

async function run() {
    const canvas = document.querySelector("canvas")
    if (!canvas)
        throw new Error("No Canvas")
    const render = new Renderer(canvas)
    await render.initWebGPU()
    await render.draw()
}

run()