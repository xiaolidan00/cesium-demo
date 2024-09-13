import fs from 'fs';
import urls from './urls.js';

function copyHtml() {
  const indexPage = 'dist/index.html';
  const list = [];
  urls.urls.forEach((item, idx) => {
    const filePath = item.name;
    const data = fs.readFileSync(`src/${filePath}/index.html`);
    const newPath = `dist/${filePath}/index.html`;
    const newData = data
      .toString()
      .replace('index.ts', 'index.js')
      .replaceAll('/node_modules/', '/cesium-demo/')
      .replace('<%- title %>', filePath);
    fs.writeFileSync(newPath, newData);
    list.push(
      `<h1>${idx + 1}.${
        item.title
      }</h1><p>访问地址：<a href="${filePath}/index.html">${filePath}/index.html</a></p>`
    );
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
     overflow: auto;
        text-align: center;
      }
      #content {
        display: inline-block;
        width: 800px;
        margin: 0 auto;
        padding: 20px 0;
        text-align: left;
      }
    </style>
  </head>
  <body>
  <div id="content"> 
  ${list.join('')}
  </div>
  </body>
</html>`
  );
  console.log('copyHtml ok');
}
copyHtml();
