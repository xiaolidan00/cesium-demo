import './InfoOverlay.scss';

import * as Cesium from 'cesium';

import { HtmlOverlay, type HtmlOverlayType } from '../utils/HtmlOverlay';

import { parseResultColor } from 'xcolor-helper';
import { uuid } from '../utils/tool';

export type InfoOverlayType = HtmlOverlayType & {
  width: number;
  height: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  data: any;
  title: string;
  info: Array<{ name: string; prop: string; unit: string }>;
  colorListStyle: ColorListStyleType;
};

export type ColorListStyleType = {
  colorListProp: string;
  className: string;
} & (
  | {
      colorListIsRange: true;
      colorList: Array<{
        headerBg: string;
        bodyBg: string;
        headerColor: string;
        bodyColor: string;
        min: number;
        max: number;
      }>;
    }
  | {
      colorListIsRange: false;
      colorList: {
        [n: number]: {
          headerBg: string;
          bodyBg: string;
          headerColor: string;
          bodyColor: string;
        };
      };
    }
);

export class InfoOverlay {
  static htmlOverlay: HtmlOverlay;
  static overlayMap = new Map<string, InfoOverlayType>();

  static init(viewer: Cesium.Viewer) {
    this.htmlOverlay = new HtmlOverlay({
      viewer,
      containerId: 'cesium_InfoOverlay'
    });
  }
  static getInfoHtml(set: InfoOverlayType) {
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

    return `<div class="cesium-info-overlay ${
      set.colorListStyle.className || ''
    }" data-colorprop="${
      set.colorListStyle.colorListProp
    }" data-colorvalue="${value}" style="width:${set.width}px;height:${set.height}px">
    <div class="header">
    <span class="title">${set.title}</span>
    <span class="close" id="close_${set.id}"><i></i></span>
    </div>    
    <div class="body">
    <table>
    ${set.info
      .map((it) => `<tr><td>${it.name}</td><td>${set.data[it.prop]}${it.unit}</td></tr>`)
      .join('')}</table>
      </div>
      <div class="arrow"></div>
    </div>`;
  }
  static createOverlay(set: InfoOverlayType) {
    if (!set.id) {
      set.id = uuid();
    }
    const p = set.position;
    const o: HtmlOverlayType = {
      id: set.id,
      position: [p[0], p[1], (p[2] | 0) + 0.3],
      offset: [-set.width * 0.5, -set.height - 16],
      isGround: set.isGround,
      hideLevel: set.hideLevel,
      content: this.getInfoHtml(set)
    };

    this.overlayMap.set(set.id, set);
    return o;
  }
  static addOverlay(set: InfoOverlayType) {
    const o = this.createOverlay(set);
    this.htmlOverlay.addHtml(o);
    return set.id;
  }
  static createColorListStyle(set: ColorListStyleType) {
    const id = set.className + 'info_STYLE';
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
        const c = parseResultColor(it.headerBg);
        css += `.${set.className}.cesium-info-overlay[data-colorprop="${
          set.colorListProp
        }"][data-colorvalue="${it.min}"]{          
  --cesium-info-overlay-header-bg: ${it.headerBg};
  --cesium-info-overlay-header-bg1: rgba(${c.red},${c.green},${c.blue},${0.46});
  --cesium-info-overlay-header-color: ${it.headerColor};
  --cesium-info-overlay-body-bg: ${it.bodyBg};
  --cesium-info-overlay-body-color: ${it.bodyColor};
         }`;
      }
    } else {
      for (let v in set.colorList) {
        const it = set.colorList[v];
        const c = parseResultColor(it.headerBg);
        css += `.${set.className}.cesium-info-overlay[data-colorprop="${
          set.colorListProp
        }"][data-colorvalue="${v}"]{          
  --cesium-info-overlay-header-bg: ${it.headerBg};
    --cesium-info-overlay-header-bg1: rgba(${c.red},${c.green},${c.blue},${0.46});
  --cesium-info-overlay-header-color: ${it.headerColor};
  --cesium-info-overlay-body-bg: ${it.bodyBg};
  --cesium-info-overlay-body-color: ${it.bodyColor};
         }
  `;
      }
    }
    style.innerHTML = css;
  }
  static updateOverlay(set: InfoOverlayType) {
    const old = this.overlayMap.get(set.id);
    const o = this.createOverlay({ ...old, ...set });
    this.htmlOverlay.updateHtml(o);
  }
  static removeOverlay(id: string) {
    this.htmlOverlay.removeHtml(id);
  }
}
