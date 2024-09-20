import './style.scss';

import * as Cesium from 'cesium';

import DrawBase from '../utils/DrawBase';
import { type LngLatHeightType, PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';
import { DynamicPrimitive } from '../customPrimitive/DynamicPrimitive';
import { HtmlOverlay } from '../utils/HtmlOverlay';
type TriangleToolData = {
  id: string;
  positions: LngLatHeightType[];
};
class TriangleTool extends DrawBase {
  currentId: string = '';
  currentData: TriangleToolData | null = null;
  dataMap = new Map<string, TriangleToolData>();
  htmlOverlay: HtmlOverlay;
  lineStyle = {
    isHeight: true,
    isPoint: true,
    color: Cesium.Color.RED,
    width: 3,
    pointOutline: true,
    isClose: true
  };
  constructor(v: Cesium.Viewer) {
    super(v);
    this.htmlOverlay = new HtmlOverlay(v);
  }
  openTool() {
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return alert('请在3D模式下进行三角测量');
    }

    this.currentId = uuid();
    this.onListener();
  }
  closeTool() {
    if (this.currentData) {
      this.dataMap.set(this.currentId, this.currentData);
    }

    this.currentId = '';
    this.currentData = null;

    this.offListener();
  }
  drawTriangle(pos: LngLatHeightType[]) {
    const positions = pos.length === 1 ? [pos[0], pos[0]] : pos;
    const p1 = positions[0];
    const p2 = positions[1];
    const p3 = [p1[0], p1[1], p2[2]];
    const arr = [p2, p3, p1];
    const distance = PosUtil.getSpaceDistance(
      PosUtil.WGS84ToCartographic(p1),
      PosUtil.WGS84ToCartographic(p2)
    );
    const height = Math.abs(p1[2] - p2[2]);
    const len = Math.sqrt(distance * distance + height * height);
    if (!DynamicPrimitive.getLine(this.currentId)) {
      DynamicPrimitive.addPolyline({
        id: this.currentId,
        ...this.lineStyle,
        positions: arr
      });
    } else {
      DynamicPrimitive.updatePolylinePos(this.currentId, arr);
    }

    const h = Math.max(p1[2], p2[2]) - 0.5 * height;
    const center = [(p1[0] + p2[0]) * 0.5, (p1[1] + p2[1]) * 0.5];
    if (!this.htmlOverlay.getHtml(this.currentId + '1')) {
      this.htmlOverlay.addHtml({
        id: this.currentId + '1',
        position: [center[0], center[1], p2[2]],
        content: `<div class="triangle-tip">空间距离${distance.toFixed(2)}米</div>`,
        offset: [-60, -14]
      });

      this.htmlOverlay.addHtml({
        id: this.currentId + '2',
        position: [center[0], center[1], h],
        content: `<div class="triangle-tip">直线距离${len.toFixed(2)}米</div>`,
        offset: [-60, -14]
      });

      this.htmlOverlay.addHtml({
        id: this.currentId + '3',
        position: [p1[0], p1[1], h],
        content: `<div class="triangle-tip">高度差${height.toFixed(2)}米</div>`,
        offset: [-60, -14]
      });
    } else {
      this.htmlOverlay.updateHtml({
        id: this.currentId + '1',
        position: [center[0], center[1], p2[2]],
        content: `<div class="triangle-tip">空间距离${distance.toFixed(2)}米</div>`
      });

      this.htmlOverlay.updateHtml({
        id: this.currentId + '2',
        position: [center[0], center[1], h],
        content: `<div class="triangle-tip">直线距离${len.toFixed(2)}米</div>`
      });

      this.htmlOverlay.updateHtml({
        id: this.currentId + '3',
        position: [p1[0], p1[1], h],
        content: `<div class="triangle-tip">高度差${height.toFixed(2)}米</div>`
      });
    }
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        if (!this.currentData) {
          const data = {
            id: this.currentId,
            positions: []
          };
          this.currentData = data;
        }
        this.currentData.positions.push(p);
        this.drawTriangle(this.currentData.positions);
        if (this.currentData.positions.length == 2) {
          this.closeTool();
        }
      }
    }
  }
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent): void {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        this.drawTriangle([this.currentData.positions[0], p]);
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.currentData.positions.push(p);
        this.drawTriangle(this.currentData.positions);
        this.closeTool();
      }
    }
  }
  removeItem(id: string) {
    DynamicPrimitive.removePolyline(id);
    this.dataMap.delete(id);
    this.htmlOverlay.removeHtml(id + '1');
    this.htmlOverlay.removeHtml(id + '2');
    this.htmlOverlay.removeHtml(id + '3');
  }
  clear() {
    this.closeTool();
    const ids = this.dataMap.keys();
    ids.forEach((id) => {
      this.removeItem(id);
    });
  }
}
export default TriangleTool;
