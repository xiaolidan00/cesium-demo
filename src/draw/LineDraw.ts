import * as Cesium from 'cesium';

import { LngLatHeightType, PosUtil } from './../utils/PosUtil';

import { CesiumMap } from '../utils/CesiumMap';
import DrawBase from '../utils/DrawBase';
import { createGui } from '../utils/tool';

export default class LineDraw extends DrawBase {
  currentData = {
    positions: [],
    entity: null
  };
  datas = [];
  constructor(v: Cesium.Viewer) {
    super(v);
  }
  enableDraw() {
    this.viewer.canvas.style.cursor = 'url(cursor.png)';
    this.onListener();
  }
  disableDraw() {
    this.viewer.canvas.style.cursor = 'default';
    this.offListener();
  }
}
