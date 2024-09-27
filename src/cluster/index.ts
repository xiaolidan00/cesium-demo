import * as Cesium from 'cesium';

import { CesiumMap } from '../utils/CesiumMap';

class MyCesiumMap extends CesiumMap {
  dataObj = {
    actions: '无'
  };

  constructor(containerId: string) {
    super(containerId);
  }
  init() {
    const dataSourcePromise = this.viewer.dataSources.add(
      Cesium.KmlDataSource.load('facilities.kml', {
        camera: this.viewer.scene.camera,
        canvas: this.viewer.scene.canvas
      })
    );
    dataSourcePromise.then((dataSource) => {
      const pixelRange = 15;
      const minimumClusterSize = 3;
      const enabled = true;

      dataSource.clustering.enabled = enabled;
      dataSource.clustering.pixelRange = pixelRange;
      dataSource.clustering.minimumClusterSize = minimumClusterSize;

      let removeListener: Cesium.Event.RemoveCallback | undefined;

      const pinBuilder = new Cesium.PinBuilder();
      const pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
      const pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
      const pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
      const pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
      const pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();

      const singleDigitPins = new Array(8);
      for (let i = 0; i < singleDigitPins.length; ++i) {
        singleDigitPins[i] = pinBuilder.fromText(`${i + 2}`, Cesium.Color.VIOLET, 48).toDataURL();
      }

      const customStyle = () => {
        if (Cesium.defined(removeListener)) {
          removeListener();
          removeListener = undefined;
        } else {
          removeListener = dataSource.clustering.clusterEvent.addEventListener(
            (clusteredEntities, cluster) => {
              cluster.label.show = false;
              cluster.billboard.show = true;
              cluster.billboard.id = cluster.label.id;
              cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
              cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
              if (clusteredEntities.length >= 50) {
                cluster.billboard.image = pin50;
              } else if (clusteredEntities.length >= 40) {
                cluster.billboard.image = pin40;
              } else if (clusteredEntities.length >= 30) {
                cluster.billboard.image = pin30;
              } else if (clusteredEntities.length >= 20) {
                cluster.billboard.image = pin20;
              } else if (clusteredEntities.length >= 10) {
                cluster.billboard.image = pin10;
              } else {
                cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
              }
            }
          );
        }

        // force a re-cluster with the new styling
        const pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
      };

      // start with custom style
      customStyle();

      const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      handler.setInputAction((ev: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedLabel = this.viewer.scene.pick(ev.position);
        if (Cesium.defined(pickedLabel)) {
          const ids = pickedLabel.id;
          if (Array.isArray(ids)) {
            for (let i = 0; i < ids.length; ++i) {
              ids[i].billboard.color = Cesium.Color.RED;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });
  }
}

const cesiumMap = new MyCesiumMap('cesiumContainer');
window.cesiumMap = cesiumMap;
