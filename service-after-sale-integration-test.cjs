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
assert.equal(run('st.page'), 'orders');
assert.equal(run('st.accountOrder.status'), '售后中');
assert.equal(run('st.accountOrder.afterSale.amount'), 656);
assert.equal(run('st.accountOrder.afterSale.remaining'), 2);
assert.equal(run('st.orderFilter'), '售后中');
const requestTime = run('st.accountOrder.afterSale.submittedAt');
fire('confirmServiceAfterSale');
assert.equal(run('st.accountOrder.afterSale.submittedAt'), requestTime);
fire('cancelAccountOrder', { id: 'SV2026110403' });
assert.equal(run('st.accountOrder.status'), '售后中');
fire('viewServiceAfterSale', { id: 'SV2026110403' });
page = render('afterSale');
assert.ok(page.includes('&lt;script&gt;补充说明&lt;/script&gt;'));
assert.doesNotMatch(page, /data-act="submitServiceAfterSale"/);
assert.doesNotMatch(render('orderDetail'), /order-code-card/);

// Each child status filters the actual data, including legacy pending requests.
for (const [status, id] of [['售后中', 'SV2026110405'], ['售后完成', 'SV-AFTER-SALE-0'], ['售后驳回', 'SV-AFTER-SALE-1']]) {
  fire('serviceAfterSaleFilter', { v: status });
  page = render('orders');
  assert.ok(page.includes(id));
  for (const other of ['SV2026110405', 'SV-AFTER-SALE-0', 'SV-AFTER-SALE-1'].filter(value => value !== id)) {
    assert.ok(!page.includes(other));
  }
  selectOrder(id);
  assert.ok(render('orderDetail').includes('>' + status + '</span>'));
  fire('viewServiceAfterSale', { id });
  assert.ok(render('afterSale').includes(status));
  assert.doesNotMatch(render('afterSale'), /data-act="submitServiceAfterSale"/);
}

// Pending service cancellation also cancels its pending reservation.
run('st.appointments.push({id:"AP-CANCEL-TEST",orderId:"SV2026110402",status:"待服务"})');
fire('cancelAccountOrder', { id: 'SV2026110402' });
assert.equal(run('lastModal.title'), '取消订单');
fire('confirmCancelAccountOrder', { id: 'SV2026110402' });
assert.equal(run('st.orders.find(order=>order.id==="SV2026110402").status'), '已取消');
assert.equal(run('st.appointments.find(item=>item.id==="AP-CANCEL-TEST").status'), '已取消');

// Service-specific changes preserve assessment and product flows.
selectOrder('EV2026110403');
assert.doesNotMatch(render('orderDetail'), /查看档案|查看预约|申请售后/);
selectOrder('GO2026110404');
assert.match(render('orderDetail'), /申请售后/);
assert.doesNotMatch(render('afterSale'), /serviceAfterSaleReason/);
assert.equal(run('lifecycleRefundAmount({price:100,quantity:3,redemptions:[{}]})'), 66.67);
console.log('服务订单状态按钮、售后表单、退款金额、提交校验和子状态筛选检查通过');
`);
