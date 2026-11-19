// 脑科学、营养预约使用康复师Ⅱ的跨门店排班。
const iiBookingCoach={name:'康复师Ⅱ',image:'coach-chen-photo.png',title:'脑科学 · 运动营养'};
const iiBookingApplies=()=>therapistIIServiceNames.includes(S[Number(st.service)]?.[0]);
const iiBookingMinutes=value=>{const [hours,minutes]=String(value).split(':').map(Number);return hours*60+minutes};
const iiBookingDuration=value=>Number(String(value).match(/\d+/)?.[0])||60;
function iiBookingDates(){
  return Array.from({length:7},(_,index)=>{
    const date=new Date(therapistToday+'T12:00:00');date.setDate(date.getDate()+index);
    return {key:therapistDateKey(date),date,label:`${date.getMonth()+1}月${String(date.getDate()).padStart(2,'0')}日 周${['日','一','二','三','四','五','六'][date.getDay()]}`};
  });
}
function iiBookingReset(){
  st.iiBookingService=Number(st.service);st.iiBookingDate='';st.iiBookingCoach='';st.iiBookingStore='';st.iiBookingPending=null;st.slot='';
  st.iiRescheduleId=st.iiRescheduleRequested||'';
}
function iiBookingSelection(){
  const day=iiBookingDates().find(item=>item.key===st.iiBookingDate);
  const shift=day?therapistIIShiftLabel(day.key):'';
  const store=stores.find(item=>item.name===shift);
  const coachSelected=!!store&&st.iiBookingCoach===iiBookingCoach.name&&st.iiBookingStore===store.name;
  return {day,shift,store,coachSelected};
}
function iiBookingSlotStatus(day,time,duration=iiBookingDuration(S[st.service]?.[2])){
  if(!day||!stores.some(store=>store.name===therapistIIShiftLabel(day.key)))return '未排班';
  if(!therapistSlotList.includes(time))return '不可预约';
  const start=iiBookingMinutes(time),end=start+duration,[open,close]=therapistBusinessHours(day.date);
  if(start<iiBookingMinutes(open)||end>iiBookingMinutes(close))return '休息';
  if(new Date(day.key+'T'+time+':00').getTime()<=Date.now())return '已过时';
  for(let minute=start;minute<end;minute+=30){
    const part=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
    const status=therapistSlotStatus(day.date,part);if(status!=='空闲')return status;
  }
  const exclude=st.iiRescheduleId;
  const staffBusy=therapistAppointments.some(item=>
    therapistIIServiceNames.includes(item.service)&&item.date===day.key&&item.status!=='已取消'&&item.id!=='AP-USER-'+exclude&&
    start<iiBookingMinutes(item.time)+iiBookingDuration(item.duration)&&end>iiBookingMinutes(item.time));
  const userBusy=(st.appointments||[]).some(item=>
    therapistIIServiceNames.includes(item.name)&&item.dateKey===day.key&&item.status!=='已取消'&&item.id!==exclude&&
    start<iiBookingMinutes(item.time)+iiBookingDuration(item.duration)&&end>iiBookingMinutes(item.time));
  return staffBusy||userBusy?'忙碌':'空闲';
}
function iiBookingPage(){
  if(st.iiBookingService!==Number(st.service))iiBookingReset();
  const {day,shift,store,coachSelected}=iiBookingSelection();
  const dates=iiBookingDates().map(item=>`<button class="tile ${day?.key===item.key?'ii-date-selected':''}" data-act="iiBookingDate" aria-label="${item.label}" data-key="${item.key}" aria-pressed="${day?.key===item.key}"><b>${item.date.getMonth()+1}/${item.date.getDate()}</b><small>${item.label.split(' ')[1]}</small></button>`).join('');
  const coachBlock=day?`<section class="selection-group"><h3>选择康复师</h3>${store?`<button class="selection-person ${coachSelected?'selected':''}" data-act="iiBookingCoach" aria-pressed="${coachSelected}"><img src="${A+iiBookingCoach.image}" alt="康复师头像"><span class="selection-person-copy"><b>${iiBookingCoach.name}</b><small>${iiBookingCoach.title}</small></span><span class="selection-check" aria-hidden="true">${coachSelected?'✓':''}</span></button>`:`<p class="small muted">${shift==='休息'?'当天康复师休息，请更换日期。':'当天尚未安排服务门店，请选择其他日期。'}</p>`}</section>`:'<p class="tiny muted">请先选择预约日期，再选择康复师。</p>';
  const storeBlock=coachSelected?`<section class="selection-group"><h3>服务门店</h3><div class="selection-store"><img src="${A+store.images[0]}" alt="门店环境"><span class="selection-store-copy"><b>${store.name}</b><small>${store.address}</small><small>康复师当日在岗门店 · ${day.label}</small></span></div></section>`:'';
  const slots=coachSelected?therapistSlotList.filter(time=>time>=therapistBusinessHours(day.date)[0]&&time<therapistBusinessHours(day.date)[1]).map(time=>{
    const status=iiBookingSlotStatus(day,time);
    return `<button class="pill ${st.slot===time?'active':''}" data-act="iiBookingSlot" data-v="${time}" ${status==='空闲'?'':'disabled'} aria-pressed="${st.slot===time}">${time}${status==='空闲'?'':`<small class="ii-slot-status">${status}</small>`}</button>`;
  }).join(''):'';
  const slotBlock=coachSelected?`<section class="selection-group"><h3>可预约时段</h3><div class="grid3 ii-booking-slots">${slots}</div><p class="tiny muted">按服务时长占用预约时段，忙碌、占用及休息时段不可预约。</p></section>`:'';
  const canSubmit=coachSelected&&st.slot&&iiBookingSlotStatus(day,st.slot)==='空闲';
  return `<div class="ii-booking"><section class="selection-group"><h3>选择预约日期</h3><div class="grid3 ii-booking-dates">${dates}</div></section>${coachBlock}${storeBlock}${slotBlock}</div>${cta(`<button class="btn" data-act="confirmBooking" ${canSubmit?'':'disabled'}>确认预约</button>`)}`;
}
function iiBookingValidate(){
  const selection=iiBookingSelection();
  if(!selection.day){toast('请先选择预约日期');return false}
  if(!selection.coachSelected){toast('请选择当天可预约的康复师');return false}
  if(!st.slot||iiBookingSlotStatus(selection.day,st.slot)!=='空闲'){st.slot='';toast('该时段已不可预约，请重新选择');draw();return false}
  st.date=selection.day.label;st.store=selection.store.name;st.therapist=iiBookingCoach.name;st.bookedName=S[st.service][0];
  return true;
}
const iiBookingSignature=()=>[st.service,st.iiBookingDate,st.iiBookingCoach,st.iiBookingStore,st.slot,st.iiRescheduleId].join('|');
function iiBookingSaveStaffAppointment(appointment){
  const profile=st.accountProfile||{},phone=workflowAuthorizedPhone();
  let customer=therapistCustomerData.find(item=>item.phone===phone);
  if(!customer){customer={id:'CU-USER-'+phone,name:profile.name||profile.nickname||'预约用户',nickname:profile.nickname||'预约用户',gender:profile.gender||'—',phone,avatar:'coach-lin.png',kind:'新客',orders:[]};therapistCustomerData.push(customer)}
  const sourceOrder=st.accountOrder?.name===appointment.name?st.accountOrder:null;
  const orderId=appointment.orderId||sourceOrder?.id||'SO-USER-'+appointment.id;
  if(!customer.orders.some(item=>item.id===orderId))customer.orders.push({id:orderId,name:appointment.name,total:sourceOrder?.quantity||1,used:0,expiry:'2027-12-31',records:[]});
  appointment.orderId=orderId;
  const staffId='AP-USER-'+appointment.id,existing=therapistAppointments.find(item=>item.id===staffId);
  const data={id:staffId,customerId:customer.id,customer:customer.name,date:appointment.dateKey,time:appointment.time,service:appointment.name,type:appointment.name.includes('评估')?'评估':'服务',status:'待服务',duration:appointment.duration,orderId,image:appointment.image,assignedTo:iiBookingCoach.name,store:appointment.store};
  if(existing)Object.assign(existing,data);else therapistAppointments.push(data);
  const messageId='TM-'+staffId,content=`${customer.name}已预约 ${data.date} ${data.time} ${data.service}，服务门店：${data.store}。`;
  const message=therapistMessages.find(item=>item.id===messageId);
  if(message)Object.assign(message,{content,unread:true});else therapistMessages.unshift({id:messageId,type:'客户预约提醒',time:therapistToday,appointmentId:staffId,customerId:customer.id,content,unread:true});
}

