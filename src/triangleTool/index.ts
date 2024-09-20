import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { DynamicPrimitive } from '../customPrimitive/DynamicPrimitive';
import { PosUtil } from '../utils/PosUtil';
import TriangleTool from './TriangleTool';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  terrainProvider: Cesium.CesiumTerrainProvider | undefined;
  triangleTool: TriangleTool;
  dataObj = {
    actions: '无'
  };
  constructor(containerId: string) {
    super(containerId);

    this.setView(
      {
        lng: -122.34342822467134,
        lat: 47.59630244543853,
        height: 1192.6611094958428
      },
      {
        heading: 23,
        pitch: -33,
        roll: 0
      }
    );
    this.triangleTool = new TriangleTool(this.viewer);
  }
  async init() {
    const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
    this.viewer.scene.primitives.add(osmBuildingsTileset);
    // const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
    //   'https://data.marsgis.cn/terrain',
    //   {
    //     requestVertexNormals: true
    //   }
    // );
    // this.terrainProvider = terrainProvider;
    // this.viewer.terrainProvider = terrainProvider;
    // PosUtil.terrainProvider = terrainProvider;
    DynamicPrimitive.init(this.viewer);

    createGui(
      [
        { type: 'title', title: '三角测量' },
        {
          name: 'actions',
          type: 'select',
          options: ['无', '开启', '清空'],
          onChange: (value) => {
            if (value === '开启') {
              this.triangleTool.openTool();
            } else if (value === '清空') {
              this.triangleTool.clear();
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
