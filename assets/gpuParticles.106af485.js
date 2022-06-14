import"./modulepreload-polyfill.b7f2da20.js";import{b as v}from"./basic.instanced.vert.13515952.js";import{p as w}from"./position.frag.0b35f8ff.js";import{v as h,i as P,a as M}from"./box.c678a105.js";import{g as U,a as G}from"./math.c29ca26c.js";import"./mat4.f7fc816f.js";var b=`@group(0) @binding(0) var<storage, read> input: array<f32, 10>;
@group(0) @binding(1) var<storage, read_write> velocity: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> modelView: array<mat4x4<f32>>;
@group(0) @binding(3) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(4) var<storage, write> mvp : array<mat4x4<f32>>;

let size = u32(128);
@stage(compute) @workgroup_size(size)
fn main(
    @builtin(global_invocation_id) GlobalInvocationID : vec3<u32>,
    @builtin(num_workgroups) GroupSize: vec3<u32>
) {
    var index = GlobalInvocationID.x;
    if(index >= u32(input[0])){
        return;
    }
    var xMin = input[1];
    var xMax = input[2];
    var yMin = input[3];
    var yMax = input[4];
    var zMin = input[5];
    var zMax = input[6];
    var pos = modelView[index][3];
    var vel = velocity[index];
    // change x
    pos.x += vel.x;
    if(pos.x < xMin){
        pos.x = xMin;
        vel.x = -vel.x;
    }else if(pos.x > xMax){
        pos.x = xMax;
        vel.x = -vel.x;
    }
    // change y
    pos.y += vel.y;
    if(pos.y < yMin){
        pos.y = yMin;
        vel.y = -vel.y;
    }else if(pos.y > yMax){
        pos.y = yMax;
        vel.y = -vel.y;
    }
    // change z
    pos.z += vel.z;
    if(pos.z < zMin){
        pos.z = zMin;
        vel.z = -vel.z;
    }else if(pos.z > zMax){
        pos.z = zMax;
        vel.z = -vel.z;
    }
    // update position & velocity
    velocity[index] = vel;
    modelView[index][3] = pos;
    // update mvp
    mvp[index] = projection * modelView[index];
}`;async function z(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const n=await navigator.gpu.requestAdapter();if(!n)throw new Error("No Adapter Found");const a=await n.requestDevice(),i=e.getContext("webgpu"),r=navigator.gpu.getPreferredCanvasFormat?navigator.gpu.getPreferredCanvasFormat():i.getPreferredFormat(n),t=window.devicePixelRatio||1;e.width=e.clientWidth*t,e.height=e.clientHeight*t;const c={width:e.width,height:e.height};return i.configure({device:a,format:r,alphaMode:"opaque"}),{device:a,context:i,format:r,size:c}}async function T(e,n,a){const i=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:v}),entryPoint:"main",buffers:[{arrayStride:32,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:w}),entryPoint:"main",targets:[{format:n}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),r=e.createTexture({size:a,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t=r.createView(),c=await e.createComputePipelineAsync({layout:"auto",compute:{module:e.createShaderModule({code:b}),entryPoint:"main"}}),d=e.createBuffer({label:"GPUBuffer store vertex",size:h.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(d,0,h);const s=e.createBuffer({label:"GPUBuffer store index",size:P.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(s,0,P);const p=e.createBuffer({label:"GPUBuffer store NUM model matrix",size:4*4*4*u,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),l=e.createBuffer({label:"GPUBuffer store camera projection",size:4*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),g=e.createBuffer({label:"GPUBuffer store NUM MVP",size:4*4*4*u,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),m=e.createBuffer({label:"GPUBuffer store NUM velocity",size:4*4*u,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),o=e.createBuffer({label:"GPUBuffer store camera projection",size:10*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),f=e.createBindGroup({label:"Group for renderPass",layout:i.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:g}}]}),x=e.createBindGroup({label:"Group for computePass",layout:c.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:o}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:p}},{binding:3,resource:{buffer:l}},{binding:4,resource:{buffer:g}}]});return{renderPipeline:i,computePipeline:c,vertexBuffer:d,indexBuffer:s,modelBuffer:p,projectionBuffer:l,inputBuffer:o,velocityBuffer:m,renderGroup:f,computeGroup:x,depthTexture:r,depthView:t}}function S(e,n,a){const i=e.createCommandEncoder(),r=i.beginComputePass();r.setPipeline(a.computePipeline),r.setBindGroup(0,a.computeGroup),r.dispatchWorkgroups(Math.ceil(u/128)),r.end();const t=i.beginRenderPass({colorAttachments:[{view:n.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:a.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});t.setPipeline(a.renderPipeline),t.setVertexBuffer(0,a.vertexBuffer),t.setIndexBuffer(a.indexBuffer,"uint16"),t.setBindGroup(0,a.renderGroup),t.drawIndexed(M,u),t.end(),e.queue.submit([i.finish()])}let u=15e4;async function E(){var m;const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:n,context:a,format:i,size:r}=await z(e),t=await T(n,i,r),c=new Float32Array([u,-500,500,-250,250,-500,500]),d=new Float32Array(u*4*4),s=new Float32Array(u*4);for(let o=0;o<u;o++){const f=Math.random()*1e3-500,x=Math.random()*500-250,y=Math.random()*1e3-500,B=U({x:f,y:x,z:y});d.set(B,o*4*4),s[o*4+0]=Math.random()-.5,s[o*4+1]=Math.random()-.5,s[o*4+2]=Math.random()-.5,s[o*4+3]=1}n.queue.writeBuffer(t.velocityBuffer,0,s),n.queue.writeBuffer(t.modelBuffer,0,d),n.queue.writeBuffer(t.inputBuffer,0,c);const p={x:0,y:50,z:1e3};let l=r.width/r.height;function g(){const o=performance.now()/5e3;p.x=1e3*Math.sin(o),p.z=1e3*Math.cos(o);const f=G(l,60/180*Math.PI,.1,1e4,p);n.queue.writeBuffer(t.projectionBuffer,0,f),S(n,a,t),requestAnimationFrame(g)}g(),window.addEventListener("resize",()=>{r.width=e.width=e.clientWidth*devicePixelRatio,r.height=e.height=e.clientHeight*devicePixelRatio,t.depthTexture.destroy(),t.depthTexture=n.createTexture({size:r,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t.depthView=t.depthTexture.createView(),l=r.width/r.height}),(m=document.querySelector("input"))==null||m.addEventListener("input",o=>{u=+o.target.value;const f=document.querySelector("#num");f.innerHTML=u.toString()})}E();
