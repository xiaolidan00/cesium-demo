import * as Cesium from 'cesium';
//https://cesium.com/blog/2019/04/29/gpu-powered-wind/
class CustomPrimitive {
  constructor() {
    // most of the APIs in the renderer module are private,
    // so you may want to read the source code of Cesium to figure out how to initialize the below components,
    // or you can take my wind visualization code as a example (https://github.com/RaymanNg/3D-Wind-Field)
    var vertexArray = new Cesium.VertexArray(parameters);
    var primitiveType = Cesium.PrimitiveType.TRIANGLES; // you can set it to other values
    var uniformMap = {
      uniformName: function () {
        // return the value corresponding to the name in the function
        // value can be a number, Cesium Cartesian vector, or Cesium.Texture
      }
    };
    var modelMatrix = new Cesium.Matrix4(parameters);
    var shaderProgram = new Cesium.ShaderProgram(parameters);
    var framebuffer = new Cesium.Framebuffer(parameters);
    var renderState = new Cesium.RenderState(parameters);
    var pass = Cesium.Pass.OPAQUE; // if you want the command to be executed in other pass, set it to corresponding value

    this.commandToExecute = new Cesium.DrawCommand({
      owner: this,
      vertexArray: vertexArray,
      primitiveType: primitiveType,
      uniformMap: uniformMap,
      modelMatrix: modelMatrix,
      shaderProgram: shaderProgram,
      framebuffer: framebuffer,
      renderState: renderState,
      pass: pass
    });
  }

  update(frameState) {
    // if (!this.show) return;
    // if you do not want to show the CustomPrimitive, use return statement to bypass the update

    frameState.commandList.push(this.commandToExecute);
  }

  isDestroyed() {
    // return true or false to indicate whether the CustomPrimitive is destroyed
  }

  destroy() {
    // this method will be called when the CustomPrimitive is no longer used
  }
}

// To begin the custom rendering, add the CustomPrimitive to the Scene
var viewer = new Cesium.Viewer('cesiumContainer');
var customPrimitive = new CustomPrimitive();
viewer.scene.primitives.add(customPrimitive);
