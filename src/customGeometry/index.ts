import * as Cesium from 'cesium';
import image from '../assets/logo.png';
import { CesiumMap } from '../utils/CesiumMap';
import materialGlsl from './material.glsl';
class PlaneGeometry {
  _workerName: string;
  lnglat: [number, number];
  lnglat1: [number, number];
  widthSegments: number;
  heightSegments: number;
  height: number;
  constructor(
    lnglat: [number, number],
    lnglat1: [number, number],
    widthSegments: number = 100,
    heightSegments: number = 100,
    height: number = 100
  ) {
    this.height = height;
    this.lnglat = lnglat;
    this.lnglat1 = lnglat1;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
    this._workerName = 'createPlaneGeometry';
  }
  getPlaneGeometry(
    lnglat: [number, number],
    lnglat1: [number, number],
    widthSegments: number = 100,
    heightSegments: number = 100,
    height3D: number = 0
  ) {
    const width: number = 1;
    const height: number = 1;

    const minlng = Math.min(lnglat[0], lnglat1[0]);
    const minlat = Math.min(lnglat[1], lnglat1[1]);
    const maxlng = Math.max(lnglat[0], lnglat1[0]);
    const maxlat = Math.max(lnglat[1], lnglat1[1]);
    const sizelng = maxlng - minlng;
    const sizelat = maxlat - minlat;
    const width_half = width / 2;
    const height_half = height / 2;

    const gridX = Math.floor(widthSegments);
    const gridY = Math.floor(heightSegments);

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    const segment_width = width / gridX;
    const segment_height = height / gridY;

    //

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals = [];
    const uvs: number[] = [];

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segment_height - height_half;

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segment_width - width_half;

        const pos = Cesium.Cartesian3.fromDegrees(
          x * sizelng + minlng,
          -y * sizelat + minlat,
          height3D
        );
        vertices.push(pos.x, pos.y, pos.z);

        normals.push(0, 0, 1);

        uvs.push(ix / gridX);
        uvs.push(1 - iy / gridY);
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = ix + 1 + gridX1 * (iy + 1);
        const d = ix + 1 + gridX1 * iy;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    return { vertices, uvs, indices };
  }
  createGeometry() {
    const { vertices, uvs, indices } = this.getPlaneGeometry(
      this.lnglat,
      this.lnglat1,
      this.widthSegments,
      this.heightSegments,
      this.height
    );
    const positions = new Float64Array(vertices);
    const geometry = new Cesium.Geometry({
      attributes: new Cesium.GeometryAttributes(),
      indices: new Uint16Array(indices),
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(
        positions,
        new Cesium.Cartesian3(0, 0, 0),
        3
      )
    });

    geometry.attributes.position = new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions
    });
    geometry.attributes.st = new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.FLOAT,
      componentsPerAttribute: 2,
      values: new Float32Array(uvs)
    });

    return geometry;
    // return new Cesium.Geometry({
    //   attributes: {
    //     position: new Cesium.GeometryAttribute({
    //       componentDatatype: Cesium.ComponentDatatype.FLOAT,
    //       componentsPerAttribute: 3,
    //       values: new Float32Array([0.0, 0.0, 0.0, 7500000.0, 0.0, 0.0, 0.0, 7500000.0, 0.0])
    //     })
    //   },
    //   primitiveType: Cesium.PrimitiveType.LINE_LOOP
    // });
  }
}

class MyCesiumMap extends CesiumMap {
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
    // const {vertices, uvs, indices} = this.getPlaneGeometry([114, 22], [116, 23]);

    // console.log("🚀 ~ index.ts ~ MyCesiumMap ~ init ~ vertices, uvs, indices:", vertices, uvs, indices);
    //https://sandcastle.cesium.com/?src=Materials.html&label=All
    const material = new Cesium.Material({
      fabric: {
        uniforms: {
          image
        },

        source: materialGlsl
      }
    });

    const geometry = new PlaneGeometry([114, 22.5], [115, 23]).createGeometry();
    const appearance = new Cesium.MaterialAppearance({
      // material: Cesium.Material.fromType("Image", {
      //   image: image
      // })
      material
    });
    this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry
        }),
        appearance,
        asynchronous: false
      })
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
