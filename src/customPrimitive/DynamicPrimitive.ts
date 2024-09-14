import * as Cesium from "cesium";

import CustomLinePrimitive, {
  type CustomLinePrimitiveOption,
} from "./CustomLinePrimitive";
import CustomPolygonPrimitive, {
  type CustomPolygonPrimitiveOption,
} from "./CustomPolygonPrimitive";
export type ColorArrType = [number, number, number, number];

export class DynamicPrimitive {
  static viewer: Cesium.Viewer;
  static lines = new Map<string, CustomLinePrimitive>();
  static polygons = new Map<string, CustomPolygonPrimitive>();
  static addPolygon(set: CustomPolygonPrimitiveOption) {
    let p = new CustomPolygonPrimitive({
      ...set,
      isTerrain:
        this.viewer.scene.mode == Cesium.SceneMode.SCENE3D &&
        this.viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider,
    });
    this.viewer.scene.primitives.add(p);
    this.polygons.set(set.id, p);
    return p;
  }
  static updatePolygonPos(id: string, pos: number[][]) {
    const p = this.polygons.get(id);
    if (p) {
      p.positions = pos;
    }
  }

  static addPolyline(set: CustomLinePrimitiveOption) {
    let line = new CustomLinePrimitive({
      ...set,
      isTerrain:
        this.viewer.scene.mode == Cesium.SceneMode.SCENE3D &&
        this.viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider,
    });

    this.viewer.scene.primitives.add(line);

    this.lines.set(set.id, line);
    return line;
  }
  static updatePolylinePos(id: string, pos: number[][]) {
    const line = this.lines.get(id);
    if (line) {
      line.positions = pos;
    }
  }

  static removePolyline(id: string) {
    const line = this.lines.get(id);
    if (line) {
      this.viewer.scene.primitives.remove(line);
      line.destroy();
    }
    this.lines.delete(id);
  }
  static removePolygon(id: string) {
    const p = this.polygons.get(id);
    if (p) {
      this.viewer.scene.primitives.remove(p);
      p.destroy();
    }
    this.polygons.delete(id);
  }
  static updateTerrain() {
    const isTerrain =
      this.viewer.scene.mode == Cesium.SceneMode.SCENE3D &&
      this.viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider;

    this.lines.forEach((line) => {
      line.isTerrain = isTerrain;
    });

    this.polygons.forEach((polygon) => {
      polygon.isTerrain = isTerrain;
    });
  }
  static getLine(id: string) {
    return this.lines.get(id);
  }
  static getPolygon(id: string) {
    return this.polygons.get(id);
  }
}
