import * as T from "three";
import type { Schema } from "../types";

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

export function createInputElementsFromSchema(schemas: Schema[]) {
  return schemas
    .sort((a, b) => b.order - a.order)
    .map((schema) => {
      const input = document.createElement("input");
      const label = document.createElement("label");
      label.htmlFor = schema.name;
      label.textContent = schema.textContent;
      input.type = schema.type;
      input.name = schema.name;
      input.id = schema.name;
      input.required = schema.required;
      input.value = schema.defaultValue;
      input.textContent = schema.textContent;

      if (schema.minValue) {
        input.min = schema.minValue;
      }

      if (schema.maxValue) {
        input.min = schema.maxValue;
      }

      return {
        label,
        input,
        eventHandler: schema.onChange,
      };
    });
}
