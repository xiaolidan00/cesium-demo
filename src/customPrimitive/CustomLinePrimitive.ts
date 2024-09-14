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
};

class CustomLinePrimitive {
  _primitive: any;
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
  constructor(options: CustomLinePrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.width = options.width || 3;
    this.color = options.color;
    this.isGround = options.isGround;
    this.isDashed = options.isDashed;
    this.dashLength = options.dashLength || 20;
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
  getGeometry() {
    const options = this;
    if (options.isGround) {
      return new Cesium.GroundPolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(
          PosUtil.posNoHeightTransform(this.positions).flat(1)
        ),
        width: options.width,
      });
    } else {
      return new Cesium.PolylineGeometry({
        positions: this.isHeight
          ? Cesium.Cartesian3.fromDegreesArrayHeights(this.positions.flat(1))
          : Cesium.Cartesian3.fromDegreesArray(
              PosUtil.posNoHeightTransform(this.positions).flat(1)
            ),
        width: options.width,
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
      !(
        this.positions !== this._positions ||
        this.color !== this._color ||
        this.isGround !== this._isGround ||
        this.isHeight !== this._isHeight
      )
    ) {
      if (this._primitive) {
        this._primitive.update(frameState);
      }
      return;
    }

    this._positions = [...this.positions];
    this._color = this.color;
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    this._primitive = this._primitive && this._primitive.destroy();

    this._primitive = this.getPrimitive();

    if (!this._primitive) return;

    this._primitive.update(frameState);
  }

  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
export default CustomLinePrimitive;
