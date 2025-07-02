import fs from "fs";
const urls = [
  {
    title: "绘制折线和多边形",
    name: "draw",
    show: true
  },
  {
    title: "自定义Primitive",
    name: "customPrimitive",
    show: true
  },
  {
    title: "自定义Primitive绘制折线和多边形",
    name: "drawPrimitive",
    show: true
  },
  {
    title: "三角测量",
    name: "triangleTool",
    show: true
  },
  {
    title: "通视分析",
    name: "viewPoint"
  },
  {
    title: "缓冲区分析",
    name: "buffer"
  },
  {
    title: "地形开挖",
    name: "terrainClip"
  },
  {
    title: "等高线",
    name: "elevation"
  },
  {
    title: "坡向坡度分析",
    name: "terrainOrient"
  },
  {
    title: "填挖方量计算",
    name: "terrainFill"
  },
  {
    title: "距离面积计算",
    name: "distanceArea"
  },
  {
    title: "分屏",
    name: "split"
  },
  {
    title: "选择轮廓",
    name: "selectOutline"
  },
  {
    title: "聚类",
    name: "cluster"
  },
  {
    title: "2D3D切换",
    name: "2D3D"
  },
  {
    title: "HTML信息框",
    name: "htmlOverlay"
  },
  {
    title: "three+cesium",
    name: "three"
  }
];
function createMd() {
  const readme = [];
  urls.forEach((item) => {
    readme.push(`## ${item.title}`);
    readme.push("");
    readme.push(`- [源码地址:${item.name}](src/${item.name}/index.ts)`);
    readme.push("");
  });
  fs.writeFile(
    "./README.md",
    "# Cesium+ts Demo\n\n## 掘金博客：敲敲敲敲暴你脑袋\n\n- [详细实现过程讲解请看博客](https://juejin.cn/user/224781403162798/posts)\n\n" +
      readme.join("\n"),
    () => {}
  );
}
createMd();
