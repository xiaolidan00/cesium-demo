import {saveCanvas} from "../utils/tool";

export type HeatMapOptionType = {
  //canvas大小
  width: number;
  height: number;
  //lat1，lng1，经纬度经过墨卡托投影转换后的像素坐标
  data: Array<{lat1: number; lng1: number; value: number}>;
  //value值的范围
  size: number;
  //value最大值
  max: number;
  //value最小值
  min: number;
  //颜色映射
  colors: {[n: number]: string};
  //热力半径像素
  radius: number;
  //最小经度投影像素坐标
  minlng1: number;
  //最小纬度投影像素坐标
  minlat1: number;
};
//创建热力颜色映射
function createColors(option: HeatMapOptionType) {
  const canvas = document.createElement("canvas");
  // document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  //Canvas的ImageData颜色值范围是0~255，渐变条256个像素值对应颜色映射
  canvas.width = 256;
  canvas.height = 1;
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  for (const k in option.colors) {
    grad.addColorStop(Number(k), option.colors[k]);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return ctx.getImageData(0, 0, canvas.width, 1).data;
}

//https://www.jianshu.com/p/f795cc2c14f5
//https://github.com/pa7/heatmap.js/blob/master/src/renderer/canvas2d.js
export function drawCircle(ctx: CanvasRenderingContext2D, option: HeatMapOptionType, item) {
  const {lat1, lng1, value} = item;

  //在Canvas上的坐标
  const x = lng1 - option.minlng1;
  const y = lat1 - option.minlat1;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, option.radius);
  grad.addColorStop(0.0, "rgba(0,0,0,1)");
  grad.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, option.radius, 0, 2 * Math.PI);
  ctx.closePath();
  //根据当前值绘制不同透明度的渐变黑色圆形
  ctx.globalAlpha = (value - option.min) / option.size;
  ctx.fill();
}

export function createHeatmap(option: HeatMapOptionType) {
  const canvas = document.createElement("canvas");

  canvas.width = option.width;
  canvas.height = option.height;
  const ctx = canvas.getContext("2d")!;

  //根据数据绘制热力范围圆形
  option.data.forEach((item) => {
    drawCircle(ctx, option, item);
  });

  //颜色映射
  const colorData = createColors(option);
  //将黑白透明度的热力圆转换成彩色热力
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < imageData.data.length; i = i + 4) {
    const opacity = imageData.data[i];
    const offset = opacity * 4;
    //red
    imageData.data[i - 3] = colorData[offset];
    //green
    imageData.data[i - 2] = colorData[offset + 1];
    //blue
    imageData.data[i - 1] = colorData[offset + 2];
  }

  //修改后的像素数据赋值回Canvas
  ctx.putImageData(imageData, 0, 0);
  // saveCanvas(canvas);
  return canvas;
}
