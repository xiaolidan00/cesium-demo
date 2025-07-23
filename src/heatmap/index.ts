import * as Cesium from "cesium";
import mockdata from "../data/mockdata.json";
import {CesiumMap} from "../utils/CesiumMap";

import {PosUtil} from "../utils/PosUtil";
import vertexGlsl from "./vertex.glsl";
import materialGlsl from "./material.glsl";

import {SphericalMercator} from "./SphericalMercator";

import {createHeatmap} from "./heatmap";
function getHeatmap() {
  const zoom = 11;

  const info: any = {
    max: Number.MIN_SAFE_INTEGER,
    min: Number.MAX_SAFE_INTEGER,
    maxlng: Number.MIN_SAFE_INTEGER,
    minlng: Number.MAX_SAFE_INTEGER,
    maxlat: Number.MIN_SAFE_INTEGER,
    minlat: Number.MAX_SAFE_INTEGER,

    maxlng1: Number.MIN_SAFE_INTEGER,
    minlng1: Number.MAX_SAFE_INTEGER,
    maxlat1: Number.MIN_SAFE_INTEGER,
    minlat1: Number.MAX_SAFE_INTEGER,
    data: []
  };
  mockdata.forEach((item: any) => {
    const [lng, lat] = SphericalMercator.lnglat2px([item.lng, item.lat], zoom);
    item.lat1 = lat;
    item.lng1 = lng;

    info.max = Math.max(item.value, info.max);
    info.min = Math.min(item.value, info.min);

    info.maxlng1 = Math.max(lng, info.maxlng1);
    info.maxlat1 = Math.max(lat, info.maxlat1);

    info.minlng1 = Math.min(lng, info.minlng1);
    info.minlat1 = Math.min(lat, info.minlat1);
    info.data.push(item);
  });
  info.size = info.max - info.min;

  console.log(info);

  const radius = 20;
  info.minlng1 -= radius;
  info.minlat1 -= radius;
  info.maxlng1 += radius;
  info.maxlat1 += radius;
  info.sizelng = info.maxlng1 - info.minlng1;
  info.sizelat = info.maxlat1 - info.minlat1;
  const minpoint = SphericalMercator.px2lnglat([info.minlng1, info.minlat1], zoom);
  const maxpoint = SphericalMercator.px2lnglat([info.maxlng1, info.maxlat1], zoom);
  info.minlng = Math.min(minpoint[0], maxpoint[0]);
  info.minlat = Math.min(minpoint[1], maxpoint[1]);
  info.maxlng = Math.max(minpoint[0], maxpoint[0]);
  info.maxlat = Math.max(minpoint[1], maxpoint[1]);
  const heatmapCanvas = createHeatmap({
    width: info.sizelng,
    height: info.sizelat,
    colors: {
      0.1: "#2A85B8",
      0.2: "#16B0A9",
      0.3: "#29CF6F",
      0.4: "#5CE182",
      0.5: "#7DF675",
      0.6: "#FFF100",
      0.7: "#FAA53F",
      1: "#D04343"
    },
    radius,
    ...info
    // x, y 表示二维坐标； value表示强弱值
  });
  return {info, heatmapCanvas};
}
class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: "无"
  };
  areaCollection = [] as string[];
  barCollection = [] as string[];
  zoom = 10;
  heat?: Cesium.GroundPrimitive;
  removeListener: any;
  time = 0;
  isBar = false;
  info: any;
  height = 82701.91469466327;
  heatmapCanvasData?: string;
  constructor(containerId: string) {
    super(containerId);

    this.zoom = PosUtil.heightToLevel(this.height);
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
  preRender() {
    if (this.isBar) {
      if (this.time < 1) {
        this.time += 0.05;
      }
    }
  }
  loadImage(heatmapCanvas: HTMLCanvasElement) {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = heatmapCanvas.toDataURL();
      img.onload = () => {
        resolve(img);
      };
    });
  }
  async init() {
    const {heatmapCanvas, info} = getHeatmap();
    this.heatmapCanvasData = heatmapCanvas.toDataURL();
    this.info = info;
    this.viewer.scene.preRender.addEventListener(this.preRender.bind(this));
    // this.addHeatmap();
    this.addHeatmapTerrain();
  }
  getPlaneGeometry(
    lnglat: [number, number],
    lnglat1: [number, number],
    widthSegments: number = 100,
    heightSegments: number = 100,
    height3D: number = 0
  ) {
    const minlng = Math.min(lnglat[0], lnglat1[0]);
    const minlat = Math.min(lnglat[1], lnglat1[1]);
    const maxlng = Math.max(lnglat[0], lnglat1[0]);
    const maxlat = Math.max(lnglat[1], lnglat1[1]);
    const sizelng = maxlng - minlng;
    const sizelat = maxlat - minlat;

    const gridX = Math.floor(widthSegments);
    const gridY = Math.floor(heightSegments);

    const unitx = sizelng / gridX;
    const unity = sizelat / gridY;
    const gridX1 = gridX + 1;

    const indices: number[] = [];

    const vertices: number[] = [];
    const normals = [];
    const uvs: number[] = [];

    for (let iy = 0; iy <= gridY; iy++) {
      for (let ix = 0; ix <= gridX; ix++) {
        const pos = Cesium.Cartesian3.fromDegrees(ix * unitx + minlng, iy * unity + minlat, height3D);
        vertices.push(pos.x, pos.y, pos.z);

        normals.push(0, 0, 1);

        uvs.push(ix / gridX);
        uvs.push(iy / gridY);

        if (iy < gridX1) {
          const a = ix + gridX1 * iy;
          const b = a + 1;
          const c = ix + gridX1 * (iy + 1);
          const d = c + 1;
          indices.push(a, c, b);
          indices.push(c, d, b);
        }
      }
    }
    // console.log(vertices, uvs, indices);
    const positions = new Float64Array(vertices);
    const geometry = new Cesium.Geometry({
      attributes: new Cesium.GeometryAttributes(),
      indices: new Uint16Array(indices),

      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(vertices, new Cesium.Cartesian3(0, 0, 0), 3)
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
  }

  addHeatmapTerrain() {
    const material = Cesium.Material.fromType("Image", {
      image: this.heatmapCanvasData
    });

    material.shaderSource = materialGlsl;

    const appearance = new Cesium.MaterialAppearance({
      material,
      vertexShaderSource: vertexGlsl
    });

    console.log(appearance.vertexShaderSource);

    const heat = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: this.getPlaneGeometry(
          [this.info.minlng, this.info.minlat],
          [this.info.maxlng, this.info.maxlat],
          400,
          200,
          100
        )
      }),
      appearance,
      asynchronous: false
    });
    this.viewer.scene.primitives.add(heat);
  }
  addHeatmap() {
    const appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Image", {
        image: this.heatmapCanvasData
      })
    });
    const heat = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(
            this.info.minlng,
            this.info.minlat,
            this.info.maxlng,
            this.info.maxlat
          )
        })
      }),
      appearance,
      asynchronous: false
    });
    this.heat = heat;
    this.viewer.scene.primitives.add(heat);
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
