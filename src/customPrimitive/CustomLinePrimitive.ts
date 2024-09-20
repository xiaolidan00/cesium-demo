import * as Cesium from 'cesium';

import CustomPrimitive, { type CustomPrimitiveOption } from './CustomPrimitive';
import { PosUtil } from '../utils/PosUtil';

export type CustomLinePrimitiveOption = CustomPrimitiveOption & {
  color: Cesium.Color;
  width: number;
  isClose?: boolean;
  isDashed?: boolean;
  dashLength?: number;

  //点的样式
  isPoint?: boolean;
  pointSize?: number;
  pointColor?: Cesium.Color;
  pointOutline?: boolean;
  pointOutlineColor?: Cesium.Color;
  pointOutlineWidth?: number;
};

class CustomLinePrimitive extends CustomPrimitive {
  _linePrimitive: any;

  color: Cesium.Color;

  width: number;
  isClose?: boolean;
  isDashed?: boolean;
  dashLength?: number;

  isPoint: boolean;
  pointSize: number = 10;
  pointColor: Cesium.Color = Cesium.Color.WHITE;
  pointOutline: boolean;
  pointOutlineColor: Cesium.Color = Cesium.Color.RED;
  pointOutlineWidth: number;

  constructor(options: CustomLinePrimitiveOption) {
    super(options);

    this.width = options.width || 3;
    this.color = options.color;

    this.isDashed = options.isDashed;
    this.dashLength = options.dashLength || 20;
    this.isClose = options.isClose || false;
    this.isPoint = options.isPoint || false;
    this.pointSize = options.pointSize || 10;
    this.pointColor = options.pointColor || Cesium.Color.WHITE;
    this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    this.pointOutline = options.pointOutline || false;
    this.pointOutlineWidth = options.pointOutlineWidth || 3;
  }

  update(frameState: any) {
    if (
      this._primitive &&
      JSON.stringify(this.positions) === JSON.stringify(this._positions) &&
      this.isGround === this._isGround &&
      this.isHeight === this._isHeight &&
      this._isTerrain === this.isTerrain
    ) {
      this._primitive.update(frameState);
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
      this.getPointPrimitive({
        pointSize: this.pointSize,
        pointColor: this.pointColor,
        pointOutline: this.pointOutline,
        pointOutlineColor: this.pointOutlineColor,
        pointOutlineWidth: this.pointOutlineWidth
      });
    }

    this._linePrimitive && this._primitive && this._primitive.remove(this._linePrimitive);
    // this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
    this._linePrimitive = this.getLinePrimitive({
      outline: true,
      outlineColor: this.color,
      outlineWidth: this.width,
      isClose: this.isClose,
      isDashed: this.isDashed
    });

    if (this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }

    if (this.isPoint && this._pointPrimitive) {
      if (!this._primitive.contains(this._pointPrimitive)) {
        this._primitive.add(this._pointPrimitive);
      }
      this._primitive.raiseToTop(this._pointPrimitive);
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
