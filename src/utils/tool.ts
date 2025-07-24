import GUI from "lil-gui";

export type GuiType =
  | {name: string; onChange?: Function} & (
      | {type: "number"; min: number; max: number; step: number}
      | {
          type: "select";
          options: {[n: string | number]: number | string | boolean} | string[] | number[];
        }
      | {type: "color"}
      | {type: "title"; title: string}
    );
export function createGui(config: GuiType[], dataObj: {[n: string]: boolean | string | number}) {
  const gui = new GUI();
  config.forEach((item) => {
    let ctrl;
    if (item.type === "color") {
      ctrl = gui.addColor(dataObj, item.name);
    } else if (item.type === "number") {
      ctrl = gui.add(dataObj, item.name, item.min, item.max, item.step);
    } else if (item.type === "select") {
      ctrl = gui.add(dataObj, item.name, item.options);
    } else if (item.type === "title") {
      gui.title(item.title);
    }
    if (ctrl && item.onChange) ctrl.onChange(item.onChange);
  });
  return gui;
}
export const uuid = () => {
  const id = URL.createObjectURL(new Blob());

  URL.revokeObjectURL(id);
  return id.substring(5 + location.origin.length + 1);
};

export const downloadFile = (buffer: Blob, filename: string) => {
  const url = URL.createObjectURL(new File([buffer], filename));
  const a = document.createElement("a");
  a.style = "display: none";
  a.download = filename;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function convertBase64UrlToFile(base64: string, fileName: string) {
  let parts = base64.split(";base64,");
  let contentType = parts[0].split(":")[1];
  let raw = window.atob(parts[1]);
  let rawLength = raw.length;
  let uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; i++) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new File([uInt8Array], fileName, {type: contentType});
}

export function saveCanvas(canvas: HTMLCanvasElement) {
  const image = canvas.toDataURL("image/png");
  const fileName = new Date().getTime() + ".png";
  const file = convertBase64UrlToFile(image, fileName);
  downloadFile(file, fileName);
}
