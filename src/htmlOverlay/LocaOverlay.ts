import './LabelOverlay.scss';

import * as Cesium from 'cesium';

import { HtmlOverlay, type HtmlOverlayType } from '../utils/HtmlOverlay';

import { ColorListStyleType } from './InfoOverlay';
import { uuid } from '../utils/tool';

const iconMap = {
  icon1: `<svg width="_width_" height="_height_" viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.9999 18.0557L38.9451 1.77835C40.439 0.253267 42.8944 0.253274 44.3884 1.77836C45.8394 3.25961 45.8394 5.62928 44.3883 7.11052L28.3332 23.5002L44.3883 39.8895C45.8393 41.3708 45.8393 43.7404 44.3883 45.2217C42.8944 46.7468 40.4391 46.7468 38.9451 45.2217L22.9999 28.9446L7.05497 45.2217C5.56101 46.7468 3.10567 46.7468 1.61171 45.2217C0.160676 43.7404 0.160676 41.3707 1.61171 39.8895L17.6667 23.5002L1.61167 7.11055C0.160653 5.62929 0.160658 3.25961 1.61168 1.77836C3.10565 0.253271 5.56103 0.253282 7.05498 1.77838L22.9999 18.0557Z" fill="_fillColor_"/>
</svg>`,
  icon2: `<svg width="_width_" height="_height_" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M27.7273 11.2875C19.2269 12.5033 12.5033 19.2269 11.2875 27.7273H16.6364V33.2727H11.2875C12.5033 41.7731 19.2269 48.4967 27.7273 49.7125V44.3636H33.2727V49.7125C41.7731 48.4967 48.4967 41.7731 49.7125 33.2727H44.3636V27.7273H49.7125C48.4967 19.2269 41.7731 12.5033 33.2727 11.2875V16.6364H27.7273V11.2875ZM5.69776 27.7273C6.9764 16.1605 16.1605 6.9764 27.7273 5.69776V0H33.2727V5.69776C44.8394 6.9764 54.0235 16.1605 55.3023 27.7273H61V33.2727H55.3023C54.0235 44.8394 44.8394 54.0235 33.2727 55.3023V61H27.7273V55.3023C16.1605 54.0235 6.9764 44.8394 5.69776 33.2727H0V27.7273H5.69776ZM38.8182 30.5C38.8182 35.0941 35.0941 38.8182 30.5 38.8182C25.9059 38.8182 22.1818 35.0941 22.1818 30.5C22.1818 25.9059 25.9059 22.1818 30.5 22.1818C35.0941 22.1818 38.8182 25.9059 38.8182 30.5Z" fill="_fillColor_"/>
</svg>`
};
export type LocaOverlayType = HtmlOverlayType & {
  width: number;
  height: number;
  iconType: keyof typeof iconMap;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  data: any;
  colorListStyle: ColorListStyleType;
};

export class LocaOverlay {
  static htmlOverlay: HtmlOverlay;
  static overlayMap = new Map<string, LocaOverlayType>();

  static init(viewer: Cesium.Viewer) {
    this.htmlOverlay = new HtmlOverlay({
      viewer,
      containerId: 'cesium_LocaOverlay'
    });
  }
  static getInfoHtml(set: LocaOverlayType) {
    let value = set.data[set.colorListStyle.colorListProp];
    let color = '';
    let tag = false;
    if (set.colorListStyle.colorListIsRange) {
      for (let i = 0; i < set.colorListStyle.colorList.length; i++) {
        const it = set.colorListStyle.colorList[i];
        if (value >= it.min && value < it.max) {
          color = it.headerBg;
          tag = true;
          break;
        }
      }
      if (!tag) {
        const it = set.colorListStyle.colorList.at(-1);
        if (it) color = it.headerBg;
      }
    } else {
      for (let v in set.colorListStyle.colorList) {
        if (value === Number(v)) {
          const it = set.colorListStyle.colorList[v];
          color = it.headerBg;
          break;
        }
      }
    }
    const icon = iconMap[set.iconType] + '';

    return `<div class="cesium-loca-overlay ${
      set.colorListStyle.className || ''
    }" data-colorprop="${
      set.colorListStyle.colorListProp
    }" data-colorvalue="${value}" style="width:${set.width}px;height:${set.height}px">
  ${icon
    .replace('_fillColor_', color)
    .replace('_width_', set.width + '')
    .replace('_height_', set.height + '')}
    </div>`;
  }
  static createOverlay(set: LocaOverlayType) {
    if (!set.id) {
      set.id = uuid();
    }
    const p = set.position;
    const o: HtmlOverlayType = {
      id: set.id,
      position: [p[0], p[1], p[2] | 0],
      offset: [-set.width * 0.5, -set.height * 0.5],
      isGround: set.isGround,
      hideLevel: set.hideLevel,
      content: this.getInfoHtml(set),
      show: true
    };

    this.overlayMap.set(set.id, set);
    return o;
  }
  static addOverlay(set: LocaOverlayType) {
    const o = this.createOverlay(set);
    this.htmlOverlay.addHtml(o);
    return set.id;
  }
  static updateOverlay(set: LocaOverlayType) {
    const old = this.overlayMap.get(set.id);
    const o = this.createOverlay({ ...old, ...set });
    this.htmlOverlay.updateHtml(o);
  }
  static removeOverlay(id: string) {
    this.htmlOverlay.removeHtml(id);
  }
}
