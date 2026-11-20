const fs = require('node:fs');
const harness = fs.readFileSync('brain-assessment-integration-test.cjs', 'utf8')
  .split("run(\"st.page='employee'")[0];

eval(harness + `
vm.runInContext(fs.readFileSync('role-booking-refinements.js', 'utf8'), context);
const fire = (action, data = {}) => run('act')({
  currentTarget: { dataset: { act: action, ...data } },
  target: { closest: () => null },
});
const render = page => run('pagesContent(' + JSON.stringify(page) + ')');
const selectOrder = id => run('st.accountOrder=st.orders.find(order=>order.id===' + JSON.stringify(id) + ')');

// Exercise reservation-dependent buttons through the list, detail and actions.
const originalOrders = run('JSON.stringify(st.orders)');
const originalAppointments = run('JSON.stringify(st.appointments)');
const assertActions = (id, labels) => {
  selectOrder(id);
  run('st.orderType="服务订单";st.orderFilter="全部"');
  const list = render('orders');
  const card = list.slice(list.indexOf('data-id="' + id + '"')).split('</article>')[0];
  const detail = render('orderDetail');
  for (const html of [card, detail]) {
    const buttons = [...html.matchAll(/<button[^>]*>([^<]+)<[/]button>/g)].map(match => match[1]);
    assert.deepEqual(buttons, labels);
  }
};
const book = id => {
  fire('accountOrderAction', { id });
  assert.equal(run('st.page'), 'booking');
  run('st.date="11月28日 周六";st.slot="14:00"');
  fire('confirmBooking');
  fire('bookingSuccess');
  assert.equal(run('st.appointments[0].orderId'), id);
};
for (const [id, status] of [['SV2026110402', '待服务'], ['SV2026110403', '服务中']]) {
  const defaults = ['立即服务', '预约服务', status === '待服务' ? '取消订单' : '申请售后'];
  assertActions(id, defaults);
  book(id);
  assert.equal(run('st.orders.find(order=>order.id===' + JSON.stringify(id) + ').status'), status);
  assertActions(id, status === '待服务' ? ['查看预约', '取消订单'] : ['查看预约']);
  run('st.apptTab="已取消"');
  fire('viewPendingAppointment');
  assert.equal(run('st.page'), 'appointments');
  assert.equal(run('st.apptTab'), '待服务');
  assert.ok(render('appointments').includes(run('st.appointments[0].id')));
  if (status === '待服务') {
    fire('cancelAccountOrder', { id });
    assert.equal(run('lastToast'), '请取消预约');
    fire('confirmCancelAccountOrder', { id });
    assert.equal(run('lastToast'), '请取消预约');
    assert.equal(run('st.orders.find(order=>order.id===' + JSON.stringify(id) + ').status'), status);
  }
  fire('confirmCancelAccountAppointment', { id: run('st.appointments[0].id') });
  assertActions(id, defaults);
}

// A one-use order starts service without becoming completed on submission.
const querySelector = context.document.querySelector;
context.document.querySelector = selector => {
  if (selector === '[data-order-flow="store"]') return { value: '静安运动康复中心' };
  if (selector === '[data-order-flow="coach"]') return { value: '林教练' };
  return null;
};
fire('startImmediateService', { id: 'SV2026110402' });
assert.equal(run('st.page'), 'orderServiceStart');
assert.match(render('orderServiceStart'), /提交立即服务/);
fire('submitImmediateService');
assert.equal(run('lastModal.title'), '确认立即服务');
fire('confirmStartImmediateService');
assert.equal(run('st.accountOrder.status'), '服务中');
assert.equal(run('lifecycleRemaining(st.accountOrder)'), 1);
assertActions('SV2026110402', ['立即服务', '预约服务', '申请售后']);
fire('confirmStartImmediateService');
assert.equal(run('st.accountOrder.status'), '服务中');
context.document.querySelector = querySelector;

for (const id of ['SV2026110402', 'SV2026110403', 'EV2026110402', 'EV2026110403']) {
  selectOrder(id);
  assert.match(render('orderDetail'), /有效期/);
  assert.match(render('orderDetail'), /2027-02-28/);
  run('st.accountOrder.expiry="2028-05-01"');
  assert.match(render('orderDetail'), /有效期　2028-05-01/);
}
run('st.orders=' + originalOrders + ';st.appointments=' + originalAppointments + ';st.accountOrder=null');

// Brain-science service reservations use the same buttons with date-first booking.
run('st.orders.unshift({id:"SV-II-BOOKING",type:"服务订单",status:"待服务",name:S[11][0],detail:S[11][2],price:299,image:"service-back.png",date:"2026-11-20"})');
fire('accountOrderAction', { id: 'SV-II-BOOKING' });
const day = run('iiBookingDates().find((item,index)=>index>0&&stores.some(store=>store.name===therapistIIShiftLabel(item.key)))');
fire('iiBookingDate', { key: day.key });
fire('iiBookingCoach');
const slot = run('therapistSlotList.find(time=>iiBookingSlotStatus(iiBookingSelection().day,time)==="空闲")');
fire('iiBookingSlot', { v: slot });
fire('confirmBooking');
fire('bookingSuccess');
assertActions('SV-II-BOOKING', ['查看预约', '取消订单']);
fire('confirmCancelAccountAppointment', { id: run('st.appointments[0].id') });
assertActions('SV-II-BOOKING', ['立即服务', '预约服务', '取消订单']);
run('st.orders=' + originalOrders + ';st.appointments=' + originalAppointments + ';st.accountOrder=null');

for (const [id, status, expected] of [
  ['SV2026110402', '待服务', ['立即服务', '预约服务', '取消订单']],
  ['SV2026110403', '服务中', ['立即服务', '预约服务', '申请售后']],
  ['SV2026110404', '已完成', ['评价服务']],
]) {
  run('st.orderType="服务订单";st.orderFilter=' + JSON.stringify(status));
  selectOrder(id);
  for (const page of ['orders', 'orderDetail']) {
    const html = render(page);
    for (const label of expected) assert.ok(html.includes(label), page + status + label);
    assert.doesNotMatch(html, /查看档案/);
  }
}

fire('applyServiceAfterSale', { id: 'SV2026110403' });
assert.equal(run('st.page'), 'afterSale');
let page = render('afterSale');
for (const label of ['SV2026110403', '膝关节运动康复', '时长', '价格', '实付金额', '剩余次数 / 总次数', '可退金额', '已康复，不需要了', '达不到理想的效果', '备注说明']) {
  assert.ok(page.includes(label), label);
}
assert.ok(page.includes('656.00'));
assert.equal(run('lifecycleRefundAmount(st.accountOrder)'), 656);
fire('submitServiceAfterSale');
assert.equal(run('lastToast'), '请选择售后原因');
elements.set('serviceAfterSaleReason', { value: '已康复，不需要了' });
elements.set('serviceAfterSaleRemarks', { value: '<script>补充说明</script>' });
fire('submitServiceAfterSale');
assert.equal(run('lastModal.title'), '确认提交售后');
assert.equal(run('st.accountOrder.status'), '服务中');

// Recheck unused sessions when the confirmation is submitted.
run('st.accountOrder.redemptions.push({id:"R-CONCURRENT"})');
fire('confirmServiceAfterSale');
assert.equal(run('st.accountOrder.status'), '服务中');
assert.match(run('lastToast'), /次数或金额已变化/);
run('st.accountOrder.redemptions.pop()');
fire('submitServiceAfterSale');
fire('confirmServiceAfterSale');
assert.equal(run('st.page'), 'afterSaleOrders');
assert.equal(run('st.accountOrder.status'), '售后中');
assert.equal(run('st.accountOrder.afterSale.amount'), 656);
assert.equal(run('st.accountOrder.afterSale.remaining'), 2);
assert.equal(run('st.afterSaleOrderStatus'), '售后中');
const requestTime = run('st.accountOrder.afterSale.submittedAt');
fire('confirmServiceAfterSale');
assert.equal(run('st.accountOrder.afterSale.submittedAt'), requestTime);
fire('cancelAccountOrder', { id: 'SV2026110403' });
assert.equal(run('st.accountOrder.status'), '售后中');
fire('viewServiceAfterSale', { id: 'SV2026110403' });
assert.equal(run('st.page'), 'afterSaleDetail');
page = render('afterSaleDetail');
assert.ok(page.includes('&lt;script&gt;补充说明&lt;/script&gt;'));
assert.doesNotMatch(page, /data-act="submitServiceAfterSale"/);
assert.doesNotMatch(render('orderDetail'), /order-code-card/);

// Each child status filters the actual data, including legacy pending requests.
for (const [status, id] of [['售后中', 'SV2026110405'], ['售后完成', 'SV-AFTER-SALE-0'], ['售后驳回', 'SV-AFTER-SALE-1']]) {
  fire('afterSaleOrderStatus', { v: status });
  page = render('afterSaleOrders');
  assert.ok(page.includes(id));
  for (const other of ['SV2026110405', 'SV-AFTER-SALE-0', 'SV-AFTER-SALE-1'].filter(value => value !== id)) {
    assert.ok(!page.includes(other));
  }
  selectOrder(id);
  assert.ok(render('orderDetail').includes('>' + status + '</span>'));
  fire('viewServiceAfterSale', { id });
  assert.ok(render('afterSaleDetail').includes(status));
  assert.doesNotMatch(render('afterSaleDetail'), /data-act="submitServiceAfterSale"/);
}

// Pending reservations must be cancelled before cancelling the service order.
run('st.appointments.push({id:"AP-CANCEL-TEST",orderId:"SV2026110402",status:"待服务"})');
fire('cancelAccountOrder', { id: 'SV2026110402' });
assert.equal(run('lastToast'), '请取消预约');
fire('confirmCancelAccountAppointment', { id: 'AP-CANCEL-TEST' });
fire('cancelAccountOrder', { id: 'SV2026110402' });
assert.equal(run('lastModal.title'), '取消订单');
fire('confirmCancelAccountOrder', { id: 'SV2026110402' });
assert.equal(run('st.orders.find(order=>order.id==="SV2026110402").status'), '已取消');
assert.equal(run('st.appointments.find(item=>item.id==="AP-CANCEL-TEST").status'), '已取消');

// The personal center exposes an independent after-sales list with both types.
assert.match(render('my'), /data-go="afterSaleOrders"/);
assert.ok(render('my').includes('售后/退款'));
assert.equal(run('labels.afterSaleOrders'), '售后/退款');
assert.ok(run('groups.some(group=>group[1].some(item=>item[0]==="afterSaleOrders"))'));
for (const type of ['服务订单', '商品订单']) {
  fire('afterSaleOrderType', { v: type });
  assert.equal(run('st.afterSaleOrderStatus'), '全部');
  for (const status of ['全部', '售后中', '售后完成', '售后驳回']) {
    fire('afterSaleOrderStatus', { v: status });
    const expected = run('st.orders.filter(order=>order.type===' + JSON.stringify(type) + '&&lifecycleIsAfterSaleOrder(order)&&(' + JSON.stringify(status) + '==="全部"||lifecycleAfterSaleStatus(order)===' + JSON.stringify(status) + '))');
    page = render('afterSaleOrders');
    assert.ok(expected.length > 0);
    for (const order of expected) assert.ok(page.includes(order.id));
    const actualIds = [...page.matchAll(/data-act="openAfterSaleDetail" data-id="([^"]+)"/g)].map(match => match[1]);
    assert.equal(actualIds.length, expected.length);
    fire('openAfterSaleDetail', { id: expected[0].id });
    assert.equal(run('st.page'), 'afterSaleDetail');
    assert.ok(render('afterSaleDetail').includes(expected[0].id));
  }
  run('st.orderType=' + JSON.stringify(type) + ';st.orderFilter="全部"');
  for (const order of run('st.orders.filter(order=>lifecycleIsAfterSaleOrder(order))')) {
    assert.ok(!render('orders').includes(order.id));
  }
}

// Product applications are bound to the selected order and land in its type.
fire('applyProductAfterSale', { id: 'GO2026110404' });
assert.equal(run('st.page'), 'afterSale');
assert.match(render('afterSale'), /GO2026110404/);
elements.set('productAfterSaleReason', { value: '其他' });
elements.set('productAfterSaleRemarks', { value: '申请退货退款' });
fire('submitProductAfterSale');
assert.equal(run('lastModal.title'), '确认提交售后');
fire('confirmProductAfterSale');
assert.equal(run('st.page'), 'afterSaleOrders');
assert.equal(run('st.afterSaleOrderType'), '商品订单');
assert.equal(run('st.afterSaleOrderStatus'), '售后中');
assert.match(render('afterSaleOrders'), /GO2026110404/);
assert.equal(run('st.orders.find(order=>order.id==="GO2026110404").afterSale.amount'), 59);
fire('confirmProductAfterSale');
assert.equal(run('lastToast'), '当前订单不可重复申请');
fire('openAfterSaleDetail', { id: 'GO2026110404' });
assert.match(render('afterSaleDetail'), /申请退货退款/);
assert.equal(run('lifecycleOrderStatus({type:"商品订单",status:"售后完成"})'), '售后完成');
run('globalThis.savedAfterSaleOrders=st.orders;st.orders=[]');
assert.match(render('afterSaleOrders'), /当前状态暂无售后订单/);
run('st.orders=savedAfterSaleOrders');

// Service-specific changes preserve assessment and product flows.
selectOrder('EV2026110403');
assert.doesNotMatch(render('orderDetail'), /查看档案|查看预约|申请售后/);
selectOrder('GO2026110406');
run('st.accountOrder.status="已完成"');
assert.match(render('orderDetail'), /申请售后/);
assert.doesNotMatch(render('afterSale'), /serviceAfterSaleReason/);
assert.equal(run('lifecycleRefundAmount({price:100,quantity:3,redemptions:[{}]})'), 66.67);
console.log('服务订单状态按钮、售后表单、退款金额、提交校验和子状态筛选检查通过');
`);
