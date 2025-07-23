declare module "*.glsl" {
  const content: string;
  export default content;
}

interface Window {
  cesiumMap: any;
}

declare module "*.png";
declare module "*.svg";
