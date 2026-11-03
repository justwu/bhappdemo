<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NButton, NInput, NSelect, NTag, NEmpty, useMessage } from 'naive-ui'
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Compass, CreditCard, Gift, Heart, Home, MapPin,
  Search, ShieldCheck, ShoppingBag, Sparkles, Star, Ticket,
  UserRound, Wallet, Waves, X
} from 'lucide-vue-next'
import { state, products, verifyTicket, claimCoupon, purchase, fmt } from '../store.js'
import '../h5.css'

const message = useMessage()
const page = ref('home')
const search = ref('')
const filter = ref('全部')
const ticketCode = ref('BH2026')
const ticketName = ref('演示游客')
const couponFilter = ref('available')
const buying = ref(null)
const selectedCoupon = ref('none')

const tabs = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'explore', label: '逛北海', icon: Compass },
  { id: 'verify', label: '票根', icon: Ticket },
  { id: 'coupons', label: '优惠券', icon: Gift },
  { id: 'profile', label: '我的', icon: UserRound }
]
const categories = [
  { label: '酒店民宿', emoji: '🏨', type: '住宿', color: '#e9f2ff' },
  { label: '海鲜美食', emoji: '🦐', type: '美食', color: '#fff0e9' },
  { label: '景区游玩', emoji: '🌴', type: '玩乐', color: '#e6f7ed' },
  { label: '海上运动', emoji: '⛵', type: '玩乐', color: '#eaf4ff' },
  { label: '城市购物', emoji: '🛍️', type: '全部', color: '#fff0ee' },
  { label: '停车出行', emoji: '🚙', type: '全部', color: '#eff0ff' },
  { label: '特色伴手礼', emoji: '🎁', type: '全部', color: '#fff5e3' },
  { label: '全部服务', emoji: '✨', type: '全部', color: '#e7f7f8' }
]
const catalogue = computed(() => products.filter(p => state.merchants.some(m => m.name === p.merchant && m.status === '正常')))
const featured = computed(() => catalogue.value.slice(0, 4))
const filtered = computed(() => catalogue.value.filter(p =>
  (filter.value === '全部' || p.type === filter.value) &&
  (!search.value.trim() || (p.name + p.merchant + p.distance).includes(search.value.trim()))
))
const liveCoupons = computed(() => state.coupons.filter(c => c.status === '投放中'))
const shownCoupons = computed(() => couponFilter.value === 'mine'
  ? state.coupons.filter(c => state.claimedCoupons.includes(c.id))
  : liveCoupons.value)
const applicable = computed(() => buying.value ? liveCoupons.value.filter(c =>
  state.claimedCoupons.includes(c.id) &&
  !state.usedCoupons.includes(c.id) &&
  c.category === buying.value.type &&
  buying.value.price >= c.threshold
) : [])
const couponOptions = computed(() => [
  { label: '不使用优惠券', value: 'none' },
  ...applicable.value.map(c => ({ label: c.title + ' · 立减 ¥' + c.amount, value: c.id }))
])
const finalPrice = computed(() => {
  if (!buying.value) return 0
  const discount = applicable.value.find(c => c.id === selectedCoupon.value)?.amount || 0
  return Math.max(0, buying.value.price - discount)
})
const activeTab = computed(() => page.value === 'orders' ? 'profile' : page.value)
const ticketStatus = computed(() => state.ticketVerified ? '已完成资格核验' : '等待核验票根')

