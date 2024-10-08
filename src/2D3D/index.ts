import * as Cesium from 'cesium';

import { LngLatHeightType, PosUtil } from '../utils/PosUtil';

import { CesiumMap } from '../utils/CesiumMap';
import { createGui } from '../utils/tool';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '3D'
  };
  max2DHeight = 20000000;
  max3DHeight = 12805975;
  center2D3D: LngLatHeightType | undefined;
  constructor(containerId: string) {
    super(containerId);
  }
  //设置视角
  setCurrentView(
    pos: { lng: number; lat: number; height: number },
    orient = {
      heading: 0.0,
      pitch: -45,
      roll: 0.0
    },
    isLookAt?: boolean
  ) {
    let height = pos.height;
    if (PosUtil.is2D()) {
      height = height > this.max2DHeight ? this.max2DHeight : height;
    } else {
      height = height > this.max3DHeight ? this.max3DHeight : height;
    }
    if (isLookAt) {
      this.viewer.camera.lookAt(
        Cesium.Cartesian3.fromDegrees(
          pos.lng,
          pos.lat -
            (PosUtil.is2D()
              ? 0
              : PosUtil.distanceToLat(
                  (0.5 * height) / Math.abs(Math.tan(Cesium.Math.toRadians(Math.abs(orient.pitch))))
                )),
          height
        ),
        new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(0),
          Cesium.Math.toRadians(PosUtil.is2D() ? -90 : orient.pitch),
          height * 2
        )
      );
      this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    } else {
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, height),
        orientation: {
          heading: Cesium.Math.toRadians(orient.heading),
          pitch: Cesium.Math.toRadians(orient.pitch),
          roll: Cesium.Math.toRadians(orient.roll)
        }
      });
    }
  }
  updateMapCenter() {
    this.center2D3D = undefined;
  }
  init() {
    this.setCurrentView(
      {
        lng: 113,
        lat: 30,
        height: 1000
      },
      {
        heading: 0,
        roll: 0,
        pitch: -53
      },
      true
    );
    this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(113, 30, 500),
      box: {
        material: Cesium.Color.BLUE,
        dimensions: new Cesium.Cartesian3(100, 100, 100)
      }
    });
    const hander = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    hander.setInputAction(this.updateMapCenter.bind(this), Cesium.ScreenSpaceEventType.WHEEL);
    hander.setInputAction(this.updateMapCenter.bind(this), Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    hander.setInputAction(this.updateMapCenter.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
    let center = [113, 30, 1000];
    createGui(
      [
        {
          name: 'actions',
          type: 'select',
          options: ['3D', '2D'],
          onChange: (value) => {
            // let center;
            // if (!this.center2D3D) {
            //   center = PosUtil.getMapCenter();
            //   this.center2D3D = center;
            // } else {
            //   center = this.center2D3D;
            // }
            console.log('🚀 ~ file: index.ts:92 ~ MyCesiumMap ~ init ~ value:', value, center);
            if (value === '3D') {
              this.viewer.scene.morphTo3D(0);
              if (center)
                this.setCurrentView(
                  {
                    lng: center[0],
                    lat: center[1],
                    height: center[2]
                  },
                  { heading: 0, pitch: -53, roll: 0 },
                  true
                );
            } else {
              this.viewer.scene.morphTo2D(0);
              if (center)
                this.setCurrentView(
                  {
                    lng: center[0],
                    lat: center[1],
                    height: center[2]
                  },
                  { heading: 0, pitch: -90, roll: 0 },
                  true
                );
            }
          }
        }
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
