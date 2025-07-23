import * as Cesium from "cesium";
import mockdata from "../data/mockdata.json";
import {CesiumMap} from "../utils/CesiumMap";
import locationImage from "../assets/Locations.svg";
class MyCesiumMap extends CesiumMap {
  removeListener: any;
  constructor(containerId: string) {
    super(containerId);
    this.setView(
      {
        lng: 114.09596765019016,
        lat: 22.094395841725976,
        height: 82701.91469466327
      },
      {
        heading: 0,
        pitch: -53,
        roll: 0
      }
    );
  }
  init() {
    const dataSource = new Cesium.CustomDataSource("cluster");
    mockdata.forEach((item, idx) => {
      const {lat, lng} = item;

      dataSource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
        billboard: {
          image: locationImage,
          scale: 0.5,
          //取消深度测试
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
    });
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = 100;
    dataSource.clustering.minimumClusterSize = 2;

    const size = 60;
    const halfSize = size * 0.5;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    this.removeListener = dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.id = cluster.label.id;
      cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
      cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.CENTER;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
      ctx.fillStyle = "#1E90FF";
      ctx.fill();
      const text = clusteredEntities.length + "";
      ctx.font = `16px serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const t = ctx.measureText(text).width;
      ctx.fillText(text, halfSize - t * 0.5, halfSize);
      cluster.billboard.image = canvas.toDataURL();
    });

    this.viewer.dataSources.add(dataSource);
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
