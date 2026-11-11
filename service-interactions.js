function validProductQuantity(value) {
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

function bindModalQuantity() {
  const input = document.getElementById('mq');
  if (!input) return;
  input.addEventListener('focus', () => input.select());
  input.addEventListener('input', () => { st.mq = validProductQuantity(input.value); });
  const commit = () => {
    st.mq = validProductQuantity(input.value);
    input.value = st.mq;
  };
  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      input.blur();
    }
  });
}

function bindCommerceQuantities() {
  document.querySelectorAll('[data-quantity]').forEach(input => {
    const update = () => {
      const value = validProductQuantity(input.value);
      if (input.dataset.quantity === 'product') {
        st.qty = value;
      } else {
        st.cart[Number(input.dataset.i)].qty = value;
        const count = st.cart.reduce((total, item) => total + item.qty, 0);
        document.querySelector('.cart-toolbar > span').textContent = `总共 ${count} 件`;
        const total = st.cart.filter(item => item.checked && !item.invalid)
          .reduce((sum, item) => sum + item.price * item.qty, 0);
        document.querySelector('.cart-total .price').textContent = `¥${total}`;
      }
    };
    input.addEventListener('focus', () => input.select());
    input.addEventListener('input', update);
    const commit = () => {
      input.value = validProductQuantity(input.value);
      update();
    };
    input.addEventListener('change', commit);
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
    });
  });
}

function rehabAgreement() {
  const key = `${st.btype}:${st.service}`;
  if (st.noticeAgreementKey !== key) {
    st.noticeAgreementKey = key;
    st.noticeAgreed = false;
  }
  return `<div class="rehab-agreement"><label class="rehab-agreement-label"><input id="agreeNotice" type="checkbox" ${st.noticeAgreed ? 'checked' : ''}><span>我已阅读并同意</span></label><button class="textbtn rehab-notice-link" data-act="rehabNotice">《康复须知》</button></div>`;
}

function showRehabNotice() {
  modal('康复须知', `<div class="rehab-notice-content"><h4>服务前如实告知</h4><p>请向康复师如实告知既往伤病、手术史、当前身体不适及其他可能影响评估或训练的情况，便于确认本次服务安排。</p><h4>评估与康复安排</h4><p>本次服务内容、时长及适用门店以订单和康复师确认的信息为准。请按预约时间到店；需要改期或取消时，请通过预约页面办理或联系客服。</p><h4>服务过程注意事项</h4><p>请按康复师指导进行评估和训练。如出现疼痛加重、头晕或其他不适，请立即停止并告知康复师。</p><h4>健康与安全</h4><p>康复评估和训练不能替代疾病诊断及急救。如有急性损伤或明显不适，请及时就医，并与康复师沟通后续服务安排。</p></div><button class="btn full" data-act="agreeRehabNotice">已阅读并同意</button>`);
  const dialog = document.querySelector('#modal .modal');
  dialog.classList.add('rehab-notice-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', '康复须知');
}

