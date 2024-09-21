import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import TerrainClipDraw from './TerrainClipDraw';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };
  terrainClip: TerrainClipDraw;
  constructor(containerId: string) {
    super(containerId);
    this.terrainClip = new TerrainClipDraw(this.viewer);
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
    this.viewer.terrainProvider = terrainProvider;
    createGui(
      [
        { type: 'title', title: '左点击添加点，右点击结束绘制' },
        {
          name: 'actions',
          type: 'select',
          options: ['无', '开启', '清空'],
          onChange: (value) => {
            if (value === '开启') {
              this.terrainClip.openTool();
            } else if (value === '清空') {
              this.terrainClip.clear();
            }
          }
        }
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
