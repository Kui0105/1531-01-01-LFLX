/* Account data and order redemption flows. */
const lifecycleBasePages=pagesContent;
const lifecycleBaseAct=act;
const lifecycleBaseDraw=draw;
const lifecycleOrderActions=accountOrderActions;
const lifecycleOrderDetail=accountOrderDetail;
const lifecycleProfilePage=accountProfilePage;

function lifecycleEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function lifecycleNow(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}
function lifecycleService(order){return S.find(service=>service[0]===order.name)||S[6]}
function lifecycleUsesPerUnit(){return 1}
function lifecycleQuantity(order){return Math.max(1,Number.isSafeInteger(Number(order.quantity))?Number(order.quantity):Number(order.detail?.match(/数量\s*×\s*(\d+)/)?.[1]||1))}
function lifecycleTotalUses(order){return lifecycleQuantity(order)*lifecycleUsesPerUnit(order)}
function lifecycleRemaining(order){return Math.max(0,lifecycleTotalUses(order)-(order.redemptions||[]).length)}
function lifecycleRemainingCards(){return st.orders.filter(order=>order.type==='服务订单'&&order.status==='服务中').reduce((sum,order)=>sum+lifecycleRemaining(order),0)}

// Seed one partially redeemed multi-use order and completed assessment data.
const lifecycleMulti=st.orders.find(order=>order.id==='SV2026110403');
if(lifecycleMulti&&!lifecycleMulti.redemptions){
  lifecycleMulti.quantity=3;lifecycleMulti.price=984;lifecycleMulti.unitPrice=328;lifecycleMulti.detail='50 分钟 · 购买 3 份';
  lifecycleMulti.redemptions=[{id:'RX2026110201',time:'2026-11-02 14:50:00',store:stores[0].name,coach:coaches[0].name,service:lifecycleMulti.name}];
}
st.orders.filter(order=>['评估订单','服务订单'].includes(order.type)&&order.status==='已完成').forEach(order=>{
  order.checkedIn=true;order.redeemedAt||=order.date+' 15:20:00';
  if(order.type==='服务订单'&&!order.redemptions)order.redemptions=Array.from({length:lifecycleTotalUses(order)},(_,index)=>({id:order.id+'-R'+(index+1),time:order.redeemedAt,store:stores[0].name,coach:coaches[0].name,service:order.name}));
});

function lifecycleRedemptionSection(order){
  if(order.type==='评估订单')return `<section class="card redemption-summary"><h3>核销信息</h3><dl class="account-facts"><div><dt>核销状态</dt><dd>${order.checkedIn?'已核销':'未核销'}</dd></div><div><dt>核销时间</dt><dd>${order.checkedIn?lifecycleEscape(order.redeemedAt||'—'):'—'}</dd></div></dl></section>`;
  const records=order.redemptions||[];
  return `<section class="card redemption-summary"><h3>服务次数</h3><div class="redemption-counts"><div><small>总次数</small><b>${lifecycleTotalUses(order)}</b></div><div><small>已核销</small><b>${records.length}</b></div><div><small>剩余次数</small><b>${lifecycleRemaining(order)}</b></div></div><p class="tiny muted">购买 ${lifecycleQuantity(order)} 份 · 每份 ${lifecycleUsesPerUnit(order)} 次</p></section><section class="card redemption-records"><h3>核销记录</h3>${records.length?records.slice().reverse().map((record,index)=>`<article><div class="between"><b>第 ${records.length-index} 次核销</b><span class="tag">已核销</span></div><p>${lifecycleEscape(record.service)}</p><p>${lifecycleEscape(record.store)} · ${lifecycleEscape(record.coach)}</p><time>${lifecycleEscape(record.time)}</time></article>`).join(''):'<p class="small muted">暂无核销记录</p>'}</section>`;
}

accountOrderActions=function(order){
  if(order.type==='服务订单'&&order.status==='服务中'&&lifecycleRemaining(order)>0)return `<div class="order-actions"><button class="textbtn" data-act="startImmediateService" data-id="${order.id}">立即服务</button><button class="textbtn" data-act="accountOrderAction" data-id="${order.id}">预约服务</button><button class="textbtn" data-go="archives">查看档案</button></div>`;
  return lifecycleOrderActions(order);
};

accountOrderDetail=function(order){
  let html=lifecycleOrderDetail(order);
  if(['评估订单','服务订单'].includes(order.type)){
    // Completed/fully used orders display their records instead of a stale code.
    if(order.status==='已完成'||(order.type==='服务订单'&&lifecycleRemaining(order)===0))html=html.replace(/<div class="card order-code-card">[\s\S]*?<\/p><\/div>/,'');
    const section=lifecycleRedemptionSection(order);
    html=html.replace('<div class="card small"><b>优惠信息</b>',section+'<div class="card small"><b>优惠信息</b>');
  }
  return html;
};

accountProfilePage=function(){
  return lifecycleProfilePage().replace(/<button data-go="cards"><b>2<\/b><span>剩余卡次<\/span><\/button>/,`<button data-act="remainingServiceOrders"><b>${lifecycleRemainingCards()}</b><span>剩余卡次</span></button>`);
};

