import * as Cesium from "cesium";

import { EventBus, useEventBus } from "../utils/EventBus";

import { CesiumMap } from "../utils/CesiumMap";
import { DynamicPrimitive } from "./DynamicPrimitive";

class MyCesiumMap extends CesiumMap {
  isTerrain = true;
  terrainChangeEvent = "terrainChangeEvent";
  constructor(containerId: string) {
    super(containerId);
    // this.setView(
    //   {
    //     lng: 112.99793630124755,
    //     lat: 38.993141215272466,
    //     height: 595.3241643506092,
    //   },
    //   {
    //     heading: 0,
    //     pitch: -30,
    //     roll: 360,
    //   }
    // );

    this.setView(
      {
        lng: 114.12139292195221,
        lat: 23.494146019762045,
        height: 400,
      },
      {
        heading: 0,
        pitch: -50,
        roll: 360,
      }
    );
  }
  async init() {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      "https://data.marsgis.cn/terrain",
      {
        requestVertexNormals: true,
      }
    );
    // this.viewer.terrainProvider = terrainProvider;

    this.viewer.scene.globe.terrainProviderChanged.addEventListener((ev) => {
      console.log("%c地形改变", "background:yellow", ev);
    });

    DynamicPrimitive.viewer = this.viewer;
    // const polygon = DynamicPrimitive.addPolygon({
    //   id: "aaa",
    //   positions: [
    //     [113, 39],
    //     [113.002, 39],
    //     [113.002, 39.002],
    //   ],
    //   color: Cesium.Color.YELLOW.withAlpha(0.5),
    //   outline: true,
    //   outlineColor: Cesium.Color.YELLOW,
    //   outlineWidth: 3,
    //   isGround: true,
    //   isPoint: true,
    // });

    // const polygon = DynamicPrimitive.addPolygon({
    //   id: "aaa",
    //   positions: [
    //     [114.12139292195221, 23.494146019762045, 244.94998754302043],
    //     [114.0781432964593, 23.457089645698883, 83.74397088283233],
    //     [114.02284024948034, 23.50605266019647, 322.2697819772894],
    //   ],
    //   color: Cesium.Color.YELLOW.withAlpha(0.5),
    //   outline: true,
    //   outlineColor: Cesium.Color.YELLOW,
    //   outlineWidth: 3,
    //   isGround: true,
    // });

    // const line = DynamicPrimitive.addPolyline({
    //   id: "bbb",
    //   positions: [
    //     [113.004, 39],
    //     [113.006, 39],
    //     [113.006, 39.002],
    //   ],
    //   color: Cesium.Color.BLUE.withAlpha(0.5),
    //   width: 5,
    //   isGround: true,
    //   isPoint: true,
    // });

    const line = DynamicPrimitive.addPolyline({
      id: "bbb",
      positions: [
        [114.12139292195221, 23.494146019762045, 244.94998754302043],
        [114.0781432964593, 23.457089645698883, 83.74397088283233],
        [114.02284024948034, 23.50605266019647, 322.2697819772894],
      ],
      color: Cesium.Color.BLUE.withAlpha(0.5),
      width: 5,
      isGround: true,
      isPoint: true,
    });

    this.addBtnAction("btn1", () => {
      DynamicPrimitive.updatePolygonPos("aaa", [
        [113, 39, 100],
        [113.002, 39, 100],
        [113.002, 39.002, 100],
        [113.003, 39.002, 100],
      ]);
      DynamicPrimitive.updatePolylinePos("bbb", [
        [113.004, 39, 100],
        [113.006, 39, 100],
      ]);
    });
    this.addBtnAction("btn2", () => {
      this.viewer.terrainProvider = terrainProvider;

      this.isTerrain = true;
      EventBus.emit(this.terrainChangeEvent, this.isTerrain);
    });

    this.addBtnAction("btn3", () => {
      this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

      this.isTerrain = false;
      EventBus.emit(this.terrainChangeEvent, this.isTerrain);
    });

    this.addBtnAction("btn4", () => {
      DynamicPrimitive.removePolygon("aaa");
      DynamicPrimitive.removePolyline("bbb");
    });
    useEventBus(this.terrainChangeEvent, (isTerrain: boolean) => {
      DynamicPrimitive.updateTerrain();
    });
  }
  addBtnAction(id: string, callback: Function) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        callback && callback();
      };
    }
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
