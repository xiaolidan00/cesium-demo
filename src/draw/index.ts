import * as Cesium from 'cesium';

import { LngLatHeightType, PosUtil } from './../utils/PosUtil';

import { CesiumMap } from '../utils/CesiumMap';
import DrawBase from '../utils/DrawBase';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  drawHelper: DrawBase;
  dataObj = {
    actions: '无'
  };
  linePoints: number[][] = [];
  positions: number[][] = [];
  polygonPoints: number[][] = [];
  positions1: number[][] = [];
  line: Cesium.Entity | null = null;
  polygon: Cesium.Entity | null = null;
  constructor(containerId: string) {
    super(containerId);
    this.drawHelper = new DrawBase(this.viewer);
  }
  init() {
    createGui(
      [
        { type: 'title', title: '左点击添加点，右点击结束绘制' },
        {
          name: 'actions',
          type: 'select',
          options: ['无', '画线', '画面'],
          onChange: (value) => {
            this.closeDraw();
            if (value !== '无') {
              if (this.line) {
                this.viewer.entities.remove(this.line);
              }
              if (this.polygon) {
                this.viewer.entities.remove(this.polygon);
              }
              this.linePoints = [];
              this.line = null;
              this.polygonPoints = [];
              this.polygon = null;
              this.positions = [];
              this.positions1 = [];
              this.drawHelper.onListener({
                onLeftClick: this.onLeftClick.bind(this),
                onMouseMove: this.onMouseMove.bind(this),
                onRightClick: this.onRightClick.bind(this)
              });
            }
          }
        }
      ],
      this.dataObj
    );
  }
  drawLine(positions: number[][]) {
    const arr = positions.length == 1 ? [positions[0], positions[0]] : positions;

    if (!this.line) {
      this.positions = arr;
      this.line = new Cesium.Entity({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return Cesium.Cartesian3.fromDegreesArray(this.positions.flat(1));
          }, false),
          width: 5,
          material: Cesium.Color.RED,
          clampToGround: true
        }
      });
      this.viewer.entities.add(this.line);
    } else {
      this.positions = arr;
    }
  }
  drawPolygon(positions: number[][]) {
    const arr =
      positions.length == 1
        ? [positions[0], positions[0], positions[0]]
        : positions.length == 2
        ? [positions[0], positions[1], positions[0]]
        : positions;

    if (!this.polygon) {
      this.positions1 = arr;
      this.polygon = new Cesium.Entity({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return Cesium.Cartesian3.fromDegreesArray(
              [...this.positions1, this.positions1[0]].flat(1)
            );
          }, false),
          width: 5,
          material: Cesium.Color.RED,
          clampToGround: true
        },
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => {
            return { positions: Cesium.Cartesian3.fromDegreesArray(this.positions1.flat(1)) };
          }, false),
          material: Cesium.Color.RED.withAlpha(0.5),
          classificationType: Cesium.ClassificationType.BOTH
        }
      });
      this.viewer.entities.add(this.polygon);
    } else {
      this.positions1 = arr;
    }
  }
  closeDraw() {
    this.drawHelper.isDraw && this.drawHelper.offListener();
  }
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.drawHelper.isDraw) {
      if (this.dataObj.actions === '画线' && this.line) {
        const p = PosUtil.pickPosWGS84(ev.endPosition);
        if (p) {
          this.drawLine([...this.linePoints, [p[0], p[1]]]);
        }
      } else if (this.dataObj.actions === '画面' && this.polygon) {
        const p = PosUtil.pickPosWGS84(ev.endPosition);
        if (p) {
          this.drawPolygon([...this.polygonPoints, [p[0], p[1]]]);
        }
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.drawHelper.isDraw) {
      if (this.dataObj.actions === '画线') {
        const p = PosUtil.pickPosWGS84(ev.position);
        if (p) {
          this.linePoints.push([p[0], p[1]]);
          this.drawLine(this.linePoints);
        }
        this.closeDraw();
      } else if (this.dataObj.actions === '画面') {
        const p = PosUtil.pickPosWGS84(ev.position);
        if (p) {
          this.polygonPoints.push([p[0], p[1]]);
          this.drawPolygon(this.polygonPoints);
        }
        this.closeDraw();
      }
    }
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.drawHelper.isDraw) {
      if (this.dataObj.actions === '画线') {
        const p = PosUtil.pickPosWGS84(ev.position);
        console.log('🚀 ~ MyCesiumMap ~ onLeftClick ~ p:', p);
        if (p) {
          this.linePoints.push([p[0], p[1]]);
          this.drawLine(this.linePoints);
        }
      } else if (this.dataObj.actions === '画面') {
        const p = PosUtil.pickPosWGS84(ev.position);
        if (p) {
          this.polygonPoints.push([p[0], p[1]]);
          this.drawPolygon(this.polygonPoints);
        }
      }
    }
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
