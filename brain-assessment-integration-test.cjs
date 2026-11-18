const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const store = new Map();
const elements = new Map();
const context = vm.createContext({
  console, Date, Intl, Set, URLSearchParams,
  location: { origin: 'http://localhost' },
  window: { addEventListener() {} },
  document: {
    head: { append() {}, appendChild() {}, insertAdjacentHTML() {} },
    createElement: () => ({}), addEventListener() {},
    getElementById: id => elements.get(id) || null,
    querySelector: () => null, querySelectorAll: () => [],
  },
  localStorage: {
    getItem: key => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => store.delete(key),
  },
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
});

vm.runInContext(inline.slice(0, inline.indexOf("document.getElementById('pageSearch').addEventListener")), context);
vm.runInContext("draw=function(){};go=function(page){st.page=page};toast=function(value){globalThis.lastToast=value};close=function(){};modal=function(title,body){globalThis.lastModal={title,body}}", context);
for (const file of [
  'service-interactions.js', 'account-refinements.js', 'workflow-refinements.js',
  'rewards-refinements.js', 'account-lifecycle.js', 'therapist-workspace.js',
]) {
  let source = fs.readFileSync(file, 'utf8');
  if (file === 'therapist-workspace.js') source = source.replace(/\ndraw\(\);/g, '\n');
  vm.runInContext(source, context, { filename: file });
}
vm.runInContext(fs.readFileSync('brain-assessment-data.js', 'utf8'), context, { filename: 'brain-assessment-data.js' });
vm.runInContext(fs.readFileSync('brain-assessment.js', 'utf8').replace(/\ndraw\(\);\s*$/, '\n'), context, { filename: 'brain-assessment.js' });
vm.runInContext('draw=function(){}', context);
const run = code => vm.runInContext(code, context);

run("st.page='employee';st.employeeRole='康复师';st.employeeTab='therapistRecordForm';st.therapistAppointmentId='AP-BRAIN-001';st.accountProfile={phone:'13800138000',customerId:'CU1002'};therapistAppointment('AP-BRAIN-001').status='服务中';st.brainAssessmentStep='reflex'");
assert.equal(run('brainSections.length'), 15, '评估从原始反射起包含 15 个表单类型');
let page = run('brainFormPage()');
assert.match(page, /原始反射评估/);
assert.match(page, /用户已填写的基本信息与主诉/);
assert.doesNotMatch(page, /<h2>基本信息<\/h2>|<h2>主诉 \/ 诉求<\/h2>/, '用户已填写内容只查看、不重复填表');

const sections = run('brainSections.map(section=>({id:section.id,title:section.title}))');
for (let i = 0; i < sections.length; i++) {
  page = run('brainFormPage()');
  assert.ok(page.includes(sections[i].title), `应显示第 ${i + 1} 类表单：${sections[i].title}`);
  const next = i === sections.length - 1 ? 'summary' : sections[i + 1].id;
  run(`st.brainAssessmentStep=${JSON.stringify(sections[i].id)};st.therapistAppointmentId='AP-BRAIN-001'`);
  const event = { currentTarget: { dataset: { act: 'brainNext', next } } };
  run('act')(event);
  assert.equal(run('st.brainAssessmentStep'), next, `下一步应进入 ${next}`);
}
assert.match(run('brainFormPage()'), /评估总结/);

const scoring = run(`(()=>{
  const answers=brainDefaultAnswers();
  const reflex=brainSections.find(section=>section.id==='reflex');
  const abnormal=reflex.items.find(item=>item.options.some(option=>option.abn));
  answers['reflex.'+abnormal.name]=abnormal.options.find(option=>option.abn).label;
  return {one:brainScore(answers),colors:[brainScoreColor(100),brainScoreColor(85),brainScoreColor(70),brainScoreColor(68.5)]};
})()`);
assert.equal(scoring.one.score, 98.5);
assert.equal(scoring.one.abnormal, 1);
assert.deepEqual(Array.from(scoring.colors), ['#27864b', '#df8a20', '#df8a20', '#d94a4a']);

run("st.brainAssessmentStep='summary';localStorage.setItem('lflx_brain_assessment_intakes_v1',JSON.stringify([{orderId:'SO-BRAIN-001',customerId:'CU1002',name:'李先生',gender:'男',age:'28岁',phone:'13800138000',issues:['专注力不好']}]))");
elements.set('form', {});
const formFields = [
  { dataset: { brainField: 'summary' }, value: '评估总结测试' },
  { dataset: { brainField: 'plan' }, value: '康复方案测试' },
  { dataset: { brainField: 'cycle' }, value: '建议 8 周' },
];
context.document.querySelectorAll = selector => selector === '[data-brain-field]' ? formFields : [];
const appointment = run("therapistAppointment('AP-BRAIN-001')");
const appointmentArg = appointment;
run('brainSubmit')(appointmentArg);
assert.match(run('lastToast'), /脑科学评估报告已提交/);
assert.equal(appointmentArg.status, '待核销');
const reports = JSON.parse(store.get('lflx_brain_assessment_reports_v1'));
assert.equal(reports.length, 1);
assert.equal(reports[0].summary, '评估总结测试');
assert.equal(reports[0].plan, '康复方案测试');
assert.equal(reports[0].cycle, '建议 8 周');
assert.match(run('brainReportCard(JSON.parse(localStorage.getItem("lflx_brain_assessment_reports_v1"))[0],true)'), /康复方案测试/);
assert.match(run('brainUserArchivePage()'), /查看评估报告及康复方案/);
assert.match(run('brainReportCard(JSON.parse(localStorage.getItem("lflx_brain_assessment_reports_v1"))[0],false)'), /评估总结测试/);

console.log('脑科学评估流程集成测试通过：用户资料只读、15 类表单导航、异常计分、报告提交、双方康复档案可见。');
