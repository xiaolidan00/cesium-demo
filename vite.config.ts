import cesium from 'vite-plugin-cesium';
import { createHtmlPlugin } from 'vite-plugin-html';
import { defineConfig } from 'vite';
import fs from 'fs';
import { resolve } from 'node:path';

// import createExternal from 'vite-plugin-external';

function getEntryPath() {
  const p = [];
  const map = {}; //最后生成的多页面配置项
  const PAGE_PATH = resolve(__dirname, './src'); //指定要查询的目录
  const entryFiles = fs.readdirSync(PAGE_PATH); //获取到指定目录下的所有文件名
  entryFiles.forEach((filePath) => {
    //遍历处理每个子页面的入口
    map[filePath] = resolve(__dirname, `src/${filePath}/index.ts`);
    p.push({
      entry: 'index.ts',
      filename: `src/${filePath}/index.html`,
      template: `src/${filePath}/index.html`,
      injectOptions: {
        data: {
          title: filePath
        }
      }
    });
  });
  return { inputmap: map, pages: p };
}
const pages = getEntryPath();

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
      pages: pages.pages
    })
  ],
  build: {
    minify: false,
    rollupOptions: {
      external: ['cesium'],
      input: pages.inputmap,
      output: {
        entryFileNames: '[name]/index.js'
      }
    }
  }
});
