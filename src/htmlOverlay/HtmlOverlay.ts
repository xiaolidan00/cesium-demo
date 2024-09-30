import * as Cesium from 'cesium';

export type HtmlOverlayType = {
  id: string;
  position: number[];
  content: string;
  show?: boolean;
  data?: any;
  dom?: HTMLDivElement;
  offset?: [number, number];
  isGround?: boolean; //是否贴地
  hideLevel?: number; //隐藏缩放等级
};

export type OverlayOptionsType = {
  viewer: Cesium.Viewer;
  containerId: string;
};

export class HtmlOverlay {
  viewer: Cesium.Viewer;
  overlayBody: HTMLDivElement;
  htmlMap = new Map<string, HtmlOverlayType>();

  listener: Cesium.Event.RemoveCallback;
  isTerrain: boolean = false;
  mapLevel: number = 3;
  constructor(options: OverlayOptionsType) {
    this.viewer = options.viewer;

    this.overlayBody = document.createElement('div');
    this.overlayBody.id = options.containerId || 'cesium_overlayBody';
    this.overlayBody.style.position = 'absolute';
    this.overlayBody.style.top = '0px';
    this.overlayBody.style.left = '0px';

    this.overlayBody.style.pointerEvents = 'none';
    document.body.appendChild(this.overlayBody);

    this.listener = this.viewer.scene.preRender.addEventListener(() => {
      this.isTerrain =
        this.viewer.scene.mode == Cesium.SceneMode.SCENE3D &&
        !(this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider);
      this.mapLevel = Math.log2(128538232 / this.viewer.camera.positionCartographic.height);
      this.htmlMap.forEach((item) => {
        this.updatePos(item);
      });
    });
  }
  getHtml(id: string) {
    return this.htmlMap.get(id);
  }
  showHtml(id: string) {
    const set = this.htmlMap.get(id);
    if (set?.dom) {
      set.dom.style.display = '';
    }
  }
  hideHtml(id: string) {
    const set = this.htmlMap.get(id);
    if (set?.dom) {
      set.dom.style.display = 'none';
    }
  }
  addHtml(set: HtmlOverlayType) {
    const dom = document.createElement('div');
    dom.id = set.id + 'overlay';
    dom.style.position = 'absolute';
    dom.innerHTML = set.content;
    this.overlayBody.appendChild(dom);
    set.dom = dom;
    this.htmlMap.set(set.id, set);
    this.updatePos(set);
  }
  updatePos(item: HtmlOverlayType) {
    if (!item.dom) return;
    if (item.show === false) {
      item.dom.style.display = 'none';
      return;
    }
    if (item.hideLevel && this.mapLevel < item.hideLevel) {
      item.dom.style.display = 'none';
      return;
    }
    item.dom.style.display = '';
    const pos = item.position;
    let height = pos[2] || 1;
    if (item.isGround) {
      if (this.isTerrain) {
        height = pos[2] || 1;
      } else {
        height = 1;
      }
    }
    const position = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], height);

    const dom = item.dom;
    try {
      const canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates(position);
      if (dom && Cesium.defined(canvasPosition)) {
        dom.style.top = `${canvasPosition.y}px`;
        dom.style.left = `${canvasPosition.x}px`;
        if (item.offset?.length) {
          dom.style.marginLeft = `${item.offset[0]}px`;
          dom.style.marginTop = `${item.offset[1]}px`;
        }
      }
    } catch (error) {
      item.dom.style.display = 'none';
    }
  }
  updateHtml(set: HtmlOverlayType) {
    const item = this.htmlMap.get(set.id);

    if (item?.dom) {
      const newSet = {
        ...item,
        ...set
      };
      const dom = item.dom;
      dom.innerHTML = newSet.content;
      newSet.dom = dom;
      this.htmlMap.set(newSet.id, newSet);
      this.updatePos(newSet);
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
  }
}
