import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/vue3-ts-vite-route/",
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://192.168.0.99:31080", // 目标 API 地址
        changeOrigin: true, // 允许跨域请求
        rewrite: (path) => path.replace(/^\/api/, ""), // 重写路径，将 /api 替换为空
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      "@view": path.resolve(__dirname, "src/view"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@api": path.resolve(__dirname, "src/api"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    commonjsOptions: {
      //默认内部只处理了node_modules，需要将"packages/"也标识处理
      include: /node_modules|packages/,
    },
    //已忽略其他配置
  },
  plugins: [vue()],
});
