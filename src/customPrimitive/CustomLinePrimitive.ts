import * as Cesium from 'cesium';

import CustomPrimitive, { type CustomPrimitiveOption } from './CustomPrimitive';

export type CustomLinePrimitiveOption = CustomPrimitiveOption & {
  color: Cesium.Color; //线颜色
  width: number; //线宽
  isClose?: boolean; //是否封闭图形
  //虚线
  isDashed?: boolean; //是否虚线
  dashLength?: number; //虚线长度

  //点的样式
  isPoint?: boolean; //是否开启
  pointSize?: number; //点大小
  pointColor?: Cesium.Color; //点颜色
  pointOutline?: boolean; //点是否有边框
  pointOutlineColor?: Cesium.Color; //点边框颜色
  pointOutlineWidth?: number; //点边框宽度
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
    this._isGround = this.isGround;
    this._isHeight = this.isHeight;
    this._isTerrain = this.isTerrain;

    //创建图元集合
    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
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
    //绘制线
    this._linePrimitive && this._primitive && this._primitive.remove(this._linePrimitive);
    this._linePrimitive = this.getLinePrimitive({
      outline: true,
      outlineColor: this.color,
      outlineWidth: this.width,
      isClose: this.isClose,
      isDashed: this.isDashed
    });
    //如果未添加则添加到集合
    if (this._linePrimitive && !this._primitive.contains(this._linePrimitive)) {
      this._primitive.add(this._linePrimitive);
    }
    if (this.isPoint && this._pointPrimitive) {
      if (!this._primitive.contains(this._pointPrimitive)) {
        this._primitive.add(this._pointPrimitive);
      }
      //点集合置顶
      this._primitive.raiseToTop(this._pointPrimitive);
    }
    if (!this._primitive) return;

    this._primitive.update(frameState);
  }

  isDestroyed() {
    return false;
  }
  destroy() {
    //清空集合
    this._primitive && this._primitive.removeAll();
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
export default CustomLinePrimitive;
