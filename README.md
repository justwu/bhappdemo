# 北海城投 · 票根经济全域数字化运营平台（交互 Demo）

基于 **Vue 3 + Vite** 的前端单页演示站点。使用模拟数据，不接入真实票根、实名核验、支付、清结算或 AI 服务。

## 页面入口

- 消费者 / 游客：`/#/consumer`（票根验证 → 领券 → 本地生活 → 模拟支付与订单）
- 商户端：`/#/merchant`（商户看板、优惠券模拟核销、订单）
- 运营端：`/#/operations`（数据总览、活动管理、权益营销、商户、订单、分析）
- 财务 / 清分：`/#/finance`（聚合支付数据、模拟清分分账和风险对账）
- 领导驾驶舱：`/#/cockpit`（全域经营可视化）

演示票根编号 `BH2026`；演示商户核销码 `BH-8899`。页面顶部可切换全部角色。消费者模拟购买及运营端创建活动会写入浏览器本地存储。

## 本地开发

要求 Node.js 20.19+ 或 22+。

```bash
npm install
npm run dev
```

构建与本地预览：

```bash
npm run build
npm run preview
```

## 发布

GitHub Actions 工作流 `.github/workflows/deploy-pages.yml` 在推送到 `main` 后构建 `dist` 并部署到 GitHub Pages。**首次启用需要仓库管理员在 Settings → Pages → Build and deployment → Source 选择 GitHub Actions**，然后从 Actions 页面重新运行部署工作流。发布后地址为：

https://justwu.github.io/bhappdemo/

也可在 Cloudflare Pages 中连接此仓库，设置构建命令 `npm run build`、输出目录 `dist`，无需更改项目。

## 演示范围和限制

- 本项目是 UI 原型 + 本地交互流程，不包含生产后端或真实身份验证。
- 支付、清分分账、风控与数据大屏均为模拟展示，金额不可用于财务或结算依据。
- 页面中的商户、活动、订单、统计指标和产品图片均为演示数据。
- 实际接入后还需要服务端权限、数据持久化、商户资质验证、支付服务商渠道及审计能力。
