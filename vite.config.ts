import cesium from 'vite-plugin-cesium';
import { createHtmlPlugin } from 'vite-plugin-html';
import { defineConfig } from 'vite';
import fs from 'fs';
import urls from './urls';

// import { resolve } from 'node:path';

// import createExternal from 'vite-plugin-external';

// function getEntryPath() {
//   const p = [];
//   const map = {}; //最后生成的多页面配置项
//   const PAGE_PATH = resolve(__dirname, './src'); //指定要查询的目录
//   const entryFiles = fs.readdirSync(PAGE_PATH); //获取到指定目录下的所有文件名
//   entryFiles.forEach((filePath) => {
//     //遍历处理每个子页面的入口
//     map[filePath] = resolve(__dirname, `src/${filePath}/index.ts`);
//     p.push({
//       entry: 'index.ts',
//       filename: `src/${filePath}/index.html`,
//       template: `src/${filePath}/index.html`,
//       injectOptions: {
//         data: {
//           title: filePath
//         }
//       }
//     });
//   });
//   return { inputmap: map, pages: p };
// }
// const pages = getEntryPath();
fs.writeFileSync(
  './index.html',
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cesium-Demo</title>
  <style>
    body {
      margin: 0px;
      padding: 0px;
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0px;
      left: 0px;
      overflow: hidden;
    }
  </style>
</head>
<body> 
${urls.urls
  .map(
    (item, idx) =>
      `<h1>${idx + 1}.${item.title}</h1><p>访问地址：<a href="src/${item.name}/index.html">src/${
        item.name
      }/index.html</a></p>`
  )
  .join('')}
</body>
</html>`
);
export default defineConfig({
  plugins: [
    cesium(),
    // createExternal({
    //   development: {
    //     externals: {
    //       cesium: 'Cesium'
    //     }
    //   }
    // }),
    createHtmlPlugin({
      pages: urls.pages
    })
  ],
  build: {
    minify: false,
    rollupOptions: {
      external: ['cesium'],
      input: urls.map,
      output: {
        entryFileNames: '[name]/index.js'
      }
    }
  }
});
