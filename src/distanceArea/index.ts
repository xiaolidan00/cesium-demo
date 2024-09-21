import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';

//空间距离 单位米
function getSpaceDistance(positions: Cesium.Cartesian3[]) {
  let distance = 0;
  const geodesic = new Cesium.EllipsoidGeodesic();

  for (let i = 0; i < positions.length - 1; i++) {
    //计算直接距离
    distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
    const c1 = Cesium.Cartographic.fromCartesian(positions[i]);
    const c2 = Cesium.Cartographic.fromCartesian(positions[i + 1]);

    geodesic.setEndPoints(c1, c2);
    let s = geodesic.surfaceDistance;
    //两点之间的空间距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(c2.height - c1.height, 2));
    distance = distance + s;
  }
  return distance;
}

function getBearing(from: Cesium.Cartographic, to: Cesium.Cartographic) {
  const lon1 = from.longitude;
  const lon2 = to.longitude;
  const lat1 = from.latitude;
  const lat2 = to.latitude;
  //返回从原点到x,y点的线段与x轴正方形之间的平面角度(弧度)
  let angel = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  );
  if (angel < 0) {
    angel += Math.PI * 2.0;
  }
  return Cesium.Math.toDegrees(angel);
}
function getAngle(p1: Cesium.Cartographic, p2: Cesium.Cartographic, p3: Cesium.Cartographic) {
  const b21 = getBearing(p2, p1);
  const b23 = getBearing(p2, p3);
  let angle = b21 - b23;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}
function getDistance(point1: Cesium.Cartographic, point2: Cesium.Cartographic) {
  //根据经纬度计算距离
  const geodesic = new Cesium.EllipsoidGeodesic();
  //设置起点终点
  geodesic.setEndPoints(point1, point2);
  //起点和终点表面距离
  let s = geodesic.surfaceDistance;
  //两点之间的距离
  s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2.height - point1.height, 2));
  return s;
}

function getArea(points: Cesium.Cartographic[]) {
  let res = 0;
  //拆分三角面
  for (let i = 0; i < points.length - 2; i++) {
    //相邻三个点
    const j = (i + 1) % points.length;
    const k = (i + 2) % points.length;
    let totalAngle = getAngle(points[i], points[j], points[k]);
    const d1 = getDistance(points[i], points[j]);
    const d2 = getDistance(points[j], points[k]);
    res +=
      d1 *
      d2 *
      Math.abs(Math.round(Math.sin(Cesium.Math.toRadians(totalAngle)) * 1000000) / 1000000);
  }
  return res; //单位平方米
}
class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };

  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 113.007154921491,
        lat: 38.99747060717016,
        height: 2099.79922005954
      },
      {
        heading: 305,
        pitch: -56,
        roll: 0
      }
    );
  }
  init() {
    this.viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([113, 39, 1000, 113, 39.002, 800]),
        width: 3,
        material: Cesium.Color.RED
      }
    });
    console.log(
      '距离',
      getSpaceDistance([
        Cesium.Cartesian3.fromDegrees(113, 39, 1000),
        Cesium.Cartesian3.fromDegrees(113, 39.002, 800)
      ])
    );
    this.viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights([
            113.002, 39.001, 1000, 113, 39.002, 800, 113.001, 39.003, 1100, 113, 39.003, 1200
          ])
        ),
        perPositionHeight: true,
        material: Cesium.Color.BLUE
      }
    });
    console.log(
      '面积',
      getArea([
        Cesium.Cartographic.fromDegrees(113.002, 39.001, 1000),
        Cesium.Cartographic.fromDegrees(113, 39.002, 800),
        Cesium.Cartographic.fromDegrees(113.001, 39.003, 1100),
        Cesium.Cartographic.fromDegrees(1113, 39.003, 1200)
      ])
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
