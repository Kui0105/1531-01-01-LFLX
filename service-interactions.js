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
  if (['productDetail', 'cart', 'serviceCheckout'].includes(st.page)) {
    const bar = document.querySelector('#view > .cta');
    if (bar) {
      bar.id = 'commerceActionBar';
      bar.classList.add('commerce-action-bar');
      if (st.page === 'productDetail') bar.classList.add('product-action-bar');
      if (st.page === 'serviceCheckout') bar.classList.add('checkout-action-bar');
      document.getElementById('tabbar').before(bar);
    }
  }
  mountSceneCarousels();
  updateFloatingCart();
  bindCommerceQuantities();
  document.getElementById('agreeNotice')?.addEventListener('change', event => {
    st.noticeAgreed = event.currentTarget.checked;
  });
};
draw();
