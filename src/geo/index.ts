import {CesiumMap} from "../utils/CesiumMap";
import * as Cesium from "cesium";

class MyCesiumMap extends CesiumMap {
  zoom = 10;
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

  //行政区块
  init() {
    Cesium.GeoJsonDataSource.load("https://geo.datav.aliyun.com/areas_v3/bound/440300_full.json").then((dataSource) => {
      this.viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i] as any;
        entity.polygon.material = new Cesium.Color(Math.random(), Math.random(), Math.random(), 0.5);
        entity.polygon.outline = true;
        entity.polygon.outlineWidth = 10;
        entity.polygon.outlineColor = Cesium.Color.WHITE;
        entity.polygon.height = 100;
      }
    });
  }
}
const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
