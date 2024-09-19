import * as Cesium from "cesium";

import { CesiumMap } from "../utils/CesiumMap";
import LineDraw from "./LineDraw";
import PolygonDraw from "./PolygonDraw";
import { createGui } from "../utils/tool";

class MyCesiumMap extends CesiumMap {
  lineDraw: LineDraw;
  polygonDraw: PolygonDraw;
  dataObj = {
    actions: "无",
  };

  constructor(containerId: string) {
    super(containerId);
    this.lineDraw = new LineDraw(this.viewer);
    this.polygonDraw = new PolygonDraw(this.viewer);
  }
  init() {
    createGui(
      [
        { type: "title", title: "左点击添加点，右点击结束绘制" },
        {
          name: "actions",
          type: "select",
          options: ["无", "画线", "画面", "清空线", "清空面"],
          onChange: (value) => {
            if (value === "画线") {
              this.lineDraw.openDraw();
            } else if (value === "画面") {
              this.polygonDraw.openDraw();
            } else if (value === "清空线") {
              this.lineDraw.clear();
            } else if (value === "清空面") {
              this.polygonDraw.clear();
            }
          },
        },
      ],
      this.dataObj
    );
  }
}

const cesiumMap = new MyCesiumMap("cesiumContainer");
window.cesiumMap = cesiumMap;
