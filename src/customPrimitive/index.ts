import * as Cesium from 'cesium';

import { EventBus, useEventBus } from '../utils/EventBus';

import { CesiumMap } from '../utils/CesiumMap';
import { DynamicPrimitive } from './DynamicPrimitive';
import { PosUtil } from '../utils/PosUtil';

class MyCesiumMap extends CesiumMap {
  isTerrain = true;
  terrainChangeEvent = 'terrainChangeEvent';
  terrainProvider: Cesium.CesiumTerrainProvider | undefined;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 112.99793630124755,
        lat: 38.993141215272466,
        height: 595.3241643506092
      },
      {
        heading: 0,
        pitch: -30,
        roll: 360
      }
    );
  }
  async init() {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://data.marsgis.cn/terrain',
      {
        requestVertexNormals: true
      }
    );
    this.terrainProvider = terrainProvider;
    PosUtil.terrainProvider = terrainProvider;
    DynamicPrimitive.init(this.viewer, this.viewer.terrainProvider === this.terrainProvider);
    this.viewer.scene.globe.terrainProviderChanged.addEventListener((ev) => {
      setTimeout(() => {
        DynamicPrimitive.updateTerrain(this.viewer.terrainProvider === this.terrainProvider);
      }, 100);
      console.log('%c地形改变', 'background:yellow', ev);
    });

    const polygon = DynamicPrimitive.addPolygon({
      id: 'aaa',
      positions: [
        [113, 39],
        [113.002, 39],
        [113.002, 39.002]
      ],
      color: Cesium.Color.YELLOW.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      isGround: true,
      isPoint: true
    });

    const line = DynamicPrimitive.addPolyline({
      id: 'bbb',
      positions: [
        [113.004, 39],
        [113.006, 39],
        [113.006, 39.002]
      ],
      color: Cesium.Color.BLUE.withAlpha(0.5),
      width: 5,
      isGround: true,
      isPoint: true
    });

    this.addBtnAction('btn1', () => {
      DynamicPrimitive.updatePolygonPos('aaa', [
        [113, 39],
        [113.002, 39],
        [113.002, 39.002],
        [113.003, 39.002]
      ]);
      DynamicPrimitive.updatePolylinePos('bbb', [
        [113.004, 39],
        [113.006, 39]
      ]);
    });
    this.addBtnAction('btn2', () => {
      this.viewer.terrainProvider = terrainProvider;

      this.isTerrain = true;
    });

    this.addBtnAction('btn3', () => {
      this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

      this.isTerrain = false;
    });

    this.addBtnAction('btn4', () => {
      DynamicPrimitive.removePolygon('aaa');
      DynamicPrimitive.removePolyline('bbb');
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

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
