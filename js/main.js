/**
 * Deep Public School, Jhunjhunu — Premium Website Script v2
 * Added: Particle canvas, scroll parallax, mouse-parallax, 3D effects
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────
  // 1. Hide Preloader
  // ─────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.style.opacity = '0';
      setTimeout(() => { preloader.style.display = 'none'; }, 600);
    });
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }, 3000);
  }

  // ─────────────────────────────────────────────
  // 2. Sticky Navbar Glass Effect
  // ─────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ─────────────────────────────────────────────
  // 3. Active Nav Link Highlighting
  // ─────────────────────────────────────────────
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

  const highlightNav = () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionTop = current.offsetTop - 100;
      const sectionId  = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + current.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav);

  // Close mobile navbar on link click
  const navbarCollapse = document.querySelector('.navbar-collapse');
  const navbarToggler  = document.querySelector('.navbar-toggler');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse.classList.contains('show')) navbarToggler.click();
    });
  });

  // ─────────────────────────────────────────────
  // 4. Hero Particle Canvas
  // ─────────────────────────────────────────────
  const initParticles = () => {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.4,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      gold:  Math.random() < 0.25,   // 25% are gold dots
    }));

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${0.045 * (1 - dist / 110)})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(245,179,1,${p.alpha})`
          : `rgba(79,195,247,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(drawParticles);
    };

    drawParticles();
  };
  initParticles();

  // ─────────────────────────────────────────────
  // 5. Scroll Parallax — multi-layer RAF loop
  // ─────────────────────────────────────────────
  const initScrollParallax = () => {
    if (window.innerWidth < 992) return;   // disable on mobile

    const heroBg    = document.getElementById('heroBgParallax');
    const heroTitle = document.querySelector('.hero-title');
    const heroSub   = document.querySelector('.hero-subtitle');
    const blobs     = document.querySelectorAll('.accent-3d-blob, .wc-blob');

    let lastScrollY = window.scrollY;
    let ticking     = false;

    const onParallaxFrame = () => {
      const y = lastScrollY;

      // Hero background moves slower than scroll (parallax depth)
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      }
      // Hero text layers at different speeds
      if (heroTitle) heroTitle.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      if (heroSub)   heroSub.style.transform   = `translate3d(0, ${y * 0.12}px, 0)`;

      // Section blobs drift slightly on scroll
      blobs.forEach((blob, i) => {
        const dir   = i % 2 === 0 ? 1 : -1;
        const speed = 0.06 + (i * 0.02);
        blob.style.transform = `translate3d(${dir * y * speed * 0.4}px, ${y * speed}px, 0)`;
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(onParallaxFrame);
        ticking = true;
      }
    }, { passive: true });
  };
  initScrollParallax();

  // ─────────────────────────────────────────────
  // 6. Mouse-move Parallax on Hero
  // ─────────────────────────────────────────────
  const initMouseParallax = () => {
    if (window.innerWidth < 992) return;

    const hero   = document.querySelector('.hero-section');
    if (!hero) return;

    const heroBg    = document.getElementById('heroBgParallax');
    const heroTitle = document.querySelector('.hero-title');
    const heroSub   = document.querySelector('.hero-subtitle');
    const glassCard = hero.querySelector('.glass-card');

    hero.addEventListener('mousemove', (e) => {
      const rect     = hero.getBoundingClientRect();
      const cx       = rect.width  / 2;
      const cy       = rect.height / 2;
      const dx       = (e.clientX - rect.left  - cx) / cx;   // -1 → 1
      const dy       = (e.clientY - rect.top   - cy) / cy;

      const scrollY  = window.scrollY;

      if (heroBg) {
        heroBg.style.transform = `translate3d(${dx * -12}px, ${dy * -8 + scrollY * 0.35}px, 0)`;
      }
      if (heroTitle) {
        heroTitle.style.transform = `translate3d(${dx * 8}px, ${dy * 5 + scrollY * 0.18}px, 0)`;
      }
      if (heroSub) {
        heroSub.style.transform = `translate3d(${dx * 5}px, ${dy * 3 + scrollY * 0.12}px, 0)`;
      }
      if (glassCard) {
        glassCard.style.transform = `translate3d(${dx * -6}px, ${dy * -4}px, 0)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      const scrollY = window.scrollY;
      if (heroBg)    heroBg.style.transform    = `translate3d(0, ${scrollY * 0.35}px, 0)`;
      if (heroTitle) heroTitle.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
      if (heroSub)   heroSub.style.transform   = `translate3d(0, ${scrollY * 0.12}px, 0)`;
      if (glassCard) glassCard.style.transform = '';
    });
  };
  initMouseParallax();

  // ─────────────────────────────────────────────
  // 7. Stat Counter Animation (IntersectionObserver)
  // ─────────────────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number');
  const animateCounter = (el) => {
    const target    = parseInt(el.getAttribute('data-target'), 10);
    const suffix    = el.getAttribute('data-suffix') || '';
    const duration  = 2000;
    const stepTime  = 30;
    const steps     = duration / stepTime;
    const increment = target / steps;
    let current     = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  };

  const statsSection = document.getElementById('stats-counter');
  if (statsSection && statNumbers.length > 0) {
    const obs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statNumbers.forEach(animateCounter);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(statsSection);
  }

  // ─────────────────────────────────────────────
  // 8. Gallery Lightbox
  // ─────────────────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox     = document.getElementById('lightbox');

  if (lightbox && galleryItems.length > 0) {
    const lightboxImg     = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose   = lightbox.querySelector('.lightbox-close');
    const lightboxPrev    = lightbox.querySelector('.lightbox-prev');
    const lightboxNext    = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    const imagesList = [];

    galleryItems.forEach((item, index) => {
      const img      = item.querySelector('img');
      const title    = item.querySelector('h5')?.textContent || 'Gallery Image';
      const category = item.querySelector('p')?.textContent  || '';
      imagesList.push({ src: img.src, caption: `${title} — ${category}` });

      item.addEventListener('click', (e) => {
        e.preventDefault();
        currentIndex = index;
        openLightbox();
      });
    });

    const openLightbox = () => {
      updateLightboxContent();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    const updateLightboxContent = () => {
      const d = imagesList[currentIndex];
      if (d) { lightboxImg.src = d.src; lightboxCaption.textContent = d.caption; }
    };
    const showNext = () => { currentIndex = (currentIndex + 1) % imagesList.length; updateLightboxContent(); };
    const showPrev = () => { currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length; updateLightboxContent(); };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click',  showNext);
    lightboxPrev.addEventListener('click',  showPrev);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft')  showPrev();
    });
  }

  // ─────────────────────────────────────────────
  // 9. Testimonial Carousel
  // ─────────────────────────────────────────────
  const testimonialEl = document.querySelector('#testimonialCarousel');
  if (testimonialEl) {
    new bootstrap.Carousel(testimonialEl, { interval: 6000, wrap: true });
  }

  // ─────────────────────────────────────────────
  // 10. Contact Form Handler
  // ─────────────────────────────────────────────
  const contactForm = document.getElementById('schoolContactForm');
  const formStatus  = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }

      const name      = document.getElementById('formName').value;
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const origText  = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

      setTimeout(() => {
        submitBtn.innerHTML  = origText;
        submitBtn.disabled   = false;
        formStatus.style.display  = 'block';
        formStatus.className      = 'form-status alert alert-success';
        formStatus.innerHTML      = `<strong>Success!</strong> Thank you, ${name}. We will reach out to you shortly.`;
        contactForm.reset();
        contactForm.classList.remove('was-validated');
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => {
          formStatus.style.opacity = '0';
          setTimeout(() => { formStatus.style.display = 'none'; formStatus.style.opacity = '1'; }, 500);
        }, 8000);
      }, 1500);
    });
  }

  // ─────────────────────────────────────────────
  // 11. Back to Top
  // ─────────────────────────────────────────────
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('active', window.scrollY > 400);
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─────────────────────────────────────────────
  // 12. Initialize AOS
  // ─────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      anchorPlacement: 'top-bottom',
      offset: 60,
    });
  }

  // ─────────────────────────────────────────────
  // 13. Timeline — highlight based on current time
  // ─────────────────────────────────────────────
  const highlightTimeline = () => {
    const now  = new Date();
    const t    = now.getHours() + now.getMinutes() / 60;
    let active = '';
    if      (t >= 5.5  && t < 7.5)  active = 'timeline-drill';
    else if (t >= 7.5  && t < 8.5)  active = 'timeline-assembly';
    else if (t >= 8.5  && t < 14)   active = 'timeline-academics';
    else if (t >= 14   && t < 16.5) active = 'timeline-lunch';
    else if (t >= 16.5 && t < 18.5) active = 'timeline-sports';
    else if (t >= 18.5 && t < 21.5) active = 'timeline-study';
    else                              active = 'timeline-sleep';

    document.querySelectorAll('.timeline-container').forEach(el => {
      const content = el.querySelector('.timeline-content');
      if (el.id === active) {
        content.style.borderColor = 'var(--secondary-gold)';
        content.style.boxShadow   = '0 0 18px rgba(245,179,1,0.4)';
        if (!content.querySelector('.active-timeline-badge')) {
          const badge = document.createElement('span');
          badge.className = 'badge bg-warning text-dark ms-2 active-timeline-badge';
          badge.innerHTML = '<i class="fa-solid fa-clock"></i> Active Now';
          badge.style.fontSize = '0.72rem';
          content.querySelector('.timeline-title').appendChild(badge);
        }
      } else {
        content.style.borderColor = '';
        content.style.boxShadow   = '';
        content.querySelector('.active-timeline-badge')?.remove();
      }
    });
  };
  highlightTimeline();
  setInterval(highlightTimeline, 60000);

  // ─────────────────────────────────────────────
  // 14. Inertial Smooth Scroll (desktop only)
  // ─────────────────────────────────────────────
  const initSmoothScroll = () => {
    if (window.innerWidth < 992) {
      document.body.classList.remove('smooth-scroll-active');
      return;
    }
    const viewport = document.querySelector('.scroll-viewport');
    const content  = document.getElementById('scroll-content');
    if (!viewport || !content) return;

    document.body.classList.add('smooth-scroll-active');

    let targetY  = window.scrollY;
    let currentY = window.scrollY;
    const ease   = 0.085;

    const resizeBody = () => {
      document.body.style.height = `${content.getBoundingClientRect().height}px`;
    };
    window.addEventListener('resize', resizeBody);
    setInterval(resizeBody, 1500);
    resizeBody();

    window.addEventListener('scroll', () => { targetY = window.scrollY; }, { passive: true });

    const updateScroll = () => {
      currentY += (targetY - currentY) * ease;
      if (Math.abs(targetY - currentY) > 0.05) {
        content.style.transform = `translate3d(0, ${-currentY}px, 0)`;
      } else {
        currentY = targetY;
        content.style.transform = `translate3d(0, ${-targetY}px, 0)`;
      }
      requestAnimationFrame(updateScroll);
    };
    requestAnimationFrame(updateScroll);
  };
  setTimeout(initSmoothScroll, 500);

  // ─────────────────────────────────────────────
  // 15. Interactive 3D Tilt (extended: gallery + wc-cards)
  // ─────────────────────────────────────────────
  const init3dTilt = () => {
    const tiltCards = document.querySelectorAll(
      '.tilt-card, .gallery-item, .wc-card, .feature-icon-card, .military-card'
    );

    tiltCards.forEach(card => {
      if (!card.querySelector('.tilt-glare')) {
        const glare       = document.createElement('div');
        glare.className   = 'tilt-glare';
        card.appendChild(glare);
      }
      const glare = card.querySelector('.tilt-glare');

      card.addEventListener('mousemove', (e) => {
        const rect      = card.getBoundingClientRect();
        const x         = e.clientX - rect.left;
        const y         = e.clientY - rect.top;
        const normX     = (x / rect.width)  - 0.5;
        const normY     = (y / rect.height) - 0.5;
        const maxTilt   = 8;
        const tiltX     = -normY * maxTilt;
        const tiltY     =  normX * maxTilt;

        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;

        if (glare) {
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 65%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      });
    });
  };
  init3dTilt();

  // ─────────────────────────────────────────────
  // 16. 3D Section Scroll Reveal (IntersectionObserver)
  // ─────────────────────────────────────────────
  const init3dReveal = () => {
    const cards = document.querySelectorAll('.section-3d-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    cards.forEach(c => obs.observe(c));
  };
  init3dReveal();

});