function navigate(target) {
  page.value = target
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function browse(type = '全部') {
  filter.value = type
  search.value = ''
  navigate('explore')
}
function runVerify() {
  const outcome = verifyTicket(ticketCode.value, ticketName.value)
  if (outcome.ok) {
    message.success(outcome.message)
    couponFilter.value = 'available'
    navigate('coupons')
  } else message.warning(outcome.message)
}
function runClaim(coupon) {
  const outcome = claimCoupon(coupon.id)
  if (outcome.ok) message.success(outcome.message)
  else {
    message.warning(outcome.message)
    if (!state.ticketVerified) navigate('verify')
  }
}
function startBuy(p) {
  buying.value = p
  selectedCoupon.value = 'none'
}
function completeBuy() {
  if (!buying.value) return
  const order = purchase(buying.value, selectedCoupon.value)
  buying.value = null
  message.success('模拟支付成功，订单号：' + order.id)
  navigate('orders')
}
function closeBuy() { buying.value = null }
function onKeydown(e) { if (e.key === 'Escape' && buying.value) closeBuy() }
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="h5-stage">
    <div class="h5-device">
      <div class="h5-topbar">
        <div class="h5-location"><span class="h5-logo"><Waves :size="19" :stroke-width="2.6"/></span><div><strong>北海票根生活</strong><small><MapPin :size="11"/> 广西 · 北海</small></div></div>
        <button class="h5-top-action" type="button" aria-label="查看我的订单" @click="navigate('orders')"><ShoppingBag :size="19"/><i v-if="state.orders.length" class="h5-bubble">{{state.orders.length}}</i></button>
      </div>

      <main class="h5-main">
        <!-- Landing / Home -->
        <template v-if="page === 'home'">
          <section class="h5-home-head">
            <div class="h5-greeting"><span>HI, BEIHAI <span class="h5-sun">☀</span></span><strong>发现北海的每一份惊喜</strong></div>
            <button class="h5-searchbox" type="button" @click="browse()"><Search :size="17"/><span>搜酒店、海鲜、美食、景区好物</span><span class="h5-search-go">搜索</span></button>
          </section>
          <section class="h5-hero">
            <img alt="蓝天海浪与海滩" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=950&q=84" fetchpriority="high"/>
            <div class="h5-hero-mask"></div>
            <div class="h5-hero-copy">
              <span class="h5-hero-kicker"><Sparkles :size="12"/> 城市票根 · 北海礼遇</span>
              <strong>一张票根<br/>玩转<span>浪漫北海</span></strong>
              <p>看演出 · 逛银滩 · 吃海鲜</p>
              <button type="button" @click="navigate('verify')">解锁专属权益 <ArrowRight :size="14"/></button>
            </div>
            <div class="h5-hero-dot"><i></i><i></i><i></i></div>
          </section>

          <div class="h5-ticker"><span class="h5-ticker-symbol"><Bell :size="14"/></span><b>北海优选</b><span>参与活动，即享专属票根消费好礼</span><ChevronRight :size="14"/></div>

          <section class="h5-category-panel">
            <button v-for="item in categories" :key="item.label" class="h5-category" @click="browse(item.type)">
              <span class="h5-category-icon" :style="{ background: item.color }">{{item.emoji}}</span>
              <small>{{item.label}}</small>
            </button>
          </section>

          <section class="h5-ticket-promo" @click="navigate('verify')">
            <div class="h5-ticket-promo-left"><span><Ticket :size="14"/> 票根专属权益</span><strong>{{state.ticketVerified ? '你的票根已激活' : '带上票根，领取北海好礼'}}</strong><small>{{state.ticketVerified ? '专属消费券等你领取' : '一键核验，解锁酒店、美食专属优惠'}}</small><button type="button">{{state.ticketVerified ? '去领优惠' : '立即核验'}} <ChevronRight :size="13"/></button></div>
            <span class="h5-ticket-art">🎟️</span>
          </section>

          <section class="h5-section">
            <header class="h5-section-head"><div><small>EXCLUSIVE COUPONS</small><h2>北海礼遇券 <span>🎁</span></h2></div><button type="button" @click="navigate('coupons')">更多 <ChevronRight :size="15"/></button></header>
            <div class="h5-coupon-scroll">
              <article v-for="c in liveCoupons" :key="c.id" class="h5-coupon-mini">
                <div><small>¥</small><strong>{{c.amount}}</strong><span>满 {{c.threshold}} 可用</span></div>
                <div class="h5-coupon-mini-right"><strong>{{c.title}}</strong><small>{{c.category}}好礼 · 票根专享</small><button type="button" :disabled="state.claimedCoupons.includes(c.id)" @click="runClaim(c)">{{state.usedCoupons.includes(c.id)?'已用':state.claimedCoupons.includes(c.id)?'已领':'领取'}}</button></div>
              </article>
            </div>
          </section>

          <section class="h5-section">
            <header class="h5-section-head"><div><small>HANDPICKED FOR YOU</small><h2>北海精选 <span class="h5-title-label">人气推荐</span></h2></div><button type="button" @click="browse()">查看全部 <ChevronRight :size="15"/></button></header>
            <div class="h5-product-grid">
              <article v-for="p in featured" :key="p.id" class="h5-product" @click="startBuy(p)">
                <div class="h5-product-image"><img :src="p.image" :alt="p.name" loading="lazy"/><span>{{p.type}}精选</span></div>
                <div class="h5-product-info"><strong>{{p.name}}</strong><small><MapPin :size="11"/> {{p.distance}} <b><Star :size="11" fill="currentColor"/>{{p.rating}}</b></small><div class="h5-product-footer"><span><em>¥</em>{{p.price}} <del>¥{{p.original}}</del></span><button aria-label="查看详情" type="button"><ArrowRight :size="15"/></button></div></div>
              </article>
            </div>
          </section>
          <div class="h5-bottom-hint">北海城投票根经济 · 让城市生活更精彩</div>
        </template>

        <!-- Ticket verification -->
        <template v-else-if="page === 'verify'">
          <div class="h5-subheading"><span>票根特权 · CITY PASS</span><h1>票根资格核验</h1><p>让每一张票根，都变成城市旅行的惊喜。</p></div>
          <div class="h5-pass-card"><div class="h5-pass-top"><span>BEIHAI CITY PASS</span><span>2026 / DEMO</span></div><div class="h5-pass-center"><span>北海文旅</span><strong>城市活动通行证</strong><small>票根经济专属权益卡</small></div><div class="h5-pass-bottom"><span>NO. BH2026</span><span>✧ ✧ ✧</span></div></div>
          <div v-if="state.ticketVerified" class="h5-success-line"><CheckCircle2 :size="18"/> {{ticketStatus}}，可以领取优惠券</div>
          <section class="h5-card h5-verify-form"><h2><ClipboardCheck :size="20"/> 核验票根</h2><label for="h5-code">票根编号</label><n-input id="h5-code" v-model:value="ticketCode" size="large" placeholder="输入票根编号"/><label for="h5-person">持票人姓名</label><n-input id="h5-person" v-model:value="ticketName" size="large" placeholder="输入持票人姓名"/><div class="h5-demo-tip"><ShieldCheck :size="16"/><span>演示票根编号：<b>BH2026</b><br/>本页面不连接真实票务或实名系统。</span></div><n-button size="large" block type="primary" round @click="runVerify">{{state.ticketVerified?'重新核验':'确认核验'}} <ArrowRight :size="16"/></n-button></section>
          <section class="h5-card h5-steps"><h2>核验后可以做什么？</h2><div v-for="(step,i) in ['验证票根资格，激活专属权益','领取住宿、餐饮、玩乐优惠券','选择心仪商品，模拟支付享折扣']" :key="step"><span>{{i+1}}</span><p>{{step}}</p></div></section>
        </template>

        <!-- Coupon wallet -->
        <template v-else-if="page === 'coupons'">
          <div class="h5-subheading"><span>BENEFITS · CITY GIFTS</span><h1>票根专属优惠</h1><p>给北海旅行加一点甜。</p></div>
          <div class="h5-benefit-cover"><div><small>北海城市好礼</small><strong>专属福利 限时领</strong><span>享更多精彩，花更少的钱</span></div><span>🎁</span></div>
          <div v-if="!state.ticketVerified" class="h5-notice-action"><div><Ticket :size="18"/><span>领取前请先核验票根</span></div><button type="button" @click="navigate('verify')">立即去核验 <ArrowRight :size="13"/></button></div>
          <div class="h5-coupon-tabs"><button type="button" :class="{active:couponFilter==='available'}" @click="couponFilter='available'">可领取</button><button type="button" :class="{active:couponFilter==='mine'}" @click="couponFilter='mine'">我的卡券 <span>{{state.claimedCoupons.length}}</span></button></div>
          <div v-if="shownCoupons.length" class="h5-coupon-list">
            <article v-for="c in shownCoupons" :key="c.id" class="h5-voucher"><div class="h5-voucher-value"><span><em>¥</em>{{c.amount}}</span><small>满 {{c.threshold}} 可用</small></div><div class="h5-voucher-detail"><span>票根权益 · 北海精选</span><strong>{{c.title}}</strong><small>适用于{{c.category}}类精选商品</small><button type="button" :disabled="state.claimedCoupons.includes(c.id)" @click="runClaim(c)">{{state.usedCoupons.includes(c.id)?'已使用':state.claimedCoupons.includes(c.id)?'已领取':'立即领取'}}</button></div></article>
          </div>
          <div v-else class="h5-empty"><NEmpty description="还没有领取卡券"/><n-button type="primary" round @click="couponFilter='available'">去领取</n-button></div>
          <div class="h5-coupon-footnote">温馨提示：核验、领券、支付均为模拟体验，实际优惠以正式平台规则为准。</div>
        </template>

        <!-- Shopping -->
        <template v-else-if="page === 'explore'">
          <div class="h5-subheading h5-explore-heading"><span>DISCOVER BEIHAI</span><h1>北海好物</h1><p>精选本地美食与旅行体验</p></div>
          <div class="h5-explore-search"><Search :size="18"/><input v-model="search" type="search" placeholder="搜索商户、酒店或商品"/><button v-if="search" type="button" aria-label="清除搜索" @click="search=''"><X :size="16"/></button></div>
          <div class="h5-filter-row"><button v-for="cat in ['全部','住宿','美食','玩乐']" :key="cat" type="button" :class="{active:filter===cat}" @click="filter=cat">{{cat}}</button></div>
          <div class="h5-find-count">为你找到 <b>{{filtered.length}}</b> 个北海精选好物</div>
          <div class="h5-product-grid">
            <article v-for="p in filtered" :key="p.id" class="h5-product" @click="startBuy(p)"><div class="h5-product-image"><img :src="p.image" :alt="p.name" loading="lazy"/><span>{{p.type}}精选</span></div><div class="h5-product-info"><strong>{{p.name}}</strong><small><MapPin :size="11"/> {{p.distance}} <b><Star :size="11" fill="currentColor"/>{{p.rating}}</b></small><div class="h5-product-footer"><span><em>¥</em>{{p.price}} <del>¥{{p.original}}</del></span><button type="button" aria-label="立即预订"><ArrowRight :size="15"/></button></div></div></article>
          </div>
          <div v-if="!filtered.length" class="h5-empty"><NEmpty description="暂无相关商品"/><n-button type="primary" round @click="browse()">查看全部好物</n-button></div>
        </template>

        <!-- Order list -->
        <template v-else-if="page === 'orders'">
          <div class="h5-subheading"><button type="button" class="h5-backlink" @click="navigate('profile')"><ArrowLeft :size="16"/> 我的</button><h1>我的订单</h1><p>记下每一次北海之旅的美好。</p></div>
          <div v-if="!state.orders.length" class="h5-empty h5-orders-empty"><ShoppingBag :size="46"/><strong>还没有订单</strong><p>去发现北海的精彩好物吧</p><n-button type="primary" round @click="browse()">去逛逛 <ArrowRight :size="14"/></n-button></div>
          <div v-else class="h5-order-list">
            <article v-for="o in state.orders" :key="o.id" class="h5-card h5-order"><div class="h5-order-head"><span>订单号 {{o.id}}</span><n-tag size="small" type="success" round>{{o.status}}</n-tag></div><strong>{{o.product}}</strong><small>{{o.merchant}} · {{o.time}}</small><div class="h5-order-price">实付款 <b>¥{{fmt(o.amount)}}</b><span v-if="o.discount">优惠 ¥{{o.discount}}</span></div></article>
          </div>
        </template>

        <!-- My account -->
        <template v-else-if="page === 'profile'">
          <div class="h5-profile-cover"><div class="h5-profile-avatar"><UserRound :size="31"/></div><div class="h5-profile-welcome"><strong>演示游客</strong><span><BadgeCheck :size="14"/> {{state.ticketVerified?'已激活票根权益':'普通游客 · 待核验'}}</span></div><Sparkles class="h5-profile-star" :size="33"/></div>
          <div class="h5-profile-stats"><button type="button" @click="navigate('coupons')"><strong>{{state.claimedCoupons.length}}</strong><small>我的优惠券</small></button><button type="button" @click="navigate('orders')"><strong>{{state.orders.length}}</strong><small>我的订单</small></button><button type="button" @click="navigate('verify')"><strong>{{state.ticketVerified?'✓':'—'}}</strong><small>票根状态</small></button></div>
          <div class="h5-card h5-profile-links"><h2>我的服务</h2><button type="button" @click="navigate('orders')"><span class="h5-menu-icon" style="background:#e9f1ff"><ShoppingBag :size="19" color="#297ff0"/></span>全部订单 <ChevronRight :size="17"/></button><button type="button" @click="navigate('coupons')"><span class="h5-menu-icon" style="background:#fff0e9"><Gift :size="19" color="#ef8a53"/></span>我的优惠券 <ChevronRight :size="17"/></button><button type="button" @click="navigate('verify')"><span class="h5-menu-icon" style="background:#e6f8f2"><Ticket :size="19" color="#1daf88"/></span>票根资格核验 <ChevronRight :size="17"/></button><a href="#/" class="h5-profile-link"><span class="h5-menu-icon" style="background:#f0edff"><Waves :size="19" color="#8268e8"/></span>返回展示首页 <ChevronRight :size="17"/></a></div>
          <p class="h5-profile-disclaimer">北海城投票根生活 · UI 交互演示版本<br/>仅使用浏览器本地模拟数据，不接真实支付。</p>
        </template>
      </main>

      <nav class="h5-tabbar" aria-label="游客端底部导航">
        <button v-for="t in tabs" :key="t.id" type="button" :class="{active:activeTab===t.id}" @click="navigate(t.id)"><span class="h5-nav-icon"><component :is="t.icon" :size="21" :stroke-width="activeTab===t.id?2.4:1.9"/><i v-if="t.id==='coupons'&&state.claimedCoupons.length" class="h5-nav-badge"></i></span><small>{{t.label}}</small></button>
      </nav>
    </div>

    <!-- Mobile checkout sheet -->
    <div v-if="buying" class="h5-checkout-overlay" role="presentation" @click.self="closeBuy">
      <section class="h5-checkout" role="dialog" aria-modal="true" aria-label="确认模拟订单">
        <div class="h5-sheet-handle"></div>
        <div class="h5-sheet-head"><h2>确认订单</h2><button type="button" aria-label="关闭订单" @click="closeBuy"><X :size="19"/></button></div>
        <div class="h5-checkout-product"><img :src="buying.image" :alt="buying.name"/><div><strong>{{buying.name}}</strong><small>{{buying.merchant}}</small><b>¥{{fmt(buying.price)}}</b></div></div>
        <div class="h5-checkout-label"><Gift :size="18"/> 票根专属优惠券</div>
        <n-select v-model:value="selectedCoupon" :options="couponOptions" size="large"/>
        <p class="h5-checkout-tip">核验票根并领取适用券后，可以在这里模拟抵扣。</p>
        <div class="h5-checkout-total"><span>应付金额</span><strong><small>¥</small>{{fmt(finalPrice)}}</strong></div>
        <n-button type="primary" size="large" block round @click="completeBuy"><CreditCard :size="17"/> 确认模拟支付</n-button>
        <p class="h5-checkout-note">演示操作，不会发起真实支付或生成真实交易。</p>
      </section>
    </div>
  </div>
</template>
