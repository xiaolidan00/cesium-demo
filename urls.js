const urls = [
  {
    title: '绘制折线和多边形',
    name: 'draw',
    show: true
  },
  {
    title: '自定义Primitive',
    name: 'customPrimitive',
    show: true
  },
  {
    title: '自定义Primitive绘制折线和多边形',
    name: 'drawPrimitive',
    show: true
  },
  {
    title: '三角测量',
    name: 'triangleTool',
    show: true
  },
  {
    title: '通视分析',
    name: 'viewPoint'
  },
  {
    title: '缓冲区分析',
    name: 'buffer'
  },
  {
    title: '地形开挖',
    name: 'terrainClip'
  },
  {
    title: '等高线',
    name: 'elevation'
  },
  {
    title: '坡向坡度分析',
    name: 'terrainOrient'
  },
  {
    title: '填挖方量计算',
    name: 'terrainFill'
  },
  {
    title: '距离面积计算',
    name: 'distanceArea'
  },
  {
    title: '分屏',
    name: 'split'
  },
  {
    title: '选择轮廓',
    name: 'selectOutline'
  },
  {
    title: '聚类',
    name: 'cluster'
  },
  {
    title: '2D3D切换',
    name: '2D3D'
  },
  {
    title: 'HTML信息框',
    name: 'htmlOverlay'
  },
  {
    title: 'three+cesium',
    name: 'three'
  }
];
const map = {};
const pages = [];
urls.forEach((item) => {
  map[item.name] = `src/${item.name}/index.ts`;
  pages.push({
    entry: 'index.ts',
    filename: `src/${item.name}/index.html`,
    template: `src/${item.name}/index.html`,
    injectOptions: {
      data: {
        title: item.title
      }
    }
  });
});
export default {
  urls,
  map,
  pages
};
