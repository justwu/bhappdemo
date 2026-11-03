# 北海城投 · 票根经济全域数字化运营平台（Vue 3 Demo）

基于 **Vue 3 + Vite + Naive UI** 的响应式交互原型。只保留两个独立入口，**不提供商户端**：

- **游客端**：票根模拟核验、领取优惠券、本地生活精选商品、模拟支付、订单查询、个人中心。
- **运营管理 PC 后台**：运营总览、经营数据、票根活动、优惠券、订单、**商户后台录入/启停**、支付清分演示、员工角色、系统设置及日志。

## 入口地址

由 Cloudflare Pages 托管（GitHub `main` 分支自动部署）：

- 平台入口：https://bhappdemo.pages.dev/
- 游客端：https://bhappdemo.pages.dev/#/visitor
- 运营管理后台：https://bhappdemo.pages.dev/#/backoffice

兼容旧入口 `#/consumer`、`#/operations`、`#/admin`，会分别转到游客端或统一后台。

**部署方式：** 仅使用 Cloudflare Pages，仓库不再包含 GitHub Actions 部署工作流。推送到 `main` 分支后，由 Cloudflare 自动完成构建与发布。

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

Cloudflare Pages 已连接 GitHub 仓库。构建命令 `npm run build`，输出目录 `dist`；项目 `vite.config.js` 使用相对资源路径。

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
```

