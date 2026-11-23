const fs = require('node:fs');
const harness = fs.readFileSync('brain-assessment-integration-test.cjs', 'utf8')
  .split("run(\"st.page='employee'")[0];

eval(harness + `
vm.runInContext(fs.readFileSync('role-booking-refinements.js','utf8'), context);
const fire = (action, data = {}) => run('act')({
  currentTarget: { dataset: { act: action, ...data } },
  target: { closest: () => null },
});
const render = page => run('pagesContent(' + JSON.stringify(page) + ')');
const select = id => run('st.accountOrder=st.orders.find(item=>item.id===' + JSON.stringify(id) + ')');
const simulate = (id, next) => {
  const stage = run('lifecycleProductAfterSaleStage(st.orders.find(item=>item.id===' + JSON.stringify(id) + '))');
  fire('simulateProductAfterSale', { id, stage, next });
  fire('confirmSimulateProductAfterSale', { id, stage, next });
};
const apply = (id, type) => {
  fire('applyProductAfterSale', { id });
  elements.set('productAfterSaleType', { value: type });
  elements.set('productAfterSaleReason', { value: '其他' });
  elements.set('productAfterSaleRemarks', { value: '<script>备注</script>' });
  fire('submitProductAfterSale');
  assert.equal(run('lastModal.title'), '确认提交售后');
  fire('confirmProductAfterSale');
  fire('openAfterSaleDetail', { id });
};

// Cancelled services retain their service selection when bought again.
run('st.orderType="服务订单";st.orderFilter="已取消"');
select('SV2026110406');
for (const page of ['orders', 'orderDetail']) assert.match(render(page), /reBuyService/);
fire('reBuyService', { id: 'SV2026110406' });
assert.equal(run('st.page'), 'serviceDetail');
assert.equal(run('S[st.service][0]'), '膝关节运动康复');
assert.equal(run('st.btype'), 'service');

// Pending shipment exposes cancellation in both entry points.
run('st.orderType="商品订单";st.orderFilter="待发货"');
select('GO2026110402');
for (const page of ['orders', 'orderDetail']) {
  assert.match(render(page), /cancelAccountOrder/);
  assert.doesNotMatch(render(page), /查看物流/);
}
fire('cancelAccountOrder', { id: 'GO2026110402' });
assert.equal(run('lastModal.title'), '取消订单');
assert.equal(run('st.accountOrder.status'), '待发货');
fire('confirmCancelAccountOrder', { id: 'GO2026110402' });
assert.equal(run('st.accountOrder.status'), '已取消');
assert.equal(run('st.accountOrder.refundAmount'), 89);

// Receiving an order requires confirmation and opens the completed list.
select('GO2026110403');
fire('confirmReceived', { id: 'GO2026110403' });
assert.equal(run('lastModal.title'), '确认收货');
assert.equal(run('st.accountOrder.status'), '待收货');
fire('close');
assert.equal(run('st.accountOrder.status'), '待收货');
fire('confirmReceived', { id: 'GO2026110403' });
fire('confirmProductReceived', { id: 'GO2026110403' });
assert.equal(run('st.page'), 'orders');
assert.equal(run('st.orderFilter'), '已完成');
assert.equal(run('lastToast'), '已确认收货');
assert.match(render('orders'), /GO2026110403/);
assert.match(render('orderDetail'), /data-go="products">再次购买/);
const receivedAt = run('st.accountOrder.receivedAt');
fire('confirmProductReceived', { id: 'GO2026110403' });
assert.equal(run('st.accountOrder.receivedAt'), receivedAt);
fire('confirmCancelAccountOrder', { id: 'GO2026110403' });
assert.equal(run('st.accountOrder.status'), '已完成');

// The form validates type and reason and retains uploaded image evidence.
fire('applyProductAfterSale', { id: 'GO2026110403' });
for (const label of ['售后类型', '仅退款', '退货退款', '售后原因', '上传图片', '备注说明']) assert.ok(render('afterSale').includes(label));
fire('submitProductAfterSale');
assert.equal(run('lastToast'), '请选择售后类型');
elements.set('productAfterSaleType', { value: '退货退款' });
fire('submitProductAfterSale');
assert.equal(run('lastToast'), '请选择售后原因');
elements.set('productAfterSaleReason', { value: '商品破损' });
elements.set('productAfterSaleRemarks', { value: '<script>照片说明</script>' });
run('st.productAfterSaleDraft.images=["data:image/png;base64,aGVsbG8="]');
fire('submitProductAfterSale');
assert.equal(run('st.accountOrder.status'), '已完成');
fire('confirmProductAfterSale');
assert.equal(run('st.page'), 'afterSaleOrders');
assert.equal(run('st.accountOrder.afterSale.type'), '退货退款');
assert.equal(run('st.accountOrder.afterSale.stage'), '待审核');
fire('openAfterSaleDetail', { id: 'GO2026110403' });
assert.match(render('afterSaleDetail'), /&lt;script&gt;照片说明&lt;[/]script&gt;/);
assert.match(render('afterSaleDetail'), /data:image[/]png;base64,aGVsbG8=/);

// Review approval starts the return flow, never completing its refund early.
simulate('GO2026110403', 'approve');
assert.equal(run('st.accountOrder.afterSale.stage'), '待退货');
assert.equal(run('st.accountOrder.afterSale.status'), '售后中');
assert.equal(run('st.accountOrder.refundAmount'), undefined);
assert.match(render('afterSaleOrders'), /待退货/);
assert.match(render('afterSaleDetail'), /填写退货物流/);
fire('confirmSimulateProductAfterSale', { id: 'GO2026110403', stage: '待退货', next: 'refund' });
assert.equal(run('st.accountOrder.afterSale.stage'), '待退货');
fire('openReturnLogistics', { id: 'GO2026110403' });
assert.equal(run('st.page'), 'returnLogistics');
fire('submitReturnLogistics');
assert.equal(run('lastToast'), '请填写快递公司和快递单号');
elements.set('returnLogisticsCompany', { value: '顺丰速运' });
elements.set('returnLogisticsNumber', { value: 'SF123456789012' });
fire('submitReturnLogistics');
assert.equal(run('lastModal.title'), '确认退货物流');
assert.equal(run('st.accountOrder.afterSale.stage'), '待退货');
fire('confirmReturnLogistics');
assert.equal(run('st.page'), 'afterSaleDetail');
assert.equal(run('st.accountOrder.afterSale.stage'), '待平台收货');
assert.match(render('afterSaleDetail'), /SF123456789012/);
assert.match(render('afterSaleOrders'), /待平台收货/);
fire('confirmReturnLogistics');
assert.equal(run('st.accountOrder.afterSale.stage'), '待平台收货');
simulate('GO2026110403', 'receive');
assert.equal(run('st.accountOrder.afterSale.stage'), '待平台退款');
assert.equal(run('st.accountOrder.afterSale.status'), '售后中');
assert.equal(run('st.accountOrder.refundAmount'), undefined);
assert.match(render('afterSaleOrders'), /待平台退款/);
simulate('GO2026110403', 'refund');
assert.equal(run('st.accountOrder.afterSale.status'), '售后完成');
assert.equal(run('st.accountOrder.refundAmount'), 129);
assert.match(render('afterSaleDetail'), /原路退回（模拟）/);
assert.doesNotMatch(render('afterSaleDetail'), /data-act="simulateProductAfterSale"/);
const refundedAt = run('st.accountOrder.afterSale.refundedAt');
fire('confirmSimulateProductAfterSale', { id: 'GO2026110403', stage: '待平台退款', next: 'refund' });
assert.equal(run('st.accountOrder.afterSale.refundedAt'), refundedAt);

// Refund-only requests finish on approval without a return shipment.
apply('GO2026110404', '仅退款');
simulate('GO2026110404', 'approve');
assert.equal(run('st.accountOrder.afterSale.status'), '售后完成');
assert.equal(run('st.accountOrder.refundAmount'), 59);
assert.doesNotMatch(render('afterSaleDetail'), /填写退货物流/);

// Rejected requests keep the rejection state and cannot be progressed.
simulate('GO2026110405', 'reject');
fire('openAfterSaleDetail', { id: 'GO2026110405' });
assert.equal(run('st.accountOrder.afterSale.status'), '售后驳回');
assert.doesNotMatch(render('afterSaleDetail'), /data-act="simulateProductAfterSale"/);
fire('afterSaleOrderStatus', { v: '售后驳回' });
assert.match(render('afterSaleOrders'), /GO2026110405/);
for (const [id, stage] of [['GO-RETURN-STAGE-0','待退货'],['GO-RETURN-STAGE-1','待平台收货'],['GO-RETURN-STAGE-2','待平台退款']]) {
  fire('openAfterSaleDetail', { id });
  assert.ok(render('afterSaleDetail').includes(stage));
}
console.log('商品订单取消、收货确认、再次购买、售后申请及退货退款完整流程检查通过');
`);
