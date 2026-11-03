import { reactive, watch } from 'vue'

const STORAGE_KEY = 'bhappdemo-v2'
const initial = {
  ticketVerified: false,
  verifiedTicket: null,
  ticketVerifications: [],
  couponInstances: [],
  claimedCoupons: [],
  usedCoupons: [],
  orders: [],
  merchants: [
    { id: 'M001', name: '北海银滩海景酒店', category: '酒店住宿', contact: '陈经理', phone: '13800001001', status: '正常', created: '2026-10-22', orders: 684, revenue: 96230 },
    { id: 'M002', name: '海岸海鲜风味餐厅', category: '特色餐饮', contact: '许店长', phone: '13800001002', status: '正常', created: '2026-10-23', orders: 386, revenue: 68490 },
    { id: 'M003', name: '北海老街文化体验馆', category: '景区玩乐', contact: '周经理', phone: '13800001003', status: '正常', created: '2026-10-25', orders: 257, revenue: 42160 },
    { id: 'M004', name: '银滩海上运动中心', category: '景区玩乐', contact: '林店长', phone: '13800001004', status: '正常', created: '2026-10-26', orders: 189, revenue: 31860 },
    { id: 'M005', name: '北海滨海度假酒店', category: '酒店住宿', contact: '黄经理', phone: '13800001005', status: '停用', created: '2026-10-27', orders: 512, revenue: 83190 }
  ],
  campaigns: [
    {"id":"A001","title":"北海演唱会票根消费季","subtitle":"凭北海演出票根，领取城市消费福利","tag":"演艺活动","badge":"城市狂欢","theme":"coral","image":"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=85","status":"进行中","date":"2026-11-01 至 2026-12-20","sort":1,"claims":3860,"redeemed":2210},
    {"id":"A002","title":"银滩活力运动嘉年华","subtitle":"凭赛事票根，解锁阳光海岸好礼","tag":"体育赛事","badge":"银滩专享","theme":"ocean","image":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=85","status":"进行中","date":"2026-11-03 至 2026-12-18","sort":2,"claims":2126,"redeemed":1580},
    {"id":"A003","title":"浪漫北海文旅消费季","subtitle":"从酒店到海鲜，到处都有好礼","tag":"文旅活动","badge":"文旅好礼","theme":"teal","image":"https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1000&q=85","status":"进行中","date":"2026-11-04 至 2026-12-28","sort":3,"claims":1785,"redeemed":1206},
    {"id":"A004","title":"冬日北海优享计划","subtitle":"海边度假，轻松领券","tag":"城市营销","badge":"即将开启","theme":"violet","image":"https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1000&q=85","status":"草稿","date":"2026-11-15 至 2026-12-31","sort":4,"claims":0,"redeemed":0}
  ],
  coupons: [
    { id: 'C001', title: '酒店住宿立减券', amount: 50, threshold: 300, category: '住宿', campaignId: 'A001', expiresAt: '2026-12-31', issued: 5680, redeemed: 3220, status: '投放中' },
    { id: 'C002', title: '海鲜美食立减券', amount: 30, threshold: 150, category: '美食', campaignId: 'A003', expiresAt: '2026-12-31', issued: 4260, redeemed: 2790, status: '投放中' },
    { id: 'C003', title: '滨海玩乐立减券', amount: 20, threshold: 100, category: '玩乐', campaignId: 'A002', expiresAt: '2026-12-31', issued: 3200, redeemed: 1820, status: '投放中' }
  ],
  staff: [
    { id: 'U001', name: '张运营', role: '运营专员', department: '平台运营部', status: '启用' },
    { id: 'U002', name: '李主管', role: '运营主管', department: '平台运营部', status: '启用' },
    { id: 'U003', name: '王管理员', role: '系统管理员', department: '信息技术部', status: '启用' }
  ],
  audit: [
    { id: 'L001', time: '2026-11-03 09:40', user: '系统管理员', action: '商户资质审核', detail: '审核通过：北海银滩海景酒店' },
    { id: 'L002', time: '2026-11-03 09:16', user: '张运营', action: '活动配置', detail: '更新北海海风音乐季活动规则' },
    { id: 'L003', time: '2026-11-03 08:32', user: '系统任务', action: '对账任务', detail: '生成昨日交易对账报表' }
  ],
  settings: { siteName: '北海城投 · 票根生活', platformNotice: '用一张票根，开启北海精彩生活', ticketCheckEnabled: true, consumerCouponEnabled: true, maintenance: false }
}

let saved = {}
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch (_) {}
const clone = (obj) => JSON.parse(JSON.stringify(obj))
export const state = reactive(Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, saved[k] === undefined ? clone(v) : saved[k]])))

watch(state, () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) {}
}, { deep: true })

