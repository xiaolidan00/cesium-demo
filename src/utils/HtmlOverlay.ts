import * as Cesium from "cesium";
import { type LngLatHeightType } from "./PosUtil";
export type HtmlOverlayType = {
  id: string;
  position: LngLatHeightType;
  content: string;
  data?: any;
  dom?: HTMLDivElement;
  offset?: [number, number];
};

export class HtmlOverlay {
  viewer: Cesium.Viewer;
  overlayBody: HTMLDivElement;
  styleDom: HTMLStyleElement;
  htmlMap = new Map<string, HtmlOverlayType>();
  scratch: Cesium.Cartesian2;
  listener: Cesium.Event.RemoveCallback;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.overlayBody = document.createElement("div");
    this.overlayBody.id = "cesium_overlayBody";
    document.body.appendChild(this.overlayBody);
    this.styleDom = document.createElement("style");
    this.styleDom.id = "cesium_overlayStyle";
    this.styleDom.innerHTML = `#cesium_overlayBody{position:absolute;z-index:999;height:100%;width:100%;top:0px;left:0px;pointer-events:none;overflow:hidden;}
    .cesium-html-overlay{position:absolute;}`;
    document.head.appendChild(this.styleDom);
    this.scratch = new Cesium.Cartesian2();
    this.listener = this.viewer.scene.preRender.addEventListener(() => {
      this.htmlMap.forEach((item) => {
        this.updatePos(item);
      });
    });
  }
  showHtml(id: string) {
    const set = this.htmlMap.get(id);
    if (set?.dom) {
      set.dom.style.display = "";
    }
  }
  hideHtml(id: string) {
    const set = this.htmlMap.get(id);
    if (set?.dom) {
      set.dom.style.display = "none";
    }
  }
  addHtml(set: HtmlOverlayType) {
    const dom = document.createElement("div");
    dom.id = set.id;
    dom.className = "cesium-html-overlay";
    dom.innerHTML = set.content;
    this.overlayBody.appendChild(dom);
    set.dom = dom;

    this.htmlMap.set(set.id, set);
    this.updatePos(set);
  }
  updatePos(item: HtmlOverlayType) {
    const position = Cesium.Cartesian3.fromDegrees(...item.position);
    const dom = item.dom;
    const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(
      position,
      this.scratch
    );
    if (dom && Cesium.defined(canvasPosition)) {
      dom.style.top = `${canvasPosition.y}px`;
      dom.style.left = `${canvasPosition.x}px`;
      if (item.offset?.length) {
        dom.style.marginLeft = `${item.offset[0]}px`;
        dom.style.marginTop = `${item.offset[1]}px`;
      }
    }
  }
  updateHtml(set: HtmlOverlayType) {
    const item = this.htmlMap.get(set.id);

    if (item?.dom) {
      const dom = item.dom;
      dom.innerHTML = set.content;
      set.dom = dom;
      this.htmlMap.set(set.id, set);
      this.updatePos(set);
    }
  }
  removeHtml(id: string) {
    const item = this.htmlMap.get(id);
    if (item?.dom) {
      const dom = item.dom;
      this.overlayBody.removeChild(dom);
      this.htmlMap.delete(id);
    }
  }
  destroy() {
    this.listener();
    this.htmlMap.clear();
    document.body.removeChild(this.overlayBody);
    document.head.removeChild(this.styleDom);
  }
}
