import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 配置服务器选项
  server: {
    // 开发服务器端口
    port: 3000,
    // 启用热更新
    hmr: true,
    // 监听所有网络接口
    host: '0.0.0.0',
    // 文件更改时自动刷新页面
    watch: {
      usePolling: true,
      interval: 1000,
    }
  },
  
  // 配置构建选项
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成的静态资源目录
    assetsDir: 'assets',
    // 启用压缩
    minify: true
  },
  
  // 配置别名和其他解析选项
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // 配置插件
  plugins: []
});