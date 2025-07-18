import * as T from "three";
import type { Schema, Song, Theme } from "../types";

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

export function parseValue(value: string, type: string): string | boolean | number | object | null {
  switch (type) {
    case "string":
      return value;
    case "number":
      return !Number.isNaN(parseFloat(value)) ? parseFloat(value) : null;
    case "boolean":
      return value === "true";
    case "object":
      return JSON.parse(value);
    default:
      return null;
  }
}

function setLocalStorage(key: string, value: any) {
  let valueToSave = value.toString();

  if (typeof value === "object") {
    valueToSave = JSON.stringify(value);
  }

  localStorage.setItem(key, valueToSave);

  return { value };
}

function getFromLocalStorage(key: string, value: any) {
  const stored = localStorage.getItem(key);

  if (stored !== null) {
    const valueType = typeof value;
    const newValue = parseValue(stored, valueType);

    if (newValue !== null) {
      return { value: newValue };
    }

    return null;
  }
  return null;
}

export function useLocalStorage<K extends boolean | string | number | object>(key: string, value: K): { set: (newVal: K) => { value: K }; value: K } {
  const response = {
    set: (newValue: K) => setLocalStorage(key, newValue),
    value,
  };

  const found = getFromLocalStorage(key, value);

  if (found !== null) {
    response.value = found.value as K;
    return response;
  }

  const setObject = setLocalStorage(key, value);
  response.value = setObject.value;
  return response;
}

export function createThemeFromJSON(jsonTheme: { name: string; color: number; transitionColor: number; backgroundColor: number }[]): Theme[] {
  return jsonTheme
    .filter((theme) => theme.name !== "")
    .map((theme) => ({
      name: theme.name,
      color: new T.Color(theme.color),
      transitionColor: new T.Color(theme.transitionColor),
      backgroundColor: new T.Color(theme.backgroundColor),
    }));
}

export function threeThemeToObject(theme: Theme) {
  return {
    name: theme.name,
    color: "#" + theme.color.getHexString(),
    transitionColor: "#" + theme.transitionColor.getHexString(),
    backgroundColor: "#" + theme.backgroundColor.getHexString(),
  };
}

export function getCssAccentColorValue(theme: Theme) {
  const hsl = { h: 0, s: 0, l: 0 };
  const transitionColorHSL = theme.transitionColor.getHSL({ ...hsl });
  const colorHSL = theme.color.getHSL({ ...hsl });

  if (transitionColorHSL.l > 0.2) {
    return theme.transitionColor.getStyle();
  } else if (colorHSL.l > 0.2) {
    return theme.color.getStyle();
  } else {
    if (transitionColorHSL.l > colorHSL.l) {
      return theme.transitionColor.clone().offsetHSL(0, 0, 0.6).getStyle();
    } else {
      return theme.color.clone().offsetHSL(0, 0, 0.6).getStyle();
    }
  }
}