// 数据查找保留全量，页面与操作入口按当前身份判断，避免影响历史报告恢复。
function employeeOrderAccessDenied(action,data){
  if(st.page!=='employee')return false;
  let appointment;
  if(['therapistAppointmentDetail','therapistStart','confirmTherapistStart','therapistFillRecord','therapistScan','managerChangeCoach'].includes(action))appointment=therapistAppointment(data.id);
  else if(action==='confirmTherapistRedemption')appointment=therapistAppointment(data.appointment);
  else if(['managerSelectCoach','confirmManagerCoach'].includes(action))appointment=therapistAppointment(st.managerPendingAppointment);
  else if(['saveTherapistAssessment','saveTherapistNote'].includes(action)||action.startsWith('brain')&&!action.includes('User'))appointment=therapistAppointment(st.therapistAppointmentId);
  if(appointment&&!employeeCanSeeService(appointment.service))return true;
  if(action==='therapistServiceHistory'){
    const order=therapistServiceOrder(data.order);return !!order&&!employeeCanSeeService(order.name);
  }
  return false;
}
const roleBookingBasePages=pagesContent;
pagesContent=function(page){
  if(page==='booking'&&iiBookingApplies())return iiBookingPage();
  if(page==='employee'&&['therapistAppointmentDetail','therapistRecordForm'].includes(st.employeeTab)){
    const appointment=therapistAppointment(st.therapistAppointmentId);
    if(appointment&&!employeeCanSeeService(appointment.service))return '<div class="empty">当前身份无法查看该订单，请返回订单列表。</div>';
  }
  return roleBookingBasePages(page);
};
const roleBookingBaseGo=go;
go=function(page,push=true){if(page==='booking'&&iiBookingApplies())iiBookingReset();return roleBookingBaseGo(page,push)};
const roleBookingBaseAct=act;
act=function(event){
  const node=event.currentTarget,action=node.dataset.act;
  if(employeeOrderAccessDenied(action,node.dataset)){toast('当前身份无法操作该订单');return}
  if(action==='rescheduleAccountAppointment')st.iiRescheduleRequested=node.dataset.id;
  if(iiBookingApplies()&&(st.page==='booking'||action==='bookingSuccess')){
    if(action==='iiBookingDate'){
      if(!iiBookingDates().some(item=>item.key===node.dataset.key))return;
      st.iiBookingDate=node.dataset.key;st.iiBookingCoach='';st.iiBookingStore='';st.slot='';st.iiBookingPending=null;draw();return;
    }
    if(action==='iiBookingCoach'){
      const {store}=iiBookingSelection();if(!store)return;
      st.iiBookingCoach=iiBookingCoach.name;st.iiBookingStore=store.name;st.slot='';st.iiBookingPending=null;draw();return;
    }
    if(action==='iiBookingSlot'){
      const {day,coachSelected}=iiBookingSelection();if(!coachSelected||iiBookingSlotStatus(day,node.dataset.v)!=='空闲'){toast('该时段不可预约');return}
      st.slot=node.dataset.v;st.iiBookingPending=null;draw();return;
    }
    if(['changeWorkflowStore','bookingCoachCard','date','slot','therapist'].includes(action))return;
    if(action==='confirmBooking'){
      if(!iiBookingValidate())return;
      st.iiBookingPending=iiBookingSignature();
    }
    if(action==='bookingSuccess'){
      if(st.page!=='booking'||!st.iiBookingPending||st.iiBookingPending!==iiBookingSignature())return;
      if(!iiBookingValidate()){st.iiBookingPending=null;close();return}
      const day=iiBookingSelection().day,slot=st.slot,store=st.store;
      const previous=st.appointments.find(item=>item.id===st.iiRescheduleId);
      st.iiBookingPending=null;
      roleBookingBaseAct(event);
      let appointment=st.appointments[0];
      Object.assign(appointment,{dateKey:day.key,time:slot,coach:iiBookingCoach.name,coachImage:iiBookingCoach.image,coachTitle:iiBookingCoach.title,store,storeImage:stores.find(item=>item.name===store).images[0]});
      if(previous){st.appointments.shift();Object.assign(previous,{...appointment,id:previous.id,orderId:previous.orderId});appointment=previous}
      st.appointmentId=appointment.id;iiBookingSaveStaffAppointment(appointment);st.iiRescheduleId='';draw();return;
    }
  }
  const result=roleBookingBaseAct(event);
  if(action==='confirmCancelAccountAppointment'){
    const appointment=st.appointments.find(item=>item.id===node.dataset.id);
    if(appointment?.status==='已取消'&&therapistIIServiceNames.includes(appointment.name)){
      const staffId='AP-USER-'+appointment.id;
      const staffAppointment=therapistAppointments.find(item=>item.id===staffId);
      if(staffAppointment)staffAppointment.status='已取消';
      for(const message of therapistMessages)if(message.appointmentId===staffId)message.unread=false;
      draw();
    }
  }
  st.iiRescheduleRequested='';return result;
};
for(const appointment of therapistAppointments)if(therapistIIServiceNames.includes(appointment.service)){
  appointment.assignedTo||=iiBookingCoach.name;appointment.store||=therapistIIShiftLabel(appointment.date);
}
// 预约详情沿用已有展示，并显示该类康复师的职称信息。
const iiOriginalAppointmentDetail=workflowAppointmentDetail;
workflowAppointmentDetail=function(){const item=st.appointments.find(entry=>entry.id===st.appointmentId)||st.appointments[0];const html=iiOriginalAppointmentDetail();return item?.coach===iiBookingCoach.name?html.replace(`<small>${workflowTitles[0]}</small>`,`<small>${iiBookingCoach.title}</small>`):html};
if(st.page==='booking')draw();
