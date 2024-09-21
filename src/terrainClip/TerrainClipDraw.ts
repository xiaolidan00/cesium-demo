import * as Cesium from 'cesium';

import DrawBase from '../utils/DrawBase';
import { PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';

type TerrainClipDrawData = {
  id: string;
  positions: Cesium.Cartesian3[];
};
class TerrainClipDraw extends DrawBase {
  hierarchy: number[] = [];
  //添加控制点
  controls: Cesium.Cartesian3[] = [];
  //添加填挖点
  points: Cesium.Cartesian3[] = [];
  constructor(v: Cesium.Viewer) {
    super(v);
  }
  openTool() {
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
      return alert('请在3D模式下进行通视分析');
    }

    this.onListener();
  }
  closeTool() {
    this.controls = [];
    this.points = [];
    this.hierarchy = [];
    this.offListener();
  }
  drawClippingPlane(points: Cesium.Cartesian3[]) {
    const clippingPlanes = [];
    //计算剪裁面
    for (let i = 0; i < points.length; i++) {
      const nextIdx = (i + 1) % points.length;
      //计算两个笛卡尔坐标的按分量求和
      let midPoint = Cesium.Cartesian3.add(points[i], points[nextIdx], new Cesium.Cartesian3());
      //缩放笛卡尔坐标
      midPoint = Cesium.Cartesian3.multiplyByScalar(midPoint, 0.5, midPoint);
      //计算提供的笛卡尔坐标系的标准化形势
      const up = Cesium.Cartesian3.normalize(midPoint, new Cesium.Cartesian3());
      //计算两个笛卡尔坐标的分量差异
      let right = Cesium.Cartesian3.subtract(points[nextIdx], midPoint, new Cesium.Cartesian3());
      right = Cesium.Cartesian3.normalize(right, right);
      //计算提供的笛卡尔坐标的叉外乘积
      let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
      normal = Cesium.Cartesian3.normalize(normal, normal);
      //原始中心平面
      const originCenteredPlane = new Cesium.Plane(normal, 0.0);
      const distance = Cesium.Plane.getPointDistance(originCenteredPlane, midPoint);
      clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
    }
    const clipCollection = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeColor: Cesium.Color.YELLOW,
      edgeWidth: 1.0
    });
    //赋值给globe的clippingPlanes
    this.viewer.scene.globe.clippingPlanes = clipCollection;
  }
  addPolygon(postions: number[]) {
    this.viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(postions),
        material: new Cesium.ImageMaterialProperty({
          image: './test.png'
        }),
        closeTop: false,
        extrudedHeight: 0,
        perPositionHeight: true
      }
    });
  }
  getHeight(position: Cesium.Cartographic) {
    return this.viewer.scene.globe.getHeight(position);
  }
  //封装样条插值函数
  interpolation(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3) {
    const spline = new Cesium.LinearSpline({
      times: [0.0, 1.0],
      points: [point1, point2]
    });

    for (let i = 0; i <= 100; i++) {
      const cartesian3 = spline.evaluate(i / 100);
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const height = this.getHeight(cartographic);
      this.hierarchy.push(lng, lat, height || 0);
    }
  }
  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw) {
      const a = this.viewer.scene.pickPosition(ev.position);
      const b = Cesium.Cartographic.fromCartesian(a);
      const lng = Cesium.Math.toDegrees(b.longitude);
      const lat = Cesium.Math.toDegrees(b.latitude);
      const c = Cesium.Cartesian3.fromDegrees(lng, lat);
      this.controls.push(c);
      this.points.push(c);
      if (this.controls.length > 1) {
        this.interpolation(
          this.controls[this.controls.length - 2],
          this.controls[this.controls.length - 1]
        );
      }
    }
  }

  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    if (this.isDraw) {
      this.interpolation(this.controls[this.controls.length - 1], this.controls[0]);
      //挖地形
      this.drawClippingPlane(this.points);
      //绘制面，贴纹理
      this.addPolygon(this.hierarchy);
      this.closeTool();
    }
  }

  clear() {
    this.viewer.entities.removeAll();
    this.closeTool();
  }
}
export default TerrainClipDraw;
