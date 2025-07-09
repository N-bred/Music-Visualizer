import * as T from "three";

export function disposeObject(object: any) {
  if (object.children) {
    for (let i = object.children.length - 1; i >= 0; i--) {
      disposeObject(object.children[i]);
    }
  }

  if (object.isMesh) {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      const materials: any[] = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        for (const key in material) {
          if (material[key] instanceof T.Texture) {
            material[key].dispose();
          }
        }
        material.dispose();
      });
    }
  }

  if (object.parent) {
    object.parent.remove(object);
  }
}

export function randomID(artistName: string, songName: string) {
  return artistName + songName;
}

export function calculateMinutesAndSeconds(duration: number) {
  const min = Math.floor(duration / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(duration % 60)
    .toString()
    .padStart(2, "0");

  return {
    min,
    sec,
  };
}
