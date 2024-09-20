import * as Cesium from "cesium";

import CustomLinePrimitive, {
  type CustomLinePrimitiveOption,
} from "./CustomLinePrimitive";
import CustomPolygonPrimitive, {
  type CustomPolygonPrimitiveOption,
} from "./CustomPolygonPrimitive";
import { PosUtil } from "../utils/PosUtil";
import CustomPrimitive from "./CustomPrimitive";
export type ColorArrType = [number, number, number, number];

export class DynamicPrimitive {
  static viewer: Cesium.Viewer;
  static lines = new Map<string, CustomLinePrimitive>();
  static polygons = new Map<string, CustomPolygonPrimitive>();
  static group: Cesium.PrimitiveCollection = new Cesium.PrimitiveCollection();
  static isTerrain: boolean;
  static init(v: Cesium.Viewer, isTerrain: boolean) {
    this.viewer = v;
    this.viewer.scene.primitives.add(this.group);
    this.isTerrain = isTerrain;
  }
  static async updateGroundPos(positions: number[][]) {
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      const height = await PosUtil.getLngLatTerrainHeight(a[0], a[1]);
      a[2] = height;
    }
  }
  static async addPolygon(set: CustomPolygonPrimitiveOption) {
    if (set.isGround) {
      await this.updateGroundPos(set.positions);
    }
    let p = new CustomPolygonPrimitive({
      ...set,
      isTerrain: this.isTerrain,
    });
    this.group.add(p);
    this.polygons.set(set.id, p);
    this.group.raiseToTop(p);
    this.viewer.scene.primitives.raiseToTop(this.group);
    return p;
  }
  static async updatePolygonPos(id: string, pos: number[][]) {
    const p = this.polygons.get(id);
    if (p) {
      if (p.isGround) {
        await this.updateGroundPos(pos);
      }
      p.positions = pos;
    }
  }

  static async addPolyline(set: CustomLinePrimitiveOption) {
    if (set.isGround) {
      await this.updateGroundPos(set.positions);
    }
    let line = new CustomLinePrimitive({
      ...set,
      isTerrain: this.isTerrain,
    });

    this.group.add(line);

    this.lines.set(set.id, line);
    this.group.raiseToTop(line);
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
  static updateTerrain(isTerrain: boolean) {
    this.isTerrain = isTerrain;
    this.lines.forEach((line) => {
      if (line.isGround) line.isTerrain = isTerrain;
    });

    this.polygons.forEach((polygon) => {
      if (polygon.isGround) polygon.isTerrain = isTerrain;
    });
  }
  static getLine(id: string) {
    return this.lines.get(id);
  }
  static getPolygon(id: string) {
    return this.polygons.get(id);
  }
}
