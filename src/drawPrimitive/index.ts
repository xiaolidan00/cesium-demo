import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { DynamicPrimitive } from '../customPrimitive/DynamicPrimitive';
import LinePrimitiveDraw from './LinePrimitiveDraw';
import PolygonPrimitiveDraw from './PolygonPrimitiveDraw';
import { PosUtil } from '../utils/PosUtil';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  lineDraw: LinePrimitiveDraw;
  polygonDraw: PolygonPrimitiveDraw;
  dataObj = {
    actions: '无',
    terrain: true
  };
  terrainEllipsoid = new Cesium.EllipsoidTerrainProvider();
  terrainProvider: Cesium.CesiumTerrainProvider | null = null;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 113,
        lat: 39,
        height: 2000
      },
      {
        heading: 0,
        pitch: -50,
        roll: 0
      }
    );
    this.lineDraw = new LinePrimitiveDraw(this.viewer);
    this.polygonDraw = new PolygonPrimitiveDraw(this.viewer);
  }
  async init() {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://data.marsgis.cn/terrain',
      {
        requestVertexNormals: true
      }
    );
    this.viewer.terrainProvider = terrainProvider;
    this.terrainProvider = terrainProvider;
    DynamicPrimitive.init(this.viewer, this.viewer.terrainProvider === this.terrainProvider);
    PosUtil.terrainProvider = terrainProvider;
    this.viewer.scene.globe.terrainProviderChanged.addEventListener((ev) => {
      setTimeout(() => {
        DynamicPrimitive.updateTerrain(this.viewer.terrainProvider === this.terrainProvider);
      }, 100);
      console.log('%c地形改变', 'background:yellow', ev);
    });

    createGui(
      [
        { type: 'title', title: '左点击添加点，右点击结束绘制' },
        {
          name: 'terrain',
          type: 'select',
          options: { 开启: true, 关闭: false },
          onChange: (value: boolean) => {
            if (value && this.terrainProvider) {
              this.viewer.terrainProvider = this.terrainProvider;
            } else {
              this.viewer.terrainProvider = this.terrainEllipsoid;
            }
          }
        },
        {
          name: 'actions',
          type: 'select',
          options: ['无', '画线', '画面', '清空线', '清空面'],
          onChange: (value) => {
            if (value === '画线') {
              this.lineDraw.openDraw();
            } else if (value === '画面') {
              this.polygonDraw.openDraw();
            } else if (value === '清空线') {
              this.lineDraw.clear();
            } else if (value === '清空面') {
              this.polygonDraw.clear();
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
