import * as Cesium from 'cesium';

import CustomPolygonPrimitive from '../customPrimitive/CustomPolygonPrimitive';
import DrawBase from '../utils/DrawBase';
import { DynamicPrimitive } from './../customPrimitive/DynamicPrimitive';
import { PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';

//多边形数据
type PolygonDataType = {
  positions: number[][];
  id: string;
  polygon: CustomPolygonPrimitive | null;
  point: { [n: string]: number };
};
class PolygonPrimitiveDraw extends DrawBase {
  //当前数据
  currentData: PolygonDataType | null = null;
  //多边形数据
  polygonMap = new Map<string, PolygonDataType>();
  //当前多边形id
  currentId: string = '';
  //当前绘制多边形坐标点

  //多边形样式
  polygonStyle = {
    color: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineWidth: 5,
    outlineColor: Cesium.Color.RED,
    pointSize: 10,
    pointColor: Cesium.Color.WHITE,
    isPoint: true,
    pointOutline: true,
    pointOutlineColor: Cesium.Color.RED,
    pointOutlineWidth: 5,
    isGround: true
  };
  isLock = false;
  constructor(v: Cesium.Viewer) {
    super(v);
  }

  openDraw() {
    this.currentId = uuid();
    this.onListener();
  }
  closeDraw() {
    this.currentId = '';
    this.currentData = null;

    this.offListener();
  }
  //绘制多边形
  async drawPolygon(positions: number[][]) {
    if (!this.currentData || this.isLock) return;
    //上锁
    this.isLock = true;
    //更新多边形坐标，多边形至少3个坐标点
    const pos =
      positions.length === 1
        ? [positions[0], positions[0], positions[0]]
        : positions.length === 2
        ? [positions[0], positions[1], positions[0]]
        : [...positions];
    //没有绘制则新增绘制多边形
    if (!this.currentData.polygon) {
      this.currentData.polygon = await DynamicPrimitive.addPolygon({
        id: this.currentId,
        positions: pos,
        ...this.polygonStyle
      });
    } else {
      //更新坐标点
      await DynamicPrimitive.updatePolygonPos(this.currentId, pos);
    }
    //取消上锁
    this.isLock = false;
  }
  async onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        await this.drawPolygon([...this.currentData.positions, [p[0], p[1]]]);
      }
    }
  }
  async onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.currentData.positions.push([p[0], p[1]]);
        await this.drawPolygon(this.currentData.positions);
      }
      this.closeDraw();
    }
  }

  async onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw) {
      const p = PosUtil.pickPosWGS84(ev.position);

      if (p) {
        if (!this.currentData) {
          const polygon = {
            id: this.currentId,
            positions: [],

            polygon: null,
            point: {}
          };

          this.polygonMap.set(this.currentId, polygon);

          this.currentData = polygon;
        }
        this.currentData.positions.push([p[0], p[1]]);
        await this.drawPolygon(this.currentData.positions);
      }
    }
  }
  removeItem(id: string) {
    const item = this.polygonMap.get(id);
    if (!item) return;
    DynamicPrimitive.removePolygon(id);
    this.polygonMap.delete(item.id);
  }
  clear() {
    this.polygonMap.forEach((item) => {
      DynamicPrimitive.removePolygon(item.id);
    });
    this.polygonMap.clear();
  }
}
export default PolygonPrimitiveDraw;
