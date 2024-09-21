import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无',
    //开挖高度
    excavateHeight: 1000,
    //填埋高度
    buryHeight: 1200,
    excavateVolumes: 0,
    buryVloumes: 0
  };
  gui: any;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 112.99857862856632,
        lat: 39.00242585592647,
        height: 1428.4370534555333
      },
      {
        heading: 140,
        pitch: -46,
        roll: 360
      }
    );
  }
  clac(lon1: number, lat1: number, lon2: number, lat2: number) {
    const eH = this.dataObj.excavateHeight;
    const bH = this.dataObj.buryHeight;
    //计算开挖，填埋的挖方量，填埋量核心思想是微积分
    const minStepSize = 0.0001; //定义剖分的最小步长
    //存储所有剖分矩形
    const subRectangles: Cesium.Rectangle[] = [];
    for (let i = lon1; i <= lon2; i += minStepSize) {
      for (let j = lat1; j < lat2; j += minStepSize) {
        const subrect = new Cesium.Rectangle(
          Cesium.Math.toRadians(i),
          Cesium.Math.toRadians(j),
          Cesium.Math.toRadians(i + minStepSize),
          Cesium.Math.toRadians(j + minStepSize)
        );
        subRectangles.push(subrect);
      }
    }
    //计算每个矩形的中心坐标，将其作为计算该矩阵高度的位置
    const subRectCenters: Cesium.Cartographic[] = [];
    subRectangles.forEach((subRect) => {
      const center = Cesium.Cartographic.fromRadians(
        (subRect.west + subRect.east) * 0.5,
        (subRect.north + subRect.south) * 0.5
      );
      subRectCenters.push(center);
    });
    //计算每个中心点坐标的地形高度
    Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, subRectCenters).then((res) => {
      const heights: number[] = [];
      res.forEach((p) => {
        heights.push(p.height);
      });

      //开始计算填挖方量
      let excavateVolumes = 0; //挖方量
      let buryVloumes = 0; //填埋量
      for (let i = 0; i < subRectangles.length; i++) {
        const subRect = subRectangles[i];
        const lb = Cesium.Cartesian3.fromRadians(subRect.west, subRect.south);
        const lt = Cesium.Cartesian3.fromRadians(subRect.west, subRect.north);
        const rb = Cesium.Cartesian3.fromRadians(subRect.east, subRect.south);
        const rt = Cesium.Cartesian3.fromRadians(subRect.east, subRect.north);
        const height = Cesium.Cartesian3.distance(lb, lt);
        const width = Cesium.Cartesian3.distance(lb, rb);
        //挖方
        if (heights[i] > eH) {
          //如果地形高度大于开挖基准高度才需要开挖
          const ev = width * height * (heights[i] - eH);
          excavateVolumes += ev;
        }
        //填埋
        if (heights[i] < bH) {
          //如果地形高度萧羽填埋基准高度才需要填埋
          const bv = width * height * (bH - heights[i]);
          buryVloumes += bv;
        }
      }
      //单位立方米
      this.dataObj.excavateVolumes = excavateVolumes;
      this.dataObj.buryVloumes = buryVloumes;
      console.log('excavateVolumes', excavateVolumes);
      console.log('buryVloumes', buryVloumes);
      this.gui.children[2].setValue(excavateVolumes);
      this.gui.children[3].setValue(buryVloumes);
    });
  }
  drawResult(
    minHeight: number,
    maxHeight: number,
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number
  ) {
    this.viewer.entities.add({
      name: '填挖体',
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(lon1, lat1, lon2, lat2),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        height: minHeight,
        extrudedHeight: maxHeight
      }
    });
  }

  async init() {
    //开启深度检测
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://data.marsgis.cn/terrain',
      {
        requestVertexNormals: true
      }
    );

    this.viewer.terrainProvider = terrainProvider;

    this.gui = createGui(
      [
        {
          name: 'excavateHeight',
          type: 'number',
          min: 10,
          max: 1000,
          step: 1
        },
        {
          name: 'buryHeight',
          type: 'number',
          min: 10,
          max: 1000,
          step: 1
        },
        {
          name: 'excavateVolumes',
          type: 'number',
          min: 10,
          max: Number.MAX_SAFE_INTEGER,
          step: 1
        },
        {
          name: 'buryVloumes',
          type: 'number',
          min: 10,
          max: Number.MAX_SAFE_INTEGER,
          step: 1
        }
      ],
      this.dataObj
    );
    this.clac(113, 39, 113.002, 39.002);
    this.drawResult(this.dataObj.excavateHeight, this.dataObj.buryHeight, 113, 39, 113.002, 39.002);
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
