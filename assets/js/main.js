(function () {
  var root = document.documentElement;
  root.classList.add('js');
  requestAnimationFrame(function () { document.body.classList.add('anima'); });

  // Barra de progreso de lectura
  var barra = document.getElementById('barra-progreso');
  function progreso() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (barra) barra.style.transform = 'scaleX(' + p + ')';
  }
  window.addEventListener('scroll', progreso, { passive: true });
  window.addEventListener('resize', progreso);
  progreso();

  // Resaltar la sección actual en el índice
  var enlaces = Array.prototype.slice.call(document.querySelectorAll('.indice a'));
  var secciones = enlaces.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function marcar(id) {
    enlaces.forEach(function (a) {
      var activo = a.getAttribute('href') === '#' + id;
      a.classList.toggle('activo', activo);
      if (activo) {
        a.setAttribute('aria-current', 'true');
        var nav = a.closest('.indice');
        if (nav && nav.scrollWidth > nav.clientWidth) {
          nav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }
  function seccionActual() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var actual = secciones[0];
    secciones.forEach(function (s) { if (s.offsetTop <= y) actual = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) actual = secciones[secciones.length - 1];
    return actual;
  }
  var ultimo = null;
  function alHacerScroll() {
    var s = seccionActual();
    if (s && s.id !== ultimo) { ultimo = s.id; marcar(s.id); }
  }
  window.addEventListener('scroll', alHacerScroll, { passive: true });
  alHacerScroll();

  // Aparición suave de bloques al llegar a ellos
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bloques = document.querySelectorAll('.titulo, .evidencia, .grupo, .mural, .logros, .cita, .proceso__pasos li, .momento');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove('oculto'); e.target.style.removeProperty('--trazo'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    bloques.forEach(function (b) {
      b.classList.add('revelar');
      var r = b.getBoundingClientRect();
      if (r.top > window.innerHeight) {
        b.classList.add('oculto');
        if (b.classList.contains('titulo')) b.style.setProperty('--trazo', '0');
        io.observe(b);
      }
    });
  }

  // Video: carga YouTube solo al hacer clic
  document.querySelectorAll('.video[data-youtube]').forEach(function (v) {
    var boton = v.querySelector('.video__play');
    if (!boton) return;
    boton.addEventListener('click', function () {
      var id = v.getAttribute('data-youtube');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = v.querySelector('.video__titulo') ? v.querySelector('.video__titulo').textContent : 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      v.innerHTML = '';
      v.appendChild(f);
    });
  });
})();

// Visor de fotos (Momentos)
(function () {
  var visor = document.getElementById('visor');
  if (!visor || typeof visor.showModal !== 'function') return;
  var img = visor.querySelector('img'), txt = visor.querySelector('p');
  document.querySelectorAll('.momento__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      img.src = b.getAttribute('data-grande');
      img.alt = b.querySelector('img').alt;
      txt.textContent = b.getAttribute('data-texto');
      visor.showModal();
    });
  });
  visor.querySelector('.visor__cerrar').addEventListener('click', function () { visor.close(); });
  visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
})();
