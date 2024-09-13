import * as Cesium from "cesium";

import { CesiumMap } from "../utils/CesiumMap";

class MyCesiumMap extends CesiumMap {
  isTerrain = false;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 113.00335444744138,
        lat: 38.99402121334489,
        height: 2109.337370044164,
      },
      {
        heading: 0,
        pitch: -45,
        roll: 360,
      }
    );
  }
  init(): void {}
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
