const urls = [
  {
    title: '绘制点线面',
    name: 'draw',
    show: true
  },
  {
    title: '自定义Primitive',
    name: 'customPrimitive',
    show: true
  },
  {
    title: '自定义Primitive绘制点线面',
    name: 'draw',
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
