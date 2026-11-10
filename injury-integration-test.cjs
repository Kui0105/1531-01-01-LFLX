const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),inline=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const store=new Map(),elements=new Map();
const context=vm.createContext({console,Date,Intl,Set,URLSearchParams,location:{origin:'http://localhost'},
  window:{addEventListener(){}},
  document:{head:{append(){},insertAdjacentHTML(){}},createElement:()=>({}),addEventListener(){},getElementById:id=>elements.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[]},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)},
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){}});
vm.runInContext(inline.slice(0,inline.indexOf("document.getElementById('pageSearch').addEventListener")),context);
vm.runInContext("draw=function(){};go=function(page){st.page=page};toast=function(value){globalThis.lastToast=value};close=function(){};modal=function(){}",context);
for(const file of ['service-interactions.js','account-refinements.js','workflow-refinements.js','rewards-refinements.js','account-lifecycle.js','therapist-workspace.js']){
  let source=fs.readFileSync(file,'utf8');
  if(file==='therapist-workspace.js')source=source.replace(/\ndraw\(\);/g,'\n');
  vm.runInContext(source,context,{filename:file});
}
const run=code=>vm.runInContext(code,context);
run("st.page='employee';st.employeeRole='康复师';st.employeeTab='therapistRecordForm';st.therapistAppointmentId='AP-T002';therapistAppointment('AP-T002').status='服务中';draw=function(){};go=function(page){st.page=page}");
assert.match(run('therapistRecordForm()'),/injuryAssessmentMount/);
assert.doesNotMatch(run('therapistRecordForm()'),/<iframe|injury-questionnaire\.html/);
run('saveInjuryReport')({appointmentId:'AP-T002',answers:{e1:['膝'],c1v:6},summary:'膝关节测试报告'});
assert.equal(run("therapistAppointment('AP-T002').status"),'待核销');
assert.equal(run('st.therapistRecords[0].customerId'),'CU1002');
assert.equal(JSON.parse(store.get('lflx_injury_reports'))[0].answers.c1v,6);
run("st.therapistCustomerId='CU1002';st.therapistArchiveReportIndex=0");
assert.match(run('therapistCustomerArchive()'),/膝关节测试报告/);
assert.match(run('therapistArchiveReport()'),/injuryAssessmentMount/);
run("st.therapistRecords.unshift({customerId:'CU1002',type:'康复纪要',name:'其他记录',time:'2099-01-01 00:00',title:'纪要',content:'记录'});st.therapistArchiveReportIndex=1");
assert.match(run('therapistArchiveReport()'),/injuryAssessmentMount/);
run("st.therapistCustomerId='CU1001';st.therapistArchiveReportIndex=0");
assert.doesNotMatch(run('therapistArchiveReport()'),/injuryAssessmentMount/);
const questionnaire=fs.readFileSync('injury-questionnaire.html','utf8');
new vm.Script(questionnaire.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert.match(questionnaire,/function evaluate\(\)/);assert.match(questionnaire,/function renderResult\(\)/);
const component=fs.readFileSync('injury-assessment.js','utf8');
new vm.Script(component);
assert.doesNotMatch(component,/location\.search|document\.querySelector\('#result|<iframe/);
assert.match(component,/config\.onSubmit/);
const controls=new Map();
const survey=vm.createContext({Date,URLSearchParams,location:{search:'',origin:'http://localhost'},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},getElementById:id=>{if(!controls.has(id))controls.set(id,{});return controls.get(id)},querySelectorAll:()=>[]},setTimeout(){},clearTimeout(){},navigator:{}});
vm.runInContext(questionnaire.match(/<script>([\s\S]*?)<\/script>/)[1],survey);
const low=vm.runInContext("ans={e1:['膝'],c1v:0};evaluate().total",survey);
const high=vm.runInContext("ans={e1:['膝'],c1v:8};evaluate().total",survey);
assert.ok(high>low,'不同疼痛选择应生成不同评分');
console.log('运动损伤评估内嵌组件、档案报告与评分测试通过');
