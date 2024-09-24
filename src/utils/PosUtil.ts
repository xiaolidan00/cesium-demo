import * as Cesium from "cesium";

export type LngLatHeightType = [number, number, number];
//地球半径 单位m
const EARTH_RADIUS = 6378137;
export class PosUtil {
  static viewer: Cesium.Viewer;
  static terrainProvider: Cesium.CesiumTerrainProvider;
  static posNoHeightTransform(positions: number[][]): number[][] {
    return positions.map((it) => [it[0], it[1]]);
  }
  static posHeightTransform(positions: number[][]) {
    return positions.map((it) => [it[0], it[1], it[2] || 0]);
  }
  static Cartesian3ToCartesian2(c: Cesium.Cartesian3) {
    return this.viewer.scene.cartesianToCanvasCoordinates(
      c,
      new Cesium.Cartesian2()
    );
  }
  static Cartesian3ToCartographic(c: Cesium.Cartesian3) {
    return Cesium.Cartographic.fromCartesian(c);
  }
  static CartographicToCartesian3(c: Cesium.Cartographic) {
    return Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height);
  }
  static CartographicToWGS84(c: Cesium.Cartographic): LngLatHeightType {
    return [
      Cesium.Math.toDegrees(c.longitude),
      Cesium.Math.toDegrees(c.latitude),
      c.height,
    ];
  }
  static Cartesian3ToWGS84(c: Cesium.Cartesian3): LngLatHeightType {
    const c1 = this.Cartesian3ToCartographic(c);
    return this.CartographicToWGS84(c1);
  }
  static WGS84ToCartesian3(c: LngLatHeightType) {
    return Cesium.Cartesian3.fromDegrees(c[0], c[1], c[2]);
  }
  static WGS84ToCartographic(c: LngLatHeightType) {
    return Cesium.Cartographic.fromDegrees(c[0], c[1], c[2]);
  }
  static Cartesian2ToCartesian3(c: Cesium.Cartesian2) {
    let cartesian = this.pickTilePos(c);
    if (Cesium.defined(cartesian)) {
      return cartesian;
    } else {
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    }
  }
  static Cartesian2ToWGS84(c: Cesium.Cartesian2) {
    let cartesian = this.Cartesian2ToCartesian3(c);
    if (Cesium.defined(cartesian)) {
      return this.Cartesian3ToWGS84(cartesian);
    }
  }

  static picPoskModelHeight(c: Cesium.Cartographic) {
    return new Promise<number>((resolve) => {
      this.viewer.scene
        .clampToHeightMostDetailed([this.CartographicToCartesian3(c)])
        .then((pos: Cesium.Cartesian3[]) => {
          if (pos?.length) {
            const cc = this.Cartesian3ToCartographic(pos[0]);
            resolve(cc.height);
          } else {
            resolve(0);
          }
        });
    });
  }
  static pickPosHeight(c: Cesium.Cartographic) {
    if (this.viewer.scene.sampleHeightSupported) {
      return this.viewer.scene.sampleHeight(c);
    }
  }
  static getLngLatTerrainHeight(lng: number, lat: number) {
    return new Promise<number>((resolve) => {
      Cesium.sampleTerrainMostDetailed(this.terrainProvider, [
        Cesium.Cartographic.fromDegrees(lng, lat),
      ]).then((pos: Cesium.Cartographic[]) => {
        if (pos?.length) {
          resolve(pos[0].height);
        } else {
          resolve(0);
        }
      });
    });
  }
  static pickPosTerrainHeight(c: Cesium.Cartographic) {
    return new Promise<number>((resolve) => {
      Cesium.sampleTerrainMostDetailed(this.terrainProvider, [
        new Cesium.Cartographic(c.longitude, c.latitude),
      ]).then((pos: Cesium.Cartographic[]) => {
        if (pos?.length) {
          resolve(pos[0].height);
        } else {
          resolve(0);
        }
      });
    });
  }
  static pickTilePosWGS84(c: Cesium.Cartesian2) {
    const pos = this.pickTilePos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  static pickTerrainPosWGS84(c: Cesium.Cartesian2) {
    const pos = this.pickTerrainPos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  static is2D() {
    return this.viewer.scene.mode === Cesium.SceneMode.SCENE2D;
  }
  static getViewBoundary() {
    const rect = this.viewer.camera.computeViewRectangle();
    if (rect)
      return {
        left: Cesium.Math.toDegrees(rect.east),
        right: Cesium.Math.toDegrees(rect.west),

        bottom: Cesium.Math.toDegrees(rect.south),
        top: Cesium.Math.toDegrees(rect.north),
      };
  }
  static pickPos2D3D(c: Cesium.Cartesian2) {
    if (this.is2D()) {
      let cartesian;
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    } else {
      const rect = this.getViewBoundary();
      if (!rect) return;
      let cartesian;
      if (rect && this.viewer.scene.pick(c)) {
        cartesian = this.viewer.scene.pickPosition(c);
        const cc = this.Cartesian2ToWGS84(cartesian);
        if (
          Cesium.defined(cartesian) &&
          cc &&
          cc[0] >= rect.left &&
          cc[0] <= rect.right &&
          cc[1] >= rect.bottom &&
          cc[1] <= rect.top
        ) {
          return cartesian;
        }
      }
      const ray = this.viewer.camera.getPickRay(c);
      if (ray) {
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (Cesium.defined(cartesian)) {
          return cartesian;
        }
      }
    }
  }
  static pickPos2D3DWGS84(c: Cesium.Cartesian2) {
    const p = this.pickPos2D3D(c);
    if (p) {
      return this.Cartesian3ToWGS84(p);
    }
  }
  static pickTilePos(c: Cesium.Cartesian2) {
    if (this.viewer.scene.pick(c)) {
      let cartesian = this.viewer.scene.pickPosition(c);
      if (Cesium.defined(cartesian)) {
        return cartesian;
      }
    }
    // let picks = this.viewer.scene.drillPick(c);

    // for (let i = 0; i < picks.length; i++) {
    //   const pick = picks[i];

    //   if (
    //     pick &&
    //     pick.primitive &&
    //     (pick instanceof Cesium.Cesium3DTileFeature ||
    //       pick instanceof Cesium.Cesium3DTileset ||
    //       pick instanceof Cesium.Model)
    //   ) {
    //     if (this.viewer.scene.pick(c)) {
    //       let cartesian = this.viewer.scene.pickPosition(c);
    //       if (Cesium.defined(cartesian)) {
    //         return cartesian;
    //       }
    //     }
    //   }
    // }
  }
  static pickTerrainPos(c: Cesium.Cartesian2) {
    let cartesian;

    const ray = this.viewer.camera.getPickRay(c);
    if (ray) {
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (Cesium.defined(cartesian)) {
        return cartesian;
      }
    }

    cartesian = this.viewer.scene.camera.pickEllipsoid(
      c,
      this.viewer.scene.globe.ellipsoid
    );
    if (Cesium.defined(cartesian)) {
      return cartesian;
    }
  }
  static pickPos(c: Cesium.Cartesian2) {
    let pos = this.pickTilePos(c);
    if (Cesium.defined(pos)) {
      return pos;
    }
    pos = this.pickTerrainPos(c);
    if (Cesium.defined(pos)) {
      return pos;
    }
  }
  static pickPosWGS84(c: Cesium.Cartesian2) {
    const pos = this.pickPos(c);
    if (Cesium.defined(pos)) {
      return this.Cartesian3ToWGS84(pos);
    }
  }
  //获取空间距离
  static getSpaceDistance(c1: Cesium.Cartographic, c2: Cesium.Cartographic) {
    return Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromRadians(c1.longitude, c1.latitude, c1.height),
      Cesium.Cartesian3.fromRadians(c2.longitude, c2.latitude, c2.height)
    );
  }
  // 地球表面距离计算
  static getEarthDistance(c1: Cesium.Cartographic, c2: Cesium.Cartographic) {
    // 纬度
    let lat1 = c1.latitude;
    let lat2 = c2.latitude;
    // 经度
    let lng1 = c1.longitude;
    let lng2 = c2.longitude;
    // 纬度之差
    let a = lat1 - lat2;
    // 经度之差
    let b = lng1 - lng2;
    // 计算两点距离的公式
    let s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(b / 2), 2)
        )
      );
    // 弧长乘地球半径, 返回单位: 米
    s = s * EARTH_RADIUS;
    return s;
  }

  //距离单位米，距离转纬度
  static distanceToLat(d: number) {
    return Number((d * 0.00001).toFixed(6));
  }
  //距离单位米，距离转经度
  static distanceToLng(d: number) {
    return Number(((d / 1.1132) * 0.00001).toFixed(6));
  }
}
