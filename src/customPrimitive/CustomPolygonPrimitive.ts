import * as Cesium from "cesium";

import { PosUtil } from "../utils/PosUtil";

export type CustomPolygonPrimitiveOption = {
  id: string;
  positions: number[][];
  color?: Cesium.Color;
  isHeight?: boolean;
  outline?: boolean;
  outlineColor?: Cesium.Color;
  outlineWidth?: number;
  isGround?: boolean;
  //点的样式
  isPoint?: boolean;
  pointSize?: number;
  pointColor?: Cesium.Color;
  pointOutline?: boolean;
  pointOutlineColor?: Cesium.Color;
  pointOutlineWidth?: number;
  //是否开启山形
  isTerrain?: boolean;
};

class CustomPolygonPrimitive {
  private _polygonPrimitive:
    | Cesium.Primitive
    | Cesium.GroundPrimitive
    | undefined = undefined;
  _primitive: Cesium.PrimitiveCollection | undefined = undefined;
  private _linePrimitive:
    | Cesium.Primitive
    | Cesium.GroundPolylinePrimitive
    | undefined = undefined;
  private _pointPrimitive: Cesium.PointPrimitiveCollection | undefined =
    undefined;
  id: string;
  positions: number[][];
  private _positions: number[][] = [];
  color: Cesium.Color = Cesium.Color.RED;

  outline: boolean;
  outlineColor: Cesium.Color = Cesium.Color.RED;
  outlineWidth: number;
  isGround?: boolean;
  private _isGround?: boolean = false;
  isHeight?: boolean = false;
  private _isHeight?: boolean = false;
  isTerrain?: boolean = false;
  private _isTerrain?: boolean = false;

  isPoint: boolean;
  pointSize: number = 10;
  pointColor: Cesium.Color = Cesium.Color.WHITE;
  pointOutline: boolean;
  pointOutlineColor: Cesium.Color = Cesium.Color.RED;
  pointOutlineWidth: number;
  constructor(options: CustomPolygonPrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;

    this.color = options.color || Cesium.Color.RED;

    this.isGround = options.isGround || false;
    this.outline = options.outline || false;
    this.outlineColor = options.outlineColor || Cesium.Color.RED;
    this.outlineWidth = options.outlineWidth || 3;
    this.isPoint = options.isPoint || false;
    this.pointSize = options.pointSize || 10;
    this.pointColor = options.pointColor || Cesium.Color.WHITE;
    this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    this.pointOutline = options.pointOutline || false;
    this.pointOutlineWidth = options.pointOutlineWidth || 3;
    this.isTerrain = options.isTerrain || false;

    if (this.isGround) {
      this.isHeight = false;
    } else {
      this.isHeight = options.isHeight || false;
    }
  }

