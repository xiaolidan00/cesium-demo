import './LabelOverlay.scss';

import * as Cesium from 'cesium';

import { HtmlOverlay, type HtmlOverlayType } from '../utils/HtmlOverlay';

import { ColorListStyleType } from './InfoOverlay';
import { uuid } from '../utils/tool';

export type LabelOverlayType = HtmlOverlayType & {
  width: number;
  height: number;
  imageUrl: string;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  data: any;
  colorListStyle: ColorListStyleType;
};

export class LabelOverlay {
  static htmlOverlay: HtmlOverlay;
  static overlayMap = new Map<string, LabelOverlayType>();

  static init(viewer: Cesium.Viewer) {
    this.htmlOverlay = new HtmlOverlay({
      viewer,
      containerId: 'cesium_LabelOverlay'
    });
  }
  static getInfoHtml(set: LabelOverlayType) {
    let value = set.data[set.colorListStyle.colorListProp];
    let tag = false;
    if (set.colorListStyle.colorListIsRange) {
      for (let i = 0; i < set.colorListStyle.colorList.length; i++) {
        const it = set.colorListStyle.colorList[i];
        if (value >= it.min && value < it.max) {
          value = it.min;
          tag = true;
          break;
        }
      }
      if (!tag) {
        const it = set.colorListStyle.colorList.at(-1);
        value = it?.min;
      }
    }

    return `<div class="cesium-label-overlay ${
      set.colorListStyle.className || ''
    }" data-colorprop="${
      set.colorListStyle.colorListProp
    }" data-colorvalue="${value}" style="width:${set.width}px;height:${set.height}px">
    <img src="${set.imageUrl}">
    </div>`;
  }
  static createOverlay(set: LabelOverlayType) {
    if (!set.id) {
      set.id = uuid();
    }
    const p = set.position;
    const o: HtmlOverlayType = {
      id: set.id,
      position: [p[0], p[1], (p[2] | 0) + 0.3],
      offset: [-set.width * 0.5, -set.height * 0.5],
      isGround: set.isGround,
      hideLevel: set.hideLevel,
      content: this.getInfoHtml(set),
      show: true
    };

    this.overlayMap.set(set.id, set);
    return o;
  }
  static addOverlay(set: LabelOverlayType) {
    const o = this.createOverlay(set);
    this.htmlOverlay.addHtml(o);
    return set.id;
  }
  static createColorListStyle(set: ColorListStyleType) {
    const id = set.className + 'label_STYLE';
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.body.appendChild(style);
    }
    let css: string = '';
    if (set.colorListIsRange) {
      for (let i = 0; i < set.colorList.length; i++) {
        const it = set.colorList[i];
        css += `.${set.className}.cesium-label-overlay[data-colorprop="${set.colorListProp}"][data-colorvalue="${it.min}"]{          
  --cesium-label-overlay-bg: ${it.headerBg};
         }
  `;
      }
    } else {
      for (let v in set.colorList) {
        const it = set.colorList[v];
        css += `.${set.className}.cesium-label-overlay[data-colorprop="${set.colorListProp}"][data-colorvalue="${v}"]{          
  --cesium-label-overlay-bg: ${it.headerBg};
         }
  `;
      }
    }
    style.innerHTML = css;
  }
  static updateOverlay(set: LabelOverlayType) {
    const old = this.overlayMap.get(set.id);
    const o = this.createOverlay({ ...old, ...set });
    this.htmlOverlay.updateHtml(o);
  }
  static removeOverlay(id: string) {
    this.htmlOverlay.removeHtml(id);
  }
}
