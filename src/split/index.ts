import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };
  moveActive: boolean = false;
  slider: HTMLElement | null = null;
  constructor(containerId: string) {
    super(containerId);
  }
  async init() {
    const viewer = this.viewer;
    try {
      const left = await Cesium.Cesium3DTileset.fromIonAssetId(69380);
      viewer.scene.primitives.add(left);
      left.splitDirection = Cesium.SplitDirection.LEFT;

      viewer.zoomTo(left);

      const right = await Cesium.createOsmBuildingsAsync();
      viewer.scene.primitives.add(right);
      right.splitDirection = Cesium.SplitDirection.RIGHT;
    } catch (error) {
      console.log(`Error loading tileset: ${error}`);
    }

    // Sync the position of the slider with the split position
    this.slider = document.getElementById('slider');
    if (!this.slider) return;
    viewer.scene.splitPosition = this.slider.offsetLeft / window.innerWidth;
    this.moveActive = false;
    this.slider.addEventListener('mousedown', () => {
      this.moveActive = true;
    });
    this.slider.addEventListener('mouseup', () => {
      this.moveActive = false;
    });
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    handler.setInputAction(this.move.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(this.move.bind(this), Cesium.ScreenSpaceEventType.PINCH_MOVE);
  }
  move(movement: Cesium.ScreenSpaceEventHandler.MotionEvent) {
    if (!this.moveActive || !this.slider) {
      return;
    }
    const splitPosition = movement.endPosition.x / window.innerWidth;
    this.slider.style.left = `${100.0 * splitPosition}%`;
    this.viewer.scene.splitPosition = splitPosition;
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
