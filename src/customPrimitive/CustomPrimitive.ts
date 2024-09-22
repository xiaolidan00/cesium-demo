import * as Cesium from 'cesium';

import { PosUtil } from '../utils/PosUtil';

//自定义Primitive配置项
export type CustomPrimitiveOption = {
  id: string;
  //坐标点
  positions: number[][];
  //是否贴地
  isGround?: boolean;
  //坐标点是否有高度
  isHeight?: boolean;
  //是否开启山形
  isTerrain?: boolean;
};
class CustomPrimitive {
  id: string = '';
  //图元
  _primitive: any;

  positions: number[][] = [];
  _positions: number[][] = [];

  isGround?: boolean;
  _isGround?: boolean = false;

  isHeight?: boolean = false;
  _isHeight?: boolean = false;

  isTerrain?: boolean = false;
  _isTerrain?: boolean = false;
  //坐标点id集
  pointMap: { [n: string]: number } = {};
  _pointPrimitive: any;
  constructor(options: CustomPrimitiveOption) {
    this.id = options.id || (Math.random() * 9999).toFixed(0);
    this.positions = options.positions;
    this.isGround = options.isGround || false;
    this.isTerrain = options.isTerrain || false;
    //贴地开启则默认坐标点高度不开启
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
    //创建点Primitive集
    if (!this._pointPrimitive) {
      this._pointPrimitive = new Cesium.PointPrimitiveCollection();
    }
    const oldMap = { ...this.pointMap };
    const newMap: { [n: string]: number } = {};
    //点样式
    const pointStyle = {
      pixelSize: that.pointSize,
      color: that.pointColor,
      outlineColor: that.pointOutline ? that.pointOutlineColor : undefined,
      outlineWidth: that.pointOutline ? that.pointOutlineWidth : 0.0
    };
    const baseHeight = 0.0;
    //贴地
    if (this.isGround) {
      //地形开启，取山形高度
      if (this.isTerrain) {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], it[2] || baseHeight];
          const id = this.id + p.join('_');
          if (!oldMap[id] && !newMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle
            });
          }
          newMap[id] = 1;
        });
      } else {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], baseHeight];
          const id = this.id + p.join('_');
          if (!oldMap[id] && !newMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle
            });
          }
          newMap[id] = 1;
        });
      }
    } else {
      //坐标自定义高度开启
      if (this.isHeight) {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], it[2] || baseHeight];
          const id = this.id + p.join('_');
          if (!oldMap[id] && !newMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle
            });
          }

          newMap[id] = 1;
        });
      } else {
        this.positions.forEach((it, idx) => {
          const p = [it[0], it[1], baseHeight];
          const id = this.id + p.join('_');
          if (!oldMap[id] && !newMap[id]) {
            this._pointPrimitive.add({
              id,
              position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
              ...pointStyle
            });
          }

          newMap[id] = 1;
        });
      }
    }
    //删除没有的点
    this._pointPrimitive._pointPrimitives.forEach((point: Cesium.PointPrimitive) => {
      if (!newMap[point.id]) {
        this._pointPrimitive.remove(point);
      }
    });
    this.pointMap = newMap;
    return this._pointPrimitive;
  }
  //线样式
  getLineMaterial(that: { color: Cesium.Color; isDashed?: boolean; dashLength?: number }) {
    if (that.isDashed) {
      //虚线样式
      return Cesium.Material.fromType('PolylineDash', {
        color: that.color,
        gapColor: Cesium.Color.TRANSPARENT,
        dashLength: that.dashLength
      });
    } else {
      //实线样式
      return Cesium.Material.fromType('Color', {
        color: that.color
      });
    }
  }
  //线Primitive
  getLinePrimitive(that: {
    outline: boolean;
    outlineColor: Cesium.Color;
    outlineWidth: number;
    isClose?: boolean; //是否闭环
    isDashed?: boolean;
  }) {
    const positions = that.isClose ? [...this.positions, this.positions[0]] : this.positions;
    const material = this.getLineMaterial({
      color: that.outlineColor,
      isDashed: that.isDashed
    });
    //贴地
    if (this.isGround) {
      return new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + 'linegeometryInstance',
          geometry: new Cesium.GroundPolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray(
              PosUtil.posNoHeightTransform(positions).flat(1)
            ),
            width: that.outlineWidth
          })
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,

          material: material
        }),
        asynchronous: false
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + 'linegeometryInstance',
          geometry: new Cesium.PolylineGeometry({
            //是否开启高度
            positions: this.isHeight
              ? Cesium.Cartesian3.fromDegreesArrayHeights(
                  PosUtil.posHeightTransform(positions).flat(1)
                )
              : Cesium.Cartesian3.fromDegreesArray(PosUtil.posNoHeightTransform(positions).flat(1)),
            width: that.outlineWidth
          })
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          translucent: true,
          material: material
        }),
        asynchronous: false
      });
    }
  }
  //创建多边形Primitive
  getPolygonPrimitive(that: { color: Cesium.Color }) {
    //贴地
    if (this.isGround) {
      return new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + 'geometryInstance',
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(
                //转换为无高度坐标
                PosUtil.posNoHeightTransform(this.positions).flat(1)
              )
            )
          })
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false, //双面可见
          translucent: true, //透明开启
          material: Cesium.Material.fromType('Color', {
            color: that.color
          })
        }),
        asynchronous: false
      });
    } else {
      return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: this.id + 'geometryInstance',
          geometry: new Cesium.PolygonGeometry({
            perPositionHeight: this.isHeight, //是否开启高度
            polygonHierarchy: new Cesium.PolygonHierarchy(
              this.isHeight
                ? Cesium.Cartesian3.fromDegreesArrayHeights(
                    //转换为有高度坐标
                    PosUtil.posHeightTransform(this.positions).flat(1)
                  )
                : Cesium.Cartesian3.fromDegreesArray(
                    //转换为无高度坐标
                    PosUtil.posNoHeightTransform(this.positions).flat(1)
                  )
            )
          })
        }),
        appearance: new Cesium.MaterialAppearance({
          faceForward: false, //双面可见
          translucent: true, //透明开启
          material: Cesium.Material.fromType('Color', {
            color: that.color
          })
        }),
        asynchronous: false
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
