const accountOrders = [
  {id:'EV2026110401',type:'评估订单',status:'待付款',name:'放松评估',detail:'45 分钟 · 评估服务',price:99,image:'service-eval.png',date:'2026-11-04'},
  {id:'EV2026110402',type:'评估订单',status:'待评估',name:'运动损伤评估',detail:'60 分钟 · 评估服务',price:199,image:'service-knee.png',date:'2026-11-03'},
  {id:'EV2026110403',type:'评估订单',status:'服务中',name:'术后评估',detail:'60 分钟 · 评估服务',price:199,image:'service-back.png',date:'2026-11-02'},
  {id:'EV2026110404',type:'评估订单',status:'已完成',name:'颈肩腰痛评估',detail:'45 分钟 · 评估服务',price:159,image:'service-back.png',date:'2026-10-29'},
  {id:'EV2026110405',type:'评估订单',status:'售后中',name:'运动损伤评估',detail:'60 分钟 · 评估服务',price:199,image:'service-knee.png',date:'2026-10-27'},
  {id:'EV2026110406',type:'评估订单',status:'已取消',name:'放松评估',detail:'45 分钟 · 评估服务',price:99,image:'service-eval.png',date:'2026-10-25'},
  {id:'SV2026110401',type:'服务订单',status:'待付款',name:'颈肩腰放松疗程',detail:'45 分钟 · 到店康复',price:268,image:'service-back.png',date:'2026-11-04'},
  {id:'SV2026110402',type:'服务订单',status:'待使用',name:'筋膜放松体验卡',detail:'3 次卡 · 待预约',price:699,image:'service-back.png',date:'2026-11-03'},
  {id:'SV2026110403',type:'服务订单',status:'服务中',name:'膝关节运动康复',detail:'50 分钟 · 林教练',price:328,image:'service-knee.png',date:'2026-11-02'},
  {id:'SV2026110404',type:'服务订单',status:'已完成',name:'膝关节运动康复',detail:'50 分钟 · 林教练',price:328,image:'service-knee.png',date:'2026-10-29'},
  {id:'SV2026110405',type:'服务订单',status:'售后中',name:'颈肩腰放松疗程',detail:'45 分钟 · 售后处理中',price:268,image:'service-back.png',date:'2026-10-27'},
  {id:'SV2026110406',type:'服务订单',status:'已取消',name:'膝关节运动康复',detail:'50 分钟 · 到店康复',price:328,image:'service-knee.png',date:'2026-10-25'},
  {id:'GO2026110401',type:'商品订单',status:'待付款',name:'运动恢复筋膜球',detail:'标准款 × 1',price:59,image:'product.png',date:'2026-11-04'},
  {id:'GO2026110402',type:'商品订单',status:'待发货',name:'弹力训练带',detail:'中阻力 × 1',price:89,image:'product.png',date:'2026-11-03'},
  {id:'GO2026110403',type:'商品订单',status:'待收货',name:'运动恢复滚轴',detail:'标准款 × 1',price:129,image:'product.png',date:'2026-11-02'},
  {id:'GO2026110404',type:'商品订单',status:'已完成',name:'运动恢复筋膜球',detail:'加硬款 × 1',price:59,image:'product.png',date:'2026-10-29'},
  {id:'GO2026110405',type:'商品订单',status:'售后中',name:'弹力训练带',detail:'中阻力 × 1 · 退货处理中',price:89,image:'product.png',date:'2026-10-27'},
  {id:'GO2026110406',type:'商品订单',status:'已取消',name:'运动恢复滚轴',detail:'标准款 × 1',price:129,image:'product.png',date:'2026-10-25'}
];

st.orders ||= accountOrders.map(order=>({...order}));

