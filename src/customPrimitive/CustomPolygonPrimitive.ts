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
  // isPoint?: boolean;
  // pointColor?: Cesium.Color;
  // pointOutline?: boolean;
  // pointOutlineColor?: Cesium.Color;
  // pointOutlineWidth?: number;
};

class CustomPolygonPrimitive {
  private _polygonPrimitive: any;
  _primitive: any;
  private _linePrimitive: any;
  private _pointPrimitive: any;
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
  // isPoint: boolean;
  // pointColor: Cesium.Color = Cesium.Color.WHITE;
  // pointOutline: boolean;
  // pointOutlineColor: Cesium.Color = Cesium.Color.RED;
  // pointOutlineWidth: number;
  constructor(options: CustomPolygonPrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;

    this.color = options.color || Cesium.Color.RED;

    this.isGround = options.isGround || false;
    this.outline = options.outline || false;
    this.outlineColor = options.outlineColor || Cesium.Color.RED;
    this.outlineWidth = options.outlineWidth || 3;
    // this.isPoint = options.isPoint || false;
    // this.pointColor = options.pointColor || Cesium.Color.WHITE;

    // this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    // this.pointOutline = options.pointOutline || false;
    // this.pointOutlineWidth = options.pointOutlineWidth || 3;

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
            ? Cesium.Cartesian3.fromDegreesArrayHeights(this.positions.flat(1))
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
              [...this.positions, this.positions[0]].flat(1)
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
    let points = new Cesium.PointPrimitiveCollection();
    const pos = this.positions.forEach((it) => {});
    points.add({
      position: new Cesium.Cartesian3(1.0, 2.0, 3.0),
      color: Cesium.Color.YELLOW,
    });
    points.add({
      position: new Cesium.Cartesian3(4.0, 5.0, 6.0),
      color: Cesium.Color.CYAN,
    });
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
      this.isHeight === this._isHeight
    ) {
      if (this._primitive) {
        this._primitive.update(frameState);
      }
      return;
    }

    this._positions = this.positions;

    this._isGround = this.isGround;
    this._isHeight = this.isHeight;

    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }

    if (this.outline) {
      this._primitive && this._primitive.remove(this._linePrimitive);
      this._linePrimitive =
        this._linePrimitive && this._linePrimitive.destroy();
      this._linePrimitive = this.getLinePrimitive();
    }
    this._primitive && this._primitive.remove(this._polygonPrimitive);
    this._polygonPrimitive =
      this._polygonPrimitive && this._polygonPrimitive.destroy();
    this._polygonPrimitive = this.getPrimitive();

    this._primitive.add(this._linePrimitive);

    this._primitive.add(this._polygonPrimitive);

    if (this._primitive) {
      this._primitive.update(frameState);
    }
  }

  isDestroyed() {
    return false;
  }
  destroy() {
    this._primitive && this._primitive.removeAll();
    if (this.outline) {
      this._linePrimitive =
        this._linePrimitive && this._linePrimitive.destroy();
    }

    this._polygonPrimitive =
      this._polygonPrimitive && this._polygonPrimitive.destroy();

    this._primitive = this._primitive && this._primitive.destroy();

    return Cesium.destroyObject(this);
  }
}
export default CustomPolygonPrimitive;
