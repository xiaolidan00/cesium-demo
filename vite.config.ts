import fs from "node:fs";
import {defineConfig} from "vite";
import cesium from "vite-plugin-cesium";
import GlslPlugin from "./glslPlugin";
function readSrc(rootPath: string) {
  const inputMap: {[n: string]: string} = {};
  const files = fs.readdirSync(rootPath);
  files.forEach((item: string) => {
    if (!["utils", "@types", "data", "assets"].includes(item)) inputMap[item] = `${rootPath}/${item}/index.ts`;
  });
  return inputMap;
}
const pages = readSrc("./src");
fs.writeFileSync("./urls.ts", "export default " + JSON.stringify(pages));

export default defineConfig(({mode}) => {
  return {
    plugins: [cesium(), GlslPlugin()],
    build: {
      minify: true,
      rollupOptions: {
        input: pages,
        output: {
          entryFileNames: "[name]/index.js"
        }
      }
    }
  };
});
