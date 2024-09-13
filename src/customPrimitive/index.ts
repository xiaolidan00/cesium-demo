import * as Cesium from "cesium";

import { EventBus, useEventBus } from "../utils/EventBus";

import { CesiumMap } from "../utils/CesiumMap";
import { DynamicPrimitive } from "./DynamicPrimitive";

class MyCesiumMap extends CesiumMap {
  isTerrain = true;
  terrainChangeEvent = "terrainChangeEvent";
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 112.99793630124755,
        lat: 38.993141215272466,
        height: 595.3241643506092,
      },
      {
        heading: 0,
        pitch: -30,
        roll: 360,
      }
    );
    // this.setView(
    //   {
    //     lng: 113.69245554433121,
    //     lat: 23.164224093748036,
    //     height: 100,
    //   },
    //   {
    //     heading: 0,
    //     pitch: -50,
    //     roll: 360,
    //   }
    // );
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
    const polygon = DynamicPrimitive.addPolygon({
      id: "aaa",
      positions: [
        [113, 39],
        [113.002, 39],
        [113.002, 39.002],
      ],
      color: Cesium.Color.YELLOW.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      isGround: true,
    });

    // const polygon = DynamicPrimitive.addPolygon({
    //   id: "aaa",
    //   positions: [
    //     [113.69245554433121, 23.164224093748036, -0.005276706939177416],
    //     [113.69034235029376, 23.16172482687673, -0.008379322114169113],
    //     [113.6960317340238, 23.159449084501517, -0.0021148479059751326],
    //     [113.69847003483359, 23.162334416984866, -0.006557055925513616],
    //     [113.69727119532554, 23.16582931975918, -0.0017425456673988776],
    //     [113.69487352582445, 23.16717038383892, -0.001627863522539245],
    //     [113.69123638653335, 23.167170377712363, -0.006128266901260755],
    //   ],
    //   color: Cesium.Color.YELLOW.withAlpha(0.5),
    //   outline: true,
    //   outlineColor: Cesium.Color.YELLOW,
    //   outlineWidth: 3,
    //   isGround: true,
    // });

    const line = DynamicPrimitive.addPolyline({
      id: "bbb",
      positions: [
        [113.004, 39],
        [113.006, 39],
        [113.006, 39.002],
      ],
      color: Cesium.Color.BLUE.withAlpha(0.5),
      width: 5,
      isGround: true,
    });
    console.log(polygon, line);

    const btn1 = document.getElementById("btn1");
    if (btn1) {
      btn1.onclick = () => {
        DynamicPrimitive.updatePolygonPos("aaa", [
          [113, 39],
          [113.002, 39],
          [113.002, 39.002],
          [113.003, 39.002],
        ]);
        DynamicPrimitive.updatePolylinePos("bbb", [
          [113.004, 39],
          [113.006, 39],
        ]);
      };
    }
    const btn2 = document.getElementById("btn2");
    if (btn2) {
      btn2.onclick = async () => {
        this.viewer.terrainProvider = terrainProvider;

        this.isTerrain = true;
        EventBus.emit(this.terrainChangeEvent, this.isTerrain);
      };
    }
    this.addBtnAction("btn3", () => {
      this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

      this.isTerrain = false;
      EventBus.emit(this.terrainChangeEvent, this.isTerrain);
    });

    this.addBtnAction("btn4", () => {
      DynamicPrimitive.removePolygon("aaa");
      DynamicPrimitive.removePolyline("bbb");
    });
    useEventBus(this.terrainChangeEvent, (isTerrain: boolean) => {});
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
