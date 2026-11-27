const rewardsBasePages=pagesContent;
const rewardsBaseAct=act;
const rewardsBaseDraw=draw;

function rewardsEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function rewardsMoney(value){return Number(value).toFixed(2)}
const rewardsIdentity={nickname:'林间微光',avatar:'coach-lin.png',code:'LF1008',points:320};
const rewardsTeam=[
  {id:'U1001',name:'晨跑的阿宁',avatar:'coach-zhao-photo.png',joined:'2026-11-03 10:20'},
  {id:'U1002',name:'小满',avatar:'coach-chen-photo.png',joined:'2026-10-28 16:35'},
  {id:'U1003',name:'山野行者',avatar:'coach-lin.png',joined:'2026-10-16 09:18'}
];
const rewardsOrders=[
  {id:'TG2026110301',user:0,name:'膝关节运动康复',paid:328,points:16,status:'待到账',date:'2026-11-03 11:08',node:'待到店核销'},
  {id:'TG2026110201',user:1,name:'运动恢复用品组合',paid:560,points:28,status:'已到账',date:'2026-11-02 14:26',node:'已超出售后期'},
  {id:'TG2026102701',user:2,name:'弹力训练带',paid:100,points:5,status:'已失效',date:'2026-10-27 18:40',node:'订单已退款'},
  {id:'TG2026101801',user:1,name:'运动恢复滚轴组合',paid:400,points:20,status:'已到账',date:'2026-10-18 12:19',node:'已超出售后期'}
];
st.commissionEntries||=[
  {id:'CM3',reason:'佣金到账',date:'2026-11-03 15:20',amount:28,status:'已到账',note:'推广商品订单结算'},
  {id:'CM2',reason:'佣金提现',date:'2026-10-29 10:05',amount:-100,status:'已完成',note:'提现至尾号 6288 的银行卡'},
  {id:'CM1',reason:'佣金到账',date:'2026-10-18 16:40',amount:200,status:'已到账',note:'推广商品订单结算'}
];
st.withdrawalRecords||=[
  {id:'WD2026110801',amount:100,fee:1,received:99,date:'2026-11-08 15:20',status:'已打款',bank:'招商银行（尾号 6288）',proof:'电子回单号 ZB20261108001520',paidAt:'2026-11-08 15:20'},
  {id:'WD2026110601',amount:80,fee:0.8,received:79.2,date:'2026-11-06 11:32',status:'待打款',bank:'招商银行（尾号 6288）'},
  {id:'WD2026110401',amount:50,fee:0,received:50,date:'2026-11-04 09:18',status:'待审核',bank:'招商银行（尾号 6288）'},
  {id:'WD2026102901',amount:60,fee:0,received:0,date:'2026-10-29 16:05',status:'已拒绝',bank:'招商银行（尾号 6288）',reason:'收款账户姓名与开户信息不一致'}
];
st.withdrawDraft||={amount:'',bank:'',holder:'',account:''};

function rewardsBalance(){return Math.round(st.commissionEntries.reduce((sum,entry)=>sum+entry.amount,0)*100)/100}
function rewardsEarnings(){return st.commissionEntries.filter(entry=>entry.amount>0).reduce((sum,entry)=>sum+entry.amount,0)}

