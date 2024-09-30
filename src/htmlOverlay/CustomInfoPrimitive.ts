import * as Cesium from 'cesium';

import { InfoOverlay, type ColorListStyleType, type InfoOverlayType } from './InfoOverlay';
import { PosUtil } from '../utils/PosUtil';
import { uuid } from '../utils/tool';
import { LabelOverlay, type LabelOverlayType } from './LabelOverlay';
import { LocaOverlay, type LocaOverlayType } from './LocaOverlay';

type LabelStyleType = Pick<
  LabelOverlayType,
  'isGround' | 'width' | 'height' | 'imageUrl' | 'hideLevel' | 'rotateX' | 'rotateY' | 'rotateZ'
>;

type InfoStyleType = Pick<
  InfoOverlayType,
  | 'height'
  | 'width'
  | 'rotateX'
  | 'rotateY'
  | 'rotateZ'
  | 'offset'
  | 'isGround'
  | 'hideLevel'
  | 'title'
  | 'info'
  | 'show'
>;
type LocaStyleType = Pick<
  LocaOverlayType,
  | 'height'
  | 'width'
  | 'rotateX'
  | 'rotateY'
  | 'rotateZ'
  | 'isGround'
  | 'hideLevel'
  | 'show'
  | 'iconType'
>;
export type CustomInfoPrimitiveOptions = {
  id: string;
  terrainHeight: number;

  lineStyle: {
    width: number;
    color: Cesium.Color;
    startPos?: number[];
    endPos?: number[];
    isGround?: boolean; //是否贴地
  };
  position: number[];
  locaStyle: LocaStyleType;
  labelStyle: LabelStyleType;
  crossStyle: {
    materialType?: 'color' | 'image' | 'follow';
    color: Cesium.Color;
    width: number;
  } & (
    | {
        isHeight: false;
      }
    | { isHeight: true; height: number }
  );
  data: any;
  infoStyle: InfoStyleType;
  colorListStyle: ColorListStyleType;
  viewer: Cesium.Viewer;
  hideLevel: number;
};

export class CustomInfoPrimitive {
  position: number[] = [];
  id: string = '';
  _primitive: any;
  lineStyle: CustomInfoPrimitiveOptions['lineStyle'];
  crossStyle: CustomInfoPrimitiveOptions['crossStyle'];
  infoStyle: CustomInfoPrimitiveOptions['infoStyle'];
  terrainHeight: number = 0;
  isTerrain?: boolean = false;
  _isTerrain?: boolean = false;
  _crossPrimitive: any;
  _linePrimitive: any;
  _lineId: string = '';
  _crossId: string = '';
  _infoId: string = '';
  _labelId: string = '';
  _locaId: string = '';
  locaStyle: LocaStyleType;
  data: any;
  colorListStyle: ColorListStyleType;
  labelStyle: LabelStyleType;
  _position: number[] = [];
  _data: any;
  viewer: Cesium.Viewer;
  mapLevel: number = 11;
  hideLevel: number;
  constructor(options: CustomInfoPrimitiveOptions) {
    if (!options.id) {
      options.id = uuid();
    }
    options.id = this.id;
    this.hideLevel = options.hideLevel;
    this.viewer = options.viewer;
    this.colorListStyle = options.colorListStyle;
    this.lineStyle = options.lineStyle;
    this.labelStyle = options.labelStyle;
    this.locaStyle = options.locaStyle;
    this.crossStyle = options.crossStyle;
    this.infoStyle = options.infoStyle;
    this.position = options.position;
    this.terrainHeight = options.terrainHeight;
    this.data = options.data;
  }
  getLine(that: CustomInfoPrimitiveOptions['lineStyle']) {
    let pos: number[];
    if (that.startPos && that.endPos) {
      pos = [that.startPos, that.endPos].flat(1);
    } else {
      const p = this.position;
      pos = [p[0], p[1], 0, p[0], p[1], p[2]];
    }

    this._lineId = pos.join('_');
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        id: this.id + 'linegeometryInstance',
        geometry: new Cesium.PolylineGeometry({
          //是否开启高度
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(pos),
          width: that.width
        })
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType('Color', {
          color: that.color
        })
      }),
      asynchronous: false
    });
  }

  update(frameState: any) {
    const level = Math.log2(128538232 / this.viewer.camera.positionCartographic.height);
    if (
      this._primitive &&
      this.isTerrain === this._isTerrain &&
      JSON.stringify(this.data) === JSON.stringify(this._data) &&
      JSON.stringify(this.position) === JSON.stringify(this._position) &&
      this.mapLevel === level
    ) {
      this._primitive.update(frameState);
      return;
    }
    this.mapLevel = level;
    const p = this.position;
    this._position = JSON.parse(JSON.stringify(p));
    this._data = JSON.parse(JSON.stringify(this.data));
    if (!this._primitive) {
      this._primitive = new Cesium.PrimitiveCollection();
    }

    this._primitive.removeAll();
    if (this.mapLevel > this.hideLevel) {
      this._linePrimitive = this.getLine(this.lineStyle);
      this._primitive.add(this._linePrimitive);
    }
    const infoId = 'info' + this.id;
    const common = {
      data: this.data,
      position: p,
      hideLevel: this.hideLevel,
      colorListStyle: this.colorListStyle
    };
    if (!this._infoId) {
      InfoOverlay.addOverlay({
        ...this.infoStyle,
        ...common,
        id: infoId
      });
      this._infoId = infoId;
    } else {
      InfoOverlay.updateOverlay({
        ...this.infoStyle,
        ...common,
        id: infoId
      });
    }

    const labelId = 'label' + this.id;
    if (!this._labelId) {
      LabelOverlay.addOverlay({
        ...this.labelStyle,
        ...common,
        id: labelId
      });
      this._labelId = labelId;
    } else {
      LabelOverlay.updateOverlay({
        ...this.labelStyle,
        ...common,
        id: labelId
      });
    }

    const locaId = 'loca' + this.id;
    if (!this._locaId) {
      LocaOverlay.addOverlay({
        ...this.locaStyle,
        data: this.data,
        hideLevel: this.hideLevel,
        colorListStyle: this.colorListStyle,
        position: [p[0], p[1], 0],
        id: locaId
      });
      this._locaId = labelId;
    } else {
      LocaOverlay.updateOverlay({
        ...this.locaStyle,
        data: this.data,
        hideLevel: this.hideLevel,
        colorListStyle: this.colorListStyle,
        position: [p[0], p[1], 0],
        id: locaId
      });
    }

    if (this._primitive) {
      this._primitive.update(frameState);
    }
  }
  isDestroyed() {
    return false;
  }
  destroy() {
    InfoOverlay.removeOverlay(this._infoId);
    LabelOverlay.removeOverlay(this._labelId);
    this._primitive = this._primitive && this._primitive.destroy();
    return Cesium.destroyObject(this);
  }
}
