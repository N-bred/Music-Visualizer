import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const base = mode === "development" ? "/" : "/music-visualizer/";
  return defineConfig({
    base,
  });
};
