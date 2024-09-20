import * as Cesium from 'cesium';

import CursorIcon from '../assets/cursor.png';

export default class DrawBase {
  hander: Cesium.ScreenSpaceEventHandler;
  viewer: Cesium.Viewer;
  isDraw: boolean = false;
  constructor(v: Cesium.Viewer) {
    this.viewer = v;
    this.hander = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  onListener() {
    this.hander.setInputAction(this.onLeftClick.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.hander.setInputAction(this.onMouseMove.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.hander.setInputAction(
      this.onRightClick.bind(this),
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
    this.viewer.canvas.classList.add('draw');
    this.isDraw = true;
  }
  offListener() {
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.viewer.canvas.classList.remove('draw');
    this.isDraw = false;
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {}
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {}
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {}
}
