import './drawbase.scss';

import * as Cesium from 'cesium';

export default class DrawBase {
  hander: Cesium.ScreenSpaceEventHandler;
  viewer: Cesium.Viewer;
  isDraw: boolean = false;
  constructor(v: Cesium.Viewer) {
    this.viewer = v;
    //监听canvas动作
    this.hander = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
  }
  onListener() {
    //添加动作监听
    this.hander.setInputAction(this.onLeftClick.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.hander.setInputAction(this.onMouseMove.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.hander.setInputAction(
      this.onRightClick.bind(this),
      Cesium.ScreenSpaceEventType.RIGHT_CLICK
    );
    //canvas添加鼠标样式draw
    this.viewer.canvas.classList.add('draw');
    //开启绘制
    this.isDraw = true;
  }
  offListener() {
    //移除动作监听
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.hander.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    //canvas添加鼠标样式draw
    this.viewer.canvas.classList.remove('draw');
    //关闭绘制
    this.isDraw = false;
  }

  onLeftClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {}
  onMouseMove(ev: Cesium.ScreenSpaceEventHandler.MotionEvent) {}
  onRightClick(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {}
}
