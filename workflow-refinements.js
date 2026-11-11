const workflowBasePages=pagesContent;
const workflowBaseAct=act;



const workflowAssessmentBasicKey='lflx-assessment-basic-v1';
const workflowMultiQuestions=new Set(['issues','areas','specialty']);
const workflowTitles=coaches.map((_,index)=>index===0?'首席康复师':'高级康复师');
const workflowMessages=[
  {title:'预约到店提醒',content:'预约的膝关节康复将于 11月05日 14:00 开始。',target:'appointmentDetail'},
  {title:'服务到期提醒',content:'您的康复服务即将到期，请查看剩余服务安排。',target:'orders'},
  {title:'康复复测提醒',content:'您的复测时间为 11月08日。',target:'appointments'},
  {title:'投诉处理结果',content:'投诉反馈已处理完毕。',target:'complaints'},
  {title:'生日祝福提醒',get content(){return `尊敬的${st.accountProfile?.nickname||'林间微光'}，本月是您的生日月，祝您生日快乐；平台为您准备了生日福利，可前往我的-生日福利进行领取！`},target:'birthday',unread:true}
];

function workflowMessagePage(){
  return `<div class="message-toolbar message-toolbar-left"><button class="textbtn" data-act="allRead">全部已读</button></div>${workflowMessages.map((message,index)=>`<button class="listitem message-item" data-act="message" data-i="${index}"><span class="iconbox">${ic('msg')}</span><span class="grow"><strong>${message.title}${!st.read&&(index<2||message.unread)?' <span class="tag gold">未读</span>':''}</strong><span class="message-copy">${lifecycleEscape(message.content)}</span><small class="muted">2026-11-04 09:30</small></span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('')}`;
}

function workflowCurrentStore(page,name){
  const store=stores.find(item=>item.name===name)||stores[0];
  return `<section class="selection-group current-store"><div class="between"><h3>服务门店</h3><button class="textbtn" data-act="changeWorkflowStore">更换门店</button></div><button class="selection-store" data-act="changeWorkflowStore" aria-label="更换门店，当前${store.name}"><img src="${A+store.images[0]}" alt="${store.name}门店环境"><span class="selection-store-copy"><b>${store.name}</b><small>${store.address}</small><small>营业 ${store.hours} · 距您 ${store.distance} km</small></span><span class="row-chevron" aria-hidden="true">›</span></button></section>`;
}

function assessmentBasicInfo(){
  try{return JSON.parse(localStorage.getItem(workflowAssessmentBasicKey)||'null')}catch{return null}
}

function workflowCoachCard(coach,index,selected,action){
  return `<button class="selection-person ${selected?'selected':''}" data-act="${action}" data-v="${coach.name}" data-i="${index}" aria-pressed="${selected}"><img src="${A+coach.image}" alt="${coach.name}头像"><span class="selection-person-copy"><b>${coach.name}</b><small>${workflowTitles[index]}</small></span><span class="selection-check" aria-hidden="true">${selected?'✓':''}</span></button>`;
}

function workflowStoreCard(store,index,selected,action){
  return `<button class="selection-store ${selected?'selected':''}" data-act="${action}" data-i="${index}" aria-pressed="${selected}"><img src="${A+store.images[0]}" alt="${store.name}门店环境"><span class="selection-store-copy"><b>${store.name}</b><small>${store.address}</small><small>营业 ${store.hours} · 距您 ${store.distance} km</small></span><span class="selection-check" aria-hidden="true">${selected?'✓':''}</span></button>`;
}

function workflowAssessmentPage(){
  const index=S[st.service]?.[1].startsWith('eval-')?st.service:0;
  const relaxation=index===0||index===3;
  const sets=index===4||index===5?[
    ['运动频率','frequency',['基本不运动','1-2次/周','3-4次/周','5次以上/周']]
  ]:relaxation?[
    ['每天久坐时长','sedentary',['4小时以内','4-6小时','6-8小时','8小时以上']],
    ['运动频率','frequency',['基本不运动','1-2次/周','3-4次/周','5次以上/周']],
    ['当前训练或比赛安排','schedule',['无','日常训练','备赛期','赛前1周','赛后3天内']],
    ['这次最想解决的问题','issues',['疲劳恢复','肌肉紧绷','运动后恢复','久坐僵硬','睡眠放松','情绪紧张','体态改善']],
    ['本次想处理的部位','areas',['颈肩','上肢','腰背','骨盆髋部','下肢','足底','全身']]
  ]:[
    ['职业与运动专项','specialty',['久坐办公','体力劳动','学生','跑步','球类','力量训练','格斗','冰雪','舞蹈']],
    ['每周训练频率','frequency',['不运动','1-2次','3-4次','5次以上']],
    ['单次训练时长','duration',['小于30分钟','30-60分钟','1-2小时','大于2小时']],
    ['惯用侧','side',['右','左','双侧']]
  ];
  const answers=st.assessmentAnswers||{};
  const questions=sets.map(([label,key,options])=>{
    const selected=answers[key];
    return `<fieldset class="assessment-question"><legend>${label}${workflowMultiQuestions.has(key)?'（可多选）':'（单选）'}</legend><div class="assessment-options">${options.map(option=>{
      const active=workflowMultiQuestions.has(key)?(selected||[]).includes(option):selected===option;
      return `<button type="button" class="assessment-option ${active?'selected':''}" data-act="assessmentChoice" data-key="${key}" data-value="${option}" aria-pressed="${active}">${option}</button>`;
    }).join('')}</div></fieldset>`;
  }).join('');
  const basic=assessmentBasicInfo();
  const basicFields=basic?'':`<section class="card assessment-basic"><h3>基础信息</h3><div class="field"><label>姓名</label><input class="input" name="basicName" autocomplete="name" required></div><div class="field"><label>性别</label><select class="input" name="basicGender" required><option value="">请选择</option><option>女</option><option>男</option><option>其他</option></select></div><div class="field"><label>年龄</label><input class="input" name="basicAge" type="number" min="1" max="120" inputmode="numeric" required></div><div class="field"><label>身高（cm）</label><input class="input" name="basicHeight" type="number" min="1" max="250" inputmode="decimal" required></div><div class="field"><label>体重（kg）</label><input class="input" name="basicWeight" type="number" min="1" max="350" inputmode="decimal" required></div><div class="field"><label>联系电话</label><input class="input" name="basicPhone" type="tel" inputmode="tel" autocomplete="tel" required></div></section>`;
  return `${basicFields}<div class="card assessment-form"><h3>评估资料</h3><div class="field"><label>评估项目</label><input class="input" value="${S[index][0]}" disabled></div>${questions}<div class="field"><label>补充说明（选填）</label><textarea class="input textarea" name="assessmentNote" placeholder="补充说明本次评估相关情况"></textarea></div></div>${basic?'<p class="assessment-basic-saved">基础信息已保存</p>':''}${cta('<button class="btn" data-act="submitAssessment">提交评估资料</button>')}`;
}

function workflowAppointmentDetail(){
  const appointment=st.appointments.find(item=>item.id===st.appointmentId)||st.appointments[0];
  if(!appointment)return '<div class="empty">暂无预约详情</div>';
  const storeIndex=Math.max(0,stores.findIndex(store=>store.name===appointment.store));
  const store=stores[storeIndex],coach=coaches.findIndex(item=>item.name===appointment.coach);
  const coachIndex=Math.max(0,coach),coachData=coaches[coachIndex];
  const image=appointment.storeImage||store.images[0],coachImage=appointment.coachImage||coachData.image;
  const start=appointmentIsWithinHour(appointment);
  const statusActions=appointment.status==='待服务'?start?'<p class="tiny muted">预约开始前一小时内不可改期或取消</p>':'<button class="textbtn" data-act="rescheduleAccountAppointment" data-id="'+appointment.id+'">改期</button><button class="textbtn" data-act="cancelAccountAppointment" data-id="'+appointment.id+'">取消预约</button>':appointment.status==='服务中'?'<button class="textbtn" data-go="archives">查看档案</button>':appointment.status==='已完成'?'<button class="textbtn" data-go="reviews">评价服务</button><button class="textbtn" data-go="archives">查看档案</button>':'<button class="textbtn" data-act="bookService">重新预约</button>';
  return `<section class="card appointment-status"><span class="tag ${appointment.status==='已取消'?'gold':''}">${appointment.status}</span><small>预约编号 ${appointment.id}</small></section><section class="card appointment-detail-section"><h3>门店信息</h3><img class="appointment-store-image" src="${A+image}" alt="${store.name}门店环境"><b>${store.name}</b><p>${store.address}</p><div class="appointment-detail-actions"><button class="btn secondary" data-act="appointmentNavigate" data-i="${storeIndex}">一键导航</button></div></section><section class="card appointment-detail-section"><h3>预约信息</h3><div class="appointment-coach"><img src="${A+coachImage}" alt="${appointment.coach}头像"><span><b>${appointment.coach}</b><small>${workflowTitles[coachIndex]}</small></span></div><dl class="appointment-facts"><div><dt>预约服务</dt><dd>${appointment.name}</dd></div><div><dt>预约日期/时间</dt><dd>${appointment.date}</dd></div><div><dt>服务时长</dt><dd>${appointment.duration}</dd></div></dl></section>${cta(`<div class="appointment-detail-action-bar">${statusActions}</div>`)}`;
}

function workflowAppointmentList(){
  const filters=['全部','待服务','服务中','已完成','已取消'],filter=st.apptTab||'全部';
  const items=st.appointments.filter(item=>filter==='全部'||item.status===filter);
  return `${tabs(filters,filter,'apptTab').replace('class="tabs"','class="tabs appointment-tabs"')}<div class="appointment-list">${items.map(item=>{
    const action=item.status==='待服务'?(appointmentIsWithinHour(item)?'<small class="tiny muted">预约即将开始，暂不可改期或取消</small>':`<button class="textbtn" data-act="rescheduleAccountAppointment" data-id="${item.id}">改期</button><button class="textbtn" data-act="cancelAccountAppointment" data-id="${item.id}">取消预约</button>`):item.status==='已完成'?'<button class="textbtn" data-go="reviews">评价服务</button>':item.status==='已取消'?`<button class="textbtn" data-act="bookService" data-id="${item.id}">重新预约</button>`:'';
    return `<article class="listitem appointment-card" data-act="appointmentDetail" data-id="${item.id}" role="link" tabindex="0" aria-label="查看${item.name}预约详情"><img class="thumb" src="${A+item.image}" alt="${item.name}"><div class="appointment-copy"><div class="between"><h4>${item.name}</h4><span class="tag ${item.status==='已取消'?'gold':''}">${item.status}</span></div><p>${item.store} · ${item.coach}</p><p>${item.date} · ${item.duration}</p><div class="appointment-actions">${action}</div></div></article>`;
  }).join('')||'<div class="empty">当前状态暂无预约</div>'}</div>`;
}

function workflowBooking(){
  const weekend=/周六|周日/.test(st.date);
  const slots=weekend?['09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']:['11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
  const storeIndex=Math.max(0,stores.findIndex(store=>store.name===st.store));
  return `${workflowCurrentStore('booking',st.store)}<section class="selection-group"><h3>选择康复师</h3><div class="selection-people">${coaches.map((coach,index)=>workflowCoachCard(coach,index,coach.name===st.therapist,'bookingCoachCard')).join('')}</div></section>${section('预约日期')}<div class="grid3">${['11月02日 周一','11月03日 周二','11月04日 周三','11月05日 周四','11月06日 周五','11月07日 周六','11月08日 周日'].map(value=>`<button class="tile" style="${st.date===value?'border-color:#79b5ac;background:#edf8f5':''}" data-act="date" data-v="${value}">${value.slice(0,5)}<small>${value.slice(6)}</small></button>`).join('')}</div>${section('可预约时段')}<div class="grid3">${slots.map((value,index)=>`<button class="pill ${st.slot===value?'active':''}" ${index===4?'disabled':''} data-act="slot" data-conflict="${index===7?'1':''}" data-v="${value}" style="${index===4||index===7?'opacity:.45;text-decoration:line-through':''}">${value}</button>`).join('')}</div><p class="tiny muted">${weekend?'周末营业 09:30–18:30':'工作日营业 11:00–20:00'}；按 30 分钟划分，时段按服务时长占用。预约开始前 1 小时内不可改期或取消。</p>${cta('<button class="btn" data-act="confirmBooking">确认预约</button>')}`;
}

function appointmentIsWithinHour(appointment){
  if(st.withinHour)return true;
  const match=(appointment.date||'').match(/(\d+)月(\d+)日.*?(\d{1,2}):(\d{2})/);
  if(!match)return false;
  const start=new Date(new Date().getFullYear(),Number(match[1])-1,Number(match[2]),Number(match[3]),Number(match[4]));
  const difference=start.getTime()-Date.now();
  return difference>=0&&difference<=3600000;
}

pagesContent=function(page){
  if(page==='assessment')return workflowAssessmentPage();
  if(page==='appointments')return workflowAppointmentList();
  if(page==='appointmentDetail'&&st.appointments?.length)return workflowAppointmentDetail();
  if(page==='serviceDetail'&&S[st.service]?.[1].startsWith('eval-'))return workflowBasePages(page).replace(/<section class="card service-quantity">[\s\S]*?<\/section>/,'');
  if(page==='serviceCheckout'&&st.btype==='eval')return workflowBasePages(page).replace(/ · 数量 ×\d+/,'');
  if(page==='messages')return workflowMessagePage();
  if(page==='orderAssessmentStart'){
    const storeIndex=Math.max(0,stores.findIndex(item=>item.name===st.orderFlowStore));
    const coachIndex=Math.max(0,coaches.findIndex(item=>item.name===st.orderFlowCoach));
    return `<div class="card"><b>评估项目</b><p class="small muted">${st.accountOrder?.name||'评估服务'}</p></div>${workflowCurrentStore('orderAssessmentStart',st.orderFlowStore||st.store)}<section class="selection-group"><h3>选择康复师</h3>${coaches.map((coach,index)=>workflowCoachCard(coach,index,index===coachIndex,'orderFlowCoachCard')).join('')}</section>${cta('<button class="btn" data-act="continueImmediateAssessment">填写评估资料</button>')}`;
  }
  if(page==='booking'){
    return workflowBooking();
  }
  return workflowBasePages(page);
};

function saveAssessmentBasic(){
  const values=Object.fromEntries(['Name','Gender','Age','Height','Weight','Phone'].map(key=>[key,document.querySelector(`[name="basic${key}"]`)?.value.trim()||'']));
  const required=['Name','Gender','Age','Height','Weight','Phone'];
  const missing=required.find(key=>!values[key]);
  if(missing){document.querySelector(`[name="basic${missing}"]`)?.focus();toast('请填写完整基础信息');return false}
  if(!/^1\d{10}$/.test(values.Phone)){document.querySelector('[name="basicPhone"]')?.focus();toast('请输入正确的联系电话');return false}
  try{localStorage.setItem(workflowAssessmentBasicKey,JSON.stringify(values))}catch{toast('基础信息暂时无法保存');return false}
  return true;
}

act=function(event){
  const node=event.currentTarget,action=node.dataset.act;
  if(action==='message'){
    const index=Number(node.dataset.i),message=workflowMessages[index];
    if(!message)return;
    st.read=true;
    if(index===0&&st.appointments[0])st.appointmentId=st.appointments[0].id;
    modal(message.title,'<p class="small">'+lifecycleEscape(message.content)+'</p><button class="btn full" data-act="messageJump" data-i="'+index+'">查看相关信息</button>');
    document.querySelectorAll('.unread-badge').forEach(badge=>badge.remove());return;
  }
  if(action==='messageJump'){
    const message=workflowMessages[Number(node.dataset.i)];close();
    if(message){if(message.target==='orders'){st.orderType='服务订单';st.orderFilter='全部'}go(message.target)}return;
  }
  if(action==='changeWorkflowStore'){
    st.storeReturn=st.page;go('storeList');return;
  }
  if(action==='chooseStore'&&['booking','orderAssessmentStart'].includes(st.storeReturn)){
    const store=stores[Number(node.dataset.i)];
    modal('确认更换门店',`<p class="small">${store.name}</p><p class="small muted">${store.address}</p><div class="grid2"><button class="btn ghost" data-act="close">再看看</button><button class="btn" data-act="workflowConfirmStore" data-i="${node.dataset.i}">确认选择</button></div>`);return;
  }
  if(action==='workflowConfirmStore'){
    const store=stores[Number(node.dataset.i)];st.store=store.name;st.slot='';
    if(st.storeReturn==='orderAssessmentStart')st.orderFlowStore=store.name;
    close();go(st.storeReturn||'booking');toast('服务门店已更新');return;
  }
  if(action==='continueImmediateAssessment'){
    const store=stores.find(item=>item.name===st.orderFlowStore)||stores.find(item=>item.name===st.store)||stores[0];
    const coach=coaches.find(item=>item.name===st.orderFlowCoach)||coaches[0];
    st.orderFlowStore=store.name;st.orderFlowCoach=coach.name;st.store=store.name;st.therapist=coach.name;
    st.btype='eval';st.service=Math.max(0,S.findIndex(service=>service[0]===st.accountOrder?.name));
    st.assessmentAnswers={};go('assessment');return;
  }
  if(action==='assessmentChoice'){
    const {key,value}=node.dataset;
    st.assessmentAnswers||={};
    if(workflowMultiQuestions.has(key)){
      const selected=new Set(st.assessmentAnswers[key]||[]);
      selected.has(value)?selected.delete(value):selected.add(value);
      st.assessmentAnswers[key]=[...selected];
      const active=selected.has(value);node.classList.toggle('selected',active);node.setAttribute('aria-pressed',String(active));
    }else{
      st.assessmentAnswers[key]=value;
      document.querySelectorAll(`[data-act="assessmentChoice"][data-key="${key}"]`).forEach(option=>{const active=option===node;option.classList.toggle('selected',active);option.setAttribute('aria-pressed',String(active))});
    }
    return;
  }
  if(action==='submitAssessment'&&!assessmentBasicInfo()&&!saveAssessmentBasic())return;
  if(action==='appointmentDetail'){
    if(event.target.closest('button,a,input,select,textarea'))return;
    st.appointmentId=node.dataset.id;go('appointmentDetail');return;
  }
  if(action==='bookingStoreCard'){
    const store=stores[Number(node.dataset.i)];st.store=store.name;st.slot='';
    document.querySelectorAll('[data-act="bookingStoreCard"]').forEach(card=>{const active=card===node;card.classList.toggle('selected',active);card.setAttribute('aria-pressed',String(active));card.querySelector('.selection-check').textContent=active?'✓':''});return;
  }
  if(action==='bookingCoachCard'){
    st.therapist=node.dataset.v;
    document.querySelectorAll('[data-act="bookingCoachCard"]').forEach(card=>{const active=card===node;card.classList.toggle('selected',active);card.setAttribute('aria-pressed',String(active));card.querySelector('.selection-check').textContent=active?'✓':''});return;
  }
  if(action==='orderFlowStoreCard'){st.orderFlowStore=stores[Number(node.dataset.i)].name;go('orderAssessmentStart',false);return}
  if(action==='orderFlowCoachCard'){st.orderFlowCoach=node.dataset.v;go('orderAssessmentStart',false);return}
  if(action==='appointmentNavigate'){
    const store=stores[Number(node.dataset.i)];modal('导航至'+store.name,`<p class="small">${store.address}</p><p class="small muted">距您 ${store.distance} km · 地图导航预览</p><button class="btn full" data-act="close">知道了</button>`);return;
  }
  if(action==='rescheduleAccountAppointment'){
    const item=st.appointments.find(appointment=>appointment.id===node.dataset.id);
    if(!item)return;
    if(appointmentIsWithinHour(item)){toast('预约开始前一小时内不可改期');return}
    const date=item.date.match(/(\d+)月(\d+)日/),time=item.date.match(/(\d{1,2}):(\d{2})/);
    st.appointmentId=item.id;st.store=item.store;st.therapist=item.coach;st.bookedName=item.name;st.slot='';
    if(date)st.date=`${date[1]}月${date[2]}日`;
    st.service=S.findIndex(service=>service[0]===item.name);if(st.service<0)st.service=6;
    st.btype=item.name.includes('评估')?'eval':'service';go('booking');return;
  }
  if(action==='bookService'&&node.dataset.id){const item=st.appointments.find(appointment=>appointment.id===node.dataset.id);if(item){st.service=S.findIndex(service=>service[0]===item.name);if(st.service<0)st.service=6;st.bookedName=item.name;st.btype=item.name.includes('评估')?'eval':'service'}}
  workflowBaseAct(event);
  if(action==='bookingSuccess'&&st.appointments[0]){
    const appointment=st.appointments[0],coachIndex=Math.max(0,coaches.findIndex(coach=>coach.name===appointment.coach)),storeIndex=Math.max(0,stores.findIndex(store=>store.name===appointment.store));
    appointment.coachImage=coaches[coachIndex].image;appointment.coachTitle=workflowTitles[coachIndex];appointment.storeImage=stores[storeIndex].images[0];draw();
  }
};

const workflowFlowDraw=draw;
draw=function(){
  workflowFlowDraw();
  if(st.page==='appointments')document.querySelectorAll('.appointment-card[data-act="appointmentDetail"]').forEach(card=>card.addEventListener('keydown',event=>{if(event.target===card&&['Enter',' '].includes(event.key)){event.preventDefault();card.click()}}));
};
