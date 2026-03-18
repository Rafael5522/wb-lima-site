/**
 * WB Lima — Integração de Sistemas de Segurança Eletrônica
 * Main Script — Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // MOBILE MENU
  // ========================================================================
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const header = document.getElementById('header');
  const navAnchors = document.querySelectorAll('.nav-links a');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // ========================================================================
  // STICKY HEADER
  // ========================================================================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

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
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ========================================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ========================================================================
  const animElements = document.querySelectorAll('.anim-fade');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  animElements.forEach(el => observer.observe(el));

  // ========================================================================
  // COUNTER ANIMATION
  // ========================================================================
  const counters = document.querySelectorAll('.counter');
  let hasCounted = false;

  function runCounters() {
    if (hasCounted) return;
    hasCounted = true;

    counters.forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const fps = 30;
      const totalFrames = Math.round(duration / (1000 / fps));
      const inc = target / totalFrames;
      let current = 0;

      function tick() {
        current += inc;
        if (current < target) {
          el.textContent = Math.ceil(current);
          setTimeout(tick, 1000 / fps);
        } else {
          el.textContent = target;
        }
      }
      tick();
    });
  }

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    const statsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) runCounters();
    }, { threshold: 0.5 });
    statsObs.observe(statsEl);
  }

  // ========================================================================
  // CONTACT FORM → WHATSAPP
  // ========================================================================
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const nome = fd.get('nome') || 'Não informado';
      const email = fd.get('email') || 'Não informado';
      const tel = fd.get('telefone') || 'Não informado';
      const servico = fd.get('servico') || 'Não selecionado';
      const msg = fd.get('mensagem') || '';

      const text = [
        `*Novo contato via site WB Lima*`,
        ``,
        `*Nome:* ${nome}`,
        `*E-mail:* ${email}`,
        `*Telefone:* ${tel}`,
        `*Serviço:* ${servico}`,
        msg ? `*Mensagem:* ${msg}` : '',
      ].filter(Boolean).join('\n');

      window.open(`https://wa.me/5511947772127?text=${encodeURIComponent(text)}`, '_blank');
      form.reset();
    });
  }

  // ========================================================================
  // PARTICLE NETWORK SYSTEM — Reusable across multiple sections
  // Royal Blue palette matching logo (#2563eb)
  // ========================================================================
  const isMobile = window.innerWidth < 768;

  // Global mouse tracking
  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle class
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
        if (dist < 120) {
          this.x -= (dx / dist) * 1.2;
          this.y -= (dy / dist) * 1.2;
        }
      }
    }
  }

  // ParticleCanvas manager for each canvas
  class ParticleCanvas {
    constructor(canvas, config = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.isActive = false;
      this.animId = null;

      // Config with defaults — secondary canvases are subtler
      this.count = config.count || (isMobile ? 20 : 45);
      this.maxDist = config.maxDist || (isMobile ? 100 : 140);
      this.speed = config.speed || 0.25;
      this.dotOpacity = config.dotOpacity || 0.3;
      this.lineOpacity = config.lineOpacity || 0.15;
      this.gridOpacity = config.gridOpacity || 0.02;
      this.showGrid = config.showGrid !== undefined ? config.showGrid : true;

      this.init();

      // Intersection Observer — only animate when visible
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

      // Grid
      if (this.showGrid) {
        ctx.strokeStyle = `rgba(37, 99, 235, ${this.gridOpacity})`;
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

      // Particles
      for (const p of particles) {
        p.update(w, h, localMouse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${this.dotOpacity})`;
        ctx.fill();
      }

      // Connections
      const max2 = this.maxDist * this.maxDist;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < max2) {
            const opacity = (1 - dist2 / max2) * this.lineOpacity;
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
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
  // INITIALIZE ALL CANVASES
  // ========================================================================

  const heroCanvas = document.getElementById('grid-canvas');
  let resizeTimer;

  // Store instances for resize
  const instances = [];
  if (heroCanvas) {
    instances.push(new ParticleCanvas(heroCanvas, {
      count: isMobile ? 35 : 70,
      maxDist: isMobile ? 120 : 160,
      speed: 0.3,
      dotOpacity: 0.4,
      lineOpacity: 0.2,
      gridOpacity: 0.025,
      showGrid: true
    }));
  }
  document.querySelectorAll('.bg-particles').forEach(canvas => {
    instances.push(new ParticleCanvas(canvas, {
      count: isMobile ? 15 : 35,
      maxDist: isMobile ? 100 : 130,
      speed: 0.2,
      dotOpacity: 0.2,
      lineOpacity: 0.1,
      gridOpacity: 0.015,
      showGrid: true
    }));
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      instances.forEach(inst => inst.init());
    }, 300);
  });
});
