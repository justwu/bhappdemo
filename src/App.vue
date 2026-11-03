<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NConfigProvider, NMessageProvider, NButton } from 'naive-ui'
import { ArrowRight, ArrowUpRight, Ticket, LayoutDashboard, ShieldCheck, ScanLine, Gift, ShoppingBag, Store, ChartNoAxesCombined, CircleCheck, ChevronRight, Menu, X, Waves, Sparkles } from 'lucide-vue-next'
import VisitorView from './views/VisitorView.vue'
import OperationsView from './views/OperationsView.vue'
import AdminView from './views/AdminView.vue'

const route = ref('')
const links = [
  { id: 'visitor', label: '游客端', hint: '票根核验 / 领券消费', icon: Ticket, accent: 'blue' },
  { id: 'operations', label: '运营端', hint: '活动营销 / 数据分析', icon: ChartNoAxesCombined, accent: 'purple' },
  { id: 'admin', label: '管理端', hint: '商户管理 / 权限配置', icon: ShieldCheck, accent: 'teal' }
]
const features = [
  { title: '票根核验', text: '连接演出赛事流量，验证资格、领取权益', icon: ScanLine },
  { title: '权益营销', text: '优惠券、会员权益、多场景消费转化', icon: Gift },
  { title: '本地生活', text: '酒店、餐饮、景区玩乐精选服务', icon: ShoppingBag },
  { title: '统一运营', text: '活动、商户、订单与经营数据一站管理', icon: LayoutDashboard }
]
const readRoute = () => {
  const name = location.hash.replace(/^#\/?/, '').split('/')[0]
  route.value = name === 'consumer' ? 'visitor' : links.some(item => item.id === name) ? name : ''
}
const go = id => {
  location.hash = id ? '#/' + id : '#/'
  readRoute()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onMounted(() => { readRoute(); window.addEventListener('hashchange', readRoute) })
onUnmounted(() => window.removeEventListener('hashchange', readRoute))
const current = computed(() => links.find(x => x.id === route.value))
const themeOverrides = {
  common: { primaryColor: '#246ff3', primaryColorHover: '#4586ff', primaryColorPressed: '#155bd8', borderRadius: '10px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif' },
  Button: { borderRadiusMedium: '10px', heightMedium: '38px' },
  Card: { borderRadius: '18px' },
  DataTable: { thColor: '#f7f9fd', thTextColor: '#7484a4' }
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider placement="top">
      <div class="app-shell">
        <header class="site-header">
          <button class="brand-home" aria-label="返回平台入口" @click="go('')">
            <span class="brand-mark"><Waves :size="25" :stroke-width="2.6" /></span>
            <span class="brand-words"><strong>北海城投<span>· 票根经济</span></strong><small>BEIHAI CITY INVESTMENT · DIGITAL PLATFORM</small></span>
          </button>
          <nav class="top-portals" aria-label="三个演示入口">
            <button v-for="link in links" :key="link.id" :class="{ active: route === link.id }" @click="go(link.id)">
              <component :is="link.icon" :size="16" />
              {{ link.label }}
            </button>
          </nav>
          <div class="top-status"><span class="status-dot"></span>交互演示版 <span class="top-status-tag">DEMO</span></div>
        </header>

        <main v-if="!route" class="landing">
          <section class="landing-hero">
            <div class="landing-backdrop"></div>
            <div class="landing-content">
              <div class="hero-eyebrow"><Sparkles :size="15"/> ONE CITY · ONE DIGITAL EXPERIENCE</div>
              <h1>让一张票根，<br/>打开<span>北海精彩生活。</span></h1>
              <p>从赛事演出票根到城市消费权益，让游客、运营人员与平台管理员在同一个数字化生态中高效协同。</p>
              <div class="landing-hero-actions">
                <n-button type="primary" size="large" round @click="go('visitor')">进入游客端 <ArrowRight :size="17" /></n-button>
                <n-button size="large" round class="landing-outline" @click="go('operations')">查看运营数据 <ArrowUpRight :size="17" /></n-button>
              </div>
              <div class="hero-proof"><span><CircleCheck :size="16"/> Vue 3 + Naive UI</span><span><CircleCheck :size="16"/> 多角色独立入口</span><span><CircleCheck :size="16"/> 模拟业务闭环</span></div>
            </div>
            <div class="hero-floating-card">
              <div class="floating-card-head"><span class="round-symbol">🎟</span><div><small>城市精选权益</small><strong>北海票根特权</strong></div><span class="floating-check">✓</span></div>
              <div class="floating-amount">¥50 <span>满 300 元可用</span></div>
              <div class="floating-code"><span>BH · PASS</span><span>票根权益专享</span></div>
            </div>
          </section>

          <section class="entry-section">
            <div class="section-heading"><div><span class="eyebrow">CHOOSE YOUR WORKSPACE</span><h2>选择你的体验入口</h2><p>三套独立页面、统一业务数据。点击入口即可体验功能。</p></div><span class="section-side">01 — 03 / DIGITAL SERVICES</span></div>
            <div class="portal-grid">
              <button class="portal-card portal-visitor" @click="go('visitor')">
                <div class="portal-card-top"><div class="portal-icon"><Ticket :size="28" /></div><span>01 / CONSUMER</span></div>
                <div class="portal-main"><h3>游客 / 消费者端</h3><p>面向游客的本地生活优惠服务，体验验票、领券、消费下单全流程。</p></div>
                <div class="portal-mini-tags"><span>票根核验</span><span>领取优惠</span><span>模拟下单</span></div>
                <div class="portal-go">进入游客端 <ArrowUpRight :size="20" /></div>
              </button>
              <button class="portal-card portal-operations" @click="go('operations')">
                <div class="portal-card-top"><div class="portal-icon"><ChartNoAxesCombined :size="28" /></div><span>02 / OPERATIONS</span></div>
                <div class="portal-main"><h3>平台运营端</h3><p>统一管理票根活动与优惠营销，查看订单、会员增长及经营数据。</p></div>
                <div class="portal-mini-tags"><span>活动配置</span><span>权益营销</span><span>经营分析</span></div>
                <div class="portal-go">进入运营端 <ArrowUpRight :size="20" /></div>
              </button>
              <button class="portal-card portal-admin" @click="go('admin')">
                <div class="portal-card-top"><div class="portal-icon"><ShieldCheck :size="28" /></div><span>03 / ADMINISTRATION</span></div>
                <div class="portal-main"><h3>平台管理端</h3><p>由后台管理员添加及管理商户、配置人员权限和平台基础参数。</p></div>
                <div class="portal-mini-tags"><span>商户录入</span><span>人员权限</span><span>系统配置</span></div>
                <div class="portal-go">进入管理端 <ArrowUpRight :size="20" /></div>
              </button>
            </div>
          </section>

          <section class="feature-section">
            <div class="section-heading"><div><span class="eyebrow">BUILT AROUND REAL EXPERIENCES</span><h2>围绕城市消费的完整体验</h2></div></div>
            <div class="feature-grid">
              <article v-for="item in features" :key="item.title" class="feature-item"><div><component :is="item.icon" :size="23" /></div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article>
            </div>
          </section>
        </main>

        <VisitorView v-else-if="route === 'visitor'" />
        <OperationsView v-else-if="route === 'operations'" />
        <AdminView v-else-if="route === 'admin'" />

        <footer class="site-footer"><span>北海城投 · 票根经济全域数字化运营平台</span><span>仅供产品演示 · 所有核验、支付和分账均为模拟数据</span></footer>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
