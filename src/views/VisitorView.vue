<script setup>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, NSelect, NTag, NEmpty, useMessage } from 'naive-ui'
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Compass, CreditCard, Gift, House, MapPin, ScanLine, Search, ShoppingBag, Sparkles, Star, Ticket, UserRound, ShieldCheck } from 'lucide-vue-next'
import { state, products, verifyTicket, claimCoupon, purchase, fmt } from '../store.js'
const message = useMessage()
const tab=ref('home'), search=ref(''), category=ref('全部'), ticketCode=ref('BH2026'), ticketName=ref('演示游客')
const buying=ref(null), couponChoice=ref('none')
const menu=[{id:'home',label:'首页',icon:House},{id:'verify',label:'票根核验',icon:ScanLine},{id:'coupons',label:'优惠权益',icon:Gift},{id:'explore',label:'北海好物',icon:Compass},{id:'orders',label:'我的订单',icon:ShoppingBag},{id:'profile',label:'个人中心',icon:UserRound}]
const categories=[{name:'精选酒店',key:'住宿',emoji:'🏨',tone:'blue'},{name:'海鲜美食',key:'美食',emoji:'🦐',tone:'peach'},{name:'海上玩乐',key:'玩乐',emoji:'🌊',tone:'mint'},{name:'全部精选',key:'全部',emoji:'🎁',tone:'purple'}]
const filtered=computed(()=>products.filter(p=>(category.value==='全部'||p.type===category.value)&&(!search.value||(p.name+p.merchant).includes(search.value))&&state.merchants.some(m=>m.name===p.merchant&&m.status==='正常')))
const coupons=computed(()=>state.coupons.filter(c=>c.status==='投放中'))
const applicable=computed(()=>!buying.value?[]:coupons.value.filter(c=>state.claimedCoupons.includes(c.id)&&!state.usedCoupons.includes(c.id)&&c.category===buying.value.type&&buying.value.price>=c.threshold))
const couponOptions=computed(()=>[{label:'暂不使用优惠券',value:'none'},...applicable.value.map(c=>({label:c.title+' · 立减 ¥'+c.amount,value:c.id}))])
const payable=computed(()=>buying.value?Math.max(0,buying.value.price-(applicable.value.find(c=>c.id===couponChoice.value)?.amount||0)):0)
function browse(cat='全部'){category.value=cat;tab.value='explore';window.scrollTo({top:0,behavior:'smooth'})}
function verify(){const r=verifyTicket(ticketCode.value,ticketName.value);r.ok?message.success(r.message):message.warning(r.message);if(r.ok)tab.value='coupons'}
function claim(id){const r=claimCoupon(id);r.ok?message.success(r.message):message.warning(r.message);if(!r.ok&&!state.ticketVerified)tab.value='verify'}
function openBuy(p){buying.value=p;couponChoice.value='none'}
function pay(){if(!buying.value)return;const o=purchase(buying.value,couponChoice.value);message.success('模拟支付成功，订单 '+o.id);buying.value=null;tab.value='orders'}
</script>
<template>
  <div class="visitor-shell">
    <div class="visitor-nav"><div class="visitor-nav-inner">
      <span class="visitor-location"><MapPin :size="15"/> 广西 · 北海 <ChevronRight :size="13"/></span>
      <nav class="visitor-menu"><button v-for="item in menu" :key="item.id" :class="{selected:tab===item.id}" @click="tab=item.id"><component :is="item.icon" :size="15"/>{{item.label}}</button></nav>
      <div class="visitor-welcome"><UserRound :size="16"/> 演示游客</div>
    </div></div>
    <div v-if="tab==='home'" class="visitor-container">
      <section class="visitor-hero">
        <div class="visitor-hero-image"></div>
        <div class="visitor-hero-content">
          <div class="visitor-hero-tag"><Sparkles :size="15"/> 北海票根 · 城市好礼</div>
          <h1>把美好留在北海，<br/><span>让每张票根都值得期待。</span></h1>
          <p>观演、观赛、游北海。一次票根核验，解锁银滩美宿、海鲜美食与滨海玩乐专属福利。</p>
          <div class="visitor-hero-actions"><n-button size="large" color="#fff" text-color="#1459ac" round @click="tab='verify'">立即核验票根 <ArrowRight :size="17"/></n-button><button class="hero-link" @click="tab='coupons'">查看专属权益 <ArrowUpRight :size="16"/></button></div>
        </div><div class="hero-sticker"><span>BEIHAI</span><strong>发现<br/>北海</strong><small>THE BLUE CITY</small></div>
      </section>
      <div class="visitor-stats"><div><span>✦</span><strong>一张票根 · 更多精彩</strong><small>演出赛事票根权益</small></div><div><span>◎</span><strong>精选本地好物</strong><small>酒店、餐饮、文旅玩乐</small></div><div><span>◈</span><strong>安全便捷核销</strong><small>线上领券与模拟支付</small></div></div>
      <section class="visitor-section"><div class="visitor-section-heading"><div><span>EXPLORE BEIHAI</span><h2>遇见北海好生活</h2><p>从海边日落到舌尖鲜味，找到你的下一站。</p></div><button @click="browse()">探索更多 <ArrowRight :size="17"/></button></div>
        <div class="category-display"><button v-for="cat in categories" :key="cat.name" :class="'category-block '+cat.tone" @click="browse(cat.key)"><span>{{cat.emoji}}</span><strong>{{cat.name}}</strong><small>精选好礼等你来</small><ArrowUpRight :size="18"/></button></div>
      </section>
      <section class="visitor-section"><div class="visitor-section-heading"><div><span>CURATED FOR YOU</span><h2>北海精选推荐</h2><p>热爱不止在现场，好生活继续发生。</p></div><button @click="browse()">查看全部 <ArrowRight :size="17"/></button></div>
        <div class="visitor-product-grid"><article v-for="p in filtered" :key="p.id" class="visitor-product" @click="openBuy(p)"><div class="product-photo"><img :src="p.image" :alt="p.name" loading="lazy"/><span>{{p.type}}精选</span></div><div class="product-info"><h3>{{p.name}}</h3><p><MapPin :size="13"/> {{p.distance}} <span class="product-rating"><Star :size="13" fill="currentColor"/> {{p.rating}}</span></p><div class="product-buy"><div><strong>¥{{p.price}}</strong><del>¥{{p.original}}</del></div><button>立即预订 <ArrowRight :size="15"/></button></div></div></article></div>
      </section>
      <div class="visitor-banner"><div><span class="eyebrow">TICKET BENEFITS</span><h2>凭票根，享北海专属优惠</h2><p>核验票根领取本地生活权益，为旅途带来更多惊喜。</p></div><n-button strong secondary round @click="tab='verify'">立即领取 <ArrowRight :size="16"/></n-button></div>
    </div>

    <div v-else-if="tab==='verify'" class="visitor-container visitor-subpage">
      <div class="breadcrumb">游客服务 <ChevronRight :size="14"/> 票根权益 <ChevronRight :size="14"/> <strong>资格核验</strong></div>
      <div class="visitor-page-title"><div><span class="eyebrow">TICKET VERIFICATION</span><h1>一张票根，开启专属福利</h1><p>完成票根核验，领取北海专享优惠权益。</p></div><div class="page-illustration">🎟️</div></div>
      <div class="verify-layout"><section class="visitor-white-card"><div class="section-card-head"><ScanLine :size="22"/><h2>票根资格核验</h2></div>
        <div class="fake-ticket"><div><span>北海文旅 · 观演观赛通行证</span><strong>BEIHAI CITY PASS</strong><small>享城市消费好礼 · 票根权益体验</small></div><div class="fake-qr">▦</div></div>
        <label class="visitor-label">票根编号</label><n-input v-model:value="ticketCode" size="large" placeholder="请输入票根编号"/>
        <label class="visitor-label">持票人姓名</label><n-input v-model:value="ticketName" size="large" placeholder="请输入持票人姓名"/>
        <p class="form-hint"><ShieldCheck :size="15"/> 演示编号 <b>BH2026</b>；不连接真实票务或实名接口。</p>
        <div v-if="state.ticketVerified" class="verify-success"><CheckCircle2 :size="18"/> 已完成模拟核验</div>
        <n-button type="primary" size="large" block round @click="verify">立即核验票根 <ArrowRight :size="17"/></n-button>
      </section><aside class="visitor-white-card verify-tips"><div class="section-card-head"><Gift :size="22"/><h2>专享权益说明</h2></div><div class="tips-step" v-for="(text,i) in ['填写票根编号和持票人信息','模拟验证活动票根资格','领取优惠券并在下单时抵扣']" :key="text"><span>{{i+1}}</span><p>{{text}}</p></div><div class="tips-highlight"><Sparkles :size="20"/><strong>北海精彩，从此开始</strong><p>本页面不处理真实个人身份信息。</p></div></aside></div>
    </div>

    <div v-else-if="tab==='coupons'" class="visitor-container visitor-subpage">
      <div class="breadcrumb">游客服务 <ChevronRight :size="14"/> <strong>优惠权益</strong></div>
      <div class="visitor-page-title"><div><span class="eyebrow">MEMBER BENEFITS</span><h1>你的北海专属好礼</h1><p>领取票根专属优惠，轻松畅享本地生活。</p></div><div class="page-illustration">🎁</div></div>
      <div v-if="!state.ticketVerified" class="verification-banner"><div><Ticket :size="22"/><span><strong>核验票根后即可领券</strong><small>使用演示票根编号 BH2026 完成操作</small></span></div><n-button type="primary" round @click="tab='verify'">前往核验 <ArrowRight :size="15"/></n-button></div>
      <div class="coupons-grid"><article v-for="c in coupons" :key="c.id" class="benefit-card"><div class="benefit-top"><span>票根专属 · 限时好礼</span><Gift :size="18"/></div><div class="benefit-mid"><strong>¥{{c.amount}}</strong><span>满 ¥{{c.threshold}} 可用</span></div><h3>{{c.title}}</h3><p>适用分类：{{c.category}} · 部分精选商家</p><div class="benefit-bottom"><small>演示数据</small><n-button size="small" round :type="state.claimedCoupons.includes(c.id)?'default':'primary'" :disabled="state.claimedCoupons.includes(c.id)" @click="claim(c.id)">{{state.usedCoupons.includes(c.id)?'已使用':state.claimedCoupons.includes(c.id)?'已领取':'立即领取'}}</n-button></div></article></div>
      <div class="visitor-white-card coupon-help"><Gift :size="25"/><div><strong>已领取 {{state.claimedCoupons.length}} 张优惠券</strong><p>前往「北海好物」，选择符合条件的商品即可模拟抵扣。</p></div><n-button secondary type="primary" round @click="browse()">去逛逛 <ArrowRight :size="14"/></n-button></div>
    </div>

    <div v-else-if="tab==='explore'" class="visitor-container visitor-subpage">
      <div class="breadcrumb">游客服务 <ChevronRight :size="14"/> <strong>北海好物</strong></div>
      <div class="visitor-page-title"><div><span class="eyebrow">BEIHAI LIFESTYLE</span><h1>发现值得体验的北海</h1><p>从海景旅宿到特色鲜味，精选本地好生活。</p></div><div class="page-illustration">🌴</div></div>
      <div class="explore-filters"><div class="filter-chips"><button v-for="item in ['全部','住宿','美食','玩乐']" :key="item" :class="{on:category===item}" @click="category=item">{{item}}</button></div><n-input v-model:value="search" clearable placeholder="搜索商户或好物" style="max-width:290px"><template #prefix><Search :size="17"/></template></n-input></div>
      <div class="visitor-product-grid"><article v-for="p in filtered" :key="p.id" class="visitor-product" @click="openBuy(p)"><div class="product-photo"><img :src="p.image" :alt="p.name"/><span>{{p.type}}精选</span></div><div class="product-info"><h3>{{p.name}}</h3><p><MapPin :size="13"/> {{p.distance}} <span class="product-rating"><Star :size="13" fill="currentColor"/> {{p.rating}}</span></p><div class="product-buy"><div><strong>¥{{p.price}}</strong><del>¥{{p.original}}</del></div><button>立即预订 <ArrowRight :size="15"/></button></div></div></article></div><n-empty v-if="!filtered.length" description="暂无相关商品" class="visitor-empty"/>
    </div>

    <div v-else-if="tab==='orders'" class="visitor-container visitor-subpage">
      <div class="breadcrumb">个人中心 <ChevronRight :size="14"/> <strong>我的订单</strong></div><div class="visitor-page-title"><div><span class="eyebrow">MY BOOKINGS</span><h1>我的消费订单</h1><p>统一查看在北海的每一段美好体验。</p></div><div class="page-illustration">🛍️</div></div>
      <div v-if="!state.orders.length" class="visitor-white-card visitor-empty"><n-empty description="还没有订单，去发现北海好生活吧"><template #extra><n-button type="primary" round @click="browse()">探索本地好物 <ArrowRight :size="15"/></n-button></template></n-empty></div>
      <div v-else class="order-list"><article v-for="o in state.orders" :key="o.id" class="visitor-white-card visitor-order"><div class="order-top"><span>订单编号 {{o.id}}</span><n-tag type="success" round size="small">{{o.status}}</n-tag></div><h3>{{o.product}}</h3><p>{{o.merchant}} · {{o.time}}</p><div class="order-bottom"><span>模拟支付金额 <strong>¥{{fmt(o.amount)}}</strong></span><small v-if="o.discount">已抵扣 ¥{{o.discount}}</small></div></article></div>
    </div>

    <div v-else class="visitor-container visitor-subpage">
      <div class="visitor-page-title"><div><span class="eyebrow">MY ACCOUNT</span><h1>我的北海旅程</h1><p>每一份票根，都值得被珍藏。</p></div><div class="page-illustration">👋</div></div>
      <div class="visitor-profile"><div class="profile-portrait"><UserRound :size="33"/></div><div><h2>演示游客</h2><p>欢迎体验北海城投票根生活平台</p></div><n-tag :type="state.ticketVerified?'success':'warning'" round>{{state.ticketVerified?'已核验票根':'票根待核验'}}</n-tag></div>
      <div class="profile-stats"><button @click="tab='coupons'"><strong>{{state.claimedCoupons.length}}</strong><span>优惠券</span></button><button @click="tab='orders'"><strong>{{state.orders.length}}</strong><span>我的订单</span></button><button @click="tab='verify'"><strong>{{state.ticketVerified?'✓':'—'}}</strong><span>核验状态</span></button></div>
      <div class="visitor-white-card"><h3>快捷入口</h3><button class="profile-row" @click="tab='verify'"><ScanLine :size="20"/> 票根核验 <ChevronRight :size="18"/></button><button class="profile-row" @click="tab='coupons'"><Gift :size="20"/> 我的权益 <ChevronRight :size="18"/></button><button class="profile-row" @click="tab='orders'"><ShoppingBag :size="20"/> 我的订单 <ChevronRight :size="18"/></button></div>
    </div>

    <n-modal :show="!!buying" @update:show="v=>{if(!v)buying=null}" preset="card" title="确认模拟订单" style="max-width:490px" :bordered="false">
      <template v-if="buying"><div class="purchase-product"><img :src="buying.image" :alt="buying.name"/><div><strong>{{buying.name}}</strong><p>{{buying.merchant}}</p><span>¥{{fmt(buying.price)}}</span></div></div>
      <label class="visitor-label">使用票根优惠券</label><n-select v-model:value="couponChoice" :options="couponOptions" size="large"/><p class="muted">请先完成核验并领取符合条件的优惠券。</p>
      <div class="purchase-total"><span>合计应付</span><strong>¥{{fmt(payable)}}</strong></div><n-button type="primary" size="large" block round @click="pay"><CreditCard :size="18"/> 确认模拟支付</n-button><p class="purchase-disclaimer">演示订单，不会发起真实支付。</p>
      </template>
    </n-modal>
  </div>
</template>