const sampleRegions = {
  '北京市': {'北京市':['东城区','西城区','朝阳区','海淀区','丰台区','石景山区','通州区','昌平区','大兴区','房山区','顺义区','门头沟区','怀柔区','平谷区','密云区','延庆区']},
  '天津市': {'天津市':['和平区','河东区','河西区','南开区','河北区','红桥区','滨海新区','西青区','津南区','北辰区','武清区','宝坻区']},
  '上海市': {'上海市':['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','浦东新区','闵行区','宝山区','嘉定区','松江区','青浦区','奉贤区','金山区','崇明区']},
  '重庆市': {'重庆市':['渝中区','江北区','沙坪坝区','九龙坡区','南岸区','渝北区','巴南区','北碚区','大渡口区','江津区','合川区','永川区']},
  '广东省': {'广州市':['越秀区','海珠区','荔湾区','天河区','白云区','黄埔区','番禺区','花都区','南沙区','增城区'], '深圳市':['福田区','罗湖区','南山区','盐田区','宝安区','龙岗区','龙华区','坪山区','光明区'], '珠海市':['香洲区','斗门区','金湾区'], '东莞市':['南城街道','东城街道','莞城街道','万江街道','松山湖高新区'], '佛山市':['禅城区','南海区','顺德区','三水区','高明区']},
  '浙江省': {'杭州市':['上城区','拱墅区','西湖区','滨江区','萧山区','余杭区','临平区','钱塘区','富阳区','临安区'], '宁波市':['海曙区','江北区','鄞州区','镇海区','北仑区','奉化区'], '温州市':['鹿城区','龙湾区','瓯海区','洞头区']},
  '江苏省': {'南京市':['玄武区','秦淮区','建邺区','鼓楼区','浦口区','栖霞区','雨花台区','江宁区'], '苏州市':['姑苏区','虎丘区','吴中区','相城区','吴江区','工业园区'], '无锡市':['梁溪区','锡山区','惠山区','滨湖区','新吴区'], '常州市':['天宁区','钟楼区','新北区','武进区']},
  '四川省': {'成都市':['锦江区','青羊区','金牛区','武侯区','成华区','龙泉驿区','青白江区','新都区','温江区','双流区','郫都区','新津区'], '绵阳市':['涪城区','游仙区','安州区']},
  '湖北省': {'武汉市':['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','蔡甸区','江夏区','黄陂区','新洲区'], '宜昌市':['西陵区','伍家岗区','点军区','猇亭区','夷陵区']},
  '湖南省': {'长沙市':['芙蓉区','天心区','岳麓区','开福区','雨花区','望城区','长沙县'], '株洲市':['荷塘区','芦淞区','石峰区','天元区','渌口区']},
  '山东省': {'济南市':['历下区','市中区','槐荫区','天桥区','历城区','长清区','章丘区'], '青岛市':['市南区','市北区','黄岛区','崂山区','李沧区','城阳区','即墨区'], '烟台市':['芝罘区','福山区','莱山区','牟平区']},
  '河南省': {'郑州市':['中原区','二七区','管城回族区','金水区','上街区','惠济区','中牟县'], '洛阳市':['老城区','西工区','涧西区','瀍河回族区','洛龙区']},
  '陕西省': {'西安市':['新城区','碑林区','莲湖区','灞桥区','未央区','雁塔区','阎良区','临潼区','长安区','高陵区']},
  '福建省': {'福州市':['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区'], '厦门市':['思明区','海沧区','湖里区','集美区','同安区','翔安区']},
  '辽宁省': {'沈阳市':['和平区','沈河区','大东区','皇姑区','铁西区','苏家屯区','浑南区'], '大连市':['中山区','西岗区','沙河口区','甘井子区','旅顺口区','金州区']},
  '云南省': {'昆明市':['五华区','盘龙区','官渡区','西山区','东川区','呈贡区','晋宁区']},
  '河北省': {'石家庄市':['长安区','桥西区','新华区','井陉矿区','裕华区','藁城区','鹿泉区','栾城区'], '唐山市':['路南区','路北区','古冶区','开平区','丰南区','丰润区']},
  '安徽省': {'合肥市':['瑶海区','庐阳区','蜀山区','包河区','肥东县','肥西县','长丰县','巢湖市']},
  '江西省': {'南昌市':['东湖区','西湖区','青云谱区','青山湖区','新建区','红谷滩区']},
  '广西壮族自治区': {'南宁市':['兴宁区','青秀区','江南区','西乡塘区','良庆区','邕宁区','武鸣区'], '桂林市':['秀峰区','叠彩区','象山区','七星区','雁山区','临桂区']},
  '海南省': {'海口市':['秀英区','龙华区','琼山区','美兰区'], '三亚市':['海棠区','吉阳区','天涯区','崖州区']},
  '黑龙江省': {'哈尔滨市':['道里区','南岗区','道外区','平房区','松北区','香坊区','呼兰区','阿城区']},
  '吉林省': {'长春市':['南关区','宽城区','朝阳区','二道区','绿园区','双阳区','九台区']},
  '甘肃省': {'兰州市':['城关区','七里河区','西固区','安宁区','红古区']},
  '山西省': {'太原市':['小店区','迎泽区','杏花岭区','尖草坪区','万柏林区','晋源区']},
  '内蒙古自治区': {'呼和浩特市':['新城区','回民区','玉泉区','赛罕区']},
  '新疆维吾尔自治区': {'乌鲁木齐市':['天山区','沙依巴克区','新市区','水磨沟区','头屯河区','达坂城区','米东区']},
  '西藏自治区': {'拉萨市':['城关区','堆龙德庆区','达孜区']},
  '青海省': {'西宁市':['城东区','城中区','城西区','城北区','湟中区']},
  '宁夏回族自治区': {'银川市':['兴庆区','西夏区','金凤区','永宁县','贺兰县']},
  '贵州省': {'贵阳市':['南明区','云岩区','花溪区','乌当区','白云区','观山湖区']}
};