function lifecycleApplyRedemption(order,details){
  if(order.type!=='服务订单'||!['待服务','服务中','待使用'].includes(order.status))throw Error('当前订单状态不能核销');
  if(lifecycleRemaining(order)<=0)throw Error('服务次数已全部使用');
  const record={id:details.id,time:details.time||lifecycleNow(),store:details.store,coach:details.coach,service:order.name};
  order.redemptions||=[];
  if(order.redemptions.some(item=>item.id===record.id))return false;
  order.redemptions.push(record);order.checkedIn=lifecycleRemaining(order)===0;order.redeemedAt=record.time;
  order.status=lifecycleRemaining(order)>0?'服务中':'已完成';
  return true;
}

function lifecycleImmediateServicePage(order){
  return `<section class="card"><b>关联服务订单</b><p class="small muted">${lifecycleEscape(order.name)} · ${order.id}</p><p class="small">剩余 ${lifecycleRemaining(order)} / ${lifecycleTotalUses(order)} 次</p></section><div class="field"><label>服务门店</label><select class="input" data-order-flow="store">${stores.map(store=>`<option ${store.name===(st.orderFlowStore||st.store)?'selected':''}>${store.name}</option>`).join('')}</select></div><div class="field"><label>康复师</label><select class="input" data-order-flow="coach">${coaches.map(coach=>`<option ${coach.name===(st.orderFlowCoach||st.therapist)?'selected':''}>${coach.name}</option>`).join('')}</select></div><div class="field"><label>服务项目</label><input class="input" value="${lifecycleEscape(order.name)}" disabled></div><p class="small muted">本次使用 1 次服务，确认后更新该订单核销记录。</p><button class="btn full" data-act="submitImmediateService">提交并核销本次服务</button>`;
}

