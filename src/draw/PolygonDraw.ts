import * as Cesium from 'cesium';

import DrawBase from '../utils/DrawBase';
import { PosUtil } from './../utils/PosUtil';
import { uuid } from '../utils/tool';

//多边形数据
type PolygonDataType = {
  positions: number[][];
  id: string;
  polygon: Cesium.Entity | null;
  point: { [n: string]: number };
};
class PolygonDraw extends DrawBase {
  //当前数据
  currentData: PolygonDataType | null = null;
  //多边形数据
  polygonMap = new Map<string, PolygonDataType>();
  //当前多边形id
  currentId: string = '';
  //当前绘制多边形坐标点
  positions: number[][] = [];
  //多边形样式
  polygonStyle = {
    material: Cesium.Color.RED.withAlpha(0.5),
    //贴地面
    classificationType: Cesium.ClassificationType.BOTH
  };
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

  openDraw() {
    this.currentId = uuid();
    this.onListener();
  }
  closeDraw() {
    this.currentId = '';
    this.currentData = null;
    this.positions = [];
    this.offListener();
  }
  drawPolygon(positions: number[][]) {
    const polygon = this.polygonMap.get(this.currentId);
    if (!polygon) return;
    //更新多边形坐标，多边形至少3个坐标点
    polygon.positions =
      positions.length === 1
        ? [positions[0], positions[0], positions[0]]
        : positions.length === 2
        ? [positions[0], positions[1], positions[0]]
        : [...positions];
    if (!polygon.polygon) {
      polygon.polygon = new Cesium.Entity({
        id: this.currentId,
        polyline: {
          //利用CallbackProperty，自动更新绘制
          positions: new Cesium.CallbackProperty(() => {
            //封闭形状
            return Cesium.Cartesian3.fromDegreesArray(
              [...polygon.positions, polygon.positions[0]].flat(1)
            );
          }, false),
          ...this.lineStyle
        },
        polygon: {
          //利用CallbackProperty，自动更新绘制
          hierarchy: new Cesium.CallbackProperty(() => {
            return {
              positions: Cesium.Cartesian3.fromDegreesArray(polygon.positions.flat(1))
            };
          }, false),
          ...this.polygonStyle
        }
      });
      this.viewer.entities.add(polygon.polygon);
    }
    const oldMap = { ...polygon.point };
    const newMap: PolygonDataType['point'] = {};
    for (let i = 0; i < positions.length; i++) {
      const p = [positions[i][0], positions[i][1]];
      const id = this.currentId + p.join('_');
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
    for (let k in oldMap) {
      if (!newMap[k]) {
        this.viewer.entities.removeById(k);
      }
    }
    polygon.point = newMap;
  }
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        this.drawPolygon([...this.positions, [p[0], p[1]]]);
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.positions.push([p[0], p[1]]);
        this.drawPolygon(this.positions);
      }
      this.closeDraw();
    }
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
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
          this.positions = [];
          this.currentData = polygon;
        }
        this.positions.push([p[0], p[1]]);
        this.drawPolygon(this.positions);
      }
    }
  }
  removeItem(id: string) {
    const item = this.polygonMap.get(id);
    if (!item) return;
    this.viewer.entities.removeById(item.id);
    for (let k in item.point) {
      this.viewer.entities.removeById(k);
    }
    this.polygonMap.delete(item.id);
  }
  clear() {
    this.polygonMap.forEach((item) => {
      this.viewer.entities.removeById(item.id);
      for (let k in item.point) {
        this.viewer.entities.removeById(k);
      }
    });
    this.polygonMap.clear();
  }
}
export default PolygonDraw;
