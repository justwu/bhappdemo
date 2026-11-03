<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NButton, NInput, NInputNumber, NSelect, NTag, NEmpty, useMessage } from 'naive-ui'
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, CalendarDays, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Compass, CreditCard, Gift, Heart, Home, MapPin,
  Search, ShieldCheck, ShoppingBag, Sparkles, Star, Ticket, QrCode,
  UserRound, Wallet, Waves, X, Banknote, House, ArrowUpRight
} from 'lucide-vue-next'
import { state, products, verifyTicket, claimCoupon, purchase, createOfflinePayment, fmt } from '../store.js'
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
const offlineMerchant = ref('M002')
const offlineAmount = ref(168)
const offlineCode = ref('')
const offlinePaymentMethod = ref('微信支付')
const offlineResult = ref(null)
const carouselIndex = ref(0)
const selectedActivity = ref(null)
const selectedProduct = ref(null)
let rotationTimer = null
let swipeStart = 0

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
const featured = computed(() => catalogue.value.slice(0, 8))
const activeCampaigns = computed(() => [...state.campaigns].filter(c=>c.status==='进行中').sort((a,b)=>(a.sort||99)-(b.sort||99)))
const currentCampaign = computed(() => activeCampaigns.value[carouselIndex.value % Math.max(1,activeCampaigns.value.length)])
const activityCoupons = computed(()=>state.coupons.filter(c=>c.campaignId===selectedActivity.value?.id&&c.status==='投放中'))
function stepBanner(delta){ const total=activeCampaigns.value.length; if(total)carouselIndex.value=(carouselIndex.value+delta+total)%total }
function openActivity(a){ if(a){selectedActivity.value=a;navigate('campaign')} }
function openProduct(p){if(p){selectedProduct.value=p;navigate('product')}}
const otherCampaigns = computed(()=>activeCampaigns.value.filter(a=>a.id!==currentCampaign.value?.id).slice(0,2))
function myInstance(c){return state.couponInstances.find(i=>i.couponId===c.id)}
function myCouponStatus(c){const i=myInstance(c);return i?.status==='已核销'?'已使用':i?'已领取':state.claimedCoupons.includes(c.id)?'已领取':'领取'}
async function copyCode(code){try{await navigator.clipboard.writeText(code);message.success('核销码已复制')}catch(e){message.info('请长按核销码复制')}}
const filtered = computed(() => catalogue.value.filter(p =>
  (filter.value === '全部' || p.type === filter.value) &&
  (!search.value.trim() || (p.name + p.merchant + p.distance).includes(search.value.trim()))
))
const liveCoupons = computed(() => state.coupons.filter(c => c.status === '投放中'))
const shownCoupons = computed(() => couponFilter.value === 'mine'
  ? state.coupons.filter(c => state.claimedCoupons.includes(c.id))
  : liveCoupons.value)
