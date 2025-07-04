import * as Cesium from "cesium";
import customMatGlsl from "./custom-material.glsl";
import customVertexGlsl from "./custom-vertex.glsl";
import customFragmentGlsl from "./custom-fragment.glsl";
import {CesiumMap} from "../utils/CesiumMap";
import {createGui} from "../utils/tool";

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: "无"
  };

  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 114.09596765019016,
        lat: 22.094395841725976,
        height: 82701.91469466327
      },
      {
        heading: 0,
        pitch: -53,
        roll: 0
      }
    );
  }
  init() {
    createGui(
      [
        {type: "title", title: "查看shader"},
        {
          name: "actions",
          type: "select",
          options: ["无", "color", "image", "custom"],
          onChange: (value) => {
            if (value === "color") {
              this.addColor();
            } else if (value === "image") {
              this.addImage();
            } else if (value === "custom") {
              this.addCustom();
            }
          }
        }
      ],
      this.dataObj
    );
  }
  addCustom() {
    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(113.5, 22.5, 114, 23),
        extrudedHeight: 3000
      }),
      id: "box with height"
    });

    const m = new Cesium.Material({
      fabric: {
        uniforms: {
          uColor: new Cesium.Color(1.0, 0.5, 0.0, 1.0)
        },
        source: customMatGlsl
      }
    });

    const aper = new Cesium.MaterialAppearance({
      material: m,
      vertexShaderSource: customVertexGlsl
      //   fragmentShaderSource: customFragmentGlsl
    });

    this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instance,
        appearance: aper
      })
    );

    const vs = aper.vertexShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ vs:", vs);
    const fs = aper.fragmentShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs:", fs);
    const fs2 = aper.getFragmentShaderSource();
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs2:", fs2);
  }
  addImage() {
    const extrudedPolygon = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray([
          114.09596765019016, 23.290411251106182, 113.09596765019016, 22.590768298743153, 114.83803246418894,
          22.285610818885644
        ])
      ),
      extrudedHeight: 3000
    });

    const instance = new Cesium.GeometryInstance({
      geometry: extrudedPolygon,
      id: "image"
    });

    const aper = new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType("Image", {
        image: "./logo.png"
      })
    });

    this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instance,
        appearance: aper,
        releaseGeometryInstances: false,
        compressVertices: false
      })
    );

    const vs = aper.vertexShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ vs:", vs);
    const fs = aper.fragmentShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs:", fs);
    const fs2 = aper.getFragmentShaderSource();
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs2:", fs2);
  }
  addColor() {
    const extrudedPolygon = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray([
          114.09596765019016, 23.290411251106182, 113.09596765019016, 22.590768298743153, 114.83803246418894,
          22.285610818885644
        ])
      ),
      extrudedHeight: 3000
    });

    const instance = new Cesium.GeometryInstance({
      geometry: extrudedPolygon,
      id: "box with height"
    });

    const m = new Cesium.Material({
      fabric: {
        type: "Color",
        uniforms: {
          color: new Cesium.Color(216 / 255.0, 170 / 255.0, 208 / 255.0).withAlpha(0.618)
        }
      }
    });

    const aper = new Cesium.MaterialAppearance({
      material: m
    });

    this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instance,
        appearance: aper,
        releaseGeometryInstances: false,
        compressVertices: false
      })
    );

    const vs = aper.vertexShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ vs:", vs);
    const fs = aper.fragmentShaderSource;
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs:", fs);
    const fs2 = aper.getFragmentShaderSource();
    console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ fs2:", fs2);
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
