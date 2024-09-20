import * as Cesium from 'cesium';

import DrawBase from '../utils/DrawBase';
import { PosUtil } from './../utils/PosUtil';
import { uuid } from '../utils/tool';

type PolygonDataType = {
  positions: number[][];
  id: string;
  polygon: Cesium.Entity | null;
  point: { [n: string]: number };
};
class PolygonDraw extends DrawBase {
  currentData: PolygonDataType | null = null;

  polygonMap = new Map<string, PolygonDataType>();

  currentId: string = '';
  positions: number[][] = [];
  polygonStyle = {
    material: Cesium.Color.RED.withAlpha(0.5),
    classificationType: Cesium.ClassificationType.BOTH
  };
  lineStyle = {
    width: 5,
    material: Cesium.Color.RED,
    clampToGround: true
  };
  pointStyle = {
    pixelSize: 10,
    color: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 5,
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
    if (this.currentData?.polygon) {
      //转静态变量
      if (this.currentData.polygon?.polyline?.positions)
        this.currentData.polygon.polyline.positions = new Cesium.ConstantProperty(
          Cesium.Cartesian3.fromDegreesArray([...this.positions, this.positions[0]].flat(1))
        );
      if (this.currentData.polygon?.polygon?.hierarchy) {
        this.currentData.polygon.polygon.hierarchy = new Cesium.ConstantProperty({
          positions: Cesium.Cartesian3.fromDegreesArray(this.positions.flat(1))
        });
      }
    }

    this.currentId = '';
    this.currentData = null;
    this.positions = [];
    this.offListener();
  }
  drawPolygon(positions: number[][]) {
    if (!this.currentData) return;
    this.positions =
      positions.length === 1
        ? [positions[0], positions[0], positions[0]]
        : positions.length === 2
        ? [positions[0], positions[1], positions[0]]
        : positions;
    if (!this.currentData.polygon) {
      this.currentData.polygon = new Cesium.Entity({
        id: this.currentId,
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return Cesium.Cartesian3.fromDegreesArray(
              [...this.positions, this.positions[0]].flat(1)
            );
          }, false),
          ...this.lineStyle
        },
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => {
            return {
              positions: Cesium.Cartesian3.fromDegreesArray(this.positions.flat(1))
            };
          }, false),
          ...this.polygonStyle
        }
      });
      this.viewer.entities.add(this.currentData.polygon);
    }
    const oldMap = { ...this.currentData.point };
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
    this.currentData.point = newMap;
  }
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.endPosition);
      if (p) {
        this.drawPolygon([...this.currentData.positions, [p[0], p[1]]]);
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.currentData.positions.push([p[0], p[1]]);
        this.drawPolygon(this.currentData.positions);
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

          this.currentData = polygon;
        }
        this.currentData.positions.push([p[0], p[1]]);
        this.drawPolygon(this.currentData.positions);
      }
    }
  }
  removeItem(item: PolygonDataType) {
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
