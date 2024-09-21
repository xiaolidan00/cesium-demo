import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };

  constructor(containerId: string) {
    super(containerId);
  }
  init() {
    createGui(
      [
        { type: 'title', title: '左点击添加点，右点击结束绘制' },
        {
          name: 'actions',
          type: 'select',
          options: ['无', '画线', '画面', '清空线', '清空面'],
          onChange: (value) => {
            if (value === '画线') {
            } else if (value === '画面') {
            } else if (value === '清空线') {
            } else if (value === '清空面') {
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
