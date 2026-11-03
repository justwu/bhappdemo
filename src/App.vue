<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NConfigProvider, NMessageProvider, NButton } from 'naive-ui'
import { ArrowRight, ArrowUpRight, Ticket, ShieldCheck, ScanLine, Gift, ShoppingBag, ChartNoAxesCombined, CircleCheck, Waves, Sparkles, LayoutDashboard, Store, Wallet } from 'lucide-vue-next'
import VisitorView from './views/VisitorView.vue'
import BackofficeView from './views/BackofficeView.vue'

const route = ref('')
const portals = [
  { id: 'visitor', label: '游客端', hint: '票根核验、领取权益、本地消费', icon: Ticket, english: 'VISITOR EXPERIENCE' },
  { id: 'backoffice', label: '运营管理后台', hint: '活动运营、商户录入、订单与数据管理', icon: LayoutDashboard, english: 'OPERATIONS & MANAGEMENT' }
]
const features = [
  { title: '票根核验', desc: '核验演出与赛事票根，将客流转化为权益会员', icon: ScanLine },
  { title: '权益营销', desc: '优惠券、权益活动，覆盖多样的消费场景', icon: Gift },
  { title: '本地生活', desc: '住宿、海鲜、文旅玩乐一站式消费体验', icon: ShoppingBag },
  { title: '统一管理', desc: '商户入驻由后台录入，业务与数据集中运营', icon: Store }
]
function readRoute() {
  const r = location.hash.replace(/^#\/?/, '').split('/')[0]
  route.value = r === 'consumer' ? 'visitor' : ['operations','admin','finance'].includes(r) ? 'backoffice' : portals.some(x => x.id === r) ? r : ''
}
function go(id) {
  location.hash = id ? '#/' + id : '#/'
  readRoute()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onMounted(() => { readRoute(); window.addEventListener('hashchange', readRoute) })
onUnmounted(() => window.removeEventListener('hashchange', readRoute))
const themeOverrides = {
  common: { primaryColor: '#1775e8', primaryColorHover: '#378bff', primaryColorPressed: '#0b5bcd', borderRadius: '10px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif' },
  Button: { borderRadiusMedium: '10px', heightMedium: '38px' },
  Card: { borderRadius: '16px' },
  DataTable: { thColor: '#f6f8fd', thTextColor: '#71809c' }
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider placement="top">
      <div class="app-shell">
        <header class="site-header">
          <button class="brand-home" @click="go('')" aria-label="返回首页">
            <span class="brand-mark"><Waves :size="25" :stroke-width="2.5"/></span>
            <span class="brand-words"><strong>北海城投<span>· 票根经济</span></strong><small>BEIHAI CITY INVESTMENT · DIGITAL PLATFORM</small></span>
          </button>
          <nav class="top-portals" aria-label="展示入口">
            <button :class="{active: route === 'visitor'}" @click="go('visitor')"><Ticket :size="16"/>游客端</button>
            <button :class="{active: route === 'backoffice'}" @click="go('backoffice')"><LayoutDashboard :size="16"/>运营管理后台</button>
          </nav>
          <div class="top-status"><span class="status-dot"></span>功能演示 <span class="top-status-tag">DEMO</span></div>
        </header>

        <main v-if="!route" class="landing">
          <section class="landing-hero">
            <div class="landing-backdrop"></div>
            <div class="landing-content">
              <div class="hero-eyebrow"><Sparkles :size="15"/> BEIHAI · DIGITAL CITY LIFESTYLE</div>
              <h1>让一张票根，<br/>开启<span>北海精彩生活。</span></h1>
              <p>连接赛事演出与城市消费，汇聚本地生活权益与智慧运营能力。一个面向游客的服务入口，一套面向平台的统一管理后台。</p>
              <div class="landing-hero-actions">
                <n-button type="primary" size="large" round @click="go('visitor')">体验游客端 <ArrowRight :size="17"/></n-button>
                <n-button size="large" round class="landing-outline" @click="go('backoffice')">查看运营后台 <ArrowUpRight :size="17"/></n-button>
              </div>
              <div class="hero-proof"><span><CircleCheck :size="16"/> Vue 3 + Naive UI</span><span><CircleCheck :size="16"/> 两个独立入口</span><span><CircleCheck :size="16"/> 模拟业务闭环</span></div>
            </div>
            <div class="hero-floating-card">
              <div class="floating-card-head"><span class="round-symbol">🎟️</span><div><small>票根专享权益</small><strong>北海城市消费券</strong></div><span class="floating-check">✓</span></div>
              <div class="floating-amount">¥50 <span>满 300 元可用</span></div>
              <div class="floating-code"><span>BEIHAI PASS</span><span>城市好礼 · 即刻领取</span></div>
            </div>
          </section>

          <section class="entry-section">
            <div class="section-heading"><div><span class="eyebrow">EXPLORE TWO WORKSPACES</span><h2>选择你的体验入口</h2><p>游客享受便捷消费，管理人员在一个后台完成全部运营管理工作。</p></div><span class="section-side">01 — 02 / DIGITAL EXPERIENCE</span></div>
            <div class="portal-grid two">
              <button class="portal-card portal-visitor" @click="go('visitor')">
                <div class="portal-card-top"><div class="portal-icon"><Ticket :size="30"/></div><span>01 / CONSUMER</span></div>
                <div class="portal-main"><h3>游客服务端</h3><p>面向游客与本地消费者，体验票根核验、优惠券领取、精选酒店与海鲜美食、模拟下单全流程。</p></div>
                <div class="portal-mini-tags"><span>票根核验</span><span>优惠权益</span><span>本地生活</span><span>模拟支付</span></div>
                <div class="portal-go">进入游客端 <ArrowUpRight :size="22"/></div>
              </button>
              <button class="portal-card portal-operations" @click="go('backoffice')">
                <div class="portal-card-top"><div class="portal-icon"><LayoutDashboard :size="30"/></div><span>02 / ADMIN CONSOLE</span></div>
                <div class="portal-main"><h3>运营管理后台</h3><p>一个 PC 后台统一管理活动营销、权益投放、商户新增及审核、订单处理、员工权限、支付与经营数据。</p></div>
                <div class="portal-mini-tags"><span>运营看板</span><span>商户录入</span><span>活动管理</span><span>系统设置</span></div>
                <div class="portal-go">进入 PC 后台 <ArrowUpRight :size="22"/></div>
              </button>
            </div>
          </section>

          <section class="feature-section">
            <div class="section-heading"><div><span class="eyebrow">ONE PLATFORM, CONNECTED EXPERIENCES</span><h2>从票根到消费的完整数字旅程</h2></div></div>
            <div class="feature-grid"><article v-for="item in features" :key="item.title" class="feature-item"><div><component :is="item.icon" :size="24"/></div><h3>{{ item.title }}</h3><p>{{ item.desc }}</p></article></div>
          </section>
        </main>

        <VisitorView v-else-if="route === 'visitor'"/>
        <BackofficeView v-else-if="route === 'backoffice'"/>

        <footer class="site-footer"><span>北海城投 · 票根经济全域数字化运营平台</span><span>交互原型演示 · 核验、支付、清分及统计均为模拟数据</span></footer>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
