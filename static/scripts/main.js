/**
 * Main Script - WB Lima Landing Page
 * Gerencia navegação, scroll, animações e interações
 */

document.addEventListener('DOMContentLoaded', function() {
  // ========== INICIALIZAÇÃO ==========
  setupHeader();
  setupNavigation();
  setupScrollToTop();
  setupCounterAnimation();
  setupScrollAnimations();
  setupFormValidation();
});

// ========== HEADER & SCROLL ==========

function setupHeader() {
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ========== NAVEGAÇÃO ==========

function setupNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // Hamburger menu toggle
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navbar.classList.toggle('active');
    });
  }

  // Close menu when clicking on a link
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (hamburger) {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
      }
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navbar || !hamburger) return;
    
    const isClickInsideNav = navbar.contains(e.target);
    const isClickOnHamburger = hamburger.contains(e.target);
    
    if (!isClickInsideNav && !isClickOnHamburger && hamburger.classList.contains('active')) {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
    }
  });

  // Update active link on scroll
  window.addEventListener('scroll', function() {
    updateActiveNavLink();
  });

  // Initial active link
  updateActiveNavLink();
}

function updateActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollY = window.scrollY;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    
    const section = document.querySelector(href);
    if (!section) return;

    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollY >= sectionTop && scrollY < sectionBottom) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// ========== SCROLL TO TOP ==========

function setupScrollToTop() {
  const scrollBtn = document.getElementById('scroll-to-top');
  
  if (!scrollBtn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  });

  scrollBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ========== COUNTER ANIMATION ==========

function setupCounterAnimation() {
  const countElements = document.querySelectorAll('[data-count]');
  
  if (countElements.length === 0) return;

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  countElements.forEach(el => observer.observe(el));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'), 10);
  let current = 0;
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps

  const interval = setInterval(function() {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(interval);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, 16);
}

// ========== SCROLL ANIMATIONS ==========

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        // Animation is already handled by CSS
      }
    });
  }, observerOptions);

  // Observe all elements with animation classes
  document.querySelectorAll('.fade-in, .slide-up, .slide-left').forEach(el => {
    observer.observe(el);
  });
}

// ========== FORM VALIDATION ==========

function setupFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Real-time validation
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });

    field.addEventListener('input', function() {
      if (this.parentElement.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

function validateField(field) {
  const formGroup = field.parentElement;
  const errorElement = formGroup.querySelector('.error-message');
  let isValid = true;
  let errorMessage = '';

  const fieldName = field.getAttribute('name');

  switch (fieldName) {
    case 'name':
      if (field.value.trim().length < 3) {
        isValid = false;
        errorMessage = 'Nome deve ter pelo menos 3 caracteres';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        isValid = false;
        errorMessage = 'Email inválido';
      }
      break;

    case 'phone':
      const phoneRegex = /^(\d{2})\s?9?\d{4}-?\d{4}$/;
      const cleanPhone = field.value.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        isValid = false;
        errorMessage = 'Telefone deve ter pelo menos 10 dígitos';
      }
      break;

    case 'tipo':
      if (!field.value) {
        isValid = false;
        errorMessage = 'Selecione um tipo de serviço';
      }
      break;

    case 'message':
      if (field.value.trim().length < 10) {
        isValid = false;
        errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
      }
      break;
  }

  if (isValid) {
    formGroup.classList.remove('error');
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.textContent = '';
    }
  } else {
    formGroup.classList.add('error');
    if (errorElement) {
      errorElement.classList.add('show');
      errorElement.textContent = errorMessage;
    }
  }

  return isValid;
}

// ========== UTILITÁRIOS ==========

/**
 * Format phone number
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Smooth scroll to element
 */
function smoothScroll(element) {
  if (!element) return;
  
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get element offset
 */
function getOffset(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    height: rect.height,
    width: rect.width
  };
}

// ========== EXPORTAR FUNÇÕES ==========

window.WBLima = {
  formatPhone,
  smoothScroll,
  debounce,
  getOffset,
  validateField
};
