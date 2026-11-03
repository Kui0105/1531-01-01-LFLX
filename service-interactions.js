const originalHome = home;
home = function () {
  return originalHome().replace(/<img id="bannerImage"[^>]*>/,
    sceneCarousel('home', ['hero.png', 'banner-plan.png', 'banner-training.png'], '首页康复服务'));
};

function mountSceneCarousels() {
  // Keep the legacy banner timer for the unchanged shop page only.
  if (st.page === 'home' && st.bannerTimer) {
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
};

const originalDraw = draw;
draw = function () { originalDraw(); mountSceneCarousels(); };
draw();
