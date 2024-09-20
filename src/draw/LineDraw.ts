import * as Cesium from 'cesium';

import { LngLatHeightType, PosUtil } from './../utils/PosUtil';

import DrawBase from '../utils/DrawBase';
import { uuid } from '../utils/tool';

type LineDataType = {
  positions: number[][];
  id: string;
  line: Cesium.Entity | null;
  point: { [n: string]: number };
};
class LineDraw extends DrawBase {
  currentData: LineDataType | null = null;

  lineMap = new Map<string, LineDataType>();

  currentId: string = '';
  positions: number[][] = [];
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
    if (this.currentData?.line?.polyline) {
      this.currentData.line.polyline.positions = new Cesium.ConstantProperty(
        Cesium.Cartesian3.fromDegreesArray(this.positions.flat(1))
      );
    }

    this.currentId = '';
    this.currentData = null;
    this.positions = [];
    this.offListener();
  }
  drawLine(positions: number[][]) {
    if (!this.currentData) return;
    this.positions = positions?.length === 1 ? [positions[0], positions[0]] : positions;
    if (!this.currentData.line) {
      this.currentData.line = new Cesium.Entity({
        id: this.currentId,
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return Cesium.Cartesian3.fromDegreesArray(this.positions.flat(1));
          }, false),
          ...this.lineStyle
        }
      });
      this.viewer.entities.add(this.currentData.line);
    }
    const oldMap = { ...this.currentData.point };
    const newMap: LineDataType['point'] = {};
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
        this.drawLine([...this.currentData.positions, [p[0], p[1]]]);
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPosWGS84(ev.position);
      if (p) {
        this.currentData.positions.push([p[0], p[1]]);
        this.drawLine(this.currentData.positions);
      }
      this.closeDraw();
    }
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    if (this.isDraw) {
      const p = PosUtil.pickPosWGS84(ev.position);

      if (p) {
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
        this.drawLine(this.currentData.positions);
      }
    }
  }
  removeItem(item: LineDataType) {
    this.viewer.entities.removeById(item.id);
    for (let k in item.point) {
      this.viewer.entities.removeById(k);
    }
    this.lineMap.delete(item.id);
  }
  clear() {
    this.lineMap.forEach((item) => {
      this.viewer.entities.removeById(item.id);
      for (let k in item.point) {
        this.viewer.entities.removeById(k);
      }
    });
    this.lineMap.clear();
  }
}
export default LineDraw;
