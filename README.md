# 北海城投 · 票根经济全域数字化运营平台（Vue 3 Demo）

基于 **Vue 3 + Vite + Naive UI** 的响应式交互原型。只保留两个独立入口，**不提供商户端**：

- **游客端**：票根模拟核验、领取优惠券、本地生活精选商品、模拟支付、订单查询、个人中心。
- **运营管理 PC 后台**：运营总览、经营数据、票根活动、优惠券、订单、**商户后台录入/启停**、支付清分演示、员工角色、系统设置及日志。

## 入口地址

GitHub Pages 正式开启后：

- 平台入口：https://justwu.github.io/bhappdemo/
- 游客端：https://justwu.github.io/bhappdemo/#/visitor
- 运营管理后台：https://justwu.github.io/bhappdemo/#/backoffice

兼容旧入口 `#/consumer`、`#/operations`、`#/admin`，会分别转到游客端或统一后台。

**重要：站点访问须先在仓库 [Settings → Pages](https://github.com/justwu/bhappdemo/settings/pages) 中将 Build and deployment 的 Source 设置为 GitHub Actions。** 本仓库提供 `.github/workflows/deploy-pages.yml`，之后在 Actions 页重新运行该工作流，或向 main 提交新代码触发发布。

## 本地运行

要求 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

Cloudflare Pages 可直接连接 GitHub 仓库，构建命令 `npm run build`，输出目录 `dist`；项目 `vite.config.js` 使用相对资源路径，可兼容 GitHub Pages 项目子路径和 Cloudflare Pages 根路径。

## 演示说明

- 票根模拟编号：`BH2026`，持票人任意非空姓名。
- 订单、优惠券领取、活动、商户、员工、设置使用浏览器 LocalStorage 持久化。
- 后台停用商户后，其在游客端的预设商品将不再展示；后台新增商户仅新增商户档案，本演示尚无商品录入界面。
- 资金清分、经营报表和部分历史订单为示例数据。
- 演示没有正式后台服务、用户登录权限验证、真实票务核验、实名校验、支付、清结算或 AI 调用，不能用于生产经营。

## 技术目录

```
index.html
src/
  main.js
  App.vue
  store.js
  theme.css
  views/
    VisitorView.vue
    BackofficeView.vue
.github/workflows/deploy-pages.yml
```