const accountAppointments = [
  {id:'AP20261105001',name:'膝关节运动康复',status:'待服务',store:'静安运动康复中心',coach:'林教练',date:'11月05日 周四 14:00',duration:'50分钟',image:'service-knee.png'},
  {id:'AP20261108002',name:'运动损伤评估',status:'服务中',store:'静安运动康复中心',coach:'赵教练',date:'11月08日 周日 10:30',duration:'45分钟',image:'service-eval.png'},
  {id:'AP20261028003',name:'颈肩腰放松疗程',status:'已完成',store:'静安运动康复中心',coach:'林教练',date:'10月28日 周三 16:00',duration:'45分钟',image:'service-back.png'},
  {id:'AP20261025004',name:'术后评估',status:'已取消',store:'静安运动康复中心',coach:'赵教练',date:'10月25日 周日 11:00',duration:'45分钟',image:'service-eval.png'}
];
st.appointments ||= accountAppointments.map(item=>({...item}));

const accountOrdersByType = {
  '评估订单':['全部','待付款','待评估','服务中','已完成','售后中','已取消'],
  '服务订单':['全部','待付款','待使用','服务中','已完成','售后中','已取消'],
  '商品订单':['全部','待付款','待发货','待收货','已完成','售后中','已取消']
};

function accountOrderPage() {
  const type=st.orderType||'服务订单';
  const filter=accountOrdersByType[type].includes(st.orderFilter)?st.orderFilter:'全部';
  st.orderFilter=filter;
  const orders=st.orders.filter(order=>order.type===type&&(filter==='全部'||order.status===filter));
  return `${tabs(Object.keys(accountOrdersByType),type,'orderType').replace('class="tabs"','class="tabs order-type-tabs"')}${tabs(accountOrdersByType[type],filter,'orderFilter').replace('class="tabs"','class="tabs order-status-tabs"')}<div class="order-list">${orders.map((order,index)=>`<article class="card order-card"><div class="between"><small class="muted">${order.id} · ${order.date}</small><span class="tag ${['待付款','售后中'].includes(order.status)?'gold':''}">${order.status}</span></div><div class="row order-product"><img class="thumb" src="${A+order.image}" alt="${order.name}"><div class="grow"><b>${order.name}</b><p>${order.detail}</p></div><b class="price">¥${order.price}</b></div><div class="order-card-footer"><small>实付 ¥${order.price}</small><button class="btn secondary" data-act="accountOrderDetail" data-id="${order.id}">查看详情</button></div>${accountOrderActions(order)}</article>`).join('')||'<div class="empty">当前状态暂无订单</div>'}</div>`;
}

function accountOrderActions(order) {
  if(order.status==='待付款')return `<div class="order-actions"><button class="textbtn" data-act="payAccountOrder" data-id="${order.id}">立即支付</button><button class="textbtn" data-act="cancelAccountOrder" data-id="${order.id}">取消订单</button></div>`;
  if(['待评估','待使用','待发货','待收货'].includes(order.status))return `<div class="order-actions"><button class="textbtn" data-act="accountOrderAction" data-id="${order.id}">${order.type==='商品订单'?'查看物流':order.type==='评估订单'?'预约评估':'立即预约'}</button>${order.type==='商品订单'?'<button class="textbtn" data-act="confirmReceived" data-id="'+order.id+'">确认收货</button>':'<button class="textbtn" data-act="cancelAccountOrder" data-id="'+order.id+'">取消订单</button>'}</div>`;
  if(order.status==='服务中')return '<div class="order-actions"><button class="textbtn" data-go="appointments">查看预约</button><button class="textbtn" data-go="archives">查看档案</button></div>';
  if(order.status==='已完成')return `<div class="order-actions"><button class="textbtn" data-go="${order.type==='商品订单'?'orders':'reviews'}">${order.type==='商品订单'?'再次购买':'评价服务'}</button><button class="textbtn" data-go="${order.type==='商品订单'?'afterSale':'archives'}">${order.type==='商品订单'?'申请售后':'查看档案'}</button></div>`;
  if(order.status==='售后中')return '<div class="order-actions"><button class="textbtn" data-go="afterSale">售后详情</button></div>';
  return '<div class="order-actions"><button class="textbtn" data-act="accountOrderAction" data-id="'+order.id+'">再次购买</button></div>';
}