const applicable = computed(() => buying.value ? liveCoupons.value.filter(c =>
  state.couponInstances.some(i=>i.couponId===c.id&&i.status==='未使用') &&
  c.category === buying.value.type &&
  buying.value.price >= c.threshold
) : [])
const offlineMerchants = computed(()=>state.merchants.filter(m=>m.status==='正常').map(m=>({label:m.name,value:m.id})))
const offlinePreview = computed(()=>state.couponInstances.find(i=>i.code===offlineCode.value.trim().toUpperCase()))
const offlineCoupon = computed(()=>state.coupons.find(c=>c.id===offlinePreview.value?.couponId))
const offlinePayable = computed(()=>{const amount=Number(offlineAmount.value)||0;const m=state.merchants.find(x=>x.id===offlineMerchant.value);const cat={住宿:'酒店住宿',美食:'特色餐饮',玩乐:'景区玩乐'}[offlineCoupon.value?.category];return Math.max(0,amount-(offlinePreview.value?.status==='未使用'&&offlineCoupon.value?.status==='投放中'&&m?.category===cat&&amount>=offlineCoupon.value.threshold?offlineCoupon.value.amount:0))})
const couponOptions = computed(() => [
  { label: '不使用优惠券', value: 'none' },
  ...applicable.value.map(c => ({ label: c.title + ' · 立减 ¥' + c.amount, value: c.id }))
])
const finalPrice = computed(() => {
  if (!buying.value) return 0
  const discount = applicable.value.find(c => c.id === selectedCoupon.value)?.amount || 0
  return Math.max(0, buying.value.price - discount)
})
const activeTab = computed(() => page.value === 'orders' ? 'profile' : ['campaign','activities','offline'].includes(page.value) ? 'home' : page.value==='product'?'explore':page.value)
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
  if (outcome.ok) { message.success(outcome.message); couponFilter.value='mine'; navigate('coupons') }
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
function goOffline(code='') { offlineResult.value=null;offlineCode.value=code;navigate('offline') }
function completeOffline() {const result=createOfflinePayment({merchantId:offlineMerchant.value,originalAmount:offlineAmount.value,couponCode:offlineCode.value,paymentMethod:offlinePaymentMethod.value});if(result.ok){offlineResult.value=result.transaction;message.success(result.message)}else message.warning(result.message)}
function onKeydown(e) { if (e.key === 'Escape' && buying.value) closeBuy() }
onMounted(() => { window.addEventListener('keydown', onKeydown); rotationTimer=setInterval(()=>{ if(page.value==='home'&&activeCampaigns.value.length>1)stepBanner(1) },5500) })
onUnmounted(() => { window.removeEventListener('keydown', onKeydown); clearInterval(rotationTimer) })
</script>

