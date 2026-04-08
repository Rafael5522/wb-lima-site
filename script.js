/* ========================================================================
   WB LIMA — Segurança Eletrônica Premium
   Script.js — JavaScript Premium com Animação, Interações e Funcionalidades
   ======================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  console.log('%c⚡ WB LIMA LANDING PAGE', 'font-size: 18px; color: #0080ff; font-weight: bold;');
  console.log('%cDesign Premium | Responsivo | Otimizado para Conversão', 'font-size: 12px; color: #1e3a5f;');

  // ────────────────────────────────────────────────────────────────────
  // 1. MOBILE MENU - Hamburger
  // ────────────────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    const toggleMenu = () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    // Fechar menu ao clicar em links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 2. ATUALIZAR ANO AUTOMATICAMENTE NO FOOTER
  // ────────────────────────────────────────────────────────────────────
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ────────────────────────────────────────────────────────────────────
  // 3. SMOOTH ANCHOR SCROLL
  // ────────────────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      
      const headerOffset = 85;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 3. SCROLL ANIMATIONS - Intersection Observer
  // ────────────────────────────────────────────────────────────────────
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos com animações
  document.querySelectorAll('.fade-in, .slide-up, .slide-left').forEach(el => {
    animationObserver.observe(el);
  });

  // ────────────────────────────────────────────────────────────────────
  // 4. ACTIVE NAV HIGHLIGHTING
  // ────────────────────────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navMenuItems = document.querySelectorAll('.nav-menu a[href^="#"]');

  const updateActiveNav = () => {
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navMenuItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, false);

  // ────────────────────────────────────────────────────────────────────
  // 5. SCROLL TO TOP BUTTON
  // ────────────────────────────────────────────────────────────────────
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 6. COUNTER ANIMATION
  // ────────────────────────────────────────────────────────────────────
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const finalCount = parseInt(counter.dataset.count);
          let currentCount = 0;
          
          const increment = finalCount / 50;
          const interval = setInterval(() => {
            currentCount += increment;
            if (currentCount >= finalCount) {
              counter.textContent = finalCount;
              clearInterval(interval);
            } else {
              counter.textContent = Math.floor(currentCount);
            }
          }, 30);
          
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  animateCounters();

  // ────────────────────────────────────────────────────────────────────
  // 7. FORM VALIDATION & SUBMIT
  // ────────────────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Limpar erros anteriores
      document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
      });

      let isValid = true;
      const fields = this.querySelectorAll('input[required], textarea[required], select[required]');

      fields.forEach(field => {
        const value = field.value.trim();
        
        if (!value) {
          field.parentElement.classList.add('error');
          isValid = false;
        } else if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            field.parentElement.classList.add('error');
            isValid = false;
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
      // Se válido, deixa o formulário ir para FormSubmit
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 8. PORTFOLIO LIGHTBOX
  // ────────────────────────────────────────────────────────────────────
  const portfolioZooms = document.querySelectorAll('.portfolio-zoom');

  portfolioZooms.forEach(zoom => {
    zoom.addEventListener('click', function(e) {
      e.preventDefault();
      const imgUrl = this.getAttribute('href');
      
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      `;
      
      const img = document.createElement('img');
      img.src = imgUrl;
      img.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      `;
      
      modal.appendChild(img);
      
      const closeModal = () => {
        modal.remove();
      };
      
      modal.addEventListener('click', closeModal);
      
      const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', closeOnEsc);
        }
      };
      document.addEventListener('keydown', closeOnEsc);
      
      document.body.appendChild(modal);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // 9. LAZY LOADING DE IMAGENS
  // ────────────────────────────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 10. PARALLAX EFFECT SUAVE - Mouse Tracking
  // ────────────────────────────────────────────────────────────────────
  const heroImage = document.querySelector('.hero-image img');
  
  if (heroImage && window.matchMedia('(min-width: 1024px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      
      heroImage.style.transform = `perspective(1000px) rotateY(${x * 0.05}deg) rotateX(${-y * 0.05}deg)`;
    });

    document.addEventListener('mouseleave', () => {
      heroImage.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 11. PREFERS REDUCED MOTION
  // ────────────────────────────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('.fade-in, .slide-up, .slide-left').forEach(el => {
      el.style.animation = 'none';
      el.classList.add('visible');
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // 12. PERFORMANCE MONITORING
  // ────────────────────────────────────────────────────────────────────
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      console.log('⏱️ Tempo de carregamento: ' + pageLoadTime + 'ms');
    });
  }

  console.log('✅ WB Lima inicializado com sucesso!');
});