function accountAppointmentPage() {
  const filters=['全部','服务中','已完成','已取消'],filter=st.apptTab||'全部';
  const appointments=st.appointments.filter(item=>filter==='全部'||item.status===filter);
  return `${tabs(filters,filter,'apptTab').replace('class="tabs"','class="tabs appointment-tabs"')}<div class="appointment-list">${appointments.map(item=>`<article class="listitem appointment-card"><img class="thumb" src="${A+item.image}" alt="${item.name}"><div class="appointment-copy"><div class="between"><h4>${item.name}</h4><span class="tag ${item.status==='已取消'?'gold':''}">${item.status}</span></div><p>${item.store} · ${item.coach}</p><p>${item.date} · ${item.duration}</p><div class="appointment-actions">${item.status==='待服务'?(isWithinHour()?'<span class="tiny muted">预约即将开始，改期/取消入口已关闭</span>':`<button class="textbtn" data-act="rescheduleAccountAppointment" data-id="${item.id}">改期</button><button class="textbtn" data-act="cancelAccountAppointment" data-id="${item.id}">取消预约</button><button class="textbtn" data-go="archives">查看档案</button>`):item.status==='服务中'?'<button class="textbtn" data-go="appointmentDetail">查看详情</button><button class="textbtn" data-go="archives">查看档案</button>':item.status==='已完成'?'<button class="textbtn" data-go="archives">查看档案</button><button class="textbtn" data-go="reviews">评价服务</button>':'<button class="textbtn" data-act="bookService">重新预约</button>'}</div></div></article>`).join('')||'<div class="empty">当前状态暂无预约</div>'}</div>`;
}

function accountCardPage() {
  const status=st.cardTab||'使用中';
  const cards={
    '使用中':[
      {name:'膝关节康复 5 次卡',status:'使用中',remaining:'剩余 2 / 5 次',expiry:'有效期至 2027-02-28'},
      {name:'运动放松 3 次卡',status:'即将到期',remaining:'剩余 1 / 3 次',expiry:'7 天后到期'}
    ],
    '即将到期':[
      {name:'运动放松 3 次卡',status:'即将到期',remaining:'剩余 1 / 3 次',expiry:'7 天后到期'},
      {name:'膝关节康复 5 次卡',status:'即将到期',remaining:'剩余 2 / 5 次',expiry:'12 天后到期'}
    ],
    '已到期':[
      {name:'肩颈舒缓 2 次卡',status:'已到期',remaining:'已使用 2 / 2 次',expiry:'到期时间 2026-10-20'},
      {name:'运动评估 1 次卡',status:'已到期',remaining:'已使用 1 / 1 次',expiry:'到期时间 2026-09-30'}
    ]
  }[status];
  return `${tabs(['使用中','即将到期','已到期'],status,'cardTab').replace('class="tabs"','class="tabs card-tabs"')}<div class="card-list">${cards.map((card,index)=>`<article class="card membership-card"><div class="between"><b>${card.name}</b><span class="tag ${card.status==='即将到期'?'gold':''}">${card.status}</span></div><p class="small muted">${card.remaining} · ${card.expiry}</p><div class="membership-actions"><button class="textbtn" data-act="accountCardRecords" data-index="${index}" data-name="${card.name}">预约明细</button>${card.status!=='已到期'?'<button class="btn secondary" data-go="booking">立即预约</button>':''}</div></article>`).join('')}</div>`;
}

function accountProfileIcon(name) {
  const paths={
    edit:'<path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z"/>',
    orders:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h4"/>',
    cards:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
    coupons:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 5v3m0 3v2m0 3v3"/>',
    reviews:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9L7.5 14 3 9.6l6.2-.9Z"/>',
    birthday:'<path d="M4 12h16v9H4zM3 16c3 3 3-3 6 0s3-3 6 0 3-3 6 0M8 12V9m8 3V9m-4 3V7M12 3v1M8 5v1m8-1v1"/>',
    complaints:'<path d="M4 4h16v13H9l-5 4ZM12 8v4m0 2v.1"/>',
    settings:'<path d="m10 3-.7 2.2-2 .9L5 5.6 3 9l1.6 1.7v2.6L3 15l2 3.4 2.3-.5 2 .9L10 21h4l.7-2.2 2-.9 2.3.5 2-3.4-1.6-1.7v-2.6L21 9l-2-3.4-2.3.5-2-.9L14 3Z"/><circle cx="12" cy="12" r="3"/>'
  };
  return paths[name]?`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`:ic(name);
}

