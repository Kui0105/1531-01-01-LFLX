const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const harness=fs.readFileSync('brain-assessment-integration-test.cjs','utf8').split("run(\"st.page='employee'")[0];
eval(harness+`
vm.runInContext(fs.readFileSync('role-booking-refinements.js','utf8'),context);
vm.runInContext(fs.readFileSync('nutrition-youth-assessment.js','utf8'),context);
const fire=(action,data={})=>run('act')({currentTarget:{dataset:{act:action,...data}}});
for(const [role,type,group] of [['康复师','康复师','therapistStandardServiceNames'],['康复师','康复师Ⅱ','therapistIIServiceNames'],['店长','技术型店长','therapistStandardServiceNames'],['店长','普通店长',null]]){
  run('st.page="employee";st.employeeRole='+JSON.stringify(role)+';st.employeeType='+JSON.stringify(type));
  const visible=run(role==='店长'?'managerVisibleAppointments()':'therapistVisibleAppointments()');
  if(group){const allowed=Array.from(run(group));assert.ok(visible.every(item=>allowed.includes(item.service)),type);for(const name of allowed)assert.ok(visible.some(item=>item.service===name),type+name)}
  else assert.equal(visible.length,run('therapistAppointments.length'));
  assert.ok(run('therapistMessagesForRole().every(employeeCanSeeMessage)'));
  if(group){const blocked=run(group==='therapistIIServiceNames'?'therapistAppointments.find(item=>therapistStandardServiceNames.includes(item.service))':'therapistAppointments.find(item=>therapistIIServiceNames.includes(item.service))');
    run('st.therapistAppointmentId='+JSON.stringify(blocked.id)+';st.employeeTab="therapistAppointmentDetail"');assert.match(run('pagesContent("employee")'),/无法查看/);
    const status=blocked.status;fire('therapistStart',{id:blocked.id});assert.equal(blocked.status,status);assert.match(run('lastToast'),/无法操作/);
  }
}
for(const index of [4,5,6,11,12,13,14,15,16]){run('st.service='+index+';go("booking")');let html=run('pagesContent("booking")');assert.match(html,/选择预约日期/);assert.doesNotMatch(html,/selection-person/);assert.match(html,/confirmBooking" disabled/)}
assert.equal(run('iiBookingDates().length'),7,'预约日期只显示近七天');
assert.equal((run('pagesContent("booking")').match(/data-act="iiBookingDate"/g)||[]).length,7,'日期横向排班展示七个日期');
run('st.service=6;st.page="assessment"');
const youthForm=run('pagesContent("assessment")');
for(const label of ['青少年/儿童营养评估','出生年月日','出生体重','孕育周期','排便次数','膳食结构调查','健康关注与日常保养'])assert.ok(youthForm.includes(label),label);
run('st.service=16;st.page="serviceDetail"');
assert.equal(run('S[6][0]'),'青少年/儿童营养评估');assert.equal(run('S[16][0]'),'成人营养评估');
run('st.service=7;go("booking")');assert.doesNotMatch(run('pagesContent("booking")'),/iiBookingDate/);
run('st.service=11;st.btype="service";go("booking");st.accountOrder=null');
const days=run('iiBookingDates()');
const day=days.find((item,index)=>index>0&&run('stores.some(store=>store.name===therapistIIShiftLabel('+JSON.stringify(item.key)+'))'));
fire('iiBookingDate',{key:day.key});assert.match(run('pagesContent("booking")'),/选择康复师/);assert.doesNotMatch(run('pagesContent("booking")'),/selection-store/);
fire('iiBookingCoach');assert.equal(run('st.iiBookingStore'),run('therapistIIShiftLabel(st.iiBookingDate)'));
const time=run('therapistSlotList.find(time=>iiBookingSlotStatus(iiBookingSelection().day,time)==="空闲")');assert.ok(time);
fire('iiBookingSlot',{v:time});fire('confirmBooking');assert.match(run('lastModal.title'),/预约/);
const count=run('st.appointments.length');fire('bookingSuccess');assert.equal(run('st.appointments.length'),count+1);
const saved=run('st.appointments[0]');assert.equal(saved.dateKey,day.key);assert.equal(saved.time,time);assert.equal(saved.coach,'康复师Ⅱ');
assert.ok(run('therapistAppointments.some(item=>item.id==="AP-USER-"+st.appointments[0].id&&item.store===st.appointments[0].store)'));
fire('bookingSuccess');assert.equal(run('st.appointments.length'),count+1,'重复提交不新增预约');
run('st.service=11;go("booking")');fire('iiBookingDate',{key:day.key});fire('iiBookingCoach');assert.equal(run('iiBookingSlotStatus(iiBookingSelection().day,'+JSON.stringify(time)+')'),'忙碌');
const newTime=run('therapistSlotList.find(time=>iiBookingSlotStatus(iiBookingSelection().day,time)==="空闲")');assert.ok(newTime);fire('iiBookingSlot',{v:newTime});fire('confirmBooking');
run('therapistScheduleSlots[therapistSlotKey(st.iiBookingDate,st.slot)]="占用"');fire('bookingSuccess');assert.equal(run('st.appointments.length'),count+1,'确认期间冲突需重新选择');
run('delete therapistScheduleSlots[therapistSlotKey(st.iiBookingDate,'+JSON.stringify(newTime)+')]');
fire('iiBookingDate',{key:days[2].key});assert.equal(run('st.iiBookingCoach'), '');assert.equal(run('st.slot'),'');assert.equal(run('st.iiBookingStore'),'');
run('localStorage.setItem(therapistIIShiftStorageKey,JSON.stringify({['+JSON.stringify(days[2].key)+']:"休息"}))');assert.match(run('pagesContent("booking")'),/当天康复师休息/);fire('iiBookingCoach');assert.equal(run('st.iiBookingCoach'),'');
run('localStorage.removeItem(therapistIIShiftStorageKey);st.page="appointments"');fire('rescheduleAccountAppointment',{id:saved.id});assert.equal(run('st.iiRescheduleId'),saved.id);
fire('iiBookingDate',{key:day.key});fire('iiBookingCoach');assert.equal(run('iiBookingSlotStatus(iiBookingSelection().day,'+JSON.stringify(time)+')'),'空闲','改期排除本人旧预约');fire('iiBookingSlot',{v:time});fire('confirmBooking');fire('bookingSuccess');
assert.equal(run('st.appointments.length'),count+1);assert.equal(run('therapistAppointments.filter(item=>item.id==="AP-USER-"+'+JSON.stringify(saved.id)+').length'),1);
assert.equal(run('st.appointments.find(item=>item.id==='+JSON.stringify(saved.id)+').dateKey'),day.key);
run('st.page="appointments"');fire('confirmCancelAccountAppointment',{id:saved.id});
assert.equal(run('therapistAppointments.find(item=>item.id==="AP-USER-"+'+JSON.stringify(saved.id)+').status'),'已取消');
run('st.service=11;go("booking")');fire('iiBookingDate',{key:day.key});fire('iiBookingCoach');
assert.equal(run('iiBookingSlotStatus(iiBookingSelection().day,'+JSON.stringify(time)+')'),'空闲','取消预约释放用户与员工两端时段');
console.log('角色订单与预约集成测试通过：四角色分组、九类预约、门店排班、冲突、保存、改期与取消。');
`);
