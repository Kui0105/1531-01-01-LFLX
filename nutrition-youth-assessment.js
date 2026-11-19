// 用户端儿童与青少年营养评估资料表，选项按提供的 Word 需求整理。
const youthNutritionSingle=new Set(['diet-food-variety','diet-grains','diet-vegetables','diet-fruit','diet-fish','diet-meat','diet-beans','diet-fungi','life-sitting']);
const youthNutritionSections=[
['消化系统',[['digest-stool-frequency','排便次数',['一天两次','一天两次以上','一天一次','两天一次','三天一次','三天以上才有一次'],true],['digest-stool-shape','排便是否成型（一般情况下）',['很正常（香蕉状）','有点沾便池','有点干结偏硬','拉稀甚至水样状','很干，排便困难','一颗一颗像羊屎粒粒'],true],['digest-stool-color','排便颜色',['正常（金黄色）','有点偏深色','经常偏黑色','经常偏绿色'],true],['digest-mouth','口腔',['排便时很臭','排便时没有明显臭味','口中有严重的异味','口中偶尔有异味','口气清新，无异味','只在早上起来口中有异味','有龋齿【虫牙】','有涂氟','有做窝沟封闭']],['digest-stomach','胃，你好吗',['正常，没有任何胃不舒服','吃生冷偏硬的食物胃不舒服','有胃胀气的现象','有轻微胃疼的现象','胃部有灼烧感','经常胃疼得厉害','有反酸的现象（食管反流，口苦，口腔感到酸性物质）','医院确诊有胃炎（浅表性胃炎）','医院确诊有胃溃疡','同居住人有幽门螺旋杆菌阳性'],true],['digest-liver','肝胆相照',['家人有肝炎病史','肝功能正常'],true]]],
['免疫系统',[['immune','免疫系统',['容易疲劳，嗜睡，困乏','容易感冒生病','感冒频率（多久感冒一次）','有无患过手足口病/疱疹性咽峡炎','容易扁桃体感染','以上情况都没有，挺正常','其他情况（备注说明）'],true]]],
['呼吸系统',[['resp-lung','肺朝百脉',['慢性支气管炎/细支气管炎','几次或多次有过肺炎','支气管哮喘','肺部常有痰，痰清、稀，量多','肺部常有痰，痰粘稠，色黄','经常咳嗽','慢性咽喉炎','肺部正常，无任何不良症状'],true]]],
['神经系统',[['nerve-vision','视力、脑力等',['近视/远视（若戴眼镜请注明度数）','有散光（若了解请备注散光度数）','有眼部疾病（请备注）','帮孩子建立了视力档案','记忆力不好','注意力很难集中','经常耳鸣','学习成绩让人操心'],true],['nerve-sleep','睡眠状况',['晚上睡觉时间（请说明具体几点钟）','入睡快','总是很难入睡','睡眠质量很好，一觉到天亮','睡眠质量一般，睡眠浅，有时做梦','易惊醒，多梦','是否午睡及时长（请备注）','请备注一天的睡眠总时长（含午睡）','睡前喜欢玩手机','睡觉后后脑勺及/后背出汗','睡觉有磨牙现象'],true],['nerve-psychology','心理状况（1-5分）',['工作生活压力','脾气急躁','焦虑程度','自身人际关系','情绪不良时易爆发'],false,'score']]],
['循环系统',[['circulation-heart','心脏、血管、血液',['先天性心脏病','有胸闷/气短/全身无力/呼吸困难的现象','睡觉打鼾，且常张嘴呼吸','自己觉得都挺正常'],true],['circulation-hemoglobin','血红蛋白/血色素',['请填写血红蛋白值（110-160）','对事物提不起兴趣，漠然','手脚时常冰凉','怕冷（尤其在秋冬）','经常头晕乏力','面色苍白，嘴唇没有血色','反甲（又称凹甲/匙状甲：指甲变薄，中央凹陷而四周隆起，像汤匙）','以上状况都没有，挺正常'],true,'hemoglobin']]],
['运动系统',[['movement-joints','骨骼、关节、肌肉',['关节疼痛/肿胀/僵硬/弹响/积液（请备注具体部位与症状）','腿抽筋（请备注多久出现一次）','腿无力','膝盖疼痛','骨关节都正常'],true]]],
['膳食结构调查',[['diet-food-variety','每天摄取食物种类',['≤10种','11-20种','>20种']],['diet-grains','食物粗细搭配',['精米面为主','粗细各半','粗粮杂粮为主']],['diet-vegetables','平均每天吃蔬菜（包括绿叶菜、瓜茄类、根茎类如土豆、山药）',['<半斤','半斤至1斤','>1斤']],['diet-fruit','平均每天吃水果',['<4两','4-8两','>8两']],['diet-eggs','平均每天吃鸡蛋',['基本不吃','半个到1个','≥2个','只吃蛋白不吃蛋黄']],['diet-fish','平均每天吃鱼/虾',['基本不吃','<1两','1-2两','>2两']],['diet-meat','平均每天吃肉',['<1两','1-2两','>2两','不爱吃肉','素食主义者']],['diet-beans','平均每天吃豆类及豆制品',['每天摄入一块扑克牌大小豆腐','一周有2-3次','基本不吃']],['diet-fungi','每天吃菌类及藻类食物',['每天吃','有时吃，比如一周2-3次','基本不吃']],['diet-milk','奶及奶制品摄入',['每天喝','一周2-3次左右','基本不喝','每天摄入<200毫升','每天摄入200-300毫升','每天摄入300以上']],['diet-breakfast','早餐',['请备注吃早餐时间','请备注早餐大致食物种类','每天都吃早餐','每周有2-3天不吃早餐','基本不吃早餐','早餐基本在家自己做','早餐基本在外吃'],true,'breakfast'],['diet-lunch-dinner','中餐与晚餐',['中餐基本在家吃','中餐基本在外吃或叫外卖','晚餐基本在家吃','晚餐基本在外吃或叫外卖','晚餐应酬多/容易吃得多','中餐基本不吃或只吃蔬菜水果','晚餐基本不吃或只吃蔬菜水果'],true],['diet-water','每天饮水情况',['主要以白开水为主','喜欢喝淡茶水','喜欢喝浓茶','喜欢喝咖啡','喜欢喝含糖饮料','每天饮水量＜1000毫升','每天饮水量1000-1500毫升','每天饮水量1500-2000毫升','每天饮水量＞2000毫升','感觉自己总忘记喝水，经常是不渴不喝水'],true],['diet-habits','饮食习惯',['喜欢甜食','吃得偏咸','吃得偏辣','爱吃腌制食品','爱吃油炸/烧烤食品','吃得清淡','喜欢吃加工食品/垃圾食品','感觉自己属于正常饮食'],true]]],
['生活方式调查',[['life-exercise','平均每周锻炼情况',['每周锻炼≥7次','每周锻炼2-6次','每周锻炼≤1次','每次锻炼>60分钟','每次锻炼20-60分钟','每次锻炼<20分钟','锻炼方式-跑步/走路','锻炼方式-球类','锻炼方式-游泳','锻炼方式-舞蹈/太极拳','其他（请具体说明）','基本不锻炼'],true],['life-sitting','每天除睡眠时间外',['几乎都是坐着的','有2-6小时都是坐着的','只有不到2小时是坐着，其他时间都是站立或走动'],true],['life-activity','每天的活动量',['每天≥6000步','每天2000-6000步','每天<2000步','经常做家务','有时做家务','很少做家务'],true]]],
['其他健康情况',[['other-health','其他',['餐后血糖（备注说明）','空腹血糖（备注说明）','微量元素（备注说明）','肥胖（如体脂肪率高）','湿疹','荨麻疹','鼻炎/鼻窦炎','其他过敏反应（请备注哪些食物过敏等）','以上数据/情况均正常'],true,'other']]],
['健康关注与日常保养',[['care-methods','平时给孩子保养身体的方式有哪些？',['运动','做理疗（如针灸、理疗、小儿推拿等）','看中医，吃中药','买一些高级补品（如燕窝、人参、灵芝孢子粉等）','喜欢研究食补','想保养，但是不知道要如何做','从来不保养身体，觉得顺其自然就好','会购买营养补充剂来保养'],true]]]
];
function youthNutritionEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function youthNutritionAppointment(){return (st.appointments||[]).find(item=>item.id===st.appointmentId&&item.name===S[6][0])}
function youthNutritionStorageKey(){const appointment=youthNutritionAppointment();return 'lflx_nutrition_youth_intake_'+(appointment?.id||st.accountOrder?.id||'draft')}
function youthNutritionRead(){try{return JSON.parse(localStorage.getItem(youthNutritionStorageKey())||'{}')}catch{return {}}}
function youthNutritionWrite(data){try{localStorage.setItem(youthNutritionStorageKey(),JSON.stringify(data));return true}catch{toast('评估资料保存失败，请检查浏览器存储空间');return false}}
function youthNutritionCollect(){
 const data={basic:{},answers:{},details:{}};
 for(const field of document.querySelectorAll('[data-youth-basic]'))data.basic[field.dataset.youthBasic]=field.value.trim();
 data.basic.needs=[...document.querySelectorAll('[data-act="youthNutritionBasicChoice"].selected')].map(node=>node.dataset.value);
 for(const field of document.querySelectorAll('[data-youth-detail]'))data.details[field.dataset.youthDetail]=field.value.trim();
 for(const question of youthNutritionSections.flatMap(section=>section[1])){
  const [key,,options,,kind]=question,selected=[...document.querySelectorAll(`[data-act="youthNutritionChoice"][data-key="${key}"].selected`)].map(node=>node.dataset.value);
  data.answers[key]=youthNutritionSingle.has(key)?(selected[0]||''):selected;
  if(kind==='score')data.answers[key]=Object.fromEntries(options.map((_,index)=>[index+1,document.querySelector(`[data-youth-score="${key}-${index+1}"]`)?.value||'']));
  if(kind==='hemoglobin')data.details.hemoglobinValue=document.querySelector('[data-youth-extra="hemoglobin"]')?.value.trim()||'';
 }
 data.basic.height=document.querySelector('[data-youth-basic="height"]')?.value.trim()||'';data.basic.weight=document.querySelector('[data-youth-basic="weight"]')?.value.trim()||'';
 return data;
}
function youthNutritionQuestion(q,data){
 const [key,label,sourceOptions,detail=false,kind='choices']=q,options=detail?[...sourceOptions,'补充说明']:sourceOptions,answer=data.answers?.[key],selected=youthNutritionSingle.has(key)?(answer?[answer]:[]):(Array.isArray(answer)?answer:[]);
 if(kind==='score')return `<fieldset class="assessment-question"><legend>${label}</legend>${options.map((option,index)=>`<div class="youth-score-row"><span>${option} <small>${index===3?'5分最好':index===0?'5分压力最大':index===1?'5分最急躁':index===2?'5分最焦虑':'5分最容易爆发'}</small></span><select class="input" data-youth-score="${key}-${index+1}"><option value="">请选择 1-5 分</option>${[1,2,3,4,5].map(score=>`<option ${Number(answer?.[index+1])===score?'selected':''}>${score}</option>`).join('')}</select></div>`).join('')}</fieldset>`;
 return `<fieldset class="assessment-question"><legend>${label}${youthNutritionSingle.has(key)?'（单选）':key==='diet-lunch-dinner'?'（可多选）':'（至少选择一项）'}</legend><div class="assessment-options ${options.length>5?'assessment-options-compact':''}">${options.map(option=>{const active=selected.includes(option);return `<button type="button" class="assessment-option youth-nutrition-option ${active?'selected':''}" data-act="youthNutritionChoice" data-key="${key}" data-value="${youthNutritionEscape(option)}" aria-pressed="${active}">${youthNutritionEscape(option)}</button>`}).join('')}</div>${detail?`<textarea class="input textarea youth-nutrition-detail" data-youth-detail="${key}" placeholder="补充说明（如早餐时间及食物种类、症状频率等，选填）">${youthNutritionEscape(data.details?.[key]||'')}</textarea>`:''}${kind==='hemoglobin'?`<input class="input" data-youth-extra="hemoglobin" inputmode="numeric" placeholder="血红蛋白值（110-160）" value="${youthNutritionEscape(data.details?.hemoglobinValue||'')}">`:''}</fieldset>`;
}
function youthNutritionPage(){
 const data=youthNutritionRead(),basic=data.basic||{},authorized=workflowAuthorizedPhone();
 const basicFields=`<section class="card assessment-basic"><h3>基本资料</h3><div class="field"><label>姓名</label><input class="input" data-youth-basic="name" value="${youthNutritionEscape(basic.name||st.accountProfile?.name||st.accountProfile?.nickname||'')}" autocomplete="name" required></div><div class="grid2"><div class="field"><label>性别</label><select class="input" data-youth-basic="gender" required><option value="">请选择</option>${['女','男','其他'].map(value=>`<option ${basic.gender===value?'selected':''}>${value}</option>`).join('')}</select></div><div class="field"><label>出生年月日</label><input class="input" type="date" data-youth-basic="birthDate" value="${youthNutritionEscape(basic.birthDate||'')}" required></div></div><div class="grid2"><div class="field"><label>身高（cm）</label><input class="input" type="number" min="30" max="250" step="0.1" data-youth-basic="height" value="${youthNutritionEscape(basic.height||'')}"></div><div class="field"><label>体重（kg）</label><input class="input" type="number" min="2" max="300" step="0.1" data-youth-basic="weight" value="${youthNutritionEscape(basic.weight||'')}"></div></div><div class="field"><label>主要诉求（可多选）</label><div class="assessment-options">${['肌骨关节养护','体重管理','身高管理','精英男士精力管理','新活女士精力管理','学习力管理','睡眠及压力管理'].map(option=>`<button type="button" class="assessment-option youth-nutrition-option ${(data.basic?.needs||[]).includes(option)?'selected':''}" data-act="youthNutritionBasicChoice" data-value="${option}" aria-pressed="${(data.basic?.needs||[]).includes(option)}">${youthNutritionEscape(option)}</button>`).join('')}</div></div><div class="field"><label>出生相关信息</label><div class="grid2"><input class="input" data-youth-basic="birthWeight" type="number" step="0.01" placeholder="出生体重（kg）" value="${youthNutritionEscape(basic.birthWeight||'')}"><input class="input" data-youth-basic="gestation" type="number" step="1" placeholder="孕育周期（月）" value="${youthNutritionEscape(basic.gestation||'')}"></div><select class="input" data-youth-basic="delivery"><option value="">分娩方式</option>${['顺产','剖腹产'].map(value=>`<option ${basic.delivery===value?'selected':''}>${value}</option>`).join('')}</select><input class="input" data-youth-basic="breastfeeding" placeholder="母乳喂养时间（非母乳喂养请填无）" value="${youthNutritionEscape(basic.breastfeeding||'')}"></div><div class="field"><label>联系电话</label><input class="input" type="tel" data-youth-basic="phone" value="${youthNutritionEscape(basic.phone||authorized)}" inputmode="tel" required></div></section>`;
 const grouped=youthNutritionSections.map(([title,questions])=>`<section class="card youth-nutrition-section"><h3>${title}</h3>${questions.map(question=>youthNutritionQuestion(question,data)).join('')}</section>`).join('');
 const freeform=`<section class="card"><div class="field"><label>餐后血糖</label><input class="input" data-youth-detail="postMealGlucose" value="${youthNutritionEscape(data.details?.postMealGlucose||'')}" placeholder="备注说明"></div><div class="field"><label>空腹血糖</label><input class="input" data-youth-detail="fastingGlucose" value="${youthNutritionEscape(data.details?.fastingGlucose||'')}" placeholder="备注说明"></div><div class="field"><label>微量元素</label><input class="input" data-youth-detail="traceElements" value="${youthNutritionEscape(data.details?.traceElements||'')}" placeholder="备注说明"></div><div class="field"><label>现在最想解决/最关注孩子哪方面的健康情况？</label><textarea class="input textarea" data-youth-detail="mainConcern">${youthNutritionEscape(data.details?.mainConcern||'')}</textarea></div></section>`;
 return `<p class="small muted">青少年/儿童营养评估 · 请根据实际情况填写，标注“至少选择一项”的题目需完成选择。</p>${basicFields}${grouped}${freeform}${cta('<button class="btn" data-act="submitAssessment">提交评估资料</button>')}`;
}
function youthNutritionValidate(data){
 for(const field of ['name','gender','birthDate','phone'])if(!data.basic[field]){toast('请完整填写姓名、性别、出生日期和联系电话');return false}
 if(!/^1\d{10}$/.test(data.basic.phone)){toast('请输入正确的联系电话');return false}
 if(!data.basic.height||!data.basic.weight||!(data.basic.needs||[]).length||!data.basic.birthWeight||!data.basic.gestation||!data.basic.delivery||!data.basic.breastfeeding){toast('请完整填写身高、体重、主要诉求和出生相关信息');return false}
 if(data.basic.birthDate>new Date().toLocaleDateString('sv-SE')){toast('出生日期不能晚于今天');return false}
 if(!data.details.mainConcern){toast('请填写最关注孩子哪方面的健康情况');return false}
 for(const question of youthNutritionSections.flatMap(section=>section[1])){const [key,label,,detail=false,kind='choices']=question;if(kind==='score'){if(Object.values(data.answers[key]||{}).length!==5||Object.values(data.answers[key]).some(value=>!value)){toast('请完成心理状况的五项评分');return false}continue;}if(key==='diet-lunch-dinner')continue;const value=data.answers[key],has=youthNutritionSingle.has(key)?!!value:(Array.isArray(value)&&value.length>0)||!!data.details[key];if(!has){document.querySelector(`[data-act="youthNutritionChoice"][data-key="${key}"]`)?.focus();toast(`请完成「${label}」`);return false}}
 return true;
}
const youthNutritionBasePages=pagesContent;
pagesContent=function(page){if(page==='assessment'&&Number(st.service)===6)return youthNutritionPage();return youthNutritionBasePages(page)};
const youthNutritionBaseAct=act;
act=function(event){
 const node=event.currentTarget,action=node.dataset.act;
 if(st.page==='assessment'&&Number(st.service)===6){
  if(action==='youthNutritionChoice'||action==='youthNutritionBasicChoice'){
   const data=youthNutritionCollect(),key=node.dataset.key||'needs',value=node.dataset.value;
   const current=action==='youthNutritionBasicChoice'?(data.basic.needs||[]):(Array.isArray(data.answers[key])?data.answers[key]:(data.answers[key]?[data.answers[key]]:[]));
   const chosen=new Set(current);chosen.has(value)?chosen.delete(value):chosen.add(value);
   if(action==='youthNutritionChoice'&&youthNutritionSingle.has(key)){
    chosen.clear();chosen.add(value);
    document.querySelectorAll(`[data-act="youthNutritionChoice"][data-key="${key}"]`).forEach(option=>{option.classList.remove('selected');option.setAttribute('aria-pressed','false')});
   }
   if(action==='youthNutritionBasicChoice')data.basic.needs=[...chosen];else data.answers[key]=youthNutritionSingle.has(key)?(chosen.has(value)?value:''):[...chosen];
   youthNutritionWrite(data);const active=chosen.has(value);node.classList.toggle('selected',active);node.setAttribute('aria-pressed',String(active));return;
  }
  if(action==='submitAssessment'){
   const data=youthNutritionCollect();if(!youthNutritionValidate(data))return;if(!youthNutritionWrite(data))return;
   modal('确认提交评估资料','<p class="small">确认儿童/青少年营养评估资料填写无误？提交后将同步至本次预约记录。</p><div class="grid2"><button class="btn ghost" data-act="close">继续修改</button><button class="btn" data-act="youthNutritionConfirm">确认提交</button></div>');return;
  }
  if(action==='youthNutritionConfirm'){
   const data=youthNutritionCollect();if(!youthNutritionValidate(data))return;
   const appointment=youthNutritionAppointment();data.appointmentId=appointment?.id||'';data.service='青少年/儿童营养评估';data.submittedAt=new Date().toISOString();
   if(!youthNutritionWrite(data))return;
   if(appointment)appointment.assessmentIntake=data;
   const staffAppointment=appointment&&therapistAppointments.find(item=>item.id==='AP-USER-'+appointment.id);
   if(staffAppointment)staffAppointment.assessmentIntake=data;
   st.youthNutritionIntake=data;close();const synthetic={...event,currentTarget:{...node,dataset:{...node.dataset,act:'assessmentSuccess'}}};youthNutritionBaseAct(synthetic);return;
  }
 }
 youthNutritionBaseAct(event);
};