<template>
  <div class="h5-stage">
    <div class="h5-device">
      <main class="h5-main">
        <!-- Curated visitor home: campaign carousel → services → editorial → discoveries -->
        <template v-if="page === 'home'">
          <div class="h5-minimal-home">
            <section class="h5-focus-carousel" aria-label="本期精选城市活动"
              @touchstart.passive="swipeStart=$event.changedTouches[0].screenX"
              @touchend.passive="Math.abs($event.changedTouches[0].screenX-swipeStart)>45&&stepBanner($event.changedTouches[0].screenX<swipeStart?1:-1)">
              <template v-if="currentCampaign">
                <div class="h5-focus-image" :key="currentCampaign.id">
                  <img :src="currentCampaign.image" :alt="currentCampaign.title" fetchpriority="high"/>
                  <div class="h5-focus-wash"></div>
                </div>
                <div class="h5-focus-brand"><Waves :size="19" :stroke-width="2.6"/> <span>北海假日</span><small>BEIHAI PASS</small></div>
                <div class="h5-focus-copy">
                  <span class="h5-focus-kicker">{{currentCampaign.badge || '城市好礼'}} · {{currentCampaign.tag}}</span>
                  <h1>{{currentCampaign.title}}</h1>
                  <p>{{currentCampaign.subtitle || '在北海，发现旅途更多美好。'}}</p>
                  <button type="button" class="h5-focus-cta" @click="openActivity(currentCampaign)">探索活动 <ArrowRight :size="17"/></button>
                </div>
                <div class="h5-focus-pager">
                  <span class="h5-focus-count">0{{(carouselIndex % activeCampaigns.length) + 1}} <i>/</i> 0{{activeCampaigns.length}}</span>
                  <div class="h5-focus-dots">
                    <button v-for="(a,i) in activeCampaigns" :key="a.id" type="button" :aria-label="'切换至'+a.title"
                      :class="{active:i===carouselIndex%activeCampaigns.length}" @click="carouselIndex=i"></button>
                  </div>
                </div>
              </template>
              <div v-else class="h5-focus-fallback"><Waves :size="32"/><h1>去北海，遇见好时光。</h1><button type="button" @click="browse()">探索北海 <ArrowRight :size="17"/></button></div>
            </section>

            <section class="h5-clean-shortcuts" aria-label="快捷服务">
              <button type="button" @click="navigate('verify')">
                <span class="h5-clean-shortcut-icon"><Ticket :size="25" :stroke-width="1.7"/></span>
                <span>票根服务</span>
              </button>
              <button type="button" @click="browse('住宿')">
                <span class="h5-clean-shortcut-icon"><House :size="25" :stroke-width="1.7"/></span>
                <span>酒店民宿</span>
              </button>
              <button type="button" @click="browse('全部')">
                <span class="h5-clean-shortcut-icon"><Compass :size="25" :stroke-width="1.7"/></span>
                <span>城市探索</span>
              </button>
              <button type="button" @click="goOffline()">
                <span class="h5-clean-shortcut-icon"><CreditCard :size="25" :stroke-width="1.7"/></span>
                <span>到店买单</span>
              </button>
            </section>

            <section class="h5-clean-section h5-clean-stories">
              <div class="h5-clean-section-heading">
                <div><span class="h5-clean-eyebrow">CURATED STORIES</span><h2>这个季节，去北海。</h2><p>精彩活动，值得专程而来。</p></div>
                <button type="button" @click="navigate('activities')" aria-label="查看全部活动"><ArrowUpRight :size="19"/></button>
              </div>
              <div class="h5-clean-story-stack">
                <button v-for="(a,i) in otherCampaigns" :key="a.id" type="button"
                  class="h5-clean-story" :class="{'h5-clean-story-second':i===1}" @click="openActivity(a)">
                  <div class="h5-clean-story-photo"><img :src="a.image" :alt="a.title" loading="lazy"/></div>
                  <div class="h5-clean-story-content">
                    <small>{{a.tag}} · {{a.badge || '限时活动'}}</small>
                    <strong>{{a.title}}</strong>
                    <span>探索专题 <ArrowRight :size="15"/></span>
                  </div>
                </button>
                <button v-if="!otherCampaigns.length" class="h5-clean-story-empty" type="button" @click="navigate('activities')">探索即将开启的北海活动 <ArrowRight :size="16"/></button>
              </div>
            </section>

            <section class="h5-clean-section h5-clean-picks">
              <div class="h5-clean-section-heading">
                <div><span class="h5-clean-eyebrow">STAY · EAT · EXPLORE</span><h2>北海生活提案</h2><p>住一晚海边，尝一口鲜味。</p></div>
                <button type="button" @click="browse()" aria-label="查看更多精选产品"><ArrowUpRight :size="19"/></button>
              </div>
              <div class="h5-clean-masonry">
                <button v-for="(p,i) in featured" :key="p.id" type="button" class="h5-clean-product" @click="openProduct(p)">
                  <div class="h5-clean-product-image"><img :src="p.image" :alt="p.name" loading="lazy"/></div>
                  <div class="h5-clean-product-body">
                    <span class="h5-clean-product-tag">{{p.type}} · {{p.distance}}</span>
                    <strong>{{p.name}}</strong>
                    <div><span><i>¥</i>{{p.price}} <small>起</small></span><ArrowUpRight :size="17"/></div>
                  </div>
                </button>
              </div>
              <button class="h5-clean-more" type="button" @click="browse()">探索更多北海好去处 <ArrowRight :size="16"/></button>
            </section>
            <p class="h5-clean-signoff">BEIHAI · WHERE GOOD DAYS BEGIN</p>
          </div>
        </template>

        <!-- All activities stay on a secondary page -->
        <template v-else-if="page === 'activities'">
          <div class="h5-clean-page-head"><button type="button" @click="navigate('home')"><ArrowLeft :size="17"/> 首页</button><small>BEIHAI STORIES</small><h1>本期精彩活动</h1><p>精选北海活动，凭当地票根解锁专属礼遇。</p></div>
          <div class="h5-clean-activity-list">
            <button v-for="a in activeCampaigns" :key="a.id" class="h5-clean-activity-item" type="button" @click="openActivity(a)">
              <img :src="a.image" :alt="a.title" loading="lazy"/>
              <div><small>{{a.tag}} · {{a.badge || '北海好礼'}}</small><strong>{{a.title}}</strong><p>{{a.subtitle}}</p><span>查看活动详情 <ArrowRight :size="16"/></span></div>
            </button>
            <div v-if="!activeCampaigns.length" class="h5-empty"><NEmpty description="更多精彩活动，敬请期待"/></div>
          </div>
        </template>

        <!-- Product detail: checkout remains a secondary action -->
        <template v-else-if="page === 'product' && selectedProduct">
          <div class="h5-clean-product-detail">
            <div class="h5-clean-detail-photo"><img :src="selectedProduct.image" :alt="selectedProduct.name"/><button type="button" @click="browse(selectedProduct.type)"><ArrowLeft :size="18"/> 返回精选</button></div>
            <section class="h5-clean-detail-main"><span>{{selectedProduct.type}} · {{selectedProduct.distance}}</span><h1>{{selectedProduct.name}}</h1><p><MapPin :size="15"/> {{selectedProduct.merchant}}　<Star :size="14" fill="currentColor"/> {{selectedProduct.rating}}</p><div class="h5-clean-detail-price"><small>¥</small>{{selectedProduct.price}} <del>¥{{selectedProduct.original}}</del></div></section>
            <section class="h5-clean-detail-description"><h2>一次值得期待的北海体验</h2><p>用更轻松的方式认识这座滨海城市。选择你喜欢的体验，在线完成模拟预订；也可以到店消费并使用票根兑换的优惠券。</p><div><CheckCircle2 :size="17"/> 北海精选合作商户</div><div><CheckCircle2 :size="17"/> 在线模拟预订 · 线下可到店体验</div><button type="button" @click="startBuy(selectedProduct)">查看套餐并模拟预订 <ArrowRight :size="17"/></button></section>
          </div>
        </template>

                <!-- Immersive campaign details -->
        <template v-else-if="page === 'campaign'">
          <div class="h5-campaign-details" v-if="selectedActivity">
            <div class="h5-campaign-detail-cover"><img :src="selectedActivity.image" :alt="selectedActivity.title"/><div class="h5-campaign-detail-gradient"></div><button class="h5-campaign-back" type="button" @click="navigate('home')"><ArrowLeft :size="19"/> 返回活动</button><span class="h5-campaign-detail-kicker">BEIHAI · HOLIDAY STORIES</span><h1>{{selectedActivity.title}}</h1></div>
            <div class="h5-campaign-detail-info"><div class="h5-detail-badge"><Ticket :size="15"/> {{selectedActivity.tag}} · {{selectedActivity.badge}}</div><h2>每一张北海票根，<br/>都是开启假日的邀请函。</h2><p>{{selectedActivity.subtitle}}</p><div class="h5-activity-valid"><span><CalendarDays :size="15"/> {{selectedActivity.date}}</span><span><MapPin :size="15"/> 广西北海 · 合作消费商户</span></div></div>
            <section class="h5-activity-rewards"><div class="h5-editorial-title"><div><small>YOUR EXCLUSIVE BENEFITS</small><h2>活动专属礼遇</h2></div></div><p class="h5-activity-rewards-hint">先核验北海本地演出、赛事或文旅票根，领取后在线下门店出示券码核销。</p>
              <div v-if="activityCoupons.length" class="h5-coupon-list"><article v-for="c in activityCoupons" :key="c.id" class="h5-voucher"><div class="h5-voucher-value"><span><em>¥</em>{{c.amount}}</span><small>满 {{c.threshold}} 可用</small></div><div class="h5-voucher-detail"><span>本地票根福利</span><strong>{{c.title}}</strong><small>有效期至 {{c.expiresAt||'2026-12-31'}}</small><button type="button" :disabled="state.claimedCoupons.includes(c.id)" @click="runClaim(c)">{{myCouponStatus(c)==='领取'?'立即兑换':myCouponStatus(c)}}</button></div></article></div>
              <div v-else class="h5-empty">活动权益配置中，请先前往领券中心查看其他优惠。</div>
            </section>
            <div class="h5-campaign-action"><button @click="navigate(state.ticketVerified?'coupons':'verify')">{{state.ticketVerified?'查看我的消费券':'核验票根，开启权益'}} <ArrowRight :size="17"/></button></div>
          </div>
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
            <article v-for="c in shownCoupons" :key="c.id" class="h5-voucher"><div class="h5-voucher-value"><span><em>¥</em>{{c.amount}}</span><small>满 {{c.threshold}} 可用</small></div><div class="h5-voucher-detail"><span>票根权益 · 北海精选</span><strong>{{c.title}}</strong><small>适用于{{c.category}}类线下合作商户</small><div v-if="couponFilter==='mine'&&myInstance(c)" class="h5-redeem-code">
                    <small>{{myInstance(c).status==='已核销'?'已完成核销 · '+(myInstance(c).merchantName||'线上演示'):'到线下合作门店出示此券码'}}</small>
                    <button type="button" :disabled="myInstance(c).status==='已核销'" @click="copyCode(myInstance(c).code)"><QrCode :size="15"/> {{myInstance(c).code}} <span>{{myInstance(c).status==='已核销'?'已使用':'复制'}}</span></button><button v-if="myInstance(c).status==='未使用'" type="button" class="h5-voucher-go-pay" @click="goOffline(myInstance(c).code)">去线下买单 <ArrowRight :size="14"/></button>
                    <small>有效期至 {{myInstance(c).expiresAt}} · {{c.category}}适用门店</small>
                  </div><button type="button" :disabled="state.claimedCoupons.includes(c.id)" @click="runClaim(c)">{{myCouponStatus(c)==='领取'?'立即兑换':myCouponStatus(c)}}</button></div></article>
          </div>
          <div v-else class="h5-empty"><NEmpty description="还没有领取卡券"/><n-button type="primary" round @click="couponFilter='available'">去领取</n-button></div>
          <div class="h5-coupon-footnote">温馨提示：本页为演示数据。线下验券仅可在同浏览器环境的运营后台模拟，不同设备之间暂不互通。</div>
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

        <!-- On-site merchant checkout -->
        <template v-else-if="page === 'offline'">
          <div class="h5-offline-cover"><button type="button" @click="navigate('home')"><ArrowLeft :size="18"/> 返回</button><span>BEIHAI · IN-STORE PAYMENT</span><h1>到店买单，<br/>消费更有礼。</h1><p>凭北海活动票根兑券，到店消费直接抵扣。</p></div>
          <div v-if="offlineResult" class="h5-card h5-offline-success"><CheckCircle2 :size="53"/><h2>模拟支付成功</h2><p>本次为本地演示，未产生真实资金交易</p><strong>¥{{fmt(offlineResult.amount)}}</strong><div>商户：{{offlineResult.merchantName}}</div><div>支付方式：{{offlineResult.paymentMethod}}</div><div>抵扣优惠：¥{{fmt(offlineResult.discount)}}</div><div>交易编号：{{offlineResult.id}}</div><n-button type="primary" block round size="large" @click="navigate('orders')">查看交易记录</n-button><button type="button" @click="goOffline()">再模拟一笔</button></div>
          <section v-else class="h5-card h5-offline-form">
            <h2><Wallet :size="20"/> 线下到店支付</h2>
            <label>消费门店</label><n-select v-model:value="offlineMerchant" :options="offlineMerchants" size="large"/>
            <label>实际消费金额（元）</label><n-input-number v-model:value="offlineAmount" :min="0.01" :max="999999" :precision="2" size="large" placeholder="请输入门店消费金额" style="width:100%"/>
            <label>票根消费券核销码（选填）</label><n-input v-model:value="offlineCode" size="large" placeholder="从我的卡券复制 BH 开头核销码"/>
            <div v-if="offlinePreview" class="h5-offline-coupon"><Gift :size="18"/><span>{{offlineCoupon?.title||'未知券种'}}<small>{{offlinePreview.status}} · 满 {{offlineCoupon?.threshold}} 元可用</small></span></div>
            <label>支付方式（演示）</label><div class="h5-pay-methods"><button v-for="m in ['微信支付','支付宝','现金','银行卡']" :key="m" type="button" :class="{selected:offlinePaymentMethod===m}" @click="offlinePaymentMethod=m">{{m}}</button></div>
            <div class="h5-offline-calculation"><div><span>消费金额</span><strong>¥{{fmt(Number(offlineAmount)||0)}}</strong></div><div><span>票根优惠</span><strong class="discount">-¥{{fmt(Math.max(0,(Number(offlineAmount)||0)-offlinePayable))}}</strong></div><div><b>模拟应付</b><strong class="payable">¥{{fmt(offlinePayable)}}</strong></div></div>
            <n-button type="primary" size="large" round block @click="completeOffline"><CreditCard :size="18"/> 确认线下模拟支付</n-button>
            <p class="h5-offline-tip">仅模拟微信/支付宝等付款结果及优惠券核销，不会调起真实支付。商户收银、券验真及资金清算须使用正式后台服务。</p>
          </section>
        </template>

        <!-- Order list -->
        <template v-else-if="page === 'orders'">
          <div class="h5-subheading"><button type="button" class="h5-backlink" @click="navigate('profile')"><ArrowLeft :size="16"/> 我的</button><h1>我的订单</h1><p>记下每一次北海之旅的美好。</p></div>
          <div v-if="!state.orders.length&&!state.offlineTransactions.length" class="h5-empty h5-orders-empty"><ShoppingBag :size="46"/><strong>还没有订单</strong><p>去发现北海的精彩好物吧</p><n-button type="primary" round @click="browse()">去逛逛 <ArrowRight :size="14"/></n-button></div>
          <div v-else class="h5-order-list"><article v-for="p in state.offlineTransactions" :key="p.id" class="h5-card h5-order"><div class="h5-order-head"><span>线下交易 {{p.id}}</span><n-tag size="small" type="success" round>{{p.status}}</n-tag></div><strong>{{p.merchantName}} · 到店消费</strong><small>{{p.paymentMethod}} · {{p.time}}</small><div class="h5-order-price">实付款 <b>¥{{fmt(p.amount)}}</b><span v-if="p.discount">票根优惠 ¥{{fmt(p.discount)}}</span></div></article>
            <article v-for="o in state.orders" :key="o.id" class="h5-card h5-order"><div class="h5-order-head"><span>订单号 {{o.id}}</span><n-tag size="small" type="success" round>{{o.status}}</n-tag></div><strong>{{o.product}}</strong><small>{{o.merchant}} · {{o.time}}</small><div class="h5-order-price">实付款 <b>¥{{fmt(o.amount)}}</b><span v-if="o.discount">优惠 ¥{{o.discount}}</span></div></article>
          </div>
        </template>

        <!-- My account -->
        <template v-else-if="page === 'profile'">
          <div class="h5-profile-cover"><div class="h5-profile-avatar"><UserRound :size="31"/></div><div class="h5-profile-welcome"><strong>演示游客</strong><span><BadgeCheck :size="14"/> {{state.ticketVerified?'已激活票根权益':'普通游客 · 待核验'}}</span></div><Sparkles class="h5-profile-star" :size="33"/></div>
          <div class="h5-profile-stats"><button type="button" @click="navigate('coupons')"><strong>{{state.claimedCoupons.length}}</strong><small>我的优惠券</small></button><button type="button" @click="navigate('orders')"><strong>{{state.orders.length+state.offlineTransactions.length}}</strong><small>我的订单</small></button><button type="button" @click="navigate('verify')"><strong>{{state.ticketVerified?'✓':'—'}}</strong><small>票根状态</small></button></div>
          <div class="h5-card h5-profile-links"><h2>我的服务</h2><button type="button" @click="goOffline()"><span class="h5-menu-icon" style="background:#e6f6f1"><CreditCard :size="19" color="#178c81"/></span>到店优惠买单 <ChevronRight :size="17"/></button><button type="button" @click="navigate('orders')"><span class="h5-menu-icon" style="background:#e9f1ff"><ShoppingBag :size="19" color="#297ff0"/></span>全部订单 <ChevronRight :size="17"/></button><button type="button" @click="navigate('coupons')"><span class="h5-menu-icon" style="background:#fff0e9"><Gift :size="19" color="#ef8a53"/></span>我的优惠券 <ChevronRight :size="17"/></button><button type="button" @click="navigate('verify')"><span class="h5-menu-icon" style="background:#e6f8f2"><Ticket :size="19" color="#1daf88"/></span>票根资格核验 <ChevronRight :size="17"/></button><a href="#/" class="h5-profile-link"><span class="h5-menu-icon" style="background:#f0edff"><Waves :size="19" color="#8268e8"/></span>返回展示首页 <ChevronRight :size="17"/></a></div>
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
