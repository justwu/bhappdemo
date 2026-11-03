import { reactive, watch } from 'vue'

const STORAGE_KEY = 'bhappdemo-v2'
const initial = {
  ticketVerified: false,
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
    { id: 'A001', title: '北海海风音乐季', tag: '演艺活动', status: '进行中', date: '2026-11-01 至 2026-12-20', claims: 3860, redeemed: 2210 },
    { id: 'A002', title: '银滩活力运动嘉年华', tag: '体育赛事', status: '进行中', date: '2026-11-03 至 2026-12-18', claims: 2126, redeemed: 1580 },
    { id: 'A003', title: '海丝文化体验周', tag: '文旅活动', status: '进行中', date: '2026-11-04 至 2026-12-28', claims: 1785, redeemed: 1206 },
    { id: 'A004', title: '秋冬文旅消费节', tag: '城市营销', status: '草稿', date: '2026-11-15 至 2026-12-31', claims: 0, redeemed: 0 }
  ],
  coupons: [
    { id: 'C001', title: '酒店住宿立减券', amount: 50, threshold: 300, category: '住宿', issued: 5680, redeemed: 3220, status: '投放中' },
    { id: 'C002', title: '海鲜美食立减券', amount: 30, threshold: 150, category: '美食', issued: 4260, redeemed: 2790, status: '投放中' },
    { id: 'C003', title: '滨海玩乐立减券', amount: 20, threshold: 100, category: '玩乐', issued: 3200, redeemed: 1820, status: '投放中' }
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

const stamp = () => new Date().toLocaleString('zh-CN', { hour12: false })
const uid = (prefix) => prefix + Date.now().toString().slice(-9)
const money = (n) => Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const products = [
  { id: 'P001', name: '北海银滩海景酒店 · 雅致大床房', merchant: '北海银滩海景酒店', type: '住宿', price: 399, original: 499, rating: 4.9, distance: '银滩商圈', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=84' },
  { id: 'P002', name: '海岸海鲜风味双人套餐', merchant: '海岸海鲜风味餐厅', type: '美食', price: 168, original: 238, rating: 4.8, distance: '海景大道', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&q=84' },
  { id: 'P003', name: '北海老街文化体验通票', merchant: '北海老街文化体验馆', type: '玩乐', price: 128, original: 180, rating: 4.8, distance: '海城区', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=84' },
  { id: 'P004', name: '银滩海上运动双人体验', merchant: '银滩海上运动中心', type: '玩乐', price: 228, original: 328, rating: 4.9, distance: '银滩景区', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=84' }
]

export function verifyTicket(code, person) {
  if (!state.settings.ticketCheckEnabled) return { ok: false, message: '当前未开放票根核验' }
  if (!person?.trim()) return { ok: false, message: '请填写持票人姓名' }
  if (String(code).trim().toUpperCase() !== 'BH2026') return { ok: false, message: '演示票根编号为 BH2026' }
  state.ticketVerified = true
  logAudit('演示游客', '票根核验', '模拟票根核验成功')
  return { ok: true, message: '票根核验成功，可领取专属权益' }
}
export function claimCoupon(id) {
  if (!state.ticketVerified) return { ok: false, message: '请先核验票根' }
  if (!state.settings.consumerCouponEnabled) return { ok: false, message: '当前未开放领券功能' }
  if (state.claimedCoupons.includes(id)) return { ok: false, message: '你已领取该优惠券' }
  state.claimedCoupons.push(id)
  return { ok: true, message: '领取成功！可在下单时使用' }
}
export function purchase(product, couponId) {
  const coupon = state.coupons.find(c => c.id === couponId && state.claimedCoupons.includes(c.id) && !state.usedCoupons.includes(c.id) && c.status === '投放中' && c.category === product.type && product.price >= c.threshold)
  if (coupon) state.usedCoupons.push(coupon.id)
  const amount = Math.max(0, product.price - (coupon?.amount || 0))
  const order = { id: uid('OD'), product: product.name, merchant: product.merchant, original: product.price, discount: coupon?.amount || 0, amount, status: '待核销', time: stamp() }
  state.orders.unshift(order)
  logAudit('演示游客', '模拟支付', '下单 ' + product.name + '，金额 ¥' + money(amount))
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
  state.campaigns.unshift({ id: uid('A'), ...input, claims: 0, redeemed: 0, status: '进行中' })
  logAudit('运营专员', '活动新增', input.title)
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