const sampleAddresses = [
  {id:'address-1',name:'张女士',phone:'138****2888',province:'上海市',city:'上海市',district:'静安区',detail:'南京西路 1288 号 8F',isDefault:true},
  {id:'address-2',name:'张女士',phone:'138****2888',province:'北京市',city:'北京市',district:'朝阳区',detail:'建国路 88 号 10F',isDefault:false}
];
st.addresses ||= sampleAddresses.map(address=>({...address}));

function addressPage() {
  const cards = st.addresses.map((address,index)=>`<article class="card address-card"><div class="between address-contact"><b>${address.name}</b><span>${address.phone}</span></div><p class="small muted address-location">${address.region||`${address.province} ${address.city} ${address.district}`} ${address.detail}</p><div class="address-actions"><div class="address-default">${address.isDefault?'<span class="tag">默认地址</span>':`<button class="textbtn" data-act="defaultAddress" data-i="${index}">设为默认</button>`}</div><div class="address-edit-actions"><button class="textbtn" data-act="editAddress" data-i="${index}">编辑</button><button class="textbtn" data-act="deleteAddress" data-i="${index}">删除</button></div></div></article>`).join('');
  return `<div class="address-list">${cards||'<div class="empty">暂无收货地址</div>'}</div>${cta('<button class="btn" data-act="address">新增地址</button>')}`;
}

const originalPagesContent=pagesContent;
pagesContent=function(page){return page==='addresses'?addressPage():originalPagesContent(page)};

function renderRegionOptions(select, values, selected) {
  select.innerHTML = '<option value="">请选择</option>'+values.map(value=>`<option value="${value}" ${value===selected?'selected':''}>${value}</option>`).join('');
}

function openAddressForm(index=-1) {
  const current=index>=0?st.addresses[index]:null;
  const provinces=Object.keys(sampleRegions);
  const province=current?.province||'上海市';
  const cities=Object.keys(sampleRegions[province]);
  const city=cities.includes(current?.city)?current.city:cities[0];
  const districts=sampleRegions[province][city];
  const district=districts.includes(current?.district)?current.district:districts[0];
  modal(current?'编辑收货地址':'新增收货地址',`<div class="field"><label for="addressName">收货人</label><input id="addressName" class="input" value="${current?.name||''}" placeholder="请输入收货人姓名" maxlength="20"></div><div class="field"><label for="addressPhone">联系电话</label><input id="addressPhone" class="input" type="tel" inputmode="numeric" value="${current?.phone?.replace(/\D/g,'')||''}" placeholder="请输入联系电话" maxlength="11"></div><div class="field"><label>所在地区</label><div class="region-selects"><select id="addressProvince" class="input" aria-label="省份"></select><select id="addressCity" class="input" aria-label="城市"></select><select id="addressDistrict" class="input" aria-label="区县"></select></div><p class="tiny muted region-sample-note">离线地区样例；省、市、区按所选地区联动</p></div><div class="field"><label for="addressDetail">详细地址</label><input id="addressDetail" class="input" value="${current?.detail||''}" placeholder="街道、门牌号、小区或楼栋"></div><label class="address-default-toggle"><input id="addressMakeDefault" type="checkbox" ${current?.isDefault||!st.addresses.some(a=>a.isDefault)?'checked':''}>设为默认地址</label><button class="btn full" data-act="saveAddress" data-i="${index}">保存地址</button>`);
  const p=document.getElementById('addressProvince'),c=document.getElementById('addressCity'),d=document.getElementById('addressDistrict');
  renderRegionOptions(p,provinces,province);
  renderRegionOptions(c,Object.keys(sampleRegions[province]),city);
  renderRegionOptions(d,sampleRegions[province][city],district);
  p.addEventListener('change',()=>{const nextCity=Object.keys(sampleRegions[p.value])[0];renderRegionOptions(c,Object.keys(sampleRegions[p.value]),nextCity);renderRegionOptions(d,sampleRegions[p.value][nextCity],sampleRegions[p.value][nextCity][0])});
  c.addEventListener('change',()=>renderRegionOptions(d,sampleRegions[p.value][c.value],sampleRegions[p.value][c.value][0]));
}

