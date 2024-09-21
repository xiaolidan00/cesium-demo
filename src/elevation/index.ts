import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    heightSpa: 150,
    lineWidth: 2
  };
  material: Cesium.Material | null = null;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 86.59888809458056,
        lat: 27.706858578565587,
        height: 6098.883501219279
      },
      {
        heading: 335,
        pitch: -8,
        roll: 360
      }
    );
  }
  changeVal() {
    const hs = this.dataObj.heightSpa;
    const lw = this.dataObj.lineWidth;
    if (!this.material) {
      this.material = Cesium.Material.fromType(Cesium.Material.ElevationContourType, {
        color: Cesium.Color.RED,
        spacing: hs,
        width: lw
      });
    } else {
      this.material.uniforms = {
        color: Cesium.Color.RED,
        spacing: hs,
        width: lw
      };
    }

    this.viewer.scene.globe.material = this.material;
  }
  async init() {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://data.marsgis.cn/terrain',
      {
        requestVertexNormals: true
      }
    );
    this.viewer.terrainProvider = terrainProvider;
    this.changeVal();
    createGui(
      [
        {
          type: 'number',
          min: 10,
          max: 1000,
          step: 1,
          name: 'heightSpa',
          onChange: this.changeVal.bind(this)
        },
        {
          type: 'number',
          min: 0,
          max: 10,
          step: 1,
          name: 'lineWidth',
          onChange: this.changeVal.bind(this)
        }
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