function accountProfilePage() {
  const shortcuts=[['我的订单','orders','orders'],['我的预约','appointments','calendar'],['我的卡包','cards','cards']];
  const tools=[['康复档案','archives','file'],['优惠券','coupons','coupons'],['邀请有礼','rewards','gift'],['生日福利','birthday','birthday'],['我的评价','reviews','reviews'],['收货地址','addresses','pin'],['投诉反馈','complaints','complaints'],['联系客服','support','support']];
  return `<div class="profile-page"><section class="profile-summary"><div class="profile-user"><img class="avatar" src="${A}coach-lin.png" alt="用户头像"><div class="profile-identity"><div class="profile-name-line"><h2>林间微光</h2><span class="tag gold">银卡会员</span></div><button class="textbtn profile-edit" data-go="profile">完善个人资料 <span aria-hidden="true">›</span></button></div></div><div class="profile-store">${ic('pin')}<span>绑定门店 · ${st.store}</span></div><div class="profile-metrics">${[['680','成长值','growth'],['320','积分','points'],['2','剩余卡次','cards']].map(([value,label,target])=>`<button data-go="${target}"><b>${value}</b><span>${label}</span></button>`).join('')}</div></section><section class="profile-section"><h3>我的服务</h3><div class="profile-service-grid">${shortcuts.map(([label,target,icon])=>`<button data-go="${target}"><span class="profile-shortcut-icon">${accountProfileIcon(icon)}</span><span>${label}</span></button>`).join('')}</div></section><section class="profile-section"><h3>常用功能</h3><div class="profile-tool-grid">${tools.map(([label,target,icon])=>`<button data-go="${target}">${accountProfileIcon(icon)}<span>${label}</span></button>`).join('')}</div></section><button class="profile-settings" data-go="settings">${accountProfileIcon('settings')}<span>设置</span><span class="profile-chevron" aria-hidden="true">›</span></button></div>`;
}

function accountOrderDetail(order) {
  return `<div class="card"><span class="tag ${order.status==='待付款'?'gold':''}">${order.status}</span><p class="small">订单编号 ${order.id}</p><p class="tiny muted">下单时间 ${order.date} · 微信支付</p></div><div class="card row"><img class="thumb" src="${A+order.image}" alt="${order.name}"><div class="grow"><b>${order.name}</b><p>${order.detail}</p></div><b class="price">¥${order.price}</b></div><div class="card small"><div class="between"><span>订单金额</span><b>¥${order.price}</b></div><div class="divider"></div><div class="between"><span>实付金额</span><b class="price">¥${order.price}</b></div></div>`;
}

const accountBasePages=pagesContent;
pagesContent=function(page){
  if(page==='my')return accountProfilePage();
  if(page==='orders')return accountOrderPage();
  if(page==='appointments')return accountAppointmentPage();
  if(page==='cards')return accountCardPage();
  if(page==='points')return accountBasePages(page).replace('<h2 class="title">积分明细</h2>','');
  if(page==='messages')return accountBasePages(page).replace('class="message-toolbar"','class="message-toolbar message-toolbar-left"');
  if(page==='orderDetail'&&st.accountOrder)return accountOrderDetail(st.accountOrder);
  return accountBasePages(page);
};

