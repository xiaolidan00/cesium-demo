import * as Cesium from 'cesium';

import DrawBase from '../utils/DrawBase';
import { PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';

type ViewPointData = {
  id: string;
  positions: Cesium.Cartesian3[];
};
class ViewPoint extends DrawBase {
  currentId: string = '';
  currentData: ViewPointData | null = null;
  dataMap = new Map<string, ViewPointData>();
  lineStyle = {
    width: 2
  };
  constructor(v: Cesium.Viewer) {
    super(v);
  }
  openTool() {
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return alert('请在3D模式下进行通视分析');
    }

    this.currentId = uuid();
    this.onListener();
  }
  closeTool() {
    this.currentId = '';
    this.currentData = null;

    this.offListener();
  }
  drawLine(idx: number, positions: Cesium.Cartesian3[], color: Cesium.Color) {
    const id = this.currentId + idx;
    const line = this.viewer.entities.getById(id);

    if (!line) {
      this.viewer.entities.add({
        id,
        polyline: {
          positions: positions,
          ...this.lineStyle,
          material: color,
          depthFailMaterial: color
        }
      });
    } else {
      if (line?.polyline) line.polyline.positions = new Cesium.ConstantProperty(positions);
    }
  }
  calcPoints(pos: Cesium.Cartesian3[]) {
    if (pos.length == 1) return;
    const positions = pos;
    //计算两点分量差异
    const substract = Cesium.Cartesian3.subtract(
      positions[0],
      positions[1],
      new Cesium.Cartesian3()
    );
    //标准化计算射线方向
    const direction = Cesium.Cartesian3.normalize(substract, new Cesium.Cartesian3());
    //创建射线
    const ray = new Cesium.Ray(positions[0], direction);
    //计算交点
    const result = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    if (result) {
      this.drawLine(1, [result, positions[0]], Cesium.Color.GREEN); //可视
      this.drawLine(2, [result, positions[1]], Cesium.Color.RED); //不可视
    } else {
      this.drawLine(1, positions, Cesium.Color.GREEN);
    }
  }
  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw) {
      const p = PosUtil.pickPos(ev.position);
      if (p) {
        if (!this.currentData) {
          const data = {
            id: this.currentId,
            positions: []
          };
          this.dataMap.set(this.currentId, data);
          this.currentData = data;
        }
        this.currentData.positions.push(p);
        this.calcPoints(this.currentData.positions);
        if (this.currentData.positions.length === 2) {
          this.closeTool();
        }
      }
    }
  }
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent): void {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPos(ev.endPosition);
      if (p) {
        this.calcPoints([this.currentData.positions[0], p]);
      }
    }
  }
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw && this.currentData) {
      const p = PosUtil.pickPos(ev.position);
      if (p) {
        this.currentData.positions.push(p);
        this.calcPoints(this.currentData.positions);
      }
      this.closeTool();
    }
  }
  removeItem(id: string) {
    this.viewer.entities.removeById(id + '1');
    this.viewer.entities.removeById(id + '2');
  }
  clear() {
    this.closeTool();
    const ids = this.dataMap.keys();
    ids.forEach((id) => {
      this.removeItem(id);
    });
  }
}
export default ViewPoint;
