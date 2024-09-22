import * as Cesium from 'cesium';

import { LngLatHeightType, PosUtil } from './../utils/PosUtil';

import DrawBase from '../utils/DrawBase';
import { uuid } from '../utils/tool';

//折线数据
type LineDataType = {
  positions: number[][];
  id: string;
  line: Cesium.Entity | null;
  point: { [n: string]: number };
};
class LineDraw extends DrawBase {
  //当前数据
  currentData: LineDataType | null = null;
  //折线数据
  lineMap = new Map<string, LineDataType>();
  //当前绘制折线id
  currentId: string = '';
  //当前绘制折线坐标点
  positions: number[][] = [];
  //折线样式
  lineStyle = {
    width: 5,
    material: Cesium.Color.RED,
    //折线贴地
    clampToGround: true
  };
  //点样式
  pointStyle = {
    pixelSize: 10,
    color: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 5,
    //点贴地
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  };

  constructor(v: Cesium.Viewer) {
    super(v);
  }
  //开启绘制
  openDraw() {
    this.currentId = uuid();
    this.onListener();
  }
  //关闭绘制，置空数据
  closeDraw() {
    this.currentId = '';
    this.currentData = null;
    this.positions = [];
    this.offListener();
  }
  //绘制折线
  drawLine(positions: number[][]) {
    const line = this.lineMap.get(this.currentId);
    if (!line) return;
    //更新折线坐标，折线至少2个坐标点
    line.positions = positions?.length === 1 ? [positions[0], positions[0]] : [...positions];
    //没有绘制则新增绘制折线
    if (!line.line) {
      line.line = new Cesium.Entity({
        id: this.currentId,
        polyline: {
          //利用CallbackProperty，自动更新绘制
          positions: new Cesium.CallbackProperty(() => {
            return Cesium.Cartesian3.fromDegreesArray(line.positions.flat(1));
          }, false),
          ...this.lineStyle
        }
      });
      this.viewer.entities.add(line.line);
    }
    //绘制点，对比新旧点坐标，进行更新
    const oldMap = { ...line.point };
    const newMap: LineDataType['point'] = {};
    for (let i = 0; i < positions.length; i++) {
      const p = [positions[i][0], positions[i][1]];
      const id = this.currentId + p.join('_');
      //添加新点
      if (!oldMap[id]) {
        this.viewer.entities.add({
          id,
          position: Cesium.Cartesian3.fromDegrees(p[0], p[1]),
          point: {
            ...this.pointStyle
          }
        });
      }
      newMap[id] = 1;
    }
    //删除没有的点
    for (let k in oldMap) {
      if (!newMap[k]) {
        this.viewer.entities.removeById(k);
      }
    }
    line.point = newMap;
  }
  //鼠标移动过程中绘制折线
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        this.drawLine([...this.positions, [p[0], p[1]]]);
      }
    }
  }
  //右点击收集点
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.positions.push([p[0], p[1]]);
        this.drawLine(this.positions);
      }
      //关闭绘制
      this.closeDraw();
    }
  }
  //左点击收集点
  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
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
          this.positions = [];
          this.currentData = line;
        }
        this.positions.push([p[0], p[1]]);
        this.drawLine(this.positions);
      }
    }
  }

  //根据id删除折线数据
  removeItem(id: string) {
    const item = this.lineMap.get(id);
    if (!item) return;
    //删除折线
    this.viewer.entities.removeById(item.id);
    //删除折线点
    for (let k in item.point) {
      this.viewer.entities.removeById(k);
    }
    //删除折线数据
    this.lineMap.delete(item.id);
  }
  //清空折线
  clear() {
    this.lineMap.forEach((item) => {
      //删除折线
      this.viewer.entities.removeById(item.id);
      //删除折线点
      for (let k in item.point) {
        this.viewer.entities.removeById(k);
      }
    });
    //清空数据
    this.lineMap.clear();
  }
}
export default LineDraw;