const accountBaseAct=act;
act=function(event){
  const node=event.currentTarget,action=node.dataset.act,id=node.dataset.id;
  if(action==='orderType'){st.orderFilter='全部';st.accountOrder=null;accountBaseAct(event);return}
  if(action==='accountOrderDetail'){st.accountOrder=st.orders.find(order=>order.id===id);go('orderDetail');return}
  if(action==='cancelAccountOrder'){
    const order=st.orders.find(item=>item.id===id);
    modal('取消订单',`<p class="small">确定取消「${order.name}」订单吗？</p><div class="grid2"><button class="btn ghost" data-act="close">返回</button><button class="btn warn" data-act="confirmCancelAccountOrder" data-id="${id}">确认取消</button></div>`);return;
  }
  if(action==='confirmCancelAccountOrder'){
    const order=st.orders.find(item=>item.id===id);if(order)order.status='已取消';st.orderFilter='已取消';close();draw();toast('订单已取消');return;
  }
  if(action==='payAccountOrder'){
    const order=st.orders.find(item=>item.id===id);
    modal('确认支付',`<p class="small">${order.name} · ¥${order.price}</p><button class="btn full" data-act="confirmPayAccountOrder" data-id="${id}">确认支付</button>`);return;
  }
  if(action==='confirmPayAccountOrder'){
    const order=st.orders.find(item=>item.id===id);if(order)order.status=order.type==='商品订单'?'待发货':order.type==='评估订单'?'待评估':'待使用';st.orderFilter=order.status;close();draw();toast('支付成功');return;
  }
  if(action==='confirmReceived'){
    const order=st.orders.find(item=>item.id===id);if(order)order.status='已完成';st.orderFilter='已完成';draw();toast('已确认收货');return;
  }
  if(action==='accountOrderAction'){
    const order=st.orders.find(item=>item.id===id);
    if(order.type==='商品订单'){toast('物流信息已更新');return}
    if(order.type==='评估订单'){st.btype='eval';st.service=1;st.orderType='评估订单';go('booking');return}
    st.btype='service';st.service=6;go('booking');return;
  }
  if(action==='cancelAccountAppointment'){
    const appointment=st.appointments.find(item=>item.id===id);
    modal('取消预约',`<p class="small">确定取消「${appointment.name}」预约吗？</p><div class="grid2"><button class="btn ghost" data-act="close">暂不取消</button><button class="btn warn" data-act="confirmCancelAccountAppointment" data-id="${id}">确认取消</button></div>`);return;
  }
  if(action==='confirmCancelAccountAppointment'){
    const appointment=st.appointments.find(item=>item.id===id);if(appointment)appointment.status='已取消';st.apptTab='已取消';close();draw();toast('预约已取消');return;
  }
  if(action==='rescheduleAccountAppointment'){
    const appointment=st.appointments.find(item=>item.id===id);
    st.bookedName=appointment.name;st.store=appointment.store;st.therapist=appointment.coach;st.date='11月05日 周四';st.slot='';st.btype=appointment.name.includes('评估')?'eval':'service';st.service=S.findIndex(service=>service[0]===appointment.name);if(st.service<0)st.service=6;go('booking');return;
  }
  if(action==='accountCardRecords'){
    modal('预约明细',`<p class="small">${node.dataset.name}<br>2026-10-28 膝关节康复 · 已核销<br>2026-10-21 膝关节康复 · 已核销</p><button class="btn full" data-act="close">完成</button>`);return;
  }
  if(action==='cardTab'||action==='orderFilter'||action==='apptTab'){accountBaseAct(event);return}
  if(action==='payOk'&&node.dataset.product==='false'){
    const service=st.orderedService||S[st.service]||S[6];
    st.orders.unshift({id:`SV${Date.now()}`,type:st.orderType==='评估订单'?'评估订单':'服务订单',status:st.orderType==='评估订单'?'待评估':'待使用',name:service[0],detail:`${service[2]} · 数量 ×${st.serviceQty||1}`,price:Number(service[3])||0,image:service[4],date:'2026-11-04'});
    st.orderFilter='全部';
  }
  if(action==='payOk'&&node.dataset.product==='true'){
    const cartItem=st.cart.find(item=>item.checked&&!item.invalid);
    if(cartItem)st.orders.unshift({id:`GO${Date.now()}`,type:'商品订单',status:'待发货',name:cartItem.name,detail:`${cartItem.spec} × ${cartItem.qty}`,price:cartItem.price*cartItem.qty,image:'product.png',date:'2026-11-04'});
    st.orderFilter='全部';
  }
  if(action==='bookingSuccess'){
    const name=st.bookedName||S[st.service]?.[0]||'膝关节运动康复';
    st.appointments.unshift({id:`AP${Date.now()}`,name,status:'待服务',store:st.store,coach:st.therapist,date:`${st.date} ${st.slot||'14:00'}`,duration:S[st.service]?.[2]||'50分钟',image:S[st.service]?.[4]||'service-knee.png'});
    st.apptTab='全部';
  }
  accountBaseAct(event);
};
