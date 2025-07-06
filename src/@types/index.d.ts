declare module '*.glsl' {
  const content: string;
  export default content;
}
declare global {
  interface Window {
    cesiumMap: any;
  }
}

declare module '*.png';
