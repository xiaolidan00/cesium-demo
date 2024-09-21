import * as Cesium from 'cesium';
import * as Turf from '@turf/turf';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };

  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 113.003,
        lat: 30.003,
        height: 1000
      },
      {
        heading: 0,
        roll: 0,
        pitch: -45
      }
    );
  }
  pointFormat(points: number[][]) {
    return points.flat(1);
  }
  addBuffer(positions: Cesium.Cartesian3[]) {
    console.log('buffer', positions);
    this.viewer.entities.add({
      polygon: {
        material: Cesium.Color.RED.withAlpha(0.5),
        hierarchy: new Cesium.PolygonHierarchy(positions),
        classificationType: Cesium.ClassificationType.BOTH
      }
    });
  }
  addPoint(point: number[]) {
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point[0], point[1]),
      point: {
        pixelSize: 9,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        color: Cesium.Color.BLUE
      }
    });
  }
  addPolyline(positions: number[]) {
    this.viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        width: 2,
        material: Cesium.Color.BLUE,
        clampToGround: true
      }
    });
  }
  addPolygon(positions: Cesium.Cartesian3[]) {
    this.viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: Cesium.Color.BLUE.withAlpha(0.5),
        classificationType: Cesium.ClassificationType.BOTH
      }
    });
  }
  initPointBuffer() {
    const point = [113.003, 30.003];
    this.addPoint(point);
    const pointF = Turf.point(point);
    const buffered = Turf.buffer(pointF, 60, { units: 'meters' });
    const crd = buffered?.geometry.coordinates;
    if (crd) {
      const points = crd[0] as number[][];
      const d = this.pointFormat(points);
      this.addBuffer(Cesium.Cartesian3.fromDegreesArray(d));
    }
  }
  initPolylineBuffer() {
    let points = [
      [113.001, 30.001],
      [113.002, 30.001],
      [113.002, 30.003]
    ];
    let d = this.pointFormat(points);
    this.addPolyline(d);
    const polylineF = Turf.lineString(points);
    const buffered = Turf.buffer(polylineF, 30, { units: 'meters' });
    const crd = buffered?.geometry.coordinates;
    if (crd) {
      points = crd[0] as number[][];
      d = this.pointFormat(points);
      this.addBuffer(Cesium.Cartesian3.fromDegreesArray(d));
    }
  }
  initPolygonBuffer() {
    let points = [
      [113.003, 30.005],
      [113.005, 30.005],
      [113.005, 30.008],
      [113.003, 30.005]
    ];
    let d = this.pointFormat(points);
    this.addPolygon(Cesium.Cartesian3.fromDegreesArray(d));
    const polygonF = Turf.polygon([points]);
    const buffered = Turf.buffer(polygonF, 60, { units: 'meters' });
    const crd = buffered?.geometry.coordinates;
    if (crd) {
      points = crd[0] as number[][];
      d = this.pointFormat(points);
      this.addBuffer(Cesium.Cartesian3.fromDegreesArray(d));
    }
  }
  init() {
    this.initPointBuffer();
    this.initPolygonBuffer();
    this.initPolylineBuffer();
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
