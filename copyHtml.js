import fs from 'fs';

function copyHtml() {
  const PAGE_PATH = './src'; //指定要查询的目录
  const entryFiles = fs.readdirSync(PAGE_PATH); //获取到指定目录下的所有文件名
  const indexPage = 'dist/index.html';
  const list = [];
  entryFiles.forEach((filePath) => {
    const data = fs.readFileSync(`src/${filePath}/index.html`);
    const newPath = `dist/${filePath}/index.html`;
    const newData = data
      .toString()
      .replace('index.ts', 'index.js')
      .replace('<%- title %>', filePath);
    fs.writeFileSync(newPath, newData);
    list.push(`<h1><a href="${filePath}/index.html">${filePath}</a></h1>`);
  });

  fs.writeFileSync(
    indexPage,
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
    <div id="cesiumContainer"></div>
  ${list.join('')}
  </body>
</html>`
  );
  console.log('copyHtml ok');
}
copyHtml();