const lifecycleReviews=[
  {id:'RV-S1',type:'服务评价',status:'待评价',name:'膝关节运动康复',spec:'50 分钟 × 1 次',image:'service-knee.png',store:stores[0].name,coach:coaches[0].name,date:'2026-10-29 14:00'},
  {id:'RV-S2',type:'服务评价',status:'已评价',name:'颈肩腰放松疗程',spec:'45 分钟 × 1 次',image:'service-back.png',store:stores[1].name,coach:coaches[1].name,date:'2026-10-26 11:00',reviewedAt:'2026-10-26 15:10',rating:5,content:'康复师沟通耐心，训练安排清晰，体验很好。',images:[]},
  {id:'RV-G1',type:'商品评价',status:'待评价',name:'运动恢复筋膜球',spec:'标准款 × 1',price:59,image:'product.png',date:'2026-10-28 10:30'},
  {id:'RV-G2',type:'商品评价',status:'已评价',name:'弹力训练带',spec:'中阻力 × 2',price:178,image:'product.png',date:'2026-10-20 16:20',reviewedAt:'2026-10-24 09:35',rating:4,content:'阻力合适，居家训练使用方便。',images:['assets/product.png']}
];
st.reviewItems||=lifecycleReviews.map(item=>({...item}));
st.reviewDrafts||={};
st.complaintItems||=[
  {id:'CP001',status:'待受理',store:stores[0].name,types:['预约安排'],content:'希望增加周末上午的预约时段。',date:'2026-11-04 09:15',images:[]},
  {id:'CP002',status:'处理中',store:stores[0].name,types:['服务体验'],content:'建议预约前增加一次服务安排提醒。',date:'2026-11-02 14:20',images:[],result:'门店正在核实并优化提醒安排。'},
  {id:'CP003',status:'已处理',store:stores[1].name,types:['环境设施'],content:'希望休息区增加座位。',date:'2026-10-28 10:40',images:['assets/store.png'],result:'已调整休息区布局并补充座位，感谢您的建议。',resolvedAt:'2026-10-30 16:00'}
];
st.complaintDraft||={store:st.store,types:[],content:'',images:[]};
function lifecycleImages(images,extraClass=''){return images?.length?`<div class="feedback-images ${extraClass}">${images.map((src,index)=>`<img src="${lifecycleEscape(src)}" alt="上传图片 ${index+1}">`).join('')}</div>`:''}
function lifecycleRating(score){return `<span class="rating-readonly" aria-label="${score} 分">${[1,2,3,4,5].map(index=>`<svg viewBox="0 0 24 24" class="${index<=score?'filled':''}" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9L7.5 14 3 9.6l6.2-.9Z"/></svg>`).join('')}</span>`}
function lifecycleReviewItem(){return st.reviewItems.find(item=>item.id===st.selectedReviewId)||st.reviewItems.find(item=>item.status==='待评价'&&item.type===(st.reviewType||'服务评价'))||st.reviewItems[0]}
function lifecycleReviewDraft(item){return st.reviewDrafts[item.id]||=( {rating:0,content:'',images:[]} )}
function lifecycleReviewsPage(){
  const type=st.reviewType||'服务评价',status=st.reviewStatus||'待评价';
  const items=st.reviewItems.filter(item=>item.type===type&&item.status===status);
  return `${tabs(['服务评价','商品评价'],type,'reviewType')}${tabs(['待评价','已评价'],status,'reviewStatus')}<div class="feedback-list">${items.map(item=>`<article class="card review-entry"><div class="row"><img class="thumb" src="${A+item.image}" alt="${item.name}"><div class="grow"><b>${item.name}</b><p>${item.spec}</p>${item.type==='服务评价'?`<p>${item.store} · ${item.coach}</p><p>预约时间 ${item.date}</p>`:`<p class="price">¥${item.price}</p>`}</div></div>${status==='已评价'?`<div class="review-excerpt">${lifecycleRating(item.rating)}<p>${lifecycleEscape(item.content)}</p></div>`:''}<div class="feedback-actions"><button class="btn secondary" data-act="${status==='待评价'?'openReviewForm':'openReviewDetail'}" data-id="${item.id}">${status==='待评价'?'去评价':'查看评价'}</button></div></article>`).join('')||'<div class="empty">当前分类暂无评价记录</div>'}</div>`;
}
function lifecycleReviewForm(){
  const item=lifecycleReviewItem(),draft=lifecycleReviewDraft(item);
  return `<section class="card"><div class="row"><img class="thumb" src="${A+item.image}" alt="${item.name}"><div class="grow"><b>${item.name}</b><p class="small muted">${item.spec}</p></div></div><div class="field feedback-score"><label>${item.type==='商品评价'?'商品':'服务'}评分</label><div class="rating-buttons">${[1,2,3,4,5].map(value=>`<button class="rating-button ${value<=draft.rating?'selected':''}" data-act="feedbackRating" data-v="${value}" aria-label="${value} 分" aria-pressed="${value===draft.rating}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9L7.5 14 3 9.6l6.2-.9Z"/></svg></button>`).join('')}</div></div><div class="field"><label for="feedbackReviewText">评价内容</label><textarea id="feedbackReviewText" class="input textarea" maxlength="500" placeholder="分享你的体验">${lifecycleEscape(draft.content)}</textarea></div>${lifecycleImages(draft.images)}<label class="btn ghost feedback-upload" for="reviewImageInput">添加图片（选填，最多 3 张）</label><input id="reviewImageInput" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden></section><button class="btn full" data-act="submitFeedbackReview">提交评价</button>`;
}
function lifecycleReviewDetail(){
  const item=lifecycleReviewItem();
  return `<section class="card"><div class="row"><img class="avatar" src="${lifecycleEscape(st.accountProfile?.avatar||A+'coach-lin.png')}" alt="用户头像"><div class="grow"><b>${lifecycleEscape(st.accountProfile?.nickname||'林间微光')}</b><p class="tiny muted">${item.reviewedAt||'—'}</p></div></div><div class="review-detail-score">${lifecycleRating(item.rating||0)}</div><p class="small muted">${item.name} · ${item.spec}</p><p class="review-full-content">${lifecycleEscape(item.content||'')}</p>${lifecycleImages(item.images)}</section>`;
}
function lifecycleComplaintPage(){
  const status=st.ctab||'待受理';
  return `${tabs(['待受理','处理中','已处理'],status,'ctab')}<div class="feedback-list">${st.complaintItems.filter(item=>item.status===status).map(item=>`<article class="card complaint-entry"><div class="between"><b>${lifecycleEscape(item.types.join('、'))}</b><span class="tag ${item.status==='已处理'?'':'gold'}">${item.status}</span></div><p class="small">${lifecycleEscape(item.store)}</p><small class="muted">提交时间 ${item.date}</small><p class="feedback-content">${lifecycleEscape(item.content)}</p>${lifecycleImages(item.images)}${item.result?`<div class="complaint-result"><b>${item.status==='已处理'?'处理结果':'处理进展'}</b><p>${lifecycleEscape(item.result)}</p>${item.resolvedAt?`<small>${item.resolvedAt}</small>`:''}</div>`:''}</article>`).join('')||'<div class="empty">当前状态暂无投诉记录</div>'}</div>${cta('<button class="btn" data-go="complaintForm">新增投诉</button>')}`;
}
function lifecycleComplaintForm(){
  const draft=st.complaintDraft;
  return `<div class="field"><label for="complaintStore">投诉门店</label><select class="input" id="complaintStore">${stores.map(store=>`<option ${store.name===draft.store?'selected':''}>${store.name}</option>`).join('')}</select></div><div class="field"><label>投诉类型（可多选）</label><div class="feedback-types">${['服务体验','预约安排','环境设施','其他'].map(type=>`<button class="pill ${draft.types.includes(type)?'active':''}" data-act="complaintType" data-v="${type}" aria-pressed="${draft.types.includes(type)}">${type}</button>`).join('')}</div></div><div class="field"><label for="complaintContent">投诉内容</label><textarea id="complaintContent" class="input textarea" maxlength="1000" placeholder="请描述遇到的问题">${lifecycleEscape(draft.content)}</textarea></div>${lifecycleImages(draft.images)}<label class="btn ghost feedback-upload" for="complaintImageInput">添加图片凭证（选填，最多 3 张）</label><input id="complaintImageInput" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden><button class="btn full" data-act="submitFeedbackComplaint">提交投诉</button>`;
}

const lifecycleProfileKey='lflx-account-profile-v1';
try{st.accountProfile=JSON.parse(localStorage.getItem(lifecycleProfileKey)||'null')}catch{}
st.accountProfile||={avatar:A+'coach-lin.png',nickname:'林间微光',name:'',gender:'',birthday:''};
function lifecycleSettingsPage(){
  return `<section class="card settings-links">${[['accountSettingsProfile','用户资料'],['userAgreement','用户协议'],['privacyPolicy','隐私政策']].map(([route,label])=>`<button data-go="${route}"><span>${label}</span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('')}</section><button class="btn ghost full" data-act="logout">退出登录</button>`;
}
function lifecycleSettingsProfile(){
  const profile=st.profileEditDraft||={...st.accountProfile};
  return `<section class="card"><div class="settings-avatar"><img class="avatar" src="${lifecycleEscape(profile.avatar)}" alt="用户头像"><div><label class="textbtn feedback-upload" for="profileAvatarInput">上传头像</label><button class="textbtn" data-act="wechatAvatar">使用微信头像</button></div><input id="profileAvatarInput" type="file" accept="image/png,image/jpeg,image/webp" hidden></div><div class="field"><label for="settingsNickname">昵称</label><div class="row"><input id="settingsNickname" class="input" data-profile="nickname" maxlength="20" value="${lifecycleEscape(profile.nickname)}"><button class="textbtn profile-wechat" data-act="wechatNickname">使用微信昵称</button></div></div><div class="field"><label for="settingsName">姓名</label><input id="settingsName" class="input" data-profile="name" maxlength="30" value="${lifecycleEscape(profile.name)}"></div><div class="field"><label for="settingsGender">性别</label><select id="settingsGender" class="input" data-profile="gender">${[['','未设置'],['女','女'],['男','男'],['其他','其他']].map(([value,label])=>`<option value="${value}" ${profile.gender===value?'selected':''}>${label}</option>`).join('')}</select></div><div class="field"><label for="settingsBirthday">出生日期</label><input id="settingsBirthday" class="input" data-profile="birthday" type="date" max="${lifecycleNow().slice(0,10)}" value="${lifecycleEscape(profile.birthday)}"></div></section><button class="btn full" data-act="saveSettingsProfile">保存资料</button>`;
}
function lifecyclePolicyPage(privacy){
  const title=privacy?'隐私政策':'用户协议';
  const sections=privacy?[
    ['信息收集','为提供预约、评估和订单服务，我们会在您主动填写或授权时收集昵称、头像、联系方式及必要的评估资料。'],
    ['信息使用','相关信息用于安排服务、维护康复档案、处理订单以及响应咨询和反馈。'],
    ['授权与选择','头像、图片和通知等权限由您自主选择；可以通过用户资料页面更新个人信息。'],
    ['信息保护','我们采取合理措施保护信息，限定业务人员的访问范围，按业务需要保存相关记录。'],
    ['查询与联系','如需了解、修改或处理个人信息，请通过小程序联系客服入口联系平台。']
  ]:[
    ['服务说明','了凡乐享提供康复评估、服务预约、商品购买与相关信息查询。具体服务内容、时长、价格及使用次数以订单展示为准。'],
    ['账户与资料','请提供真实、准确且必要的资料，并妥善保管账户。评估资料用于康复师了解您的情况和安排服务。'],
    ['预约与核销','请按约定时间到店；预约开始前一小时内不支持改期或取消。多次服务按实际核销次数扣减，订单详情可查询使用记录。'],
    ['订单与售后','请在确认订单前核对项目、数量及费用。如需退款或反馈，请通过相应订单与投诉反馈入口提交申请。'],
    ['联系我们','如对协议或服务有疑问，可通过小程序内的在线客服、电话客服咨询。']
  ];
  return `<article class="card policy-document"><p class="policy-meta">${title} · 更新日期 2026-11-04</p>${sections.map(([heading,content])=>`<section><h3>${heading}</h3><p>${content}</p></section>`).join('')}</article>`;
}

const lifecycleArchiveRecords=[
  {type:'康复纪要',name:'膝关节运动康复',time:'2026-11-03 15:20',title:'第 3 次康复训练纪要',content:'本次完成自行车热身 8 分钟、股四头肌等长收缩 3 组、台阶上下训练 3 组及单腿平衡练习。训练中膝关节无明显疼痛，动作控制较上次稳定。居家练习：靠墙静蹲 3 组，每组 30 秒；如出现疼痛及时停止并联系康复师。'},
  {type:'评估结果',name:'术后评估',time:'2026-11-03 10:10',title:'术后阶段评估结果',content:'膝关节术后恢复进展稳定，屈伸活动度较上次改善。步行时轻微不适，股四头肌力量仍需加强。评估结果已生成阶段性康复方案。',linked:true},
  {type:'康复小结',name:'膝关节运动康复',time:'2026-11-02 16:10',title:'阶段康复小结',content:'本阶段已完成 4 次到店康复训练。膝关节活动范围、单腿稳定性和步行耐力均有改善，日常步行基本无不适。建议继续按康复方案进行力量和平衡训练，并于两周后复评。'},
  {type:'康复纪要',name:'颈肩腰放松疗程',time:'2026-10-30 11:30',title:'肩颈放松训练纪要',content:'完成胸椎活动、肩胛控制练习及颈肩软组织放松。训练后肩颈紧绷感减轻。建议每工作 1 小时起身活动 3 至 5 分钟，每日完成胸椎伸展练习。'},
  {type:'评估结果',name:'运动损伤评估',time:'2026-10-28 16:10',title:'首次运动功能评估结果',content:'记录右膝跑步后不适情况，完成关节活动度、单腿稳定性与下肢力量评估。建议阶段性调整跑步训练负荷，先进行基础力量及动作控制训练。',linked:true},
  {type:'康复小结',name:'颈肩腰放松疗程',time:'2026-10-24 09:40',title:'肩颈康复阶段小结',content:'已完成 3 次肩颈放松与活动训练，颈肩僵硬频率减少，活动舒适度提升。建议保持规律活动和居家拉伸，后续根据工作强度安排复评。'}
];
const lifecycleArchivePlans=[
  {name:'术后评估',time:'2026-11-03 10:20',title:'膝关节术后阶段康复方案',content:'康复目标：逐步恢复膝关节活动度、下肢肌力与日常步行能力。第一阶段进行股四头肌激活、踝泵和辅助屈伸练习；第二阶段逐步增加闭链力量及平衡训练。每周到店训练 2 次，训练后如出现持续肿胀或明显疼痛应暂停并联系康复师。',status:'待签名'}
];
function lifecycleMaskPhone(value){
  const digits=String(value||'').replace(/\D/g,'');
  if(digits.length===11)return digits.slice(0,3)+'****'+digits.slice(-4);
  return digits?digits.replace(/(\d{3})\d+(\d{4})/,'$1****$2'):'138****2888';
}
function lifecycleArchivePage(){
  const profile=st.accountProfile||{},filter=st.recordTab||'全部';
  const records=lifecycleArchiveRecords.filter(item=>filter==='全部'||item.type===filter).slice().sort((a,b)=>b.time.localeCompare(a.time));
  const identity=[profile.name||'张女士',profile.gender||'女'].join(' · ');
  return `<section class="card archive-user"><img class="avatar" src="${lifecycleEscape(profile.avatar||A+'coach-lin.png')}" alt="用户头像"><div class="grow"><b>${lifecycleEscape(profile.nickname||'林间微光')}</b><p>${lifecycleEscape(identity)}</p><small>手机号码　${lifecycleEscape(lifecycleMaskPhone(profile.phone))}</small></div></section>${tabs(['全部','评估结果','康复纪要','康复小结'],filter,'recordTab')}<div class="archive-timeline">${records.map(record=>`<article class="archive-record"><div class="archive-timeline-mark" aria-hidden="true"></div><time>${record.time}</time><section class="card"><div class="archive-record-heading"><b>${record.name}</b><span class="tag">${record.type}</span></div><h3>${record.title}</h3><p>${record.content}</p>${record.linked?`<button class="archive-result-link" data-act="openArchiveResult" data-i="${lifecycleArchiveRecords.indexOf(record)}">查看评估结果及康复方案 <span aria-hidden="true">›</span></button>`:''}</section></article>`).join('')||'<div class="empty">当前分类暂无档案记录</div>'}</div>`;
}

function lifecycleArchiveResult(){
  const record=lifecycleArchiveRecords[Number(st.archiveRecord)];
  if(!record||!record.linked)return lifecycleArchivePage();
  const plan=lifecycleArchivePlans.find(item=>item.name===record.name);
  return `<section class="card archive-result-heading"><span class="tag">${record.type}</span><h2>${record.name}</h2><time>${record.time}</time></section><section class="card archive-result-content"><h3>${record.title}</h3><p>${record.content}</p></section>${plan?`<section class="card archive-result-content"><div class="between"><h3>康复方案</h3><span class="tag ${plan.status==='待签名'?'gold':''}">${plan.status}</span></div><p class="tiny muted">${plan.time}</p><h4>${plan.title}</h4><p>${plan.content}</p>${plan.status==='待签名'?'<button class="btn full" data-act="signArchivePlan">确认签署康复方案</button>':''}</section>`:''}<button class="btn ghost full" data-act="archiveResultsBack">返回康复档案</button>`;
}

function lifecycleLogisticsPage(){
  const order=st.orders.find(item=>item.id===st.logisticsOrderId)||st.accountOrder;
  if(!order||order.type!=='商品订单')return '<div class="empty">未找到商品物流信息</div>';
  const tracks=order.logisticsTracks||[
    {time:order.date+' 10:25',title:'商品正在打包',content:'商家已完成订单拣货，正在为商品打包。'},
    {time:order.date+' 09:40',title:'商家已接单',content:'订单已支付成功，等待商家安排发货。'}
  ];
  return `<section class="card logistics-product"><div class="row"><img class="thumb" src="${A+order.image}" alt="${lifecycleEscape(order.name)}"><div class="grow"><b>${lifecycleEscape(order.name)}</b><p class="small muted">${lifecycleEscape(order.detail)}</p><small>订单编号 ${lifecycleEscape(order.id)}</small></div></div></section><section class="card logistics-carrier"><div class="between"><b>${lifecycleEscape(order.carrier||'商家配送')}</b><span class="tag ${order.status==='待发货'?'gold':''}">${order.status==='待发货'?'待揽收':order.status==='待收货'?'运输中':order.status==='已完成'?'已签收':order.status}</span></div><p>物流单号　${lifecycleEscape(order.trackingNumber||'待商家发货后生成')}</p></section><section class="card logistics-tracks"><h3>物流轨迹</h3><div class="logistics-timeline">${tracks.map((track,index)=>`<article class="logistics-event ${index===0?'current':''}"><span class="logistics-dot" aria-hidden="true"></span><time>${lifecycleEscape(track.time)}</time><b>${lifecycleEscape(track.title)}</b><p>${lifecycleEscape(track.content)}</p></article>`).join('')}</div></section>`;
}

const lifecycleEmployeePhones=[
  {phone:'13100000001',role:'康复师',store:'静安运动康复中心'},
  {phone:'13100000002',role:'店长',store:'静安运动康复中心'}
];
function lifecycleEmployeeLoginPage(){
  const selected=st.selectedEmployeePhone||'';
  return `<section class="employee-login-brand"><div class="launch-mark">${ic('heart')}</div><h2>员工授权登录</h2><p>选择微信授权使用的手机号码</p></section><section class="employee-phone-list">${lifecycleEmployeePhones.map(item=>`<button class="employee-phone-option ${selected===item.phone?'selected':''}" data-act="selectEmployeePhone" data-v="${item.phone}" aria-pressed="${selected===item.phone}"><span class="employee-phone-check" aria-hidden="true">${selected===item.phone?'✓':''}</span><span><b>${item.phone}</b><small>授权手机号</small></span><span class="tag">${item.role}</span></button>`).join('')}</section><div class="employee-login-footer"><label class="small"><input type="checkbox" id="employeeAgree"> 我已阅读并同意 <button class="textbtn" data-act="protocol">《用户协议》与《隐私政策》</button></label><button class="btn full" data-act="employeeLogin">授权并登录</button></div>`;
}
function lifecycleEmployeePage(){
  const staff=lifecycleEmployeePhones.find(item=>item.phone===st.employeePhone);
  if(!staff)return `<div class="empty"><h3>员工身份尚未授权</h3><p>请选择员工身份并授权手机号后登录。</p><button class="btn secondary" data-go="employeeLogin">前往授权登录</button></div>`;
  return `<section class="card employee-identity-card"><div class="employee-avatar">${ic('user')}</div><div><small>员工身份</small><h2>${staff.role}</h2><p>${staff.phone}</p><p>${staff.store}</p></div></section><section class="card employee-workspace-note"><h3>${staff.role}工作台</h3><p>当前为身份授权流程演示。员工端业务页面待补充。</p></section><button class="btn ghost full" data-act="employeeLogout">退出员工登录</button>`;
}

const lifecycleRoutes=[['reviewDetail','评价详情'],['accountSettingsProfile','用户资料'],['userAgreement','用户协议'],['privacyPolicy','隐私政策']];
labels.logisticsDetail='物流详情';
notes.logisticsDetail='查看所选商品订单的承运状态、物流单号与物流轨迹。';
labels.employeeLogin='员工授权登录';
notes.employeeLogin='选择微信授权手机号后按手机号识别康复师或店长身份。';
const lifecycleGroup=groups.find(group=>group[0]==='消息与我的');
lifecycleRoutes.forEach(([route,label])=>{labels[route]=label;if(lifecycleGroup&&!lifecycleGroup[1].some(item=>item[0]===route))lifecycleGroup[1].push([route,label])});
notes.userAgreement='用户协议富文本展示。当前内容为原型示例，正式内容由管理端配置。';
notes.privacyPolicy='隐私政策富文本展示。当前内容为原型示例，正式内容由管理端配置。';

pagesContent=function(page){
  if(page==='employeeLogin')return lifecycleEmployeeLoginPage();
  if(page==='employee')return lifecycleEmployeePage();
  if(page==='logisticsDetail')return lifecycleLogisticsPage();
  if(page==='archives')return lifecycleArchivePage();
  if(page==='report'&&Number.isInteger(st.archiveRecord))return lifecycleArchiveResult();
  if(page==='reviews')return lifecycleReviewsPage();
  if(page==='reviewForm')return lifecycleReviewForm();
  if(page==='reviewDetail')return lifecycleReviewDetail();
  if(page==='complaints')return lifecycleComplaintPage();
  if(page==='complaintForm')return lifecycleComplaintForm();
  if(page==='settings')return lifecycleSettingsPage();
  if(page==='accountSettingsProfile')return lifecycleSettingsProfile();
  if(page==='userAgreement'||page==='privacyPolicy')return lifecyclePolicyPage(page==='privacyPolicy');
  if(page==='orderServiceStart'&&st.accountOrder?.type==='服务订单')return lifecycleImmediateServicePage(st.accountOrder);
  return lifecycleBasePages(page);
};

function lifecycleSubmitReview(){
  const item=lifecycleReviewItem(),draft=lifecycleReviewDraft(item);
  if(item.status!=='待评价')return;
  if(!draft.rating){toast('请选择评分');return}
  if(!draft.content.trim()){toast('请填写评价内容');return}
  modal('确认提交评价','<p class="small">确认提交本次评价？</p><div class="grid2"><button class="btn ghost" data-act="close">返回修改</button><button class="btn" data-act="confirmFeedbackReview" data-id="'+item.id+'">确认提交</button></div>');
}

act=function(event){
  const node=event.currentTarget,action=node.dataset.act,id=node.dataset.id;
  if(action==='openArchiveResult'){
    const record=lifecycleArchiveRecords[Number(node.dataset.i)];
    if(!record?.linked)return;
    st.archiveRecord=Number(node.dataset.i);go('report');return;
  }
  if(action==='archiveResultsBack'){go('archives');return}
  if(action==='signArchivePlan'){
    const record=lifecycleArchivePlans.find(item=>item.name===lifecycleArchiveRecords[Number(st.archiveRecord)]?.name);
    if(!record||record.status!=='待签名')return;
    modal('确认签署康复方案',`<p class="small">请确认已阅读「${lifecycleEscape(record.title)}」。</p><div class="grid2"><button class="btn ghost" data-act="close">稍后签署</button><button class="btn" data-act="confirmArchivePlan">确认签署</button></div>`);return;
  }
  if(action==='confirmArchivePlan'){
    const record=lifecycleArchivePlans.find(item=>item.name===lifecycleArchiveRecords[Number(st.archiveRecord)]?.name);
    if(record)record.status='已签名';close();draw();toast('康复方案已签署');return;
  }
  if(action==='remainingServiceOrders'){st.orderType='服务订单';st.orderFilter='服务中';st.accountOrder=null;go('orders');return}
  if(action==='accountOrderAction'){
    const order=st.orders.find(item=>item.id===id);
    if(order?.type==='商品订单'&&['待发货','待收货','已完成'].includes(order.status)){
      st.accountOrder=order;st.logisticsOrderId=order.id;go('logisticsDetail');return;
    }
    if(order?.type==='服务订单'&&['待服务','服务中'].includes(order.status)){
      st.accountOrder=order;st.service=Math.max(6,S.findIndex(service=>service[0]===order.name));st.btype='service';st.bookedName=order.name;go('booking');return;
    }
  }
  if(action==='selectEmployeePhone'){
    st.selectedEmployeePhone=node.dataset.v;draw();return;
  }
  if(action==='employeeLogin'){
    const staff=lifecycleEmployeePhones.find(item=>item.phone===st.selectedEmployeePhone);
    if(!staff){toast('请先选择授权手机号');return}
    if(!document.getElementById('employeeAgree')?.checked){modal('用户协议与隐私政策','<p class="small">员工授权登录前请阅读并同意用户协议与隐私政策。</p><div class="grid2"><button class="btn ghost" data-act="close">取消</button><button class="btn" data-act="agreeOk">同意并继续</button></div>');return}
    st.employeePhone=staff.phone;st.employeeRole=staff.role;st.loggedIn=true;go('employee');toast('已授权登录：'+staff.role);return;
  }
  if(action==='agreeOk'&&st.page==='employeeLogin'){
    close();const checkbox=document.getElementById('employeeAgree');if(checkbox)checkbox.checked=true;toast('已同意协议');return;
  }
  if(action==='employeeLogout'){
    st.employeePhone=null;st.employeeRole=null;st.selectedEmployeePhone='';st.loggedIn=false;go('role');return;
  }
  if(action==='submitImmediateService'&&st.accountOrder?.type==='服务订单'){
    const order=st.accountOrder;
    if(!['待服务','服务中'].includes(order.status)||!lifecycleRemaining(order)){toast('当前订单没有可核销次数');return}
    const store=document.querySelector('[data-order-flow="store"]').value,coach=document.querySelector('[data-order-flow="coach"]').value;
    st.pendingRedemption={id:'RX'+Date.now(),orderId:order.id,store,coach};
    modal('确认核销本次服务',`<p class="small">${lifecycleEscape(order.name)}<br>${lifecycleEscape(store)} · ${lifecycleEscape(coach)}<br>本次扣减 1 次，核销后剩余 ${lifecycleRemaining(order)-1} 次。</p><div class="grid2"><button class="btn ghost" data-act="close">返回修改</button><button class="btn" data-act="confirmServiceRedemption">确认核销</button></div>`);return;
  }
  if(action==='confirmServiceRedemption'){
    const pending=st.pendingRedemption,order=st.orders.find(item=>item.id===pending?.orderId);
    if(!pending||!order)return;
    try{lifecycleApplyRedemption(order,pending)}catch(error){toast(error.message);return}
    st.pendingRedemption=null;st.accountOrder=order;close();go('orderDetail');toast(order.status==='已完成'?'服务已全部核销':'本次核销成功');return;
  }
  if(action==='openReviewForm'||action==='openReviewDetail'){
    st.selectedReviewId=id;go(action==='openReviewForm'?'reviewForm':'reviewDetail');return;
  }
  if(action==='feedbackRating'){lifecycleReviewDraft(lifecycleReviewItem()).rating=Number(node.dataset.v);draw();return}
  if(action==='submitFeedbackReview'){lifecycleSubmitReview();return}
  if(action==='confirmFeedbackReview'){
    const item=st.reviewItems.find(item=>item.id===id);if(!item||item.status!=='待评价')return;
    const draft=lifecycleReviewDraft(item);if(!draft.rating||!draft.content.trim())return;
    Object.assign(item,{...draft,images:[...draft.images],content:draft.content.trim(),status:'已评价',reviewedAt:lifecycleNow()});
    st.reviewType=item.type;st.reviewStatus='已评价';close();go('reviews');toast('评价已提交');return;
  }
  if(action==='complaintType'){
    const types=st.complaintDraft.types,value=node.dataset.v,index=types.indexOf(value);
    if(index<0)types.push(value);else types.splice(index,1);draw();return;
  }
  if(action==='submitFeedbackComplaint'){
    const draft=st.complaintDraft;
    if(!draft.types.length){toast('请选择投诉类型');return}
    if(!draft.content.trim()){toast('请填写投诉内容');return}
    st.pendingComplaintId='CP'+Date.now();
    modal('确认提交投诉','<p class="small">提交后可在投诉反馈中查看处理进度。</p><div class="grid2"><button class="btn ghost" data-act="close">返回修改</button><button class="btn" data-act="confirmFeedbackComplaint">确认提交</button></div>');return;
  }
  if(action==='confirmFeedbackComplaint'){
    const draft=st.complaintDraft;if(!st.pendingComplaintId||!draft.types.length||!draft.content.trim())return;
    st.complaintItems.unshift({...draft,id:st.pendingComplaintId,types:[...draft.types],images:[...draft.images],content:draft.content.trim(),status:'待受理',date:lifecycleNow()});
    st.pendingComplaintId=null;st.complaintDraft={store:st.store,types:[],content:'',images:[]};st.ctab='待受理';close();go('complaints');toast('投诉已提交');return;
  }
  if(action==='wechatAvatar'||action==='wechatNickname'){
    modal(action==='wechatAvatar'?'使用微信头像':'使用微信昵称',`<p class="small">预览授权后的资料效果。</p><div class="grid2"><button class="btn ghost" data-act="close">取消</button><button class="btn" data-act="confirmWechatProfile" data-v="${action}">同意使用</button></div>`);return;
  }
  if(action==='confirmWechatProfile'){
    st.profileEditDraft||={...st.accountProfile};
    if(node.dataset.v==='wechatAvatar')st.profileEditDraft.avatar=A+'coach-zhao.png';else st.profileEditDraft.nickname='微信用户2888';
    close();draw();return;
  }
  if(action==='saveSettingsProfile'){
    const draft=st.profileEditDraft;
    if(!draft?.nickname.trim()){toast('请填写昵称');return}
    if(draft.birthday&&draft.birthday>lifecycleNow().slice(0,10)){toast('出生日期不能晚于今天');return}
    const profile={...draft,nickname:draft.nickname.trim(),name:draft.name.trim()};
    try{localStorage.setItem(lifecycleProfileKey,JSON.stringify(profile))}catch{toast('资料保存失败，请减少头像图片大小');return}
    st.accountProfile=profile;st.profileEditDraft=null;go('settings');toast('资料已保存');return;
  }
  if(action==='confirmImmediateService'&&st.accountOrder?.type==='评估订单'){
    const assessment=st.accountOrder;
    lifecycleBaseAct(event);
    assessment.checkedIn=true;assessment.redeemedAt=lifecycleNow();assessment.status='已完成';
    const generated=st.accountOrder;
    generated.quantity=1;generated.redemptions=[{id:generated.id+'-R1',time:assessment.redeemedAt,store:node.dataset.store,coach:node.dataset.coach,service:generated.name}];generated.status='已完成';generated.redeemedAt=assessment.redeemedAt;draw();return;
  }
  lifecycleBaseAct(event);
};

async function lifecycleReadImages(input,target,key,single=false){
  const files=[...input.files||[]];
  if(!files.length)return;
  const accepted=files.slice(0,single?1:Math.max(0,3-target[key].length));
  if(!accepted.length){toast('最多上传 3 张图片');return}
  if(accepted.some(file=>!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1024*1024)){toast('请选择不超过 1MB 的 PNG、JPG 或 WebP 图片');input.value='';return}
  try{
    const values=await Promise.all(accepted.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)})));
    if(single)target[key]=values[0];else target[key].push(...values);
    draw();
  }catch{toast('图片读取失败，请重新选择')}
}

draw=function(){
  lifecycleBaseDraw();
  if(st.page==='orders'){
    const strip=document.querySelector('.order-status-tabs'),active=strip?.querySelector('.active');
    if(active)strip.scrollLeft=Math.max(0,active.offsetLeft-strip.offsetLeft-(strip.clientWidth-active.offsetWidth)/2);
    strip?.addEventListener('wheel',event=>{if(strip.scrollWidth<=strip.clientWidth)return;if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){event.preventDefault();strip.scrollLeft+=event.deltaY}},{passive:false});
  }
  if(st.page==='my'){
    const avatar=document.querySelector('.profile-user .avatar'),name=document.querySelector('.profile-name-line h2');
    if(avatar)avatar.src=st.accountProfile.avatar;if(name)name.textContent=st.accountProfile.nickname;
  }
  document.getElementById('feedbackReviewText')?.addEventListener('input',event=>lifecycleReviewDraft(lifecycleReviewItem()).content=event.target.value);
  document.getElementById('reviewImageInput')?.addEventListener('change',event=>lifecycleReadImages(event.target,lifecycleReviewDraft(lifecycleReviewItem()),'images'));
  document.getElementById('complaintContent')?.addEventListener('input',event=>st.complaintDraft.content=event.target.value);
  document.getElementById('complaintStore')?.addEventListener('change',event=>st.complaintDraft.store=event.target.value);
  document.getElementById('complaintImageInput')?.addEventListener('change',event=>lifecycleReadImages(event.target,st.complaintDraft,'images'));
  document.querySelectorAll('[data-profile]').forEach(input=>input.addEventListener('input',()=>st.profileEditDraft[input.dataset.profile]=input.value));
  document.getElementById('profileAvatarInput')?.addEventListener('change',event=>lifecycleReadImages(event.target,st.profileEditDraft,'avatar',true));
};
draw();
