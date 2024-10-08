import * as Cesium from 'cesium';

import CustomPrimitive, { type CustomPrimitiveOption } from './CustomPrimitive';

export type CustomPolygonPrimitiveOption = CustomPrimitiveOption & {
  color?: Cesium.Color;

  outline?: boolean;
  outlineColor?: Cesium.Color;
  outlineWidth?: number;

  //点的样式
  isPoint?: boolean;
  pointSize?: number;
  pointColor?: Cesium.Color;
  pointOutline?: boolean;
  pointOutlineColor?: Cesium.Color;
  pointOutlineWidth?: number;
};

class CustomPolygonPrimitive extends CustomPrimitive {
  _polygonPrimitive: any;
  _linePrimitive: any;

  color: Cesium.Color = Cesium.Color.RED;

  outline: boolean;
  outlineColor: Cesium.Color = Cesium.Color.RED;
  outlineWidth: number;

  isPoint: boolean;
  pointSize: number = 10;
  pointColor: Cesium.Color = Cesium.Color.WHITE;
  pointOutline: boolean;
  pointOutlineColor: Cesium.Color = Cesium.Color.RED;
  pointOutlineWidth: number;
  constructor(options: CustomPolygonPrimitiveOption) {
    super(options);

    this.color = options.color || Cesium.Color.RED;

    this.outline = options.outline || false;
    this.outlineColor = options.outlineColor || Cesium.Color.RED;
    this.outlineWidth = options.outlineWidth || 3;
    this.isPoint = options.isPoint || false;
    this.pointSize = options.pointSize || 10;
    this.pointColor = options.pointColor || Cesium.Color.WHITE;
    this.pointOutlineColor = options.pointOutlineColor || Cesium.Color.RED;
    this.pointOutline = options.pointOutline || false;
    this.pointOutlineWidth = options.pointOutlineWidth || 3;
  }

  update(frameState: any) {
    //坐标点相关属性不变则保持
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
    //更新坐标点相关属性
    this._positions = [...this.positions];
    this._isTerrain = this.isTerrain;
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    //创建图元集合
    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }
    //绘制线
    if (this.outline) {
      this._linePrimitive && this._primitive && this._primitive.remove(this._linePrimitive);
      //至少两个坐标点
      if (this.positions.length >= 2) {
        this._linePrimitive = this.getLinePrimitive({
          outline: this.outline,
          outlineColor: this.outlineColor,
          outlineWidth: this.outlineWidth,
          isClose: true,
          isDashed: false
        });
      }
    }
    //绘制点
    if (this.isPoint) {
      this.getPointPrimitive({
        pointSize: this.pointSize,
        pointColor: this.pointColor,
        pointOutline: this.pointOutline,
        pointOutlineColor: this.pointOutlineColor,
        pointOutlineWidth: this.pointOutlineWidth
      });
    }
    //绘制面
    this._polygonPrimitive && this._primitive && this._primitive.remove(this._polygonPrimitive);
    //至少两个坐标点
    if (this.positions.length >= 3) {
      this._polygonPrimitive = this.getPolygonPrimitive({
        color: this.color
      });
    }

    //如果未添加则添加到集合
    if (this._polygonPrimitive && !this._primitive.contains(this._polygonPrimitive)) {
      this._primitive.add(this._polygonPrimitive);
    }

    if (this.outline && this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }

    if (this.isPoint && this._pointPrimitive) {
      if (!this._primitive.contains(this._pointPrimitive)) {
        this._primitive.add(this._pointPrimitive);
      }
      //点集合置顶
      this._primitive.raiseToTop(this._pointPrimitive);
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