// Preserve the prototype's existing ¥5 membership saving and free shipping.
function productCheckoutTotals(){
  const selected=st.cart.filter(item=>item.checked&&!item.invalid);
  const goods=st.cart.length?selected.reduce((sum,item)=>sum+Math.round(item.price*100)*item.qty,0):[5900,8900,12900][st.product||0]*validProductQuantity(st.qty||1);
  const coupon=Math.min(goods,st.coupon?2000:0);
  const membership=Math.min(goods-coupon,500);
  const points=Math.min(goods-coupon-membership,st.points?1000:0);
  const shipping=0;
  return {goods:goods/100,coupon:coupon/100,membership:membership/100,points:points/100,shipping:shipping/100,total:(goods-coupon-membership-points+shipping)/100};
}
function serviceCheckoutTotals(){
  const service=S[st.service]||S[6];
  const base=Math.round(Number(st.btype==='eval'?service[3]:service[1].startsWith('svc-')?service[3]:S[6][3])*100)*validProductQuantity(st.serviceQty||1);
  const membership=Math.min(base,500);
  const coupon=Math.min(base-membership,st.coupon?2000:0);
  const points=Math.min(base-membership-coupon,st.points?1000:0);
  return {goods:base/100,coupon:coupon/100,membership:membership/100,points:points/100,shipping:0,total:(base-membership-coupon-points)/100};
}
checkoutAmount=function(product){return product?productCheckoutTotals().total:serviceCheckoutTotals().total};

const originalCheckout=checkout;
checkout=function(product){
  let markup=originalCheckout(product);
  const fees=product?productCheckoutTotals():serviceCheckoutTotals(),money=value=>Number(value).toFixed(2);
  if(product)markup=markup.replace(/<div class="stepbar">[\s\S]*?<\/div>/,'');
  const summary=`<section class="card small checkout-fees" aria-label="费用明细"><div class="between"><span>${product?'商品总金额':'订单金额'}</span><span>¥${money(fees.goods)}</span></div><div class="between"><span>会员折扣</span><span class="checkout-saving">−¥${money(fees.membership)}</span></div>${product?`<div class="between"><span>运费</span><span>¥${money(fees.shipping)}</span></div>`:''}<div class="between"><span>优惠券优惠</span><span>−¥${money(fees.coupon)}</span></div><div class="between"><span>积分抵扣</span><span>−¥${money(fees.points)}</span></div><div class="divider"></div><div class="between"><span>应付金额</span><b class="price">¥${money(fees.total)}</b></div></section>`;
  markup=markup.replace(/<div class="card small"><div class="between"><span>应付金额<\/span>[\s\S]*?<\/div><\/div>/,summary);
  markup=markup.replace('<div class="cta">','<div class="cta"><div class="checkout-pay-total"><span>应付金额</span><b class="price">¥'+money(fees.total)+'</b></div>');
  if(!product)return markup;
  const address=st.addresses.find(item=>item.isDefault);
  if(!address)return markup;
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const contact=escape(`${address.name}　${address.phone}`);
  const location=escape(`${address.province} ${address.city} ${address.district} ${address.detail}`);
  const delivery=`<section class="card checkout-delivery"><div class="between"><b>配送方式</b><span class="tiny muted">${st.deliveryMethod==='pickup'?'到店自提':'配送到家'}</span></div><div class="delivery-choice" role="group" aria-label="配送方式"><button class="delivery-option ${st.deliveryMethod!=='pickup'?'active':''}" data-act="deliveryMethod" data-v="courier" aria-pressed="${st.deliveryMethod!=='pickup'}">快递发货</button><button class="delivery-option ${st.deliveryMethod==='pickup'?'active':''}" data-act="deliveryMethod" data-v="pickup" aria-pressed="${st.deliveryMethod==='pickup'}">上门自提</button></div>${st.deliveryMethod==='pickup'?`<button class="pickup-store-choice" data-act="pickupStore"><span><small>自提门店</small><b>${escape(st.pickupStore||st.store)}</b></span><span class="row-chevron" aria-hidden="true">›</span></button><div class="grid2 pickup-fields"><div class="field"><label for="pickupName">提货人</label><input id="pickupName" class="input" value="${escape(st.pickupName||'')}" placeholder="填写提货人姓名" data-checkout-field="pickupName"></div><div class="field"><label for="pickupPhone">联系方式</label><input id="pickupPhone" class="input" type="tel" inputmode="numeric" maxlength="11" value="${escape(st.pickupPhone||'')}" placeholder="填写手机号" data-checkout-field="pickupPhone"></div></div>`:`<label class="split-service-choice"><input type="checkbox" data-act="splitService" ${st.splitService?'checked':''}><span class="split-service-copy"><b>分装服务</b><small>选择后按商品分装发货</small></span><span class="split-service-state">${st.splitService?'是':'否'}</span></label><p class="split-service-note">选择分装服务后，商品拆分包装不支持售后。</p>`}</section>`;
  const addressMarkup=`<div class="card checkout-address"><div class="checkout-address-copy"><b class="small">${contact}</b><p class="small muted">${location}</p></div><button class="textbtn" data-go="addresses">更换　›</button></div>`;
  markup=markup.replace(/<div class="card checkout-address">[\s\S]*?<\/div>(?=<div class="card row">)/,'');
  markup=markup.replace('<div class="card row"><img class="thumb"',delivery+(st.deliveryMethod==='pickup'?'':addressMarkup)+'<div class="card row"><img class="thumb"');
  return markup;
};

