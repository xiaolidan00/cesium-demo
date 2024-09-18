const urls = [
  {
    title: '绘制点线面',
    name: 'draw'
  },
  {
    title: '自定义Primitive',
    name: 'customPrimitive'
  },
  {
    title: '三角测量',
    name: 'triangleTool'
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
