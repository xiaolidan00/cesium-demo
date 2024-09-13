import * as Cesium from "cesium";

import { PosUtil } from "./PosUtil";

export type PosType = {
  lng: number;
  lat: number;
  height: number;
};
export type OrientType = {
  heading: number;
  pitch: number;
  roll: number;
};
export class CesiumMap {
  viewer: Cesium.Viewer;
  isFirst: boolean = true;
  constructor(containerId: string) {
    //暗色底图
    // const nightLayer=new Cesium.ImageryLayer.fromProviderAsync(
    //   Cesium.IonImageryProvider.fromAssetId(3812)
    // )
    // const dayLayer=Cesium.ImageryLayer.fromProviderAsync(
    //   Cesium.IonImageryProvider.fromAssetId(3845)
    // );
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      subdomains: ["0", "1", "2", "3"],
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
    });

    const viewer = new Cesium.Viewer(containerId, {
      animation: false, // 左下角动画小组件
      baseLayerPicker: false, // 右上角底图选择组件
      fullscreenButton: false, // 右下角全屏组件
      vrButton: false, // 右下角VR模式组件
      geocoder: false, // 右上角地址搜索组件
      homeButton: false, // 右上角Home组件，点击之后将视图跳转到默认视角
      infoBox: false, // 信息框
      sceneModePicker: false, // 右上角场景模式切换组件，2D、3D 和 Columbus View (CV) 模式。
      selectionIndicator: false, //选取指示器组件
      timeline: false, // 底部时间轴
      navigationHelpButton: false, // 右上角鼠标操作
      // 导航说明
      navigationInstructionsInitiallyVisible: false,

      //山形
      //   terrain: Cesium.Terrain.fromWorldTerrain({
      //     requestVertexNormals: true,
      //     //水面运动
      //     // requestWaterMask: true
      //   }),
      //阴影
      shadows: true,
      baseLayer: new Cesium.ImageryLayer(imageryProvider),
    });
    //Cesium的logo
    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    viewer.scene.globe.depthTestAgainstTerrain = true; //地面以下不可见（高程遮挡） 会导致图标被地面覆盖问题
    viewer.scene.globe.translucency.enabled = true;

    viewer.scene.postProcessStages.fxaa.enabled = true;
    viewer.scene.globe.preloadAncestors = false;
    viewer.scene.globe.preloadSiblings = true;
    viewer.scene.globe.tileCacheSize = 1000;
    viewer.scene.globe.maximumScreenSpaceError = 2;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.3; //移动的阻尼值
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5; //缩放的阻尼值
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.1; //旋转的阻尼值
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //禁止模型穿透

    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.RIGHT_DRAG,
      Cesium.CameraEventType.PINCH,
      {
        eventType: Cesium.CameraEventType.LEFT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL,
      },
      {
        eventType: Cesium.CameraEventType.RIGHT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL,
      },
      Cesium.CameraEventType.MIDDLE_DRAG,
    ];
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.PINCH,
    ];

    this.viewer = viewer;
    PosUtil.viewer = viewer;

    //监听底图加载完毕

    viewer.scene.globe.tileLoadProgressEvent.addEventListener((ev) => {
      if (ev <= 10 && this.isFirst) {
        console.log("底图加载完毕");
        this.isFirst = false;
        this.init();
      }
    });
  }
  init() {}
  destroy() {}
  //获取当前视角
  getView() {
    const camera = this.viewer.camera;
    const pos = camera.positionCartographic;
    console.log(
      {
        lng: Cesium.Math.toDegrees(pos.longitude),
        lat: Cesium.Math.toDegrees(pos.latitude),
        height: pos.height,
      },
      {
        heading: Math.round(Cesium.Math.toDegrees(camera.heading)),
        pitch: Math.round(Cesium.Math.toDegrees(camera.pitch)),
        roll: Math.round(Cesium.Math.toDegrees(camera.roll)),
      }
    );
  }
  setView(deg: PosType, o: OrientType) {
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(deg.lng, deg.lat, deg.height),
      orientation: {
        heading: Cesium.Math.toRadians(o.heading),
        pitch: Cesium.Math.toRadians(o.pitch),
        roll: Cesium.Math.toRadians(o.roll),
      },
    });
  }
  flyTo(deg: PosType, o: OrientType, duration: number) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(deg.lng, deg.lat, deg.height),
      orientation: {
        heading: Cesium.Math.toRadians(o.heading),
        pitch: Cesium.Math.toRadians(o.pitch),
        roll: Cesium.Math.toRadians(o.roll),
      },
      duration,
    });
  }
}
