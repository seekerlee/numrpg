# numrpg

RPG 挂机游戏数值设计工具。

## 当前功能

- 📈 **曲线对比**：多条函数曲线同屏对比，支持对数轴切换，使用 mathjs 解析公式
- ⏱️ **时间换算器**：以时间为锚，快速换算任意资源目标需要多少挂机时间

## 快速开始

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
```

## 技术栈

- Vite + Vue 3 + TypeScript
- Naive UI（暗色主题）
- ECharts + vue-echarts（按需引入）
- mathjs（公式解析）
- localStorage 持久化

## 路线图

- [ ] 战斗 DPS 计算器
- [ ] 蒙特卡洛掉落模拟
- [ ] 进度时间轴模拟器
