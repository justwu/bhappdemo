<script setup>
import { computed, h, reactive, ref } from 'vue'
import { NButton, NInput, NInputNumber, NSelect, NDataTable, NTag, NModal, NSwitch, NEmpty, NProgress, useMessage } from 'naive-ui'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, CreditCard, Download, Gift, LayoutDashboard, LockKeyhole, Plus, Search, Settings2, ShieldCheck, ShoppingBag, Sparkles, Store, Ticket, TrendingUp, Users, Wallet, X, Zap, ScanLine, RefreshCcw, QrCode, ClipboardCheck, CircleAlert } from 'lucide-vue-next'
import { state, addMerchant, setMerchantStatus, addCampaign, addCoupon, addStaff, updateOrderStatus, resetDemo, fmt, redeemOffline, updateCampaignStatus, createOfflinePayment } from '../store.js'
const message=useMessage()
const active=ref('overview'), search=ref(''), modal=ref(''), tablePage=ref(1)
const menus=[
  {title:'工作台',items:[{id:'overview',label:'运营总览',icon:LayoutDashboard},{id:'analytics',label:'经营分析',icon:BarChart3}]},
  {title:'业务运营',items:[{id:'campaigns',label:'票根活动',icon:Ticket},{id:'tickets',label:'票根核验记录',icon:ShieldCheck},{id:'coupons',label:'消费券配置',icon:Gift},{id:'redeem',label:'线下券码核销',icon:QrCode},{id:'cashier',label:'线下门店收银',icon:CreditCard},{id:'orders',label:'订单管理',icon:ShoppingBag}]},
  {title:'平台管理',items:[{id:'merchants',label:'商户管理',icon:Store},{id:'settlement',label:'支付清分',icon:Wallet},{id:'staff',label:'员工与权限',icon:Users},{id:'settings',label:'基础设置',icon:Settings2},{id:'audit',label:'操作日志',icon:ClipboardList}]}
]
const titleMap={overview:'运营总览',analytics:'经营数据分析',campaigns:'票根活动管理',tickets:'票根核验记录',coupons:'消费券营销配置',redeem:'线下消费券核销',cashier:'线下门店收银台',orders:'交易订单管理',merchants:'商户管理',settlement:'支付清分概览',staff:'员工与权限',settings:'基础设置',audit:'操作审计日志'}
const merchantForm=reactive({name:'',category:'特色餐饮',contact:'',phone:''})
const campaignForm=reactive({title:'',subtitle:'凭北海本地票根，兑换城市消费券',tag:'演艺活动',date:'2026-11-03 至 2026-12-31',image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=85',badge:'新活动'})
const couponForm=reactive({title:'',amount:20,threshold:100,category:'玩乐',campaignId:'A001',expiresAt:'2026-12-31'})
const staffForm=reactive({name:'',role:'运营专员',department:'平台运营部'})
const redeemCode=ref(''), redeemMerchant=ref('M001'), redeemSearch=ref('')
const payMerchant=ref('M002'),payAmount=ref(168),payCoupon=ref(''),payMethod=ref('微信支付')
const merchantCategories=['酒店住宿','特色餐饮','景区玩乐','商超零售','停车出行','其他']
const couponCategories=['住宿','美食','玩乐']
const tagType=(status)=>['正常','进行中','投放中','已结算','已核销','启用','待核销'].includes(status)?'success':status==='停用'?'error':'warning'
const moneyMetrics=computed(()=>[
  {label:'全域交易总额',value:'¥3,286,560',change:'+26.4%',icon:Wallet,tone:'blue'},
  {label:'累计票根核验',value:'45,620',change:'+19.7%',icon:Ticket,tone:'purple'},
  {label:'营销权益领取',value:'18,436',change:'+31.2%',icon:Gift,tone:'orange'},
  {label:'平台活跃会员',value:'128,960',change:'+14.5%',icon:Users,tone:'teal'}
])
const merchantFiltered=computed(()=>state.merchants.filter(x=>(x.name+x.category+x.contact).includes(search.value)))
const campaignFiltered=computed(()=>state.campaigns.filter(x=>(x.title+x.tag).includes(search.value)))
const couponFiltered=computed(()=>state.coupons.filter(x=>(x.title+x.category).includes(search.value)))
const vouchers=computed(()=>state.couponInstances.filter(x=>(x.code+x.holder+(x.merchantName||'')+(state.coupons.find(c=>c.id===x.couponId)?.title||'')).toLowerCase().includes(redeemSearch.value.trim().toLowerCase())))
const redeemMerchantOptions=computed(()=>state.merchants.filter(x=>x.status==='正常').map(x=>({label:x.name+' · '+x.category,value:x.id})))
const voucherPreview=computed(()=>state.couponInstances.find(x=>x.code===redeemCode.value.trim().toUpperCase()))
const payPreview=computed(()=>state.couponInstances.find(x=>x.code===payCoupon.value.trim().toUpperCase()))
const payCouponInfo=computed(()=>state.coupons.find(x=>x.id===payPreview.value?.couponId))
const payMerchantRecord=computed(()=>state.merchants.find(x=>x.id===payMerchant.value))
const payDiscount=computed(()=>payPreview.value?.status==='未使用'&&payCouponInfo.value?.status==='投放中'&&payCouponInfo.value?.threshold<=Number(payAmount.value)&&({住宿:'酒店住宿',美食:'特色餐饮',玩乐:'景区玩乐'})[payCouponInfo.value?.category]===payMerchantRecord.value?.category ? Math.min(Number(payAmount.value)||0,payCouponInfo.value.amount):0)
const sampleOrders=[
{id:'BH20261103001',product:'银滩海景酒店 · 雅致大床房',merchant:'北海银滩海景酒店',amount:399,status:'已核销',time:'2026-11-03 09:40'},
{id:'BH20261103002',product:'海岸海鲜双人餐',merchant:'海岸海鲜风味餐厅',amount:168,status:'已核销',time:'2026-11-03 09:18'},
{id:'BH20261103003',product:'北海老街文化体验通票',merchant:'北海老街文化体验馆',amount:128,status:'待核销',time:'2026-11-03 08:55'},
{id:'BH20261103004',product:'银滩海上运动体验',merchant:'银滩海上运动中心',amount:228,status:'已核销',time:'2026-11-03 08:32'}
]
const allOrders=computed(()=>[...state.orders,...state.offlineTransactions.map(p=>({...p,product:'线下到店消费',merchant:p.merchantName,status:p.status,channel:'线下到店'})),...sampleOrders])
const filteredOrders=computed(()=>allOrders.value.filter(x=>(x.id+x.product+x.merchant).includes(search.value)))
const settlementRows=[
{id:'ZF20261103001',merchant:'北海银滩海景酒店',amount:399,fee:39.9,merchantShare:359.1,status:'已结算'},
{id:'ZF20261103002',merchant:'海岸海鲜风味餐厅',amount:168,fee:16.8,merchantShare:151.2,status:'已结算'},
{id:'ZF20261103003',merchant:'北海老街文化体验馆',amount:128,fee:12.8,merchantShare:115.2,status:'已结算'},
{id:'ZF20261103004',merchant:'银滩海上运动中心',amount:228,fee:22.8,merchantShare:205.2,status:'处理中'}
]
const statusCell=(row)=>h(NTag,{round:true,size:'small',type:tagType(row.status)},{default:()=>row.status})
const merchantCols=[
 {title:'商户名称',key:'name',render:r=>h('div',{class:'entity-cell'},[h('strong',r.name),h('small',r.id)])},
 {title:'业态',key:'category'}, {title:'负责人',key:'contact'}, {title:'联系电话',key:'phone'}, {title:'累计订单',key:'orders'}, {title:'累计营收',key:'revenue',render:r=>'¥'+fmt(r.revenue)}, {title:'状态',key:'status',render:statusCell},
 {title:'操作',key:'actions',render:r=>h(NButton,{text:true,type:'primary',onClick:()=>{setMerchantStatus(r.id,r.status==='正常'?'停用':'正常');message.success('商户状态已更新')}},{default:()=>r.status==='正常'?'停用商户':'启用商户'})}
]
const campaignCols=[{title:'活动名称',key:'title',render:r=>h('div',{class:'entity-cell'},[h('strong',r.title),h('small',r.subtitle||'')])},{title:'活动类型',key:'tag'},{title:'活动周期',key:'date'},{title:'领取量',key:'claims'},{title:'已核销',key:'redeemed'},{title:'状态',key:'status',render:statusCell},{title:'操作',key:'actions',render:r=>h(NButton,{type:'primary',text:true,onClick:()=>{updateCampaignStatus(r.id,r.status==='进行中'?'暂停':'进行中');message.success('活动状态已更新')}},{default:()=>r.status==='进行中'?'暂停活动':'上线活动'})}]
const couponCols=[{title:'券名称',key:'title',render:r=>h('strong',r.title)},{title:'使用门槛',key:'threshold',render:r=>'满 ¥'+r.threshold},{title:'优惠金额',key:'amount',render:r=>'¥'+r.amount},{title:'适用分类',key:'category'},{title:'领取量',key:'issued'},{title:'核销量',key:'redeemed'},{title:'状态',key:'status',render:statusCell}]
const orderCols=[{title:'渠道',key:'channel',render:r=>r.channel||'历史示例'},{title:'订单编号',key:'id',render:r=>h('strong',r.id)},{title:'商品 / 服务',key:'product'},{title:'所属商户',key:'merchant'},{title:'实付金额',key:'amount',render:r=>'¥'+fmt(r.amount)},{title:'创建时间',key:'time'},{title:'状态',key:'status',render:statusCell},{title:'操作',key:'action',render:r=>state.orders.some(o=>o.id===r.id)?h(NButton,{text:true,type:'primary',disabled:r.status==='已核销',onClick:()=>{updateOrderStatus(r.id,'已核销');message.success('已完成模拟核销')}},{default:()=>r.status==='已核销'?'已完成':'模拟核销'}):h('span',{class:'table-muted'},'演示记录')}]
const staffCols=[{title:'姓名',key:'name',render:r=>h('strong',r.name)},{title:'角色',key:'role'},{title:'所属部门',key:'department'},{title:'状态',key:'status',render:statusCell}]
const ticketCols=[{title:'核验时间',key:'time'},{title:'票根编号',key:'code'},{title:'持票人',key:'holder'},{title:'本地活动',key:'event'},{title:'结果',key:'result',render:r=>h(NTag,{round:true,size:'small',type:r.result==='通过'?'success':'error'},{default:()=>r.result})}]
const voucherCols=[{title:'核销码',key:'code',render:r=>h('strong',{style:'color:#2676c9;letter-spacing:1px'},r.code)},{title:'优惠券',key:'couponId',render:r=>state.coupons.find(c=>c.id===r.couponId)?.title||'未知券种'},{title:'持票人',key:'holder'},{title:'对应票根',key:'ticketCode'},{title:'核销门店',key:'merchantName',render:r=>r.merchantName||'—'},{title:'领取时间',key:'claimedAt'},{title:'核销时间',key:'redeemedAt',render:r=>r.redeemedAt||'—'},{title:'状态',key:'status',render:r=>h(NTag,{size:'small',round:true,type:r.status==='未使用'?'warning':'success'},{default:()=>r.status})}]
const auditCols=[{title:'发生时间',key:'time'},{title:'操作用户',key:'user'},{title:'操作类型',key:'action'},{title:'操作明细',key:'detail'}]
const offlinePaymentCols=[{title:'交易时间',key:'time'},{title:'交易号',key:'id'},{title:'消费商户',key:'merchantName'},{title:'支付方式',key:'paymentMethod'},{title:'原价',key:'original',render:r=>'¥'+fmt(r.original)},{title:'优惠',key:'discount',render:r=>'¥'+fmt(r.discount)},{title:'实付金额',key:'amount',render:r=>'¥'+fmt(r.amount)},{title:'状态',key:'status',render:statusCell}]
const settlementCols=[{title:'支付流水',key:'id'},{title:'收款商户',key:'merchant'},{title:'交易金额',key:'amount',render:r=>'¥'+fmt(r.amount)},{title:'平台服务费 (10%)',key:'fee',render:r=>'¥'+fmt(r.fee)},{title:'商户应收',key:'merchantShare',render:r=>'¥'+fmt(r.merchantShare)},{title:'状态',key:'status',render:statusCell}]
function doCashierPayment(){const r=createOfflinePayment({merchantId:payMerchant.value,originalAmount:payAmount.value,couponCode:payCoupon.value,paymentMethod:payMethod.value});if(r.ok){message.success(r.message);payCoupon.value=''}else message.warning(r.message)}
function runOfflineRedeem(){
  if (!redeemCode.value.trim()){message.warning('请填写游客提供的核销码');return}
  const result=redeemOffline(redeemCode.value,redeemMerchant.value)
  if(result.ok){message.success(result.message);redeemCode.value=''}else message.error(result.message)
}
function showModal(name){modal.value=name}
function closeModal(){modal.value=''}
function saveModal(){
 if(modal.value==='merchant'){if(!merchantForm.name.trim()||!merchantForm.contact.trim()||!/^1\d{10}$/.test(merchantForm.phone)){message.warning('请填写商户名称、负责人及11位手机号');return}addMerchant({...merchantForm});Object.assign(merchantForm,{name:'',category:'特色餐饮',contact:'',phone:''})}
 else if(modal.value==='campaign'){if(!campaignForm.title.trim()){message.warning('请输入活动名称');return}addCampaign({...campaignForm});campaignForm.title=''}
 else if(modal.value==='coupon'){if(!couponForm.title.trim()||!couponForm.amount||!couponForm.threshold||couponForm.amount>=couponForm.threshold){message.warning('请填写券名，优惠金额需小于门槛');return}addCoupon({...couponForm});couponForm.title=''}
 else if(modal.value==='staff'){if(!staffForm.name.trim()){message.warning('请输入员工姓名');return}addStaff({...staffForm});staffForm.name=''}
 closeModal();message.success('保存成功（本地模拟数据）')
}
function reset(){resetDemo();message.success('演示数据已恢复初始状态')}
function exportCsv(){
 const rows=[['商户名称','业态','负责人','状态'],...state.merchants.map(m=>[m.name,m.category,m.contact,m.status])]
 const csv='\uFEFF'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n')
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'})
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='北海商户清单.csv';a.click();URL.revokeObjectURL(url);message.success('商户清单已导出')
}
function switchTab(id){active.value=id;search.value='';window.scrollTo({top:0,behavior:'smooth'})}
</script>
<template>
  <div class="backoffice-layout">
    <aside class="backoffice-sidebar">
      <div class="sidebar-head"><div class="sidebar-badge"><LayoutDashboard :size="21"/></div><div><strong>城投运营平台</strong><small>MANAGEMENT CENTER</small></div></div>
      <div class="workspace-switch"><span class="workspace-switch-icon">城</span><div><strong>北海城投</strong><small>全域票根经济 · 演示环境</small></div><ChevronDown :size="16"/></div>
      <div class="sidebar-nav"><div v-for="group in menus" :key="group.title" class="sidebar-nav-group"><span class="sidebar-group-title">{{group.title}}</span><button v-for="item in group.items" :key="item.id" :class="{active:active===item.id}" @click="switchTab(item.id)"><component :is="item.icon" :size="18"/> {{item.label}} <ChevronRight v-if="active===item.id" :size="15" class="sidebar-chevron"/></button></div></div>
      <div class="sidebar-bottom"><div class="sidebar-bottom-avatar">管</div><div><strong>平台管理员</strong><small>最高权限 · 演示账号</small></div><span class="online-indicator"></span></div>
    </aside>
    <main class="backoffice-content">
      <div class="backoffice-toolbar"><div class="backoffice-breadcrumb">工作台 <ChevronRight :size="13"/> <strong>{{titleMap[active]}}</strong></div><div class="backoffice-toolbar-actions"><span class="env-tag"><span></span> DEMO 环境</span><Bell :size="19"/><span class="toolbar-user">管理员</span></div></div>
      <div class="backoffice-main">
        <header class="backoffice-heading"><div><div class="tiny-eyebrow">BEIHAI DIGITAL OPERATIONS</div><h1>{{titleMap[active]}}</h1><p>{{active==='overview'?'总览城市票根经济全域运营表现':active==='merchants'?'商户由平台人员统一录入并管理，无独立商户端':'统一 PC 运营管理平台 · 当前为本地演示数据'}}</p></div><div class="heading-tools"><span class="date-pill"><CalendarDays :size="16"/> 2026年11月 · 演示数据</span><n-button v-if="active==='merchants'" type="primary" @click="showModal('merchant')"><Plus :size="17"/> 添加商户</n-button><n-button v-else-if="active==='campaigns'" type="primary" @click="showModal('campaign')"><Plus :size="17"/> 新建活动</n-button><n-button v-else-if="active==='coupons'" type="primary" @click="showModal('coupon')"><Plus :size="17"/> 新增优惠券</n-button><n-button v-else-if="active==='staff'" type="primary" @click="showModal('staff')"><Plus :size="17"/> 添加员工</n-button></div></header>

        <template v-if="active==='overview'">
          <section class="backoffice-metrics"><article v-for="item in moneyMetrics" :key="item.label" class="backoffice-metric"><div class="metric-top"><span>{{item.label}}</span><span :class="'metric-icon '+item.tone"><component :is="item.icon" :size="19"/></span></div><strong>{{item.value}}</strong><div class="metric-foot"><span>{{item.change}}</span> 较上期 <TrendingUp :size="14"/></div></article></section>
          <div class="backoffice-charts"><section class="backoffice-panel large-chart"><div class="panel-title-row"><div><h2>平台交易趋势</h2><p>近七日交易金额变化 · 演示数据</p></div><span class="panel-badge">交易金额 / ¥</span></div>
            <div class="trend-chart"><div class="chart-y"><span>50万</span><span>40万</span><span>30万</span><span>20万</span><span>10万</span></div><svg viewBox="0 0 700 235" preserveAspectRatio="none" aria-label="七日交易趋势示意图"><defs><linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4f9dff" stop-opacity=".35"/><stop offset="100%" stop-color="#4f9dff" stop-opacity="0"/></linearGradient></defs><path v-for="n in [20,65,110,155,200]" :key="n" :d="'M 0 '+n+' H 700'" stroke="#edf1f8" stroke-dasharray="5 6" fill="none"/><path d="M 0 157 C 35 145, 65 130, 110 140 S 195 95, 245 108 S 325 85, 370 98 S 450 50, 490 61 S 570 78, 620 31 S 678 38, 700 17 L 700 235 L 0 235 Z" fill="url(#blueArea)"/><path d="M 0 157 C 35 145, 65 130, 110 140 S 195 95, 245 108 S 325 85, 370 98 S 450 50, 490 61 S 570 78, 620 31 S 678 38, 700 17" fill="none" stroke="#2980f4" stroke-width="4" stroke-linecap="round"/><circle cx="620" cy="31" r="7" fill="#fff" stroke="#2980f4" stroke-width="4"/></svg></div><div class="chart-x"><span>10/28</span><span>10/29</span><span>10/30</span><span>10/31</span><span>11/01</span><span>11/02</span><span>11/03</span></div>
          </section><section class="backoffice-panel donut-panel"><div class="panel-title-row"><div><h2>消费场景构成</h2><p>各业态消费金额占比</p></div></div><div class="donut-chart"><div><strong>12</strong><span>类业务场景</span></div></div><div class="donut-legend"><div v-for="(item,i) in [{name:'酒店住宿',value:34.2,color:'#287af4'},{name:'特色餐饮',value:26.1,color:'#8560ef'},{name:'景区玩乐',value:20.3,color:'#33b5d6'},{name:'商超及其他',value:19.4,color:'#f6ac66'}]" :key="item.name"><i :style="{background:item.color}"></i><span>{{item.name}}</span><strong>{{item.value}}%</strong></div></div></section></div>
          <div class="backoffice-bottom-grid"><section class="backoffice-panel"><div class="panel-title-row"><div><h2>正在开展的活动</h2><p>票根权益投放与核销进度</p></div><n-button quaternary type="primary" @click="switchTab('campaigns')">查看全部 <ArrowRight :size="15"/></n-button></div><div class="home-activity" v-for="a in state.campaigns.slice(0,3)" :key="a.id"><span class="home-activity-icon"><Ticket :size="18"/></span><div><strong>{{a.title}}</strong><small>{{a.date}}</small></div><n-tag :type="tagType(a.status)" size="small" round>{{a.status}}</n-tag></div></section>
            <section class="backoffice-panel"><div class="panel-title-row"><div><h2>快捷操作</h2><p>一站式运营与管理</p></div></div><div class="quick-actions"><button @click="showModal('campaign')"><span class="quick-icon purple"><Ticket :size="22"/></span>新建活动 <ArrowUpRight :size="16"/></button><button @click="showModal('coupon')"><span class="quick-icon orange"><Gift :size="22"/></span>创建优惠券 <ArrowUpRight :size="16"/></button><button @click="showModal('merchant')"><span class="quick-icon blue"><Store :size="22"/></span>录入商户 <ArrowUpRight :size="16"/></button><button @click="switchTab('orders')"><span class="quick-icon teal"><ShoppingBag :size="22"/></span>管理订单 <ArrowUpRight :size="16"/></button></div></section></div>
        </template>

        <template v-else-if="active==='analytics'"><div class="backoffice-metrics"><article v-for="item in moneyMetrics" :key="item.label" class="backoffice-metric"><div class="metric-top">{{item.label}} <BarChart3 :size="19"/></div><strong>{{item.value}}</strong><div class="metric-foot">{{item.change}} 环比增长</div></article></div><section class="backoffice-panel"><div class="panel-title-row"><div><h2>各业态经营表现</h2><p>按交易额统计 · 示例数据</p></div></div><div class="business-bars"><div v-for="item in [{name:'酒店住宿',value:34.2},{name:'特色餐饮',value:26.1},{name:'景区玩乐',value:20.3},{name:'商超零售',value:12.4},{name:'停车出行',value:7}]" :key="item.name"><span>{{item.name}}</span><div><i :style="{width:(item.value*2.6)+'%'}"></i></div><strong>{{item.value}}%</strong></div></div></section></template>

        <template v-else-if="['campaigns','coupons','merchants','orders','staff','audit','tickets'].includes(active)">
          <div class="backoffice-mini-stats"><div><span>活动总数</span><strong>{{state.campaigns.length}}</strong></div><div><span>权益券种</span><strong>{{state.coupons.length}}</strong></div><div><span>合作商户</span><strong>{{state.merchants.length}}</strong></div><div><span>订单记录</span><strong>{{allOrders.length}}</strong></div></div>
          <section class="backoffice-panel list-panel"><div class="panel-title-row"><div><h2>{{titleMap[active]}}列表</h2><p>数据变更将同步在同一浏览器的游客端与后台演示</p></div><div class="table-tools"><n-input v-model:value="search" clearable placeholder="搜索当前列表" style="width:230px"><template #prefix><Search :size="15"/></template></n-input><n-button v-if="active==='merchants'" secondary @click="exportCsv"><Download :size="16"/> 导出商户</n-button></div></div>
            <n-data-table v-if="active==='tickets'" :columns="ticketCols" :data="state.ticketVerifications" :pagination="{pageSize:8}" :bordered="false" :scroll-x="830"/>
            <n-data-table v-if="active==='campaigns'" :columns="campaignCols" :data="campaignFiltered" :pagination="{pageSize:8}" :bordered="false" :scroll-x="700"/>
            <n-data-table v-if="active==='coupons'" :columns="couponCols" :data="couponFiltered" :pagination="{pageSize:8}" :bordered="false" :scroll-x="700"/>
            <n-data-table v-if="active==='merchants'" :columns="merchantCols" :data="merchantFiltered" :pagination="{pageSize:8}" :bordered="false" :scroll-x="900"/>
            <n-data-table v-if="active==='orders'" :columns="orderCols" :data="filteredOrders" :pagination="{pageSize:8}" :bordered="false" :scroll-x="1100"/>
            <n-data-table v-if="active==='staff'" :columns="staffCols" :data="state.staff" :pagination="{pageSize:8}" :bordered="false"/>
            <n-data-table v-if="active==='audit'" :columns="auditCols" :data="state.audit" :pagination="{pageSize:8}" :bordered="false" :scroll-x="750"/>
          </section>
          <div v-if="active==='merchants'" class="backoffice-callout"><Store :size="20"/><div><strong>商户管理模式说明</strong><p>本次 Demo 不提供商户自助入驻或商户端；仅由后台管理员添加、启用、停用商户并维护信息。停用后，游客端不再展示该商户的精选商品。</p></div></div>
        </template>

        <template v-else-if="active==='cashier'">
          <div class="redemption-metrics"><div><span>线下模拟交易笔数</span><strong>{{state.offlineTransactions.length}}</strong></div><div><span>线下消费总金额</span><strong>¥{{fmt(state.offlineTransactions.reduce((n,p)=>n+p.original,0))}}</strong></div><div><span>优惠券抵扣金额</span><strong>¥{{fmt(state.offlineTransactions.reduce((n,p)=>n+p.discount,0))}}</strong></div></div>
          <div class="redemption-grid">
            <section class="backoffice-panel redemption-panel">
              <div class="panel-title-row"><div><h2><CreditCard :size="19"/> 合作门店线下收银</h2><p>非线上预订交易，录入线下消费实付金额与优惠抵扣</p></div><n-tag type="warning" round>模拟交易</n-tag></div>
              <label>消费商户</label><n-select v-model:value="payMerchant" :options="redeemMerchantOptions" size="large"/>
              <label>原始消费金额（元）</label><n-input-number v-model:value="payAmount" :min="0.01" :max="999999" :precision="2" size="large" style="width:100%"/>
              <label>游客消费券核销码（非必填）</label><n-input v-model:value="payCoupon" placeholder="游客提供 BH 开头核销码，无券可空" clearable/>
              <div v-if="payPreview" class="redeem-preview"><div><strong>{{payCouponInfo?.title||'未找到券种'}}</strong><n-tag :type="payPreview.status==='未使用'?'warning':'success'">{{payPreview.status}}</n-tag></div><span>适用消费金额：满 {{payCouponInfo?.threshold}} 元 · 优惠 ¥{{payCouponInfo?.amount}}</span></div>
              <label>模拟付款方式</label><n-select v-model:value="payMethod" :options="['微信支付','支付宝','现金','银行卡'].map(x=>({label:x,value:x}))" size="large"/>
              <div class="cashier-totals"><div><span>消费金额</span><strong>¥{{fmt(Number(payAmount)||0)}}</strong></div><div><span>优惠券抵扣</span><strong>-¥{{fmt(payDiscount)}}</strong></div><div><b>模拟实付</b><strong>¥{{fmt(Math.max(0,(Number(payAmount)||0)-payDiscount))}}</strong></div></div>
              <n-button type="primary" block size="large" @click="doCashierPayment"><CheckCircle2 :size="16"/> 确认线下模拟支付</n-button>
            </section>
            <section class="backoffice-panel redemption-guide"><div class="panel-title-row"><div><h2>线上与线下双支付路径</h2><p>区分预订订单与门店真实消费场景</p></div></div>
              <div v-for="(label,i) in ['线上预订：游客选择套餐或酒店 → 模拟支付 → 生成待核销订单','线下消费：游客到店 → 商户选择 → 输入消费金额','游客出示活动票根兑换的优惠券码，可选抵扣','系统判断券种、有效期、门槛、门店业态，成功后标记已使用','产生线下交易记录；统一后台管理、统计及对账']" :key="label" class="redeem-guide-step"><span>{{i+1}}</span><p>{{label}}</p></div>
              <div class="redeem-warning"><CircleAlert :size="17"/><span>当前全部为本地前端演示。真实线下扫码收款、支付通知、财务分账与券防伪均未接入，不可代替收银系统。</span></div>
            </section>
          </div>
          <section class="backoffice-panel redemption-table"><div class="panel-title-row"><div><h2>线下支付交易流水</h2><p>支付渠道、订单金额、优惠金额、商户与结果</p></div></div><n-data-table :columns="offlinePaymentCols" :data="state.offlineTransactions" :pagination="{pageSize:8}" :bordered="false" :scroll-x="1050"/></section>
        </template>

        <template v-else-if="active==='redeem'">
          <div class="redemption-metrics">
            <div><span>实际演示领券数</span><strong>{{state.couponInstances.length}}</strong></div>
            <div><span>待线下核销</span><strong>{{state.couponInstances.filter(x=>x.status==='未使用').length}}</strong></div>
            <div><span>已核销消费券</span><strong>{{state.couponInstances.filter(x=>x.status==='已核销').length}}</strong></div>
          </div>
          <div class="redemption-grid">
            <section class="backoffice-panel redemption-panel">
              <div class="panel-title-row"><div><h2><QrCode :size="19"/> 线下门店验券</h2><p>游客出示手机 H5 券码，平台员工代门店验证、核销</p></div><n-tag type="warning" round>本地演示</n-tag></div>
              <label>游客核销码</label>
              <n-input v-model:value="redeemCode" size="large" placeholder="例如 BHxxxxxxxxxxxx" clearable @keyup.enter="runOfflineRedeem"/>
              <label>核销商户</label>
              <n-select v-model:value="redeemMerchant" :options="redeemMerchantOptions" size="large" placeholder="请选择线下合作门店"/>
              <div v-if="voucherPreview" class="redeem-preview">
                <div><strong>{{state.coupons.find(c=>c.id===voucherPreview.couponId)?.title}}</strong><n-tag size="small" :type="voucherPreview.status==='未使用'?'warning':'success'">{{voucherPreview.status}}</n-tag></div>
                <span>持票人：{{voucherPreview.holder}} · 票根：{{voucherPreview.ticketCode}}</span>
                <small>适用：{{state.coupons.find(c=>c.id===voucherPreview.couponId)?.category}} · 截止：{{voucherPreview.expiresAt}}</small>
              </div>
              <n-button type="primary" block size="large" style="margin-top:18px" @click="runOfflineRedeem"><CheckCircle2 :size="16"/> 核验并模拟核销</n-button>
            </section>
            <section class="backoffice-panel redemption-guide"><div class="panel-title-row"><div><h2>线下消费闭环</h2><p>面向平台代运营人员的操作说明</p></div></div>
              <div v-for="(item,i) in ['游客提供北海本地演出、赛事或文旅票根完成核验','游客领取对应活动消费券，获得唯一核销码','游客到参与活动的线下合作商户消费并出示券码','后台选择商户并输入券码，校验券种、状态和业态后核销','核销状态同步到同浏览器游客券包，留存时间、门店和日志']" :key="item" class="redeem-guide-step"><span>{{i+1}}</span><p>{{item}}</p></div>
              <div class="redeem-warning"><CircleAlert :size="17"/><span>纯前端演示：无法跨设备实时同步或真实防伪，不可用于真实商户线下收券。上线前须接入可信后端、票务验证、数据库事务与核销鉴权。</span></div>
            </section>
          </div>
          <section class="backoffice-panel redemption-table"><div class="panel-title-row"><div><h2>消费券领取与核销流水</h2><p>记录券码、票根、领取时间和线下核销门店</p></div><n-input v-model:value="redeemSearch" placeholder="搜索券码 / 持票人" clearable style="width:240px"/></div><n-data-table :columns="voucherCols" :data="vouchers" :pagination="{pageSize:8}" :bordered="false" :scroll-x="1150"/></section>
        </template>

        <template v-else-if="active==='settlement'">
          <div class="backoffice-metrics finance-metrics"><article v-for="m in [{label:'示例交易金额',value:'¥328,560',icon:CreditCard},{label:'商户应收金额',value:'¥295,704',icon:Store},{label:'平台服务费',value:'¥32,856',icon:Wallet},{label:'对账成功率',value:'99.99%',icon:CheckCircle2}]" :key="m.label" class="backoffice-metric"><div class="metric-top">{{m.label}}<component :is="m.icon" :size="20"/></div><strong>{{m.value}}</strong><div class="metric-foot">模拟清分与对账数据</div></article></div>
          <div class="settlement-flow"><div><CreditCard :size="25"/><small>消费者支付</small><strong>¥100.00</strong></div><ArrowRight :size="22"/><div><Zap :size="25"/><small>规则清分</small><strong>按 10% 分账</strong></div><ArrowRight :size="22"/><div><Wallet :size="25"/><small>平台服务费</small><strong>¥10.00</strong></div><ArrowRight :size="22"/><div><Store :size="25"/><small>商户应收</small><strong>¥90.00</strong></div></div>
          <section class="backoffice-panel redemption-table"><div class="panel-title-row"><div><h2>近期线下模拟收款</h2><p>与门店收银台共用当前浏览器模拟交易数据</p></div></div><n-data-table :columns="offlinePaymentCols" :data="state.offlineTransactions" :pagination="{pageSize:6}" :bordered="false" :scroll-x="1000"/></section>
          <section class="backoffice-panel"><div class="panel-title-row"><div><h2>模拟支付清分流水</h2><p>演示按交易额 10% 平台服务费计算，非真实支付结算</p></div><n-tag type="warning" round>沙箱模拟</n-tag></div><n-data-table :columns="settlementCols" :data="settlementRows" :bordered="false" :scroll-x="830"/></section>
        </template>

        <template v-else-if="active==='settings'">
          <div class="settings-layout"><section class="backoffice-panel"><div class="panel-title-row"><div><h2>基础信息配置</h2><p>演示环境设置将保存在当前浏览器中</p></div><Settings2 :size="20" color="#7191bd"/></div><div class="form-line"><label>平台展示名称</label><n-input v-model:value="state.settings.siteName" placeholder="请输入平台名称"/></div><div class="form-line"><label>游客端宣传语</label><n-input v-model:value="state.settings.platformNotice" placeholder="请输入宣传语"/></div><n-button type="primary" @click="message.success('配置已保存至本地浏览器')">保存设置</n-button></section><section class="backoffice-panel"><div class="panel-title-row"><div><h2>业务开关</h2><p>用于体验后台参数对游客端的影响</p></div></div><div class="setting-switch"><div><strong>票根核验功能</strong><small>控制游客端能否模拟验证票根</small></div><n-switch v-model:value="state.settings.ticketCheckEnabled"/></div><div class="setting-switch"><div><strong>票根权益领取</strong><small>控制游客端能否领取优惠券</small></div><n-switch v-model:value="state.settings.consumerCouponEnabled"/></div><div class="setting-switch"><div><strong>维护模式</strong><small>仅供后台展示，不会自动限制页面访问</small></div><n-switch v-model:value="state.settings.maintenance"/></div></section></div><div class="backoffice-callout"><RefreshCcw :size="21"/><div><strong>恢复演示初始数据</strong><p>重置后会清空当前浏览器内创建的订单、活动、商户及领取记录，恢复预设数据。</p></div><n-button tertiary type="warning" @click="reset">重置 Demo</n-button></div>
        </template>
      </div>
    </main>
    <n-modal :show="!!modal" @update:show="v=>{if(!v)closeModal()}" preset="card" :title="modal==='merchant'?'添加合作商户':modal==='campaign'?'新建票根活动':modal==='coupon'?'新增营销优惠券':'添加后台员工'" style="max-width:520px" :bordered="false" class="backoffice-modal">
      <div v-if="modal==='merchant'" class="modal-fields"><label>商户名称 <em>*</em></label><n-input v-model:value="merchantForm.name" placeholder="例如：北海银滩海景咖啡馆"/><label>经营业态</label><n-select v-model:value="merchantForm.category" :options="merchantCategories.map(v=>({label:v,value:v}))"/><label>负责人 <em>*</em></label><n-input v-model:value="merchantForm.contact" placeholder="请输入负责人姓名"/><label>联系电话 <em>*</em></label><n-input v-model:value="merchantForm.phone" placeholder="11位手机号码" maxlength="11"/></div>
      <div v-else-if="modal==='campaign'" class="modal-fields"><label>活动名称 <em>*</em></label><n-input v-model:value="campaignForm.title" placeholder="请输入活动名称"/><label>活动类型</label><n-select v-model:value="campaignForm.tag" :options="['演艺活动','体育赛事','文旅活动','城市营销'].map(v=>({label:v,value:v}))"/><label>活动说明（游客端显示）</label><n-input v-model:value="campaignForm.subtitle" placeholder="例如：票根换礼遇，线下门店畅享"/><label>活动角标</label><n-input v-model:value="campaignForm.badge" placeholder="例如：城市福利"/><label>活动 Banner 图片地址</label><n-input v-model:value="campaignForm.image" placeholder="https://..."/><label>活动周期</label><n-input v-model:value="campaignForm.date"/></div>
      <div v-else-if="modal==='coupon'" class="modal-fields"><label>优惠券名称 <em>*</em></label><n-input v-model:value="couponForm.title" placeholder="例如：银滩玩乐立减券"/><label>优惠金额 (元)</label><n-input-number v-model:value="couponForm.amount" :min="1" :precision="0" style="width:100%"/><label>满减门槛 (元)</label><n-input-number v-model:value="couponForm.threshold" :min="1" :precision="0" style="width:100%"/><label>适用业态</label><n-select v-model:value="couponForm.category" :options="couponCategories.map(v=>({label:v,value:v}))"/><label>归属平台活动</label><n-select v-model:value="couponForm.campaignId" :options="state.campaigns.map(a=>({label:a.title,value:a.id}))"/><label>使用有效期截止</label><n-input v-model:value="couponForm.expiresAt" placeholder="YYYY-MM-DD"/></div>
      <div v-else-if="modal==='staff'" class="modal-fields"><label>员工姓名 <em>*</em></label><n-input v-model:value="staffForm.name" placeholder="请输入员工姓名"/><label>员工角色</label><n-select v-model:value="staffForm.role" :options="['运营专员','运营主管','系统管理员','财务人员'].map(v=>({label:v,value:v}))"/><label>所属部门</label><n-input v-model:value="staffForm.department" placeholder="所属部门"/></div>
      <template #footer><div class="modal-footer"><n-button @click="closeModal">取消</n-button><n-button type="primary" @click="saveModal">保存并创建</n-button></div></template>
    </n-modal>
  </div>
</template>
