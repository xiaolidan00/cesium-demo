import * as Cesium from "cesium";

import {CesiumMap} from "../utils/CesiumMap";
import mockdata from "../data/mockdata.json";
import {PosUtil} from "../utils/PosUtil";
const info = {
  max: Number.MIN_SAFE_INTEGER,
  min: Number.MAX_SAFE_INTEGER,
  size: 100
};
mockdata.forEach((item: any) => {
  info.max = Math.max(item.value, info.max);
  info.min = Math.min(item.value, info.min);
});
info.size = info.max - info.min;
class MyCesiumMap extends CesiumMap {
  info = info;
  zoom = 10;
  time = 0;
  barCollection = [] as string[];

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
  init() {
    const heightScale = PosUtil.levelToHeight(Math.floor(this.zoom * 1.3));
    mockdata.forEach((item, i) => {
      const {lat, lng, value} = item;
      const height = (value - this.info.min) / this.info.size;

      const color = Cesium.Color.fromHsl(height * 0.5 + 0.2, 1.0, 0.5);
      const surfacePosition = Cesium.Cartesian3.fromDegrees(Number(lng), Number(lat), 0);

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

      const entity = new Cesium.Entity({
        id: i + "line",
        polyline: polyline
      });
      this.viewer.entities.add(entity);
      this.barCollection.push(entity.id);
    });

    setTimeout(() => {
      this.viewer.scene.preRender.addEventListener(this.preRender.bind(this));
    }, 2000);
  }

  preRender() {
    if (this.time < 1) {
      this.time += 0.05;
    }
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