const originalHome = home;
home = function () {
  return originalHome().replace(/<img id="bannerImage"[^>]*>/,
    sceneCarousel('home', ['hero.png', 'banner-plan.png', 'banner-training.png'], '首页康复服务'));
};

function mountSceneCarousels() {
  // Both home and shop now use the same sliding carousel.
  if (['home', 'products'].includes(st.page) && st.bannerTimer) {
    clearInterval(st.bannerTimer);
    st.bannerTimer = null;
  }
  if (st.disposeCarousels) st.disposeCarousels();
  const cleanups = [];
  document.querySelectorAll('.scene-carousel').forEach(carousel => {
    const key = carousel.dataset.carousel;
    const track = carousel.querySelector('.scene-carousel-track');
    const dots = [...carousel.querySelectorAll('.scene-carousel-dot')];
    const count = dots.length;
    let position = (st.slides[key] || 0) + 1;
    let start = null, dragging = false, busy = false, timer;
    const translate = (animate, offset = 0) => {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(calc(-${position * 100}% + ${offset}px))`;
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!start && !document.hidden) move(position + 1);
      }, 3500);
    };
    const move = next => {
      if (busy) return;
      busy = true;
      position = next;
      const index = (position - 1 + count) % count;
      st.slides[key] = index;
      translate(true);
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', String(i === index));
      });
    };
    translate(false);
    track.addEventListener('transitionend', event => {
      if (event.propertyName !== 'transform') return;
      if (position === 0) position = count;
      if (position === count + 1) position = 1;
      translate(false);
      // Restore the animation after the invisible clone-to-original reset.
      track.getBoundingClientRect();
      track.style.transition = '';
      busy = false;
    });
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      move(i + 1);
      restart();
    }));
    carousel.addEventListener('pointerdown', event => {
      if (busy || event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
      start = {x: event.clientX, y: event.clientY, id: event.pointerId};
      dragging = false;
      clearInterval(timer);
      carousel.setPointerCapture(event.pointerId);
    });
    carousel.addEventListener('pointermove', event => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) dragging = true;
      if (dragging) translate(false, dx / (carousel.getBoundingClientRect().width / carousel.offsetWidth));
    });
    const finish = (event, cancelled = false) => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const threshold = carousel.getBoundingClientRect().width * 0.14;
      const step = !cancelled && dragging && Math.abs(dx) > threshold ? (dx < 0 ? 1 : -1) : 0;
      start = null;
      track.getBoundingClientRect();
      if (dragging) move(position + step);
      dragging = false;
      if (carousel.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId);
      restart();
    };
    carousel.addEventListener('pointerup', event => finish(event));
    carousel.addEventListener('pointercancel', event => finish(event, true));
    restart();
    cleanups.push(() => clearInterval(timer));
  });
  st.disposeCarousels = () => cleanups.forEach(dispose => dispose());
}

const originalAct = act;
act = function (event) {
  const node = event.currentTarget;
  if (node.dataset.act === 'serviceCategory') {
    st.cat=node.dataset.v;st.serviceSub='';st.kw='';go('serviceList',st.page!=='serviceList');return;
  }
  if (node.dataset.act === 'serviceSub') { st.serviceSub=node.dataset.v;draw();return; }
  if (node.dataset.act === 'productCat') { st.productCat=node.dataset.v;st.productSubCat='全部';draw();return; }
  if (node.dataset.act === 'productSubCat') { st.productSubCat=node.dataset.v;draw();return; }
  if (node.dataset.act === 'deliveryMethod') { st.deliveryMethod=node.dataset.v;if(st.deliveryMethod==='pickup')st.pickupStore||=st.store;draw();return; }
  if (node.dataset.act === 'pickupStore') { st.storeReturn='productCheckout';st.storeSelectionMode='pickup';go('storeList');return; }
  if (node.dataset.act === 'splitService') { st.splitService=node.checked;draw();return; }
  if (node.dataset.act === 'pay' && node.dataset.product === 'true' && st.deliveryMethod === 'pickup') {
    const name=document.getElementById('pickupName')?.value.trim()||'',phone=(document.getElementById('pickupPhone')?.value||'').replace(/\D/g,'');
    if(!st.pickupStore||!name||phone.length<7){toast('请填写自提门店、提货人和有效联系方式');return;}
    st.pickupName=name;st.pickupPhone=phone;
  }
  if (node.dataset.act === 'address') {
    openAddressForm();
    return;
  }
  if (node.dataset.act === 'editAddress') {
    openAddressForm(Number(node.dataset.i));
    return;
  }
  if (node.dataset.act === 'saveAddress') {
    const name=document.getElementById('addressName').value.trim();
    const phone=document.getElementById('addressPhone').value.replace(/\D/g,'');
    const province=document.getElementById('addressProvince').value;
    const city=document.getElementById('addressCity').value;
    const district=document.getElementById('addressDistrict').value;
    const detail=document.getElementById('addressDetail').value.trim();
    if(!name||phone.length<7||!province||!city||!district||!detail){toast('请完整填写联系人、地区和详细地址');return}
    const index=Number(node.dataset.i);
    const address={id:index>=0?st.addresses[index].id:`address-${Date.now()}`,name,phone,province,city,district,detail,isDefault:document.getElementById('addressMakeDefault').checked||!st.addresses.some(item=>item.isDefault)};
    if(index>=0)st.addresses[index]=address;else st.addresses.push(address);
    if(address.isDefault)st.addresses.forEach(item=>item.isDefault=item.id===address.id);
    close();draw();toast('收货地址已保存');return;
  }
  if (node.dataset.act === 'defaultAddress') {
    modal('设为默认地址',`<p class="small">确定将 ${st.addresses[Number(node.dataset.i)].name} 的此地址设为默认收货地址吗？</p><div class="grid2"><button class="btn ghost" data-act="close">取消</button><button class="btn" data-act="confirmDefaultAddress" data-i="${node.dataset.i}">确定</button></div>`);
    return;
  }
  if (node.dataset.act === 'confirmDefaultAddress') {
    const index=Number(node.dataset.i);st.addresses.forEach((address,i)=>address.isDefault=i===index);close();draw();toast('默认地址已更新');return;
  }
  if (node.dataset.act === 'deleteAddress') {
    const index=Number(node.dataset.i);
    modal('删除收货地址',`<p class="small">确定删除 ${st.addresses[index].name} 的此收货地址吗？</p><div class="grid2"><button class="btn ghost" data-act="close">取消</button><button class="btn warn" data-act="confirmDeleteAddress" data-i="${index}">删除</button></div>`);
    return;
  }
  if (node.dataset.act === 'confirmDeleteAddress') {
    const index=Number(node.dataset.i),removed=st.addresses.splice(index,1)[0];
    if(removed?.isDefault&&st.addresses.length)st.addresses[0].isDefault=true;
    close();draw();toast('收货地址已删除');return;
  }
  if (node.dataset.act === 'rehabNotice') {
    showRehabNotice();
    return;
  }
  if (node.dataset.act === 'agreeRehabNotice') {
    st.noticeAgreed = true;
    close();
    const checkbox = document.getElementById('agreeNotice');
    if (checkbox) checkbox.checked = true;
    document.querySelector('.rehab-notice-link')?.focus();
    return;
  }
  if (['buyService', 'buyEval'].includes(node.dataset.act)) st.noticeAgreed = false;
  if (node.dataset.act === 'shopSearch') {
    st.searchType = '商品';
    go('search');
    return;
  }
  if (node.dataset.act === 'service') {
    st.qty = 1;
    st.slides.service = 0;
  }
  if (node.dataset.act === 'chooseStore' && st.storeSelectionMode === 'pickup') {
    const store=stores[Number(node.dataset.i)];
    if(!store)return;
    st.pickupStore=store.name;st.storeSelectionMode='';
    if(st.prev.at(-1)==='productCheckout')st.prev.pop();
    go(st.storeReturn||'productCheckout',false);st.storeReturn='home';draw();toast('自提门店已切换');return;
  }
  if (node.dataset.act === 'buyService') {
    const service = S[st.service];
    if (['eval-brain', 'eval-nutrition'].includes(service[1])) return;
    st.btype = service[1].startsWith('eval-') ? 'eval' : 'service';
    st.orderType = st.btype === 'eval' ? '评估订单' : '服务订单';
    st.orderedService = service;
    st.serviceQty = Math.max(1, st.qty || 1);
    st.paidAmount = undefined;
    st.orderStatus = '待付款';
    go('serviceCheckout');
    return;
  }
  if (node.dataset.act === 'payCancel') st.paidAmount = checkoutAmount(st.page === 'productCheckout');
  originalAct(event);
  if (node.dataset.act === 'addOk') updateFloatingCart();
  if (node.dataset.act === 'message' && st.read) {
    document.querySelectorAll('.unread-badge').forEach(badge => badge.remove());
  }
};

function updateFloatingCart() {
  document.getElementById('floatingCart')?.remove();
  if (st.page !== 'products') return;
  const count = st.cart.reduce((total, item) => total + item.qty, 0);
  document.getElementById('screen').insertAdjacentHTML('beforeend',
    `<button id="floatingCart" class="floating-cart" aria-label="购物车，${count} 件商品">${ic('cart')}<span class="cart-count" aria-hidden="true">${count > 99 ? '99+' : count}</span></button>`);
  document.getElementById('floatingCart').addEventListener('click', () => go('cart'));
}

const originalDraw = draw;
draw = function () {
  // Move the existing bar outside the scroll area, preserving its bound actions.
  document.getElementById('commerceActionBar')?.remove();
  originalDraw();
  if (['productDetail', 'cart', 'productCheckout', 'serviceCheckout', 'addresses', 'complaints', 'orderDetail', 'appointmentDetail', 'assessment', 'orderAssessmentStart', 'promotionWithdraw', 'promotionPoster'].includes(st.page)) {
    const bar = document.querySelector('#view > .cta');
    if (bar) {
      bar.id = 'commerceActionBar';
      bar.classList.add('commerce-action-bar');
      if (st.page === 'productDetail') bar.classList.add('product-action-bar');
      if (st.page === 'serviceCheckout') bar.classList.add('checkout-action-bar');
      if (st.page === 'productCheckout') bar.classList.add('product-checkout-action-bar');
      if (st.page === 'addresses') bar.classList.add('address-action-bar');
      if (st.page === 'complaints') bar.classList.add('complaint-action-bar');
      if (st.page === 'orderDetail') bar.classList.add('order-detail-action-bar');
      if (st.page === 'appointmentDetail') bar.classList.add('appointment-detail-action-bar');
      if (['assessment', 'orderAssessmentStart'].includes(st.page)) bar.classList.add('assessment-action-bar');
      document.getElementById('tabbar').before(bar);
    }
  }
  mountSceneCarousels();
  updateFloatingCart();
  bindCommerceQuantities();
  document.getElementById('agreeNotice')?.addEventListener('change', event => {
    st.noticeAgreed = event.currentTarget.checked;
  });
  document.querySelectorAll('[data-checkout-field]').forEach(field=>field.addEventListener('input',()=>{st[field.dataset.checkoutField]=field.value}));
};
draw();