function rewardsCouponScope(item){
  const names=[item.productNames,item.products,item.productName,item.serviceNames,item.services,item.serviceName].flatMap(value=>Array.isArray(value)?value:value?[value]:[]).map(value=>typeof value==='object'?value.name:value).filter(Boolean);
  return names.length?`${names.join('、')}可用`:(item.scope||'适用范围以优惠券规则为准');
}
function rewardsCouponPage(){
  const coupons=[
    {name:'新人服务满减券',amount:'50',unit:'元',type:'满减券',limit:'满 ¥100 可用 · 膝关节运动康复可用',status:'未使用',expiry:'2026-12-31'},
    {name:'康复用品专享券',amount:'20',unit:'元',type:'无门槛优惠券',limit:'运动恢复筋膜球可用',status:'未使用',expiry:'2026-11-30'},
    {name:'会员商城折扣券',amount:'9',unit:'折',type:'折扣券',limit:'商城商品可用',status:'已使用',expiry:'2026-11-30'},
    {name:'秋季服务满减券',amount:'30',unit:'元',type:'满减券',limit:'满 ¥200 可用 · 颈肩腰放松疗程可用',status:'已过期',expiry:'2026-10-31'}
  ];
  try{
    const issued=JSON.parse(localStorage.getItem('lflx_manager_issued_coupons')||'[]');
    const today=new Date(),todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if(Array.isArray(issued))issued.slice().reverse().forEach(item=>coupons.unshift({name:item.name||'优惠券',amount:String(item.amount??0),unit:'元',type:'满减券',limit:`满 ¥${item.threshold??0} 可用 · ${rewardsCouponScope(item)}`,status:(item.validUntil||'')<todayKey?'已过期':'未使用',expiry:item.validUntil||'—'}));
  }catch(error){}
  const active=st.couponTab||'未使用';
  return `${tabs(['未使用','已使用/已过期'],active,'couponTab')}<div class="coupon-list">${coupons.filter(coupon=>active==='未使用'?coupon.status==='未使用':coupon.status!=='未使用').map(coupon=>`<article class="coupon-card ${coupon.status==='未使用'?'':'coupon-inactive'}"><div class="coupon-info"><div class="between"><b>${rewardsEscape(coupon.name)}</b><span class="tag">${rewardsEscape(coupon.status)}</span></div><span class="coupon-type">${rewardsEscape(coupon.type)}</span><p>${rewardsEscape(coupon.limit)}</p><small>有效期至 ${rewardsEscape(coupon.expiry)}</small></div><div class="coupon-denomination"><span>${coupon.unit==='元'?'<small>¥</small>':''}<b>${rewardsEscape(coupon.amount)}</b>${coupon.unit==='折'?'<small>折</small>':''}</span></div></article>`).join('')||'<div class="empty">暂无优惠券</div>'}</div>`;
}

const rewardsRoutes=[['promotionPoster','推广名片','gift'],['promotionTeam','推广团队','user'],['promotionOrders','推广订单','orders'],['commissionDetails','佣金明细','file'],['promotionWithdraw','佣金提现','cards'],['withdrawalRecords','提现记录','file']];
rewardsRoutes.forEach(([route,label])=>{labels[route]=label;notes[route]='推广账户、订单和收益展示；可从邀请有礼继续访问相关功能。'});
const rewardsGroup=groups.find(group=>group[0]==='消息与我的');
if(rewardsGroup&&!rewardsGroup[1].some(item=>item[0]==='promotionPoster')){
  const position=rewardsGroup[1].findIndex(item=>item[0]==='rewards')+1;
  rewardsGroup[1].splice(position,0,...rewardsRoutes.map(([route,label])=>[route,label]));
}