  getGeometry() {
    if (this.isGround) {
      return new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(
            PosUtil.posNoHeightTransform(this.positions).flat(1)
          )
        ),
      });
    } else {
      return new Cesium.PolygonGeometry({
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
      });
    }
  }
  getLineGeometry() {
    if (this.isGround) {
      return new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform([
            ...this.positions,
            this.positions[0],
          ]).flat(1)
        ),
        width: this.outlineWidth,
      });
    } else {
      return new Cesium.PolylineGeometry({
        positions: this.isHeight
          ? Cesium.Cartesian3.fromDegreesArrayHeights(
              PosUtil.posHeightTransform([
                ...this.positions,
                this.positions[0],
              ]).flat(1)
            )
          : Cesium.Cartesian3.fromDegreesArray(
              PosUtil.posNoHeightTransform([
                ...this.positions,
                this.positions[0],
              ]).flat(1)
            ),
        width: this.outlineWidth,
      });
    }
  }
  getLinePrimitive() {
    const g = this.getLineGeometry();
    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: g,
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: this.outlineColor.alpha !== 1,
          material: Cesium.Material.fromType("Color", {
            color: this.outlineColor,
          }),
        }),
        asynchronous: false,
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "linegeometryInstance",
          geometry: g,
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: this.outlineColor.alpha !== 1,
          material: Cesium.Material.fromType("Color", {
            color: this.outlineColor,
          }),
        }),
        asynchronous: false,
      });
    }
  }
  getPointPrimitive() {
    const points: any[] = [];
    const pointStyle = {
      pixelSize: this.pointSize,
      color: this.pointColor,
      outlineColor: this.pointOutline ? this.pointOutlineColor : undefined,
      outlineWidth: this.pointOutline ? this.pointOutlineWidth : 0.0,
    };
    const baseHeight = 0.0; // this.pointSize * 0.5;
    if (this.isGround) {
      if (this.isTerrain) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(
              it[0],
              it[1],
              it[2] ? it[2] + baseHeight : baseHeight
            ),
            ...pointStyle,
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], baseHeight),
            ...pointStyle,
          });
        });
      }
    } else {
      if (this.isHeight) {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(
              it[0],
              it[1],
              it[2] ? it[2] + baseHeight : baseHeight
            ),
            ...pointStyle,
          });
        });
      } else {
        this.positions.forEach((it) => {
          points.push({
            position: Cesium.Cartesian3.fromDegrees(it[0], it[1], baseHeight),
            ...pointStyle,
          });
        });
      }
    }
    return points;
  }
  getPrimitive() {
    const geometries = this.getGeometry();

    if (this.isGround) {
      return new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometries,
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: this.color.alpha !== 1,
          material: Cesium.Material.fromType("Color", {
            color: this.color,
          }),
        }),
        asynchronous: false,
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometries,
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false,
          translucent: this.color.alpha !== 1,
          material: Cesium.Material.fromType("Color", {
            color: this.color,
          }),
        }),
        asynchronous: false,
      });
    }
  }
  update(frameState: any) {
    if (
      JSON.stringify(this.positions) === JSON.stringify(this._positions) &&
      this.isGround === this._isGround &&
      this.isHeight === this._isHeight &&
      this._isTerrain === this.isTerrain
    ) {
      if (this._primitive) {
        this._primitive.update(frameState);
      }
      return;
    }
    this._positions = [...this.positions];
    this._isTerrain = this.isTerrain;
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;

    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }
    console.log("%cthis._primitive", "background:yellow", this._primitive);
    if (this.outline) {
      this._linePrimitive &&
        this._primitive &&
        this._primitive.remove(this._linePrimitive);
      // this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
      if (this.positions.length >= 2) {
        this._linePrimitive = this.getLinePrimitive();
      }
    }

    if (this.isPoint) {
      this._pointPrimitive && this._pointPrimitive.removeAll();
      if (!this._pointPrimitive) {
        this._pointPrimitive = new Cesium.PointPrimitiveCollection();
      }
      const points = this.getPointPrimitive();
      points.forEach((it) => {
        this._pointPrimitive.add(it);
      });
    }

    this._polygonPrimitive &&
      this._primitive &&
      this._primitive.remove(this._polygonPrimitive);
    // this._polygonPrimitive =
    //   this._polygonPrimitive && this._polygonPrimitive.destroy();
    if (this.positions.length >= 2) {
      this._polygonPrimitive = this.getPrimitive();
    }
    if (
      this._polygonPrimitive &&
      !this._primitive.contains(this._polygonPrimitive)
    ) {
      this._primitive.add(this._polygonPrimitive);
    }

    //后添加的在上面
    if (
      this.outline &&
      this._linePrimitive &&
      !this._primitive.contains(this._linePrimitive)
    ) {
      this._primitive.add(this._linePrimitive);
    }

    if (
      this.isPoint &&
      this._pointPrimitive &&
      !this._primitive.contains(this._pointPrimitive)
    ) {
      this._primitive.add(this._pointPrimitive);
    }

    if (this._primitive) {
      this._primitive.update(frameState);
    }
  }

  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive && this._primitive.removeAll();
    // if (this.outline) {
    //   this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
    // }
    // if (this.isPoint) {
    //   this._pointPrimitive = this._pointPrimitive && this._pointPrimitive.destroy();
    // }

    // this._polygonPrimitive = this._polygonPrimitive && this._polygonPrimitive.destroy();

    this._primitive = this._primitive && this._primitive.destroy();

    return Cesium.destroyObject(this);
  }
}
export default CustomPolygonPrimitive;
