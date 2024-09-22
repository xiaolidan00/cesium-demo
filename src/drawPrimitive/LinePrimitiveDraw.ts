import * as Cesium from 'cesium';

import CustomLinePrimitive from '../customPrimitive/CustomLinePrimitive';
import DrawBase from '../utils/DrawBase';
import { DynamicPrimitive } from '../customPrimitive/DynamicPrimitive';
import { PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';

//折线数据
type LineDataType = {
  positions: number[][];
  id: string;
  line: CustomLinePrimitive | null;
  point: { [n: string]: number };
};
class LinePrimitiveDraw extends DrawBase {
  //当前数据
  currentData: LineDataType | null = null;
  //折线数据
  lineMap = new Map<string, LineDataType>();
  //当前绘制折线id
  currentId: string = '';
  //折线样式
  lineStyle = {
    width: 5,
    color: Cesium.Color.RED,
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
  //开启绘制
  openDraw() {
    this.currentId = uuid();
    this.onListener();
    this.isLock = false;
  }
  //关闭绘制，置空数据
  closeDraw() {
    this.currentId = '';
    this.currentData = null;
    this.offListener();
  }
  //绘制折线
  async drawLine(positions: number[][]) {
    if (!this.currentData || this.isLock) return;
    //上锁
    this.isLock = true;
    //更新折线坐标，折线至少2个坐标点
    const pos = positions?.length === 1 ? [positions[0], positions[0]] : [...positions];
    console.log('🚀 ~ LinePrimitiveDraw ~ drawLine ~ pos:', pos);

    //没有绘制则新增绘制折线
    if (!this.currentData.line) {
      this.currentData.line = await DynamicPrimitive.addPolyline({
        id: this.currentId,
        positions: pos,
        ...this.lineStyle
      });
    } else {
      //更新坐标点
      await DynamicPrimitive.updatePolylinePos(this.currentId, pos);
    }
    //取消上锁
    this.isLock = false;
  }
  //鼠标移动过程中绘制折线
  async onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        await this.drawLine([...this.currentData.positions, [p[0], p[1]]]);
      }
    }
  }
  //右点击收集点
  async onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.currentData.positions.push([p[0], p[1]]);
        await this.drawLine(this.currentData.positions);
      }
      //关闭绘制
      this.closeDraw();
    }
  }
  //左点击收集点
  async onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw) {
      const p = PosUtil.pickPosWGS84(ev.position);

      if (p) {
        //初始化数据
        if (!this.currentData) {
          const line = {
            id: this.currentId,
            positions: [],

            line: null,
            point: {}
          };
          this.lineMap.set(this.currentId, line);

          this.currentData = line;
        }
        this.currentData.positions.push([p[0], p[1]]);
        await this.drawLine(this.currentData.positions);
      }
    }
  }

  //根据id删除折线数据
  removeItem(id: string) {
    const item = this.lineMap.get(id);
    if (!item) return;
    //删除折线
    DynamicPrimitive.removePolyline(id);
    //删除折线数据
    this.lineMap.delete(item.id);
  }
  //清空折线
  clear() {
    this.lineMap.forEach((item) => {
      DynamicPrimitive.removePolyline(item.id);
    });
    //清空数据
    this.lineMap.clear();
  }
}
export default LinePrimitiveDraw;
