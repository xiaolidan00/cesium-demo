import * as Cesium from 'cesium';

import { ColorListStyleType, InfoOverlay } from './InfoOverlay';

import { CesiumMap } from '../utils/CesiumMap';
import { CustomInfoPrimitive } from './CustomInfoPrimitive';
import { LabelOverlay } from './LabelOverlay';
import { LocaOverlay } from './LocaOverlay';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无',
    height: 500
  };

  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 113,
        lat: 30,
        height: 1000
      },
      {
        roll: 0,
        heading: 0,
        pitch: -50
      }
    );
  }
  init() {
    const colorStyle: ColorListStyleType = {
      colorListProp: 'height',
      className: 'my-info',
      colorListIsRange: true,
      colorList: [
        {
          headerBg: 'green',
          bodyBg: 'rgba(0,0,0,0.5)',
          headerColor: 'white',
          bodyColor: 'white',
          min: 0,
          max: 300
        },
        {
          headerBg: 'orange',
          bodyBg: 'rgba(0,0,0,0.5)',
          headerColor: 'white',
          bodyColor: 'white',
          min: 300,
          max: 800
        },
        {
          headerBg: 'red',
          bodyBg: 'rgba(0,0,0,0.5)',
          headerColor: 'white',
          bodyColor: 'white',
          min: 800,
          max: 1000
        }
      ]
    };
    InfoOverlay.init(this.viewer);
    InfoOverlay.createColorListStyle(colorStyle);
    LabelOverlay.init(this.viewer);
    LabelOverlay.createColorListStyle(colorStyle);
    LocaOverlay.init(this.viewer);
    const pr = new CustomInfoPrimitive({
      viewer: this.viewer,
      id: 'test',
      terrainHeight: 400,
      position: [113, 30, 500],
      colorListStyle: colorStyle,
      lineStyle: {
        width: 3,
        color: Cesium.Color.WHITE,
        // startPos: [113, 30, 0],
        // endPos: [113, 30, 500],
        isGround: true
      },
      locaStyle: {
        height: 30,
        width: 30,
        iconType: 'icon1'
      },

      data: {
        lat: 30,
        lng: 39,
        height: 500
      },
      hideLevel: 14,
      labelStyle: {
        imageUrl: 'location.svg',
        width: 30,
        height: 30
      },
      infoStyle: {
        hideLevel: 14,
        width: 300,
        height: 300,
        title: '标题',
        info: [
          { name: '经度', prop: 'lng', unit: '度' },
          { name: '纬度', prop: 'lat', unit: '度' },
          { name: '高度', prop: 'height', unit: '米' }
        ]
      }
    });
    this.viewer.scene.primitives.add(pr);

    const pr1 = new CustomInfoPrimitive({
      viewer: this.viewer,
      id: 'test1',
      terrainHeight: 400,
      position: [113, 30.05, 800],
      colorListStyle: colorStyle,
      lineStyle: {
        width: 3,
        color: Cesium.Color.BLUE,
        // startPos: [113, 30, 0],
        // endPos: [113, 30, 500],
        isGround: true
      },
      locaStyle: {
        height: 30,
        width: 30,
        iconType: 'icon1'
      },

      data: {
        lat: 30,
        lng: 39,
        height: 800
      },
      hideLevel: 1,
      labelStyle: {
        imageUrl: 'location.svg',
        width: 30,
        height: 30
      },
      infoStyle: {
        hideLevel: 14,
        width: 300,
        height: 300,
        title: '标题',
        info: [
          { name: '经度', prop: 'lng', unit: '度' },
          { name: '纬度', prop: 'lat', unit: '度' },
          { name: '高度', prop: 'height', unit: '米' }
        ]
      }
    });
    this.viewer.scene.primitives.add(pr1);
    createGui(
      [
        { type: 'select', name: 'actions', options: ['无', ''] },
        {
          type: 'number',
          name: 'height',
          min: 0,
          max: 1000,
          step: 100,
          onChange: (value) => {
            pr.data.height = value;
            pr.position[2] = value;
          }
        }
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
