import * as Cesium from "cesium";
import mockdata from "./mockdata.json";
import {CesiumMap} from "../utils/CesiumMap";
import {createGui} from "../utils/tool";
import {PosUtil} from "../utils/PosUtil";
import vertexGlsl from "./vertex.glsl";
import fragmentGlsl from "./fragment.glsl";

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
  heatmapCanvas?: HTMLCanvasElement;
  constructor(containerId: string) {
    super(containerId);
    const height = 82701.91469466327;
    this.zoom = PosUtil.heightToLevel(height);
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

  async init() {
    const {heatmapCanvas, info} = getHeatmap();
    this.heatmapCanvas = heatmapCanvas;
    this.info = info;
    this.viewer.scene.preRender.addEventListener(this.preRender.bind(this));
    // const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl("https://data.marsgis.cn/terrain");
    // this.viewer.terrainProvider = terrainProvider;

    createGui(
      [
        {type: "title", title: "泵房分布"},
        {
          name: "actions",
          type: "select",
          options: ["无", "柱体", "热力", "聚类", "行政区"],
          onChange: (value) => {
            if (value === "柱体") {
              this.addPolyline();
            } else if (value === "行政区") {
              this.addPolygon();
            } else if (value === "热力") {
              this.addHeatmap();
            } else if (value === "聚类") {
              this.addCluster();
            } else {
              this.isBar = false;
              this.viewer.dataSources.removeAll();
              this.viewer.entities.removeById("heatmap");
              this.areaCollection.forEach((id) => {
                this.viewer.entities.removeById(id);
              });
              this.areaCollection = [];
              this.barCollection.forEach((id) => {
                this.viewer.entities.removeById(id);
              });
              this.barCollection = [];
              if (this.heat) {
                this.viewer.scene.primitives.remove(this.heat);
                this.heat = undefined;
              }
            }
          }
        }
      ],
      this.dataObj
    );
  }
  addCluster() {
    const dataSource = new Cesium.CustomDataSource("cluster");
    mockdata.forEach((item, idx) => {
      const {lat, lng} = item;

      dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
        billboard: {
          image: "./Locations.svg",
          scale: 0.5,
          //取消深度测试
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    });
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = 100;
    dataSource.clustering.minimumClusterSize = 2;

    const size = 60;
    const halfSize = size * 0.5;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    this.removeListener = dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.id = cluster.label.id;
      cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.CENTER;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
      ctx.fillStyle = "#1E90FF";
      ctx.fill();
      const text = clusteredEntities.length + "";
      ctx.font = `16px serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const t = ctx.measureText(text).width;
      ctx.fillText(text, halfSize - t * 0.5, halfSize);
      cluster.billboard.image = canvas.toDataURL();
    });

    this.viewer.dataSources.add(dataSource);
  }
  addHeatmap() {
    const appearance = new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Image", {
        image: this.heatmapCanvas!.toDataURL()
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
      appearance
    });
    this.heat = heat;
    this.viewer.scene.primitives.add(heat);
  }

  addPolygon() {
    Cesium.GeoJsonDataSource.load("https://geo.datav.aliyun.com/areas_v3/bound/440300_full.json").then((dataSource) => {
      this.viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        entity.polygon.material = Cesium.Color.LIGHTSEAGREEN.withAlpha(0.3 + (i / entities.length) * 0.5);
        entity.polygon.outline = true;
        entity.polygon.outlineWidth = 10;
        entity.polygon.outlineColor = Cesium.Color.WHITE;
        entity.polygon.height = 100;
      }
    });
  }
  addPolyline() {
    const heightScale = PosUtil.levelToHeight(Math.floor(this.zoom * 1.3));
    mockdata.forEach((item, i) => {
      const {lat, lng, value} = item;
      const height = (value - this.info.min) / this.info.size;

      const color = Cesium.Color.fromHsl(height * 0.5 + 0.2, 1.0, 0.5);
      const surfacePosition = Cesium.Cartesian3.fromDegrees(Number(lng), Number(lat), 0);

      //WebGL Globe only contains lines, so that's the only graphics we create.
      const polyline = new Cesium.PolylineGraphics();
      polyline.material = new Cesium.ColorMaterialProperty(color);
      polyline.width = new Cesium.ConstantProperty(2);
      polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.NONE);
      polyline.positions = new Cesium.CallbackProperty(() => {
        const heightPosition = Cesium.Cartesian3.fromDegrees(
          Number(lng),
          Number(lat),
          this.time * height * heightScale
        );
        return [surfacePosition, heightPosition];
      }, false);

      //The polyline instance itself needs to be on an entity.
      const entity = new Cesium.Entity({
        id: i + "line",
        polyline: polyline
      });
      this.viewer.entities.add(entity);
      this.barCollection.push(entity.id);
    });
    this.isBar = true;
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