function rewardsLanding(){
  return `<section class="card rewards-account"><div class="rewards-user"><img class="avatar" src="${A+rewardsIdentity.avatar}" alt="用户头像"><div><b>${rewardsIdentity.nickname}</b><small>邀请码 ${rewardsIdentity.code}</small></div></div><div class="rewards-balances"><button data-go="points"><small>积分余额</small><b>${rewardsIdentity.points}</b></button><button data-go="commissionDetails"><small>佣金余额</small><b>¥${rewardsMoney(rewardsBalance())}</b></button></div><div class="rewards-earnings"><div><small>昨日收益</small><b>¥28.00</b></div><div><small>累计收益</small><b>¥${rewardsMoney(rewardsEarnings())}</b></div></div></section><section class="card rewards-menu">${rewardsRoutes.map(([route,label,icon])=>`<button data-go="${route}"><span class="iconbox">${accountProfileIcon(icon)}</span><span>${label}</span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('')}</section>`;
}

function rewardsPosterPage(){
  return `<div class="promotion-poster"><img src="${A}promotion-poster.png" alt="林间微光的了凡乐享推广名片，邀请码 LF1008，含邀请二维码"></div>${cta('<a class="btn poster-download" href="assets/promotion-poster.png" download="了凡乐享-推广名片.png">保存海报</a>')}`;
}

function rewardsTeamResults(){
  const keyword=(st.teamKeyword||'').trim();
  const members=rewardsTeam.filter(member=>member.name.includes(keyword));
  return members.map(member=>`<article class="listitem referral-member"><img class="avatar" src="${A+member.avatar}" alt="${member.name}头像"><div class="grow"><h4>${member.name}</h4><p>加入时间 ${member.joined}</p></div></article>`).join('')||'<div class="empty">未找到匹配的团队成员</div>';
}
function rewardsTeamPage(){
  return `<div class="card rewards-count"><small>推广人数</small><b>${rewardsTeam.length}<span> 人</span></b></div><form class="team-search" id="promotionTeamSearch"><label class="sr-only" for="teamKeyword">搜索成员昵称</label><input class="input" id="teamKeyword" placeholder="搜索成员昵称" value="${rewardsEscape(st.teamKeyword||'')}"><button class="btn" type="submit">搜索</button></form><div id="teamResults">${rewardsTeamResults()}</div>`;
}

function rewardsMonthFilter(name,value,label='变动日期'){return `<div class="rewards-month"><label for="${name}">${label}</label><input class="input" id="${name}" type="month" value="${rewardsEscape(value)}"></div>`}
function rewardsOrderResults(){
  const items=rewardsOrders.filter(order=>order.date.startsWith(st.promotionMonth||'2026-11')&&(!st.promotionStatus||st.promotionStatus==='全部'||st.promotionStatus===order.status));
  return items.map(order=>{const user=rewardsTeam[order.user];return `<article class="card referral-order"><div class="row"><img class="avatar" src="${A+user.avatar}" alt="${user.name}头像"><div class="grow"><b>${user.name}</b><p>${order.name}</p></div><span class="tag ${order.status==='待到账'?'gold':''}">${order.status}</span></div><div class="referral-order-facts"><span>获得积分</span><b>${order.points} 积分</b></div><p>订单编号 ${order.id}</p><p>${order.node}</p><small>下单时间 ${order.date}</small></article>`}).join('')||'<div class="empty">当前月份和状态暂无推广订单</div>';
}
function rewardsOrdersPage(){return `<div class="card rewards-count"><small>推广订单总数</small><b>${rewardsOrders.length}<span> 单</span></b></div>${rewardsMonthFilter('promotionMonth',st.promotionMonth||'2026-11')}${tabs(['全部','待到账','已到账','已失效'],st.promotionStatus||'全部','promotionStatus')}<div id="promotionOrderResults">${rewardsOrderResults()}</div>`}

function rewardsCommissionResults(){
  const entries=st.commissionEntries.filter(entry=>entry.date.startsWith(st.commissionMonth||'2026-11'));
  return entries.map(entry=>`<article class="card commission-entry"><div class="between"><b>${entry.reason}</b><b class="${entry.amount>0?'price':'muted'}">${entry.amount>0?'+':'−'}¥${rewardsMoney(Math.abs(entry.amount))}</b></div><p>${entry.note}</p><div class="between"><small>${entry.date}</small><span class="tag">${entry.status}</span></div></article>`).join('')||'<div class="empty">该月份暂无佣金明细</div>';
}
function rewardsCommissionPage(){return `<div class="card rewards-commission"><span>累计佣金总额</span><b>¥${rewardsMoney(rewardsEarnings())}</b><small>当前可提现 ¥${rewardsMoney(rewardsBalance())}</small></div>${rewardsMonthFilter('commissionMonth',st.commissionMonth||'2026-11')}<div id="commissionResults">${rewardsCommissionResults()}</div>`}

function rewardsWithdrawalDetail(record){
  if(record.status==='已打款'){
    modal('打款凭证',`<section class="card small"><div class="between"><span>提现金额</span><b>¥${rewardsMoney(record.amount)}</b></div><div class="between"><span>提现手续费</span><span>¥${rewardsMoney(record.fee)}</span></div><div class="between"><span>到账金额</span><b class="price">¥${rewardsMoney(record.received)}</b></div><p>收款账户　${rewardsEscape(record.bank)}</p><p>打款时间　${rewardsEscape(record.paidAt||record.date)}</p><p>打款凭证　${rewardsEscape(record.proof||'电子回单')}</p></section><button class="btn full" data-act="close">完成</button>`);
    return;
  }
  if(record.status==='已拒绝')modal('提现驳回原因',`<section class="card small"><p>提现申请　${rewardsEscape(record.id)}</p><p>驳回时间　${rewardsEscape(record.date)}</p><p>驳回原因　${rewardsEscape(record.reason||'未填写驳回原因')}</p></section><button class="btn full" data-act="close">知道了</button>`);
}
function rewardsWithdrawalResults(){
  const active=st.withdrawalStatus||'全部',records=st.withdrawalRecords.filter(record=>!st.withdrawalMonth||record.date.startsWith(st.withdrawalMonth)).filter(record=>active==='全部'||record.status===active);
  return records.map(record=>`<article class="card withdrawal-record ${['已打款','已拒绝'].includes(record.status)?'withdrawal-record-action':''}" ${['已打款','已拒绝'].includes(record.status)?`data-act="withdrawalRecordDetail" data-id="${rewardsEscape(record.id)}" role="button" tabindex="0"`:''}><div class="between"><b>提现金额 ¥${rewardsMoney(record.amount)}</b><span class="tag ${['待审核','待打款'].includes(record.status)?'gold':''}">${rewardsEscape(record.status)}${record.status==='已打款'||record.status==='已拒绝'?'　›':''}</span></div><div class="withdrawal-record-facts"><span>提现手续费<b>¥${rewardsMoney(record.fee)}</b></span><span>到账金额<b>¥${rewardsMoney(record.received)}</b></span></div><div class="between"><small>提现时间 ${rewardsEscape(record.date)}</small><small>${rewardsEscape(record.id)}</small></div></article>`).join('')||'<div class="empty">当前条件暂无提现记录</div>';
}
function rewardsWithdrawalRecordsPage(){
  return `${rewardsMonthFilter('withdrawalMonth',st.withdrawalMonth||'','提现月份')}<div class="withdrawal-status-tabs">${tabs(['全部','待审核','待打款','已打款','已拒绝'],st.withdrawalStatus||'全部','withdrawalStatus')}</div><div id="withdrawalResults">${rewardsWithdrawalResults()}</div>`;
}

function rewardsWithdrawPage(){
  const draft=st.withdrawDraft;
  return `<div class="card rewards-commission"><span>可提现金额</span><b>¥${rewardsMoney(rewardsBalance())}</b><button class="textbtn" data-go="withdrawalRecords">提现记录 ›</button></div><div class="card withdraw-form"><div class="field"><label for="withdrawAmount">提现金额</label><div class="withdraw-amount"><input class="input" id="withdrawAmount" data-withdraw="amount" type="number" inputmode="decimal" step="0.01" min="0.01" value="${rewardsEscape(draft.amount)}" placeholder="请输入提现金额"><button class="textbtn" data-act="withdrawAll">全部提现</button></div></div><div class="field"><label for="withdrawBank">开户银行</label><input class="input" id="withdrawBank" data-withdraw="bank" value="${rewardsEscape(draft.bank)}" placeholder="请输入开户银行"></div><div class="field"><label for="withdrawHolder">开户姓名</label><input class="input" id="withdrawHolder" data-withdraw="holder" value="${rewardsEscape(draft.holder)}" placeholder="请输入开户姓名"></div><div class="field"><label for="withdrawAccount">银行账号</label><input class="input" id="withdrawAccount" data-withdraw="account" inputmode="numeric" value="${rewardsEscape(draft.account)}" placeholder="请输入银行卡号"></div></div>${cta('<button class="btn" data-act="submitCommissionWithdraw">提交提现申请</button>')}`;
}

pagesContent=function(page){
  if(page==='coupons')return rewardsCouponPage();
  if(page==='rewards')return rewardsLanding();
  if(page==='promotionPoster')return rewardsPosterPage();
  if(page==='promotionTeam')return rewardsTeamPage();
  if(page==='promotionOrders')return rewardsOrdersPage();
  if(page==='commissionDetails')return rewardsCommissionPage();
  if(page==='withdrawalRecords')return rewardsWithdrawalRecordsPage();
  if(page==='promotionWithdraw')return rewardsWithdrawPage();
  return rewardsBasePages(page);
};

function readWithdrawal(){
  document.querySelectorAll('[data-withdraw]').forEach(input=>st.withdrawDraft[input.dataset.withdraw]=input.value.trim());
  return {...st.withdrawDraft};
}
function validateWithdrawal(draft){
  if(!/^\d+(\.\d{1,2})?$/.test(draft.amount)||Number(draft.amount)<=0)return '请输入大于 0 且最多两位小数的提现金额';
  if(Number(draft.amount)>rewardsBalance())return '提现金额超过可提现余额';
  if(!draft.bank||!draft.holder)return '请填写开户银行和开户姓名';
  if(!/^\d{12,19}$/.test(draft.account.replace(/\s/g,'')))return '请输入正确的银行账号（12–19 位数字）';
  return '';
}

act=function(event){
  const node=event.currentTarget,action=node.dataset.act;
  if(action==='promotionStatus'){st.promotionStatus=node.dataset.v;draw();return}
  if(action==='withdrawalStatus'){st.withdrawalStatus=node.dataset.v;document.getElementById('withdrawalResults').innerHTML=rewardsWithdrawalResults();return}
  if(action==='withdrawalRecordDetail'){const record=st.withdrawalRecords.find(item=>item.id===node.dataset.id);if(record)rewardsWithdrawalDetail(record);return}
  if(action==='withdrawAll'){
    readWithdrawal();st.withdrawDraft.amount=rewardsMoney(rewardsBalance());draw();return;
  }
  if(action==='submitCommissionWithdraw'){
    const draft=readWithdrawal(),error=validateWithdrawal(draft);if(error){toast(error);return}
    st.pendingWithdrawal={...draft,requestId:'WD'+Date.now()};
    modal('确认提现申请',`<p class="small">提现金额 ¥${rewardsMoney(draft.amount)}</p><p class="small">${rewardsEscape(draft.bank)} · ${rewardsEscape(draft.holder)}</p><p class="small muted">银行卡尾号 ${rewardsEscape(draft.account.replace(/\s/g,'').slice(-4))}</p><div class="grid2"><button class="btn ghost" data-act="close">返回修改</button><button class="btn" data-act="confirmCommissionWithdraw">确认提交</button></div>`);return;
  }
  if(action==='confirmCommissionWithdraw'){
    const draft=st.pendingWithdrawal;if(!draft)return;
    const error=validateWithdrawal(draft);if(error){close();toast(error);return}
    const amount=Number(draft.amount),bank=`${draft.bank}（尾号 ${draft.account.replace(/\s/g,'').slice(-4)}）`,date=new Date().toLocaleString('sv-SE');
    st.commissionEntries.unshift({id:draft.requestId,reason:'佣金提现',amount:-amount,date,status:'待审核',note:'提现申请审核中'});
    st.withdrawalRecords.unshift({id:draft.requestId,amount,fee:0,received:amount,date,status:'待审核',bank});
    st.pendingWithdrawal=null;st.withdrawDraft={amount:'',bank:'',holder:'',account:''};close();go('withdrawalRecords');toast('提现申请已提交');return;
  }
  rewardsBaseAct(event);
};

draw=function(){
  rewardsBaseDraw();
  const teamSearch=document.getElementById('promotionTeamSearch');
  if(teamSearch)teamSearch.addEventListener('submit',event=>{event.preventDefault();st.teamKeyword=document.getElementById('teamKeyword').value;document.getElementById('teamResults').innerHTML=rewardsTeamResults()});
  document.getElementById('promotionMonth')?.addEventListener('change',event=>{st.promotionMonth=event.currentTarget.value;document.getElementById('promotionOrderResults').innerHTML=rewardsOrderResults()});
  document.getElementById('commissionMonth')?.addEventListener('change',event=>{st.commissionMonth=event.currentTarget.value;document.getElementById('commissionResults').innerHTML=rewardsCommissionResults()});
  document.getElementById('withdrawalMonth')?.addEventListener('change',event=>{st.withdrawalMonth=event.currentTarget.value;document.getElementById('withdrawalResults').innerHTML=rewardsWithdrawalResults()});
  document.querySelectorAll('[data-withdraw]').forEach(input=>input.addEventListener('input',()=>st.withdrawDraft[input.dataset.withdraw]=input.value));
};
