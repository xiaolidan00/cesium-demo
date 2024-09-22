import * as Cesium from 'cesium';

import CustomLinePrimitive, { type CustomLinePrimitiveOption } from './CustomLinePrimitive';
import CustomPolygonPrimitive, {
  type CustomPolygonPrimitiveOption
} from './CustomPolygonPrimitive';
import { PosUtil } from '../utils/PosUtil';
export type ColorArrType = [number, number, number, number];

export class DynamicPrimitive {
  static viewer: Cesium.Viewer;
  //折线集合
  static lines = new Map<string, CustomLinePrimitive>();
  //多边形集合
  static polygons = new Map<string, CustomPolygonPrimitive>();
  //Primitive集合用于收集自定义Primitive
  static group: Cesium.PrimitiveCollection = new Cesium.PrimitiveCollection();
  //是否开启山形
  static isTerrain: boolean;
  //初始化管理类
  static init(v: Cesium.Viewer, isTerrain?: boolean) {
    this.viewer = v;
    this.viewer.scene.primitives.add(this.group);
    this.isTerrain = isTerrain || false;
  }
  //缓存坐标地形高程
  static terrainPosMap = new Map<string, number>();
  //更新贴地坐标点的高程
  static async updateGroundPos(positions: number[][]) {
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      let height;
      const id = [a[0], a[1]].join('_');
      const h = this.terrainPosMap.get(id);
      if (h !== undefined) {
        height = h;
      } else {
        height = await PosUtil.getLngLatTerrainHeight(a[0], a[1]);
        this.terrainPosMap.set(id, height);
      }
      a[2] = height;
    }
  }
  //添加多边形
  static async addPolygon(set: CustomPolygonPrimitiveOption) {
    //如果贴地，更新坐标点高程
    if (set.isGround) {
      await this.updateGroundPos(set.positions);
    }
    let p = new CustomPolygonPrimitive({
      ...set,
      isTerrain: this.isTerrain
    });
    this.group.add(p);
    this.polygons.set(set.id, p);
    //Primitive置顶
    this.viewer.scene.primitives.raiseToTop(this.group);
    return p;
  }
  //更新坐标点
  static async updatePolygonPos(id: string, pos: number[][]) {
    const p = this.polygons.get(id);
    if (p) {
      //如果贴地，更新坐标点高程
      if (p.isGround) {
        await this.updateGroundPos(pos);
      }
      p.positions = pos;
    }
  }
  //添加折线
  static async addPolyline(set: CustomLinePrimitiveOption) {
    //如果贴地，更新坐标点高程
    if (set.isGround) {
      await this.updateGroundPos(set.positions);
    }
    let line = new CustomLinePrimitive({
      ...set,
      isTerrain: this.isTerrain
    });
    this.group.add(line);
    this.lines.set(set.id, line);
    //Primitive置顶
    this.viewer.scene.primitives.raiseToTop(this.group);
    return line;
  }
  static async updatePolylinePos(id: string, pos: number[][]) {
    const line = this.lines.get(id);
    if (line) {
      if (line.isGround) {
        await this.updateGroundPos(pos);
      }
      line.positions = pos;
    }
  }

  static removePolyline(id: string) {
    const line = this.lines.get(id);
    if (line) {
      this.group.remove(line);
      line.destroy();
    }
    this.lines.delete(id);
  }
  static removePolygon(id: string) {
    const p = this.polygons.get(id);
    if (p) {
      this.group.remove(p);
      p.destroy();
    }
    this.polygons.delete(id);
  }
  //地形是否开启时，更新自定义Primitive
  static updateTerrain(isTerrain: boolean) {
    this.isTerrain = isTerrain;
    if (!this.lines.size && !this.polygons.size) return;
    const center = [0, 0, 0];
    let count = 0;
    this.lines.forEach((line) => {
      if (line.isGround) {
        line.isTerrain = isTerrain;
      }
      line.positions.forEach((it) => {
        center[0] += it[0];
        center[1] += it[1];
        center[2] = Math.max(it[2], center[2]);
        count++;
      });
    });

    this.polygons.forEach((polygon) => {
      if (polygon.isGround) {
        polygon.isTerrain = isTerrain;
      }
      polygon.positions.forEach((it) => {
        center[0] += it[0];
        center[1] += it[1];
        center[2] = Math.max(it[2], center[2]);
        count++;
      });
    });
    //视角适配到对应形状
    this.viewer.camera.lookAt(
      Cesium.Cartesian3.fromDegrees(center[0] / count, center[1] / count, center[2]),
      new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 500)
    );
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
  static getLine(id: string) {
    return this.lines.get(id);
  }
  static getPolygon(id: string) {
    return this.polygons.get(id);
  }
}
