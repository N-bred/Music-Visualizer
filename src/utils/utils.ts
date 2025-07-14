import * as T from "three";
import type { Schema, Song } from "../types";

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
      const materials: any[] = Array.isArray(object.material) ? object.material : [object.material];
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
  return artistName + " " + songName;
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

export function createInputElementsFromSchema(schemas: Schema[]): {
  label: HTMLLabelElement;
  input: HTMLInputElement;
  eventHandler: Schema["eventHandler"];
}[] {
  return schemas
    .sort((a, b) => a.order - b.order)
    .map((schema) => {
      const input = document.createElement("input");
      const label = document.createElement("label");
      label.htmlFor = schema.name;
      label.textContent = schema.textContent;
      input.type = schema.type;
      input.name = schema.name;
      input.id = schema.name;
      input.required = schema.required;
      input.value = schema.defaultValue.toString();
      input.textContent = schema.textContent;

      if (schema.minValue) {
        input.min = schema.minValue.toString();
      }

      if (schema.maxValue) {
        input.min = schema.maxValue.toString();
      }

      return {
        label,
        input,
        eventHandler: schema.eventHandler,
      };
    });
}

export function createSongList(songs: Song[], songsFolder: string) {
  return songs.map((song) => ({
    src: songsFolder + song.artistName + " - " + song.fileName,
    ...song,
  }));
}

export function useLocalStorage<K extends string | number | boolean>(
  key: string,
  defaultValue: K
): {
  value: K extends number ? number : K extends boolean ? boolean : string;
  set: (newValue: K) => { value: K extends number ? number : K extends boolean ? boolean : string };
} {
  const set = (newValue: K) => {
    localStorage.setItem(key, newValue.toString());
    return { value: newValue as any };
  };

  const stored = localStorage.getItem(key);
  if (stored !== null) {
    if (typeof defaultValue === "number") {
      return { value: parseFloat(stored) as any, set };
    } else if (typeof defaultValue === "boolean") {
      return { value: (stored === "true") as any, set };
    } else {
      return { value: stored as any, set };
    }
  }

  localStorage.setItem(key, defaultValue.toString());
  return { value: defaultValue as any, set };
}
