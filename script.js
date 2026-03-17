/**
 * WB LIMA - Segurança Eletrônica
 * Arquivo de Scripts Principal
 * Implementação puramente Vanilla JS (Sem jQuery ou frameworks)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // SCROLL PROGRESS BAR
    // ==========================================================================
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // ==========================================================================
    // 1. MENU MOBILE (HAMBÚRGUER) & STICKY HEADER
    // ==========================================================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const header = document.getElementById('header');
    const navItems = document.querySelectorAll('.nav-links li a');

    // Toggle Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if(navLinks.classList.contains('active')) {
        icon.classList.replace('fas fa-bars', 'fas fa-times');
    } else {
        icon.classList.replace('fas fa-times', 'fas fa-bars');
    }
    });

    // Fechar menu ao clicar em um link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // Sticky Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // 2. SCROLL SUAVE (SMOOTH SCROLLING) CUSTOMIZADO
    // ==========================================================================
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                // Considera o tamanho do header fixo
                const headerOffset = 80; 
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // 3. ANIMAÇÕES AO ROLAR A PÁGINA (INTERSECTION OBSERVER)
    // ==========================================================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Configuração do Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Dispara quando 15% do elemento é visível
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Pega o delay se existir via dataset (ex: data-delay="200")
                const delay = entry.target.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                
                // Para de observar depois que animou a primeira vez
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => scrollObserver.observe(el));

    // ==========================================================================
    // 4. CONTADOR ANIMADO (SOBRE NÓS)
    // ==========================================================================
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;

    const runCounters = () => {
        counters.forEach(counter => {
            counter.innerText = '0';
            const target = +counter.getAttribute('data-target');
            
            // Duração fixa para todos terminarem juntos, independentemente do valor alvo
            const duration = 2000; // 2 segundos
            const frameRate = 30; // Atualizações por segundo (aprox)
            const totalFrames = Math.round(duration / (1000 / frameRate));
            const increment = target / totalFrames;
            
            let currentCount = 0;
            
            const updateCounter = () => {
                currentCount += increment;
                if (currentCount < target) {
                    counter.innerText = Math.ceil(currentCount);
                    setTimeout(updateCounter, 1000 / frameRate);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    };

    // Observer específico para a seção de estatísticas
const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !hasCounted) {
                runCounters();
                hasCounted = true;
            }
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Form submit WhatsApp handler
    const contactForm = document.querySelector('.glass-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const nome = formData.get('input[name="text"]') || 'não informado';
            const email = formData.get('input[name="email"]') || 'não informado';
            const tel = formData.get('input[name="tel"]') || 'não informado';
            const msg = formData.get('textarea') || 'Consulta via formulário';
            const message = `Novo lead!\n\n👤 Nome: ${nome}\n📧 Email: ${email}\n📱 Tel: ${tel}\n💬 Mensagem: ${msg}`;
            window.open(`https://wa.me/5511947772127?text=${encodeURIComponent(message)}`, '_blank');
            contactForm.reset();
        });
    }


    // ==========================================================================
    // 5. EFEITO PARALLAX SIMPLES NO HERO
    // ==========================================================================
    const heroGlass = document.querySelector('.hero-glass');
    
    window.addEventListener('mousemove', (e) => {
        if (!heroGlass) return;
        
        // Pega as coordenadas do mouse no viewport
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calcula a variação (-1 a 1)
        const moveX = (mouseX / windowWidth) - 0.5;
        const moveY = (mouseY / windowHeight) - 0.5;
        
        // Aplica transform leve
        const strength = 15; // Intensidade do movimento em pixels
        heroGlass.style.transform = `translate(${moveX * strength}px, ${moveY * strength}px)`;
    });

    // ==========================================================================
    // 6. BACKGROUND ANIMADO TECNOLÓGICO (NETWORK PARTICLES VIA CANVAS)
    // ==========================================================================
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Variáveis de dimensão e sistema
        let width, height;
        let particles = [];
        
        // Configurações das partículas
        const config = {
            particleCount: 80, // Quantidade base (ajustada por tamanho da tela)
            particleColor: 'rgba(46, 163, 242, 0.4)', // Azul claro transparente
            lineColor: 'rgba(46, 163, 242, 0.15)',
            maxDistance: 150, // Distância máxima para conectar linhas
            particleSpeed: 0.5,
            particleSize: 1.5
        };

        // Objeto mouse para interação
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        // Rastrear mouse sobre o canvas
        window.addEventListener('mousemove', function(event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        // Limpar posições do mouse ao sair da tela
        window.addEventListener('mouseout', function() {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Classe Partícula
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Velocidade vetorial (-0.5 a 0.5 * speed)
                this.vx = (Math.random() - 0.5) * config.particleSpeed;
                this.vy = (Math.random() - 0.5) * config.particleSpeed;
                this.size = Math.random() * config.particleSize + 0.5;
            }

            // Desenhar no canvas
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = config.particleColor;
                ctx.fill();
            }

            // Atualizar posição
            update() {
                // Rebatimento nas bordas
                if (this.x > width || this.x < 0) this.vx = -this.vx;
                if (this.y > height || this.y < 0) this.vy = -this.vy;

                // Move
                this.x += this.vx;
                this.y += this.vy;

                // Interação com mouse (empurrar levemente)
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        // Foge do mouse
                        this.x -= forceDirectionX * 1;
                        this.y -= forceDirectionY * 1;
                    }
                }
                this.draw();
            }
        }

        // Função para conectar partículas com linhas
        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + 
                                   ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    
                    if (distance < (config.maxDistance * config.maxDistance)) {
                        // Calcula opacidade baseada na distância
                        let opacity = 1 - (distance / (config.maxDistance * config.maxDistance));
                        ctx.strokeStyle = `rgba(46, 163, 242, ${opacity * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Inicialização do Canvas
        function init() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            
            // Ajusta quantidade de partículas baseado no tamanho da tela para não pesar mobile
            const count = window.innerWidth < 768 ? config.particleCount / 2 : config.particleCount;
            
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        // Loop de Animação
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
            
            requestAnimationFrame(animate);
        }

        // Handle Resize Responsivo
        window.addEventListener('resize', function() {
            init();
        });

        // Start
        init();
        animate();
    }

    // ==========================================================================
    // 7. EFEITO 3D TILT AVANÇADO NOS CARDS DE SERVIÇO
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcula a rotação dinâmica pelo ponteiro do mouse
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transition = 'none'; // Desabilita smooth transition durante hover frame
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Movimenta o brilho da borda e sombra dinamicamente na oposição do mouse
            card.style.borderColor = `rgba(46, 163, 242, 0.6)`;
            card.style.boxShadow = `0 35px 60px rgba(0,0,0,0.6), ${rotateY * -1}px ${rotateX * -1}px 35px rgba(46, 163, 242, 0.2)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reseta posições base com mola suave ao sair
            card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            card.style.borderColor = `var(--glass-border)`;
            card.style.boxShadow = `var(--shadow-soft)`;
        });
    });
});