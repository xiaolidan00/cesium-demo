import * as Cesium from "cesium";

import * as THREE from "three";
//https://cesium.com/blog/2017/10/23/integrating-cesium-with-threejs/
//https://threehub.cn/#/codeMirror?navigation=CesiumJS&classify=expand&id=cesiumAndThree
function main() {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWJhYjFkOC0yNGY2LTRmODQtOWQ0My1mMWM3MDRmN2Q1ODYiLCJpZCI6MjQzMTI1LCJpYXQiOjE3MjY5MzAyMzZ9.4pVeKaBrgjyFV8BHM4debskrOnZH0iBezZV2ysj5KCI";
  const imageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: ["0", "1", "2", "3"],
    tilingScheme: new Cesium.WebMercatorTilingScheme()
  });
  const container = document.getElementById("cesiumContainer")!;
  const viewer = new Cesium.Viewer(container, {
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

    navigationInstructionsInitiallyVisible: false,

    baseLayer: new Cesium.ImageryLayer(imageryProvider)
  });

  //Cesium的logo
  (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
  viewer.scene.globe.depthTestAgainstTerrain = true; //深度检测
  viewer.scene.globe.translucency.enabled = true; //开启球体透明度
  viewer.scene.postProcessStages.fxaa.enabled = true; //抗锯齿

  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //禁止模型穿透

  viewer.scene.screenSpaceCameraController.tiltEventTypes = [
    Cesium.CameraEventType.RIGHT_DRAG,
    Cesium.CameraEventType.PINCH,
    {
      eventType: Cesium.CameraEventType.LEFT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL
    },
    {
      eventType: Cesium.CameraEventType.RIGHT_DRAG,
      modifier: Cesium.KeyboardEventModifier.CTRL
    },
    Cesium.CameraEventType.MIDDLE_DRAG
  ];
  viewer.scene.screenSpaceCameraController.zoomEventTypes = [
    Cesium.CameraEventType.WHEEL,
    Cesium.CameraEventType.PINCH
  ];

  const threeContainer = document.getElementById("ThreeContainer")!;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, threeContainer.offsetWidth / threeContainer.offsetHeight, 1, 10000000);
  camera.position.set(0, 50, 100);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({alpha: true});
  threeContainer.appendChild(renderer.domElement);
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(4, 4, 4);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: "red"}));

  group.add(mesh);
  scene.add(group);
  group.scale.set(15000, 15000, 15000);
  function cartToVec(cart: Cesium.Cartesian3) {
    return new THREE.Vector3(cart.x, cart.y, cart.z);
  }
  const minWGS84 = [115.23, 39.55]; // 最小经纬度

  const maxWGS84 = [116.23, 41.55]; // 最大经纬度
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2 - 1,
      200000
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-53),
      roll: Cesium.Math.toRadians(0)
    }
  });
  /* 相机同步 */
  function syncCesiumThree() {
    // 更新相机位置
    camera.fov = Cesium.Math.toDegrees(viewer.camera.frustum.fovy);

    // 转换为笛卡尔坐标
    const center = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2);

    // 获取定向模型的前进方向
    const centerHigh = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2,
      1
    );

    // 左下坐标
    const bottomLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1]));

    // 左上坐标
    const topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1]));

    // 方向向量
    const latDir = new THREE.Vector3().subVectors(bottomLeft, topLeft).normalize();

    // 设置位置
    group.position.copy(center);

    // 看向中心
    group.lookAt(centerHigh.x, centerHigh.y, centerHigh.z);

    // 设置方向
    group.up.copy(latDir);

    // 更新相机
    camera.matrixAutoUpdate = false;

    // 相机视图矩阵
    const cvm = viewer.camera.viewMatrix;

    // 相机逆视图矩阵
    const civm = viewer.camera.inverseViewMatrix;

    camera.matrixWorld.set(
      civm[0],
      civm[4],
      civm[8],
      civm[12],
      civm[1],
      civm[5],
      civm[9],
      civm[13],
      civm[2],
      civm[6],
      civm[10],
      civm[14],
      civm[3],
      civm[7],
      civm[11],
      civm[15]
    );

    camera.matrixWorldInverse.set(
      cvm[0],
      cvm[4],
      cvm[8],
      cvm[12],
      cvm[1],
      cvm[5],
      cvm[9],
      cvm[13],
      cvm[2],
      cvm[6],
      cvm[10],
      cvm[14],
      cvm[3],
      cvm[7],
      cvm[11],
      cvm[15]
    );

    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    renderer.render(scene, camera);
  }
  function loop() {
    syncCesiumThree();
    requestAnimationFrame(loop);
  }
  loop();
}
main();
