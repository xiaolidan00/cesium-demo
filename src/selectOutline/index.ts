import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };
  outlineEffect: Cesium.PostProcessStage | null = null;
  selectObj = {
    originColor: null,
    obj: null
  };
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: -122.34342822467134,
        lat: 47.59630244543853,
        height: 1192.6611094958428
      },
      {
        heading: 23,
        pitch: -33,
        roll: 0
      }
    );
  }
  async init() {
    const osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
    this.viewer.scene.primitives.add(osmBuildingsTileset);

    //添加轮廓特效
    const outlineEffect = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
    outlineEffect.uniforms.color = Cesium.Color.BLUE;
    outlineEffect.uniforms.length = 0.01;
    outlineEffect.selected = [];
    outlineEffect.enabled = true;
    this.outlineEffect = outlineEffect;
    this.viewer.scene.postProcessStages.add(
      Cesium.PostProcessStageLibrary.createSilhouetteStage([outlineEffect])
    );

    this.viewer.screenSpaceEventHandler.setInputAction(
      this.onClickAction.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
  }
  onClickAction(ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
    const pickObj = this.viewer.scene.pick(ev.position);
    if (!Cesium.defined(pickObj)) {
      return;
    }
    console.log('pickObj', pickObj);
    //高亮颜色
    if (this.selectObj?.obj) {
      this.selectObj.obj.color = this.selectObj.originColor;
    }
    this.selectObj.originColor = pickObj.color.clone();
    pickObj.color = Cesium.Color.BLUE;
    this.selectObj.obj = pickObj;

    if (this.outlineEffect) {
      this.outlineEffect.selected = [pickObj];
    }
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
