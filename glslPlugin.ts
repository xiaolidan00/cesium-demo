import {type Plugin} from "vite";
const fileRegex = /\.(glsl)$/;
export default function WgslPlugin(): Plugin {
  return {
    // 插件名称
    name: "vite:glsl",
    //使用时机，是编译前还是编译后
    enforce: "pre",
    // 代码转译，这个函数的功能类似于 `webpack` 的 `loader`，编译输出为js可读的文件
    transform(code, id, opt) {
      //匹配要处理的文件类型
      if (fileRegex.test(id)) {
        return {code: `export default \`${code}\``, map: null};
      }
    }
  };
}
