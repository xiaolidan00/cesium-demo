import * as Cesium from "cesium";

import { PosUtil } from "../utils/PosUtil";

export type CustomPrimitiveOption = {
  id: string;
  positions: number[][];
  isGround?: boolean;
  isHeight?: boolean;
  //是否开启山形
  isTerrain?: boolean;
};
class CustomPrimitive {
  id: string = "";
  _primitive: any;

  positions: number[][] = [];
  _positions: number[][] = [];

  isGround?: boolean;
  _isGround?: boolean = false;

  isHeight?: boolean = false;
  _isHeight?: boolean = false;

  isTerrain?: boolean = false;
  _isTerrain?: boolean = false;

  pointMap: { [n: string]: number } = {};
  _pointPrimitive: any;
  constructor(options: CustomPrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.isGround = options.isGround || false;
    this.isTerrain = options.isTerrain || false;
    if (this.isGround) {
      this.isHeight = false;
    } else {
      this.isHeight = options.isHeight || false;
    }
  }
  getPointPrimitive(that: {
    pointSize: number;
    pointColor: Cesium.Color;
    pointOutline?: boolean;
    pointOutlineColor?: Cesium.Color;
    pointOutlineWidth?: number;
  }) {
    if (!this._pointPrimitive) {
      this._pointPrimitive = new Cesium.PointPrimitiveCollection();
    }
    const oldMap = { ...this.pointMap };
    const newMap: { [n: string]: number } = {};

    const pointStyle = {
      pixelSize: that.pointSize,
      color: that.pointColor,
      outlineColor: that.pointOutline ? that.pointOutlineColor : undefined,
      outlineWidth: that.pointOutline ? that.pointOutlineWidth : 0.0,
    };
    const baseHeight = 0.0; // this.pointSize * 0.5;
    if (this.isGround) {
      if (this.isTerrain) {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], it[2] ? it[2] + baseHeight : baseHeight];
          const id = this.id + p.join("_");
          if (!oldMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle,
            });
          }
          newMap[id] = 1;
        });
      } else {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], baseHeight];
          const id = this.id + p.join("_");
          if (!oldMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle,
            });
          }
          newMap[id] = 1;
        });
      }
    } else {
      if (this.isHeight) {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], it[2] ? it[2] + baseHeight : baseHeight];
          const id = this.id + p.join("_");
          if (!oldMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle,
            });
          }

          newMap[id] = 1;
        });
      } else {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], baseHeight];
          const id = this.id + p.join("_");
          if (!oldMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle,
            });
          }

          newMap[id] = 1;
        });
      }
    }
    for (let k in oldMap) {
      if (!newMap[k]) {
        const point = this._pointPrimitive._pointPrimitives.find(
          (it: Cesium.PointPrimitive) => it && it.id === k
        );
        point && this._pointPrimitive.remove(point);
      }
    }
    this.pointMap = newMap;

    return this._pointPrimitive;
  }
  getLineMaterial(that: {
    color: Cesium.Color;
    isDashed?: boolean;
    dashLength?: number;
  }) {
    if (that.isDashed) {
      return Cesium.Material.fromType("PolylineDash", {
        color: that.color,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: that.dashLength,
      });
    } else {
      return Cesium.Material.fromType("Color", {
        color: that.color,
      });
    }
  }
  getLinePrimitive(that: {
    outline: boolean;
    outlineColor: Cesium.Color;
    outlineWidth: number;
    isClose?: boolean;
    isDashed?: boolean;
  }) {
    const positions = that.isClose
      ? [...this.positions, this.positions[0]]
      : this.positions;
    const material = this.getLineMaterial({
      color: that.outlineColor,
      isDashed: that.isDashed,
    });
    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: new Cesium.GroundPolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray(
              PosUtil.posNoHeightTransform(positions).flat(1)
            ),
            width: that.outlineWidth,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,

          material: material,
        }),
        asynchronous: false,
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: new Cesium.PolylineGeometry({
            positions: this.isHeight
              ? Cesium.Cartesian3.fromDegreesArrayHeights(
                  PosUtil.posHeightTransform(positions).flat(1)
                )
              : Cesium.Cartesian3.fromDegreesArray(
                  PosUtil.posNoHeightTransform(positions).flat(1)
                ),
            width: that.outlineWidth,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: material,
        }),
        asynchronous: false,
      });
    }
  }
  getPolygonPrimitive(that: { color: Cesium.Color }) {
    if (this.isGround) {
      return new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(
                PosUtil.posNoHeightTransform(this.positions).flat(1)
              )
            ),
          }),
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: that.color,
          }),
        }),
        asynchronous: false,
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: new Cesium.PolygonGeometry({
            perPositionHeight: this.isHeight,
            polygonHierarchy: new Cesium.PolygonHierarchy(
              this.isHeight
                ? Cesium.Cartesian3.fromDegreesArrayHeights(
                    PosUtil.posHeightTransform(this.positions).flat(1)
                  )
                : Cesium.Cartesian3.fromDegreesArray(
                    PosUtil.posNoHeightTransform(this.positions).flat(1)
                  )
            ),
          }),
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: true,
          material: Cesium.Material.fromType("Color", {
            color: that.color,
          }),
        }),
        asynchronous: false,
      });
    }
  }
  getPrimitive() {}
  update(frameState: any) {
    if (this._primitive) {
      this._primitive.update(frameState);
      return;
    }
    this._primitive = this._primitive && this._primitive.destroy();
    this._primitive = this.getPrimitive();
    if (this._primitive) {
      this._primitive.update(frameState);
    }
  }
  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}

export default CustomPrimitive;
