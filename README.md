# 我的冰箱 🧊 (Refrigerator App - Vite Edition)

现代化、响应式、极速加载的冰箱库存管理助手。

## 🚀 核心升级 (v1.1.0)
本项目已从传统的 CDN 加载模式全面迁移至 **Vite + React** 架构，带来了显著的性能提升：
- **秒速启动**: 移除了 Babel 运行时解析，移动端首屏加载速度提升约 80%。
- **模块化代码**: 采用现代 React 组件化开发，代码结构更清晰。
- **增强型 PWA**: 使用 `vite-plugin-pwa` 实现更可靠的离线访问和自动更新。

## ✨ 主要功能
- **智能库存管理**: 冷藏、冷冻、室温分类存储。
- **过期自动提醒**: 根据日期自动计算新鲜度（安全/警告/过期）。
- **常用项快速录入**: 支持自定义常用食材及其默认保质期。
- **三步极速同步**: 扫描二维码即可在多台手机间同步库存数据。
- **数据隐私**: 所有数据均存储在本地（LocalStorage），支持 JSON 导出及导入。

## 🛠️ 技术栈
- **框架**: React 18
- **构建工具**: Vite
- **离线支持**: Service Worker (Workbox)
- **样式**: Vanilla CSS (Glassmorphism 实色玻璃拟态)
- **同步**: qrcode

## 📦 快速开始
```bash
# 安装依赖
npm install

# 本地启动
npm run dev

# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 🌐 在线访问
[点击这里访问实时应用](https://h-px.github.io/refrigerator-app/)

Made with 🧊 by H-px.
