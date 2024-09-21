import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };
  slopeRamp: number[] = [];
  aspectRamp: number[] = [];
  colors = ['#b6d7a8', '#a2c4c9', '#a4c2f4', '#6d9eeb', '#3c78d8', '#1c4587', '#20124d'];
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
  getColorRamp(selectedShading) {
    const ramp = document.createElement('canvas');
    ramp.width = 100;
    ramp.height = 1;
    const ctx = ramp.getContext('2d');
    if (!ctx) return;
    let values: number[] = [];
    if (selectedShading === 'slope') {
      values = this.slopeRamp;
    } else if (selectedShading === 'aspect') {
      values = this.aspectRamp;
    }
    const grd = ctx?.createLinearGradient(0, 0, 100, 0);
    for (let i = 0; i < values.length; i++) {
      grd?.addColorStop(values[i], this.colors[i]);
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 100, 1);
    return ramp;
  }

  createMat(type: string) {
    if (type === '坡度分析') {
      const m = Cesium.Material.fromType(Cesium.Material.SlopeRampMaterialType, {
        image: this.getColorRamp('slope')
      });
      this.viewer.scene.globe.material = m;
    } else if (type === '坡向分析') {
      const m = Cesium.Material.fromType(Cesium.Material.AspectRampMaterialType, {
        image: this.getColorRamp('aspect')
      });
      this.viewer.scene.globe.material = m;
    }
  }

  async init() {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://data.marsgis.cn/terrain',
      {
        requestVertexNormals: true
      }
    );
    this.viewer.scene.globe.enableLighting = true;
    this.viewer.terrainProvider = terrainProvider;
    this.slopeRamp = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    this.aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];

    createGui(
      [
        {
          name: 'actions',
          type: 'select',
          options: ['无', '坡度分析', '坡向分析'],
          onChange: this.createMat.bind(this)
        }
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
