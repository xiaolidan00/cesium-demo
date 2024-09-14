import * as Cesium from "cesium";

import { PosUtil } from "../utils/PosUtil";

export type CustomLinePrimitiveOption = {
  id: string;
  positions: number[][];
  color: Cesium.Color;
  width: number;
  isGround?: boolean;
  isHeight?: boolean;
  isDashed?: boolean;
  dashLength?: number;

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

class CustomLinePrimitive {
  _primitive: any; //Cesium.PrimitiveCollection | undefined = undefined;
  private _linePrimitive: any;
  // | Cesium.Primitive
  // | Cesium.GroundPolylinePrimitive
  // | undefined = undefined;
  private _pointPrimitive: any; //Cesium.PointPrimitiveCollection | undefined =
  //    undefined;
  id: string;
  private _positions: number[][] = [];
  positions: number[][];
  color: Cesium.Color;
  _color: Cesium.Color = Cesium.Color.RED;
  width: number;
  isGround?: boolean;
  isDashed?: boolean;
  dashLength?: number;
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

  constructor(options: CustomLinePrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.width = options.width || 3;
    this.color = options.color;
    this.isGround = options.isGround;
    this.isDashed = options.isDashed;
    this.dashLength = options.dashLength || 20;

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
  getMaterial() {
    if (this.isDashed) {
      return Cesium.Material.fromType("PolylineDash", {
        color: this.color,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: this.dashLength,
      });
    } else {
      return Cesium.Material.fromType("Color", {
        color: this.color,
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
  getGeometry() {
    if (this.isGround) {
      return new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform(this.positions).flat(1)
        ),
        width: this.width,
      });
    } else {
      return new Cesium.PolylineGeometry({
        positions: this.isHeight
          ? Cesium.Cartesian3.fromDegreesArrayHeights(
              PosUtil.posHeightTransform(this.positions).flat(1)
            )
          : Cesium.Cartesian3.fromDegreesArray(
              PosUtil.posNoHeightTransform(this.positions).flat(1)
            ),
        width: this.width,
      });
    }
  }
  getPrimitive() {
    const geometry = this.getGeometry();

    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometry,
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: this.color.alpha !== 1,
          material: this.getMaterial(),
        }),
        asynchronous: false,
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + "geometryInstance",
          geometry: geometry,
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: this.color.alpha !== 1,
          material: this.getMaterial(),
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
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    this._isTerrain = this.isTerrain;

    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
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

    this._linePrimitive &&
      this._primitive &&
      this._primitive.remove(this._linePrimitive);
    // this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
    this._linePrimitive = this.getPrimitive();

    if (this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }

    if (
      this.isPoint &&
      this._pointPrimitive &&
      !this._primitive.contains(this._pointPrimitive)
    ) {
      this._primitive.add(this._pointPrimitive);
    }
    if (!this._primitive) return;

    this._primitive.update(frameState);
  }

  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive && this._primitive.removeAll();
    // this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
    // if (this.isPoint) {
    //   this._pointPrimitive =
    //     this._pointPrimitive && this._pointPrimitive.destroy();
    // }
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
export default CustomLinePrimitive;
