/**
 * WB Lima — Integração de Sistemas de Segurança Eletrônica
 * Main Script — Vanilla JS, zero dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rootStyle = getComputedStyle(document.documentElement);
  const accentRgb = (rootStyle.getPropertyValue('--accent-rgb') || '0, 112, 255').trim();

  // ========================================================================
  // MOBILE MENU
  // ========================================================================
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const header = document.getElementById('header');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (hamburger && navLinks) {
    const openMenu = () => {
      hamburger.classList.add('active');
      navLinks.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Fechar menu');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.contains('active');
      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navAnchors.forEach(a => {
      a.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // ========================================================================
  // STICKY HEADER with throttle
  // ========================================================================
  let ticking = false;

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  // ========================================================================
  // SMOOTH SCROLL
  // ========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ========================================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ========================================================================
  const animElements = document.querySelectorAll('.anim-fade');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    animElements.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay, 10) || 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animElements.forEach(el => observer.observe(el));
  }

  // ========================================================================
  // ACTIVE NAV LINK on scroll
  // ========================================================================
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinkById = new Map();
  sections.forEach(section => {
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      navLinkById.set(id, link);
    }
  });
  let navTicking = false;

  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = navLinkById.get(id);
      if (link) {
        const isActive = scrollPos >= top && scrollPos < top + height;
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    });
  }

  const requestActiveNavUpdate = () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      updateActiveNav();
      navTicking = false;
    });
  };

  window.addEventListener('scroll', requestActiveNavUpdate, { passive: true });
  window.addEventListener('resize', requestActiveNavUpdate, { passive: true });
  requestActiveNavUpdate();

  // ========================================================================
  // FORM VALIDATION & SUBMISSION → WhatsApp
  // ========================================================================
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    // Phone mask
    const phoneInput = document.getElementById('telefone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);
        if (val.length > 6) {
          val = `(${val.slice(0,2)}) ${val.slice(2,7)}-${val.slice(7)}`;
        } else if (val.length > 2) {
          val = `(${val.slice(0,2)}) ${val.slice(2)}`;
        } else if (val.length > 0) {
          val = `(${val}`;
        }
        e.target.value = val;
      });
    }

    // Validate field
    function validateField(field) {
      const input = field.querySelector('input, select, textarea');
      if (!input || !input.required) return true;

      const value = input.value.trim();
      let isValid = true;

      if (!value) {
        isValid = false;
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
      } else if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) {
        isValid = false;
      }

      if (!isValid) {
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
      return isValid;
    }

    // Live validation on blur
    form.querySelectorAll('.form-field').forEach(field => {
      const input = field.querySelector('input, select, textarea');
      if (input && input.required) {
        input.addEventListener('blur', () => validateField(field));
        input.addEventListener('input', () => {
          if (field.classList.contains('error')) {
            validateField(field);
          }
        });
      }
    });

    // Submit
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Validate all required fields
      let allValid = true;
      form.querySelectorAll('.form-field').forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        // Focus first error
        const firstError = form.querySelector('.form-field.error input, .form-field.error select');
        if (firstError) firstError.focus();
        return;
      }

      // Show loading state
      if (submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;
      }

      // Build WhatsApp message
      const fd = new FormData(form);
      const nome = fd.get('nome') || 'Não informado';
      const tel = fd.get('telefone') || 'Não informado';
      const servico = fd.get('servico') || 'Não selecionado';
      const msg = fd.get('mensagem') || '';

      const text = [
        `*Solicitação de Análise Técnica — Site WB Lima*`,
        ``,
        `*Nome:* ${nome}`,
        `*WhatsApp:* ${tel}`,
        `*Serviço:* ${servico}`,
        msg ? `*Necessidade:* ${msg}` : '',
      ].filter(Boolean).join('\n');

      const whatsappUrl = `https://wa.me/5511947772127?text=${encodeURIComponent(text)}`;
      const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      const popupBlocked = !popup;

      // Show success state
      form.innerHTML = `
        <div class="form-success" role="status" aria-live="polite">
          <i class="fas fa-check-circle"></i>
          <h4>Mensagem pronta no WhatsApp</h4>
          <p>${popupBlocked
            ? 'Seu navegador bloqueou a nova aba. Clique no link abaixo para continuar:'
            : 'Abrimos uma nova aba com sua mensagem. Caso não abra automaticamente, use o link abaixo:'}</p>
          <p><a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-bright);">Abrir WhatsApp</a></p>
        </div>
      `;
    });
  }

  // ========================================================================
  // PARTICLE NETWORK SYSTEM
  // ========================================================================
  const isMobile = window.innerWidth < 768;

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor(w, h, speed) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
      this.size = Math.random() * 1.5 + 0.5;
    }

    update(w, h, mouseLocal) {
      if (this.x > w || this.x < 0) this.vx *= -1;
      if (this.y > h || this.y < 0) this.vy *= -1;
      this.x += this.vx;
      this.y += this.vy;

      if (mouseLocal.x !== null) {
        const dx = mouseLocal.x - this.x;
        const dy = mouseLocal.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 120) {
          this.x -= (dx / dist) * 1.2;
          this.y -= (dy / dist) * 1.2;
        }
      }
    }
  }

  class ParticleCanvas {
    constructor(canvas, config = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.isActive = false;
      this.animId = null;

      this.count = config.count || (isMobile ? 20 : 45);
      this.maxDist = config.maxDist || (isMobile ? 100 : 140);
      this.speed = config.speed || 0.25;
      this.dotOpacity = config.dotOpacity || 0.3;
      this.lineOpacity = config.lineOpacity || 0.15;
      this.gridOpacity = config.gridOpacity || 0.02;
      this.showGrid = config.showGrid !== undefined ? config.showGrid : true;

      this.init();

      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isActive) {
            this.start();
          } else if (!entry.isIntersecting && this.isActive) {
            this.stop();
          }
        });
      }, { threshold: 0.05 });
      obs.observe(canvas.parentElement);
    }

    init() {
      const parent = this.canvas.parentElement;
      this.w = this.canvas.width = parent.clientWidth;
      this.h = this.canvas.height = parent.clientHeight;
      this.particles = [];
      for (let i = 0; i < this.count; i++) {
        this.particles.push(new Particle(this.w, this.h, this.speed));
      }
    }

    getLocalMouse() {
      if (mouse.x === null) return { x: null, y: null };
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: mouse.x - rect.left,
        y: mouse.y - rect.top
      };
    }

    draw() {
      const { ctx, w, h, particles } = this;
      ctx.clearRect(0, 0, w, h);

      if (this.showGrid) {
        ctx.strokeStyle = `rgba(${accentRgb}, ${this.gridOpacity})`;
        ctx.lineWidth = 0.5;
        const gs = 80;
        for (let x = 0; x < w; x += gs) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gs) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      const localMouse = this.getLocalMouse();

      for (const p of particles) {
        p.update(w, h, localMouse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb}, ${this.dotOpacity})`;
        ctx.fill();
      }

      const max2 = this.maxDist * this.maxDist;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < max2) {
            const opacity = (1 - dist2 / max2) * this.lineOpacity;
            ctx.strokeStyle = `rgba(${accentRgb}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    animate() {
      if (!this.isActive) return;
      this.draw();
      this.animId = requestAnimationFrame(() => this.animate());
    }

    start() {
      this.isActive = true;
      this.animate();
    }

    stop() {
      this.isActive = false;
      if (this.animId) cancelAnimationFrame(this.animId);
    }
  }

  // ========================================================================
  // INITIALIZE CANVASES
  // ========================================================================
  const instances = [];
  let resizeTimer;
  const saveDataEnabled = navigator.connection && navigator.connection.saveData;

  if (!prefersReducedMotion && !saveDataEnabled) {
    const heroCanvas = document.getElementById('grid-canvas');
    if (heroCanvas) {
      instances.push(new ParticleCanvas(heroCanvas, {
        count: isMobile ? 30 : 60,
        maxDist: isMobile ? 110 : 150,
        speed: 0.25,
        dotOpacity: 0.35,
        lineOpacity: 0.18,
        gridOpacity: 0.02,
        showGrid: true
      }));
    }

    document.querySelectorAll('.bg-particles').forEach(canvas => {
      instances.push(new ParticleCanvas(canvas, {
        count: isMobile ? 12 : 30,
        maxDist: isMobile ? 90 : 120,
        speed: 0.18,
        dotOpacity: 0.18,
        lineOpacity: 0.08,
        gridOpacity: 0.012,
        showGrid: true
      }));
    });
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      instances.forEach(inst => inst.init());
    }, 300);
  });

});