// Share demo edits across tabs on the same origin; different devices do not share localStorage.
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  try { const incoming = JSON.parse(e.newValue); for (const key of Object.keys(initial)) if (incoming[key] !== undefined) state[key] = incoming[key] } catch (_) {}
})
// Add new presentation fields when opening older saved demos.
for (const a of state.campaigns) {
  const sample = initial.campaigns.find(x=>x.id===a.id)
  if (sample) for (const key of ['subtitle','badge','theme','image','sort']) if (a[key]===undefined) a[key]=sample[key]
}
for (const c of state.coupons) {
  const sample = initial.coupons.find(x=>x.id===c.id)
  if (sample) for (const key of ['campaignId','expiresAt']) if (c[key]===undefined) c[key]=sample[key]
}
const stamp = () => new Date().toLocaleString('zh-CN', { hour12: false })
const uid = (prefix) => prefix + Date.now().toString().slice(-9)
const money = (n) => Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const products = [
  { id: 'P001', name: '北海银滩海景酒店 · 雅致大床房', merchant: '北海银滩海景酒店', type: '住宿', price: 399, original: 499, rating: 4.9, distance: '银滩商圈', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=84' },
  { id: 'P002', name: '海岸海鲜风味双人套餐', merchant: '海岸海鲜风味餐厅', type: '美食', price: 168, original: 238, rating: 4.8, distance: '海景大道', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&q=84' },
  { id: 'P003', name: '北海老街文化体验通票', merchant: '北海老街文化体验馆', type: '玩乐', price: 128, original: 180, rating: 4.8, distance: '海城区', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=84' },
  { id: 'P004', name: '银滩海上运动双人体验', merchant: '银滩海上运动中心', type: '玩乐', price: 228, original: 328, rating: 4.9, distance: '银滩景区', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=84' }
]

// Local demo allowlist only. Real ticket verification needs upstream ticket-system checks.
const demoTickets = {
  BH2026: { event:'北海城市活动通用票',type:'城市活动',city:'广西北海' },
  BHMUSIC2026: { event:'北海海风音乐季',type:'演出',city:'广西北海' },
  BHSPORT2026: { event:'银滩活力运动嘉年华',type:'赛事',city:'广西北海' },
  BHSCENIC2026: { event:'北海文化旅游体验',type:'文旅',city:'广西北海' }
}
export const availableTicketCodes = Object.keys(demoTickets)
function newRedeemCode() {
  let code
  do {
    const v = typeof crypto !== 'undefined' && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(6)), b=>b.toString(16).padStart(2,'0')).join('').toUpperCase()
      : Math.random().toString(36).slice(2,14).toUpperCase()
    code='BH'+v.slice(0,12)
  } while(state.couponInstances.some(x=>x.code===code))
  return code
}
export function verifyTicket(code, person) {
  if (!state.settings.ticketCheckEnabled) return {ok:false,message:'当前未开放票根核验'}
  if (!person?.trim()) return {ok:false,message:'请填写持票人姓名'}
  const normalized=String(code||'').trim().replace(/[\s-]+/g,'').toUpperCase()
  const ticket=demoTickets[normalized]
  state.ticketVerifications.unshift({id:uid('TV'),code:normalized,holder:person.trim(),event:ticket?.event||'未识别',result:ticket?'通过':'拒绝',time:stamp()})
  if (!ticket) return {ok:false,message:'仅支持北海本地演示票根（例如 BH2026）'}
  state.ticketVerified=true
  state.verifiedTicket={code:normalized,holder:person.trim(),...ticket,verifiedAt:stamp()}
  logAudit('演示游客','票根核验',ticket.event+' / '+normalized)
  return {ok:true,message:'北海本地票根核验成功，可以领取消费券',ticket:state.verifiedTicket}
}
export function claimCoupon(id) {
  if (!state.ticketVerified) return {ok:false,message:'请先核验北海本地票根'}
  if (!state.settings.consumerCouponEnabled) return {ok:false,message:'当前未开放领券功能'}
  const coupon=state.coupons.find(c=>c.id===id)
  if (!coupon||coupon.status!=='投放中') return {ok:false,message:'该消费券暂未开放领取'}
  if (coupon.expiresAt&&new Date(coupon.expiresAt+'T23:59:59').getTime()<Date.now()) return {ok:false,message:'该消费券已过期'}
  if (state.claimedCoupons.includes(id)) return {ok:false,message:'当前票根已领取过这张消费券'}
  const instance={id:uid('VC'),couponId:id,ticketCode:state.verifiedTicket?.code||'BH2026',holder:state.verifiedTicket?.holder||'演示游客',code:newRedeemCode(),status:'未使用',claimedAt:stamp(),expiresAt:coupon.expiresAt||'2026-12-31',merchantId:null,merchantName:null,redeemedAt:null,redeemChannel:null}
  state.couponInstances.unshift(instance)
  state.claimedCoupons.push(id)
  coupon.issued=(coupon.issued||0)+1
  const a=state.campaigns.find(x=>x.id===coupon.campaignId)
  if(a)a.claims=(a.claims||0)+1
  logAudit('演示游客','消费券领取',coupon.title+' / '+instance.code)
  return {ok:true,message:'领取成功！到线下合作商户出示券码',instance}
}
export function redeemOffline(raw, merchantId) {
  const code=String(raw||'').trim().replace(/\s+/g,'').toUpperCase()
  const instance=state.couponInstances.find(i=>i.code===code)
  if(!instance)return {ok:false,message:'未找到该券码，请检查'}
  if(instance.status!=='未使用')return {ok:false,message:'消费券已使用，不可重复核销'}
  const coupon=state.coupons.find(c=>c.id===instance.couponId)
  if(!coupon||coupon.status!=='投放中')return {ok:false,message:'券种不存在或当前停止使用'}
  if(instance.expiresAt&&new Date(instance.expiresAt+'T23:59:59').getTime()<Date.now())return {ok:false,message:'消费券已过期'}
  const merchant=state.merchants.find(m=>m.id===merchantId)
  if(!merchant||merchant.status!=='正常')return {ok:false,message:'请选择正常营业的合作商户'}
  const expected={住宿:'酒店住宿',美食:'特色餐饮',玩乐:'景区玩乐'}[coupon.category]
  if(expected&&merchant.category!==expected)return {ok:false,message:'该商户经营业态不支持此消费券'}
  instance.status='已核销';instance.redeemedAt=stamp();instance.merchantId=merchant.id;instance.merchantName=merchant.name;instance.redeemChannel='线下核销'
  coupon.redeemed=(coupon.redeemed||0)+1
  const a=state.campaigns.find(x=>x.id===coupon.campaignId)
  if(a)a.redeemed=(a.redeemed||0)+1
  logAudit('平台核销人员','线下消费券核销',coupon.title+' / '+instance.code+' / '+merchant.name)
  return {ok:true,message:'核销成功，优惠 ¥'+coupon.amount+'，商户：'+merchant.name,instance}
}
export function purchase(product, couponId) {
  const inst=state.couponInstances.find(i=>i.couponId===couponId&&i.status==='未使用')
  const coupon=inst&&state.coupons.find(c=>c.id===couponId&&c.status==='投放中'&&c.category===product.type&&product.price>=c.threshold)
  const amount=Math.max(0,product.price-(coupon?.amount||0))
  if(coupon){inst.status='已核销';inst.redeemedAt=stamp();inst.redeemChannel='线上模拟下单';inst.merchantName=product.merchant;state.usedCoupons.push(coupon.id);coupon.redeemed=(coupon.redeemed||0)+1}
  const order={id:uid('OD'),product:product.name,merchant:product.merchant,original:product.price,discount:coupon?.amount||0,amount,status:'待核销',time:stamp()}
  state.orders.unshift(order)
  logAudit('演示游客','模拟支付','下单 '+product.name+'，金额 ¥'+money(amount))
  return order
}
export function addMerchant(input) {
  const merchant = { ...input, id: uid('M'), status: '正常', created: new Date().toLocaleDateString('zh-CN'), orders: 0, revenue: 0 }
  state.merchants.unshift(merchant)
  logAudit('系统管理员', '商户新增', merchant.name)
}
export function setMerchantStatus(id, status) {
  const merchant = state.merchants.find(m => m.id === id)
  if (merchant) { merchant.status = status; logAudit('系统管理员', '商户状态变更', merchant.name + ' → ' + status) }
}
export function addCampaign(input) {
  state.campaigns.unshift({ id: uid('A'), subtitle:'北海城市票根礼遇', theme:'ocean', image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=85',badge:'新活动',sort:state.campaigns.length+1, ...input, claims: 0, redeemed: 0, status: '进行中' })
  logAudit('运营专员', '活动新增', input.title)
}
export function updateCampaignStatus(id, status) {
  const a=state.campaigns.find(x=>x.id===id)
  if(!a)return
  a.status=status
  logAudit('运营专员','活动状态更新',a.title+' → '+status)
}
export function addCoupon(input) {
  state.coupons.unshift({ id: uid('C'), ...input, issued: 0, redeemed: 0, status: '投放中' })
  logAudit('运营专员', '权益新增', input.title)
}
export function updateOrderStatus(id, status) {
  const order = state.orders.find(o => o.id === id)
  if (order) { order.status = status; logAudit('运营专员', '订单处理', id + ' → ' + status) }
}
export function addStaff(input) {
  state.staff.unshift({ ...input, id: uid('U'), status: '启用' })
  logAudit('系统管理员', '人员新增', input.name + ' / ' + input.role)
}
export function logAudit(user, action, detail) {
  state.audit.unshift({ id: uid('L'), time: stamp(), user, action, detail })
  state.audit = state.audit.slice(0, 60)
}
export function resetDemo() {
  for (const [k, v] of Object.entries(initial)) state[k] = clone(v)
}
export const fmt = money
