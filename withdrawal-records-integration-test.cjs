const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const harness = fs.readFileSync('brain-assessment-integration-test.cjs', 'utf8')
  .split("run(\"st.page='employee'")[0];

eval(harness + `
const fire = (action, data = {}) => run('act')({
  currentTarget: { dataset: { act: action, ...data } },
  target: { closest: () => null },
});
const page = route => run('pagesContent(' + JSON.stringify(route) + ')');

const withdrawPage = page('promotionWithdraw');
assert.match(withdrawPage, /提现记录/);
assert.doesNotMatch(withdrawPage, /查看佣金明细/);

const recordsPage = page('withdrawalRecords');
for (const label of ['提现金额', '提现手续费', '到账金额', '提现时间', '待审核', '待打款', '已打款', '已拒绝']) {
  assert.match(recordsPage, new RegExp(label));
}
assert.equal(run('st.withdrawalRecords.length'), 4);

fire('withdrawalRecordDetail', { id: 'WD2026110801' });
assert.equal(run('globalThis.lastModal.title'), '打款凭证');
assert.match(run('globalThis.lastModal.body'), /ZB20261108001520/);
fire('withdrawalRecordDetail', { id: 'WD2026102901' });
assert.equal(run('globalThis.lastModal.title'), '提现驳回原因');
assert.match(run('globalThis.lastModal.body'), /收款账户姓名与开户信息不一致/);

run("st.withdrawalStatus='待审核'");
assert.equal(run("rewardsWithdrawalResults().includes('待打款')"), false);
console.log('提现记录入口、状态列表、打款凭证和驳回原因检查通过');
`);
