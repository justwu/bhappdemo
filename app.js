/* 北海城投票根经济 UI Demo — Vue 3, no backend / no real payment */
(function () {
  'use strict';
  if (!window.Vue) {
    document.getElementById('app').innerHTML = '<div style="padding:64px;text-align:center;font-family:sans-serif"><h2>Vue 3 资源加载失败</h2><p>请检查网络是否可以访问 cdn.jsdelivr.net。</p></div>';
    return;
  }
  var Vue = window.Vue;
  var storageKey = 'beihai-ticket-demo-v1';
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (e) { saved = {}; }
  var initialCampaigns = [
    { id: 1, title: '北海海风音乐季', type: '演出活动', date: '2026-11-01 至 2026-12-20', claims: '3,860', used: '2,210' },
    { id: 2, title: '银滩活力运动嘉年华', type: '体育赛事', date: '2026-11-03 至 2026-12-18', claims: '2,126', used: '1,580' },
    { id: 3, title: '海丝文化体验周', type: '文旅活动', date: '2026-11-04 至 2026-12-28', claims: '1,785', used: '1,206' },
    { id: 4, title: '北海秋冬文旅消费节', type: '文旅活动', date: '2026-11-01 至 2026-12-31', claims: '3,089', used: '2,185' }
  ];
  var tx = [
    {id:'BH202611030001',merchant:'北海银滩海景酒店',type:'酒店住宿',amount:399,status:'已结算'},
    {id:'BH202611030002',merchant:'海岸海鲜大排档',type:'特色餐饮',amount:168,status:'已结算'},
    {id:'BH202611030003',merchant:'北海老街商旅',type:'景区游览',amount:88,status:'已结算'},
    {id:'BH202611030004',merchant:'北海滨海度假酒店',type:'酒店住宿',amount:588,status:'已结算'},
    {id:'BH202611030005',merchant:'银滩海上乐园',type:'文旅玩乐',amount:129,status:'待结算'}
  ];
  Vue.createApp({
    data: function () { return {
      role: 'consumer', consumerTab: 'home', workspaceTab: 'overview',
      roles: [
        { id:'consumer', icon:'◉', label:'游客 / 消费者' },
        { id:'merchant', icon:'▣', label:'商户经营' },
        { id:'operations', icon:'▤', label:'平台运营' },
        { id:'finance', icon:'▥', label:'支付清分' },
        { id:'cockpit', icon:'◈', label:'领导驾驶舱' }
      ],
      consumerNav: [
        { id:'home', icon:'⌂', label:'首页' },
        { id:'coupons', icon:'🎟', label:'优惠券' },
        { id:'life', icon:'▦', label:'本地生活' },
        { id:'orders', icon:'▤', label:'订单' },
        { id:'profile', icon:'◉', label:'我的' }
      ],
      categories: [
        {name:'票根权益',icon:'🎟',bg:'#fbe3f0',filter:'全部'},
        {name:'酒店住宿',icon:'🏨',bg:'#e0efff',filter:'住宿'},
        {name:'特色餐饮',icon:'🦐',bg:'#fff0df',filter:'美食'},
        {name:'景区门票',icon:'🌴',bg:'#daf8ed',filter:'景区'},
        {name:'海鲜美食',icon:'🍤',bg:'#fbe8da',filter:'美食'},
        {name:'海上玩乐',icon:'⛵',bg:'#e8f0ff',filter:'玩乐'},
        {name:'停车出行',icon:'🚙',bg:'#e6f4ff',filter:'全部'},
        {name:'更多服务',icon:'✦',bg:'#eeeafe',filter:'全部'}
      ],
      products: [
        {id:1,name:'北海银滩海景酒店',category:'住宿',subtitle:'银滩商圈 · 尊享海景房',rating:'4.9',price:399,original:499,image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=82'},
        {id:2,name:'海岸海鲜风味双人餐',category:'美食',subtitle:'银滩附近 · 人气海鲜套餐',rating:'4.8',price:168,original:228,image:'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=82'},
        {id:3,name:'北海老街文化漫游券',category:'景区',subtitle:'海城区 · 老街文化体验',rating:'4.8',price:40,original:60,image:'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=82'},
        {id:4,name:'银滩海上休闲体验',category:'玩乐',subtitle:'银海区 · 海滨户外玩乐',rating:'4.9',price:129,original:199,image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=82'},
        {id:5,name:'北海滨海度假酒店',category:'住宿',subtitle:'海滨度假 · 早餐双人份',rating:'4.9',price:588,original:688,image:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=82'},
        {id:6,name:'海景餐厅特色风味套餐',category:'美食',subtitle:'临海美食 · 双人精选套餐',rating:'4.7',price:98,original:158,image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=82'}
      ],
      coupons: [
        {id:1,title:'住宿专属优惠券',amount:50,threshold:300,scope:'北海合作酒店可用'},
        {id:2,title:'餐饮美食优惠券',amount:30,threshold:150,scope:'精选餐饮商家可用'},
        {id:3,title:'景区乐享优惠券',amount:20,threshold:100,scope:'景区与玩乐项目可用'}
      ],
      ticketCode:'BH2026', ticketName:'演示游客', verified:!!saved.verified,
      claimedIds: Array.isArray(saved.claimedIds) ? saved.claimedIds : [],
      usedCouponIds: Array.isArray(saved.usedCouponIds) ? saved.usedCouponIds : [],
      orders: Array.isArray(saved.orders) ? saved.orders : [],
      campaigns: Array.isArray(saved.campaigns) && saved.campaigns.length ? saved.campaigns : initialCampaigns,
      lifeCategory:'全部', modalProduct:null, selectedCoupon:'0',
      eventModal:false, newEventTitle:'', newEventType:'演出活动',
      redeemCode:'BH-8899', redeemed:false, settleMode:'all', toast:'', toastTimer:null,
      merchants: [
        {name:'北海银滩海景酒店',category:'住宿',orders:684,revenue:'96,230'},
        {name:'海岸海鲜大排档',category:'餐饮',orders:386,revenue:'68,490'},
        {name:'北海老街商旅',category:'文旅',orders:257,revenue:'42,160'},
        {name:'银滩海上乐园',category:'玩乐',orders:189,revenue:'31,860'},
        {name:'北海滨海度假酒店',category:'住宿',orders:512,revenue:'83,190'}
      ],
      channelShares: [
        {name:'酒店住宿',share:34.2,color:'#327cf7'},
        {name:'特色餐饮',share:26.1,color:'#7b62eb'},
        {name:'景区玩乐',share:14.8,color:'#29b5ce'},
        {name:'商超零售',share:12.6,color:'#f29f54'},
        {name:'停车出行',share:7.3,color:'#44c59c'},
        {name:'其他业态',share:5,color:'#d0d8ee'}
      ],
      transactionRows:tx,
      opsMetrics:[
        {icon:'↗',label:'平台交易额',value:'¥3,286,560',change:'26.4%'},
        {icon:'◉',label:'票根核验次数',value:'45,620',change:'19.7%'},
        {icon:'🎟',label:'权益领取量',value:'18,436',change:'31.2%'},
        {icon:'♟',label:'活跃会员',value:'128,960',change:'14.5%'}
      ],
      merchantMetrics:[
        {label:'今日订单',value:'86',change:'12% vs 昨日'},
        {label:'今日收入',value:'¥9,860',change:'18% vs 昨日'},
        {label:'核销券数',value:'56',change:'9% vs 昨日'},
        {label:'本月营收',value:'¥96,230',change:'15% vs 上月'}
      ],
      financeMetrics:[
        {label:'今日交易金额',value:'¥328,560',change:'已支付交易'},
        {label:'应分账金额',value:'¥295,704',change:'商户应收'},
        {label:'平台服务费',value:'¥32,856',change:'演示费率 10%'},
        {label:'结算商户',value:'128',change:'示例商户数量'}
      ],
      cockpitMetrics:[
        {label:'累计消费总额',value:'3,286.56',unit:'万元'},
        {label:'带动商户营收',value:'2,953.70',unit:'万元'},
        {label:'核验票根',value:'45,620',unit:'张'},
        {label:'参与商户',value:'1,286',unit:'家'},
        {label:'交易订单',value:'356,820',unit:'笔'}
      ]
    }; },
    computed: {
      workspaceMenus: function () {
        if (this.role==='operations') return [
          {id:'overview',icon:'▦',label:'运营总览'},
          {id:'campaigns',icon:'▤',label:'票根活动'},
          {id:'coupons',icon:'🎟',label:'权益营销'},
          {id:'merchants',icon:'▣',label:'商户管理'},
          {id:'orders',icon:'▤',label:'订单管理'},
          {id:'analytics',icon:'◫',label:'数据分析'}
        ];
        if (this.role==='merchant') return [{id:'overview',icon:'▦',label:'门店总览'},{id:'verify',icon:'🎟',label:'优惠核销',badge:'演示'},{id:'orders',icon:'▤',label:'订单管理'}];
        return [{id:'overview',icon:'▦',label:'支付清分总览'},{id:'settle',icon:'◫',label:'分账明细'},{id:'risk',icon:'◈',label:'风险与对账'}];
      },
      currentWorkspaceTitle: function () {
        if (this.role==='merchant') return this.workspaceTab==='verify'?'优惠券核销':'商户经营总览';
        if (this.role==='finance') return this.workspaceTab==='settle'?'清分分账明细':this.workspaceTab==='risk'?'支付风控与对账':'智慧支付 · 清分分账';
        var titles={overview:'运营总览',campaigns:'票根活动管理',coupons:'权益营销中心',merchants:'商户生态管理',orders:'交易订单管理',analytics:'经营数据分析'};
        return titles[this.workspaceTab] || '运营总览';
      },
      filteredProducts: function () { var that=this; return this.products.filter(function (p) {return that.lifeCategory==='全部'||that.lifeCategory===p.category;}); },
      applicableCoupons: function () { var that=this; return this.modalProduct ? this.coupons.filter(function (c) {return that.claimedIds.includes(c.id)&&!that.usedCouponIds.includes(c.id)&&that.modalProduct.price>=c.threshold;}) : []; },
      checkoutTotal: function () { if (!this.modalProduct) return '0.00'; var coupon=this.applicableCoupons.find((c)=>String(c.id)===this.selectedCoupon); return Math.max(0,this.modalProduct.price-(coupon?coupon.amount:0)).toFixed(2); },
      settlementRows: function () {return this.transactionRows.filter((r)=>this.settleMode==='all'||r.status==='已结算');}
    },
    watch: {
      verified:'persist', claimedIds:{handler:'persist',deep:true}, usedCouponIds:{handler:'persist',deep:true}, orders:{handler:'persist',deep:true}, campaigns:{handler:'persist',deep:true}
    },
    mounted: function () {window.addEventListener('hashchange',this.syncHash); this.syncHash();},
    beforeUnmount: function () {window.removeEventListener('hashchange',this.syncHash); if (this.toastTimer) clearTimeout(this.toastTimer);},
    methods: {
      persist: function () {try {localStorage.setItem(storageKey,JSON.stringify({verified:this.verified,claimedIds:this.claimedIds,usedCouponIds:this.usedCouponIds,orders:this.orders,campaigns:this.campaigns}));} catch(e) { /* local storage might be disabled */ }},
      syncHash: function () {var r=location.hash.replace(/^#\/?/,'').split('/')[0]; if (this.roles.some(function (x) {return x.id===r;})) this.role=r; else this.role='consumer';},
      go: function (id) {this.role=id;this.workspaceTab='overview';if(id==='consumer')this.consumerTab='home';location.hash='/'+id;window.scrollTo(0,0);},
      showToast: function (message) {var that=this; this.toast=message; if(this.toastTimer) clearTimeout(this.toastTimer);this.toastTimer=setTimeout(function(){that.toast='';},3300);},
      verifyTicket: function () {if(!this.ticketCode.trim()||!this.ticketName.trim()){this.showToast('请填写票根编号和持票人');return;}if(this.ticketCode.trim().toUpperCase()!=='BH2026'){this.showToast('演示票根编号请使用 BH2026');return;}this.verified=true;this.persist();this.showToast('票根资格核验成功');},
      claim: function (coupon) {if(!this.verified){this.showToast('请先完成票根核验');this.consumerTab='verify';return;}if(this.claimedIds.includes(coupon.id)){this.showToast('该优惠券已领取');return;}this.claimedIds.push(coupon.id);this.persist();this.showToast('成功领取：'+coupon.title);},
      buy: function (product) {this.modalProduct=product;this.selectedCoupon='0';},
      pay: function () {if(!this.modalProduct)return;var coupon=this.applicableCoupons.find((c)=>String(c.id)===this.selectedCoupon);var id='DEMO'+String(Date.now());this.orders.unshift({id:id,name:this.modalProduct.name,paid:this.checkoutTotal});if(coupon)this.usedCouponIds.push(coupon.id);this.persist();this.modalProduct=null;this.consumerTab='orders';this.showToast('模拟支付成功，订单已创建');},
      redeem: function () {if(this.redeemCode.trim().toUpperCase()!=='BH-8899'){this.showToast('请输入演示核销码 BH-8899');return;}if(this.redeemed){this.showToast('该演示码已经核销');return;}this.redeemed=true;this.showToast('核销成功，等待清分分账');},
      openCreateEvent: function () {this.newEventTitle='';this.newEventType='演出活动';this.eventModal=true;},
      createEvent: function () {if(!this.newEventTitle.trim()){this.showToast('请输入活动名称');return;}this.campaigns.unshift({id:Date.now(),title:this.newEventTitle.trim(),type:this.newEventType,date:'2026-11-03 至 2026-12-31',claims:'0',used:'0'});this.eventModal=false;this.workspaceTab='campaigns';this.persist();this.showToast('演示活动发布成功');},
      resetDemo: function () {this.verified=false;this.claimedIds=[];this.usedCouponIds=[];this.orders=[];this.campaigns=initialCampaigns.slice();this.persist();this.consumerTab='home';this.showToast('已重置本地演示数据');}
    }
  }).mount('#app');
})();
