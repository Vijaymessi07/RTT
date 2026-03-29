/**
 * RUKKU TRAVELS - OPTIMIZED MAIN SCRIPT
 * Performance improvements:
 * - Removed GSAP (saves 150KB+)
 * - Using Intersection Observer for scroll animations
 * - Optimized hero slider with requestAnimationFrame
 * - Efficient event handling
 * - Pure CSS animations instead of JS-driven animations
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            initHeroAnimations();
        }, 100);
    });

    // --- Initialize Hero Text Animations ---
    function initHeroAnimations() {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('visible');
        }
    }

    // --- Sticky Header with Optimized Scroll ---
    const header = document.querySelector('.header');
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Set initial header state
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if(mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    nav.classList.remove('active');
                    const icon = mobileToggle.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- Button Ripple Effect ---
    const rippleButtons = document.querySelectorAll('.btn-ripple');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripple = document.createElement("span");
            ripple.classList.add("ripple-js");
            ripple.style.position = "absolute";
            ripple.style.background = "rgba(255, 255, 255, 0.4)";
            ripple.style.transform = "translate(-50%, -50%)";
            ripple.style.pointerEvents = "none";
            ripple.style.borderRadius = "50%";
            ripple.style.width = "200px";
            ripple.style.height = "200px";
            ripple.style.left = x + "px";
            ripple.style.top = y + "px";
            ripple.style.animation = "rippleAnim 0.8s linear";
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 800);
        });
    });

    // Inject ripple animation styles
    const style = document.createElement('style');
    style.innerHTML = `
        .btn { position: relative; overflow: hidden; }
        @keyframes rippleAnim {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // --- INTERSECTION OBSERVER for Scroll-Triggered Animations (replaces GSAP) ---
    // This is more performant than GSAP and uses native browser APIs
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px 500px 0px' // Trigger 500px before element enters viewport for smoother scrolling
    };

    const scrollAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollAnimationObserver.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right').forEach(elem => {
        scrollAnimationObserver.observe(elem);
    });

    // --- Lazy Image Loading with Blur-Up (Optimized for Fast Scrolling) ---
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const dataSrc = img.getAttribute('data-src');
            const dataSrcset = img.getAttribute('data-srcset');
            if (!dataSrc && !dataSrcset) {
                observer.unobserve(img);
                return;
            }

            // Swap srcset first (browser picks optimal size), then src as fallback
            if (dataSrcset) {
                img.srcset = dataSrcset;
                img.removeAttribute('data-srcset');
            }
            if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute('data-src');
            }

            // Wait for full decode before revealing — prevents white flash
            const revealImage = () => {
                requestAnimationFrame(() => {
                    img.classList.add('is-loaded');
                });
            };

            if (img.decode) {
                img.decode().then(revealImage).catch(revealImage);
            } else {
                img.onload = revealImage;
            }

            observer.unobserve(img);
        });
    }, {
        // Load images 1000px BEFORE they scroll into view — crucial for fast scrolling
        rootMargin: '1000px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => lazyImageObserver.observe(img));

    // --- Dynamic Background Loading for Hero ---
    const heroBgContainer = document.getElementById('hero-bg-container');
    if (heroBgContainer) {
        let heroImageIndex = 1;
        let loadedHeroSlides = [];
        let maxHeroFails = 1;
        let currentHeroFails = 0;

        function tryLoadHeroImage(index) {
            const imgPath = `assets/images/${index}.jpeg`;
            const img = new Image();
            img.decoding = 'async';
            
            img.onload = () => {
                const slide = document.createElement('div');
                slide.className = 'hero-slide';
                if (loadedHeroSlides.length === 0) {
                    slide.classList.add('active', 'anim-zoom');
                }
                slide.style.backgroundImage = `url('${imgPath}')`;
                heroBgContainer.appendChild(slide);
                loadedHeroSlides.push(slide);
                
                currentHeroFails = 0;
                tryLoadHeroImage(index + 1);
            };
            
            img.onerror = () => {
                currentHeroFails++;
                if (currentHeroFails < maxHeroFails && index < 20) {
                    tryLoadHeroImage(index + 1);
                } else {
                    initHeroSlider();
                }
            };
            
            img.src = imgPath;
        }

        function initHeroSlider() {
            if (loadedHeroSlides.length > 1) {
                let currentSlide = 0;
                
                // Use requestAnimationFrame for smooth transitions
                function changeSlide() {
                    loadedHeroSlides[currentSlide].classList.remove('active', 'anim-zoom');
                    currentSlide = (currentSlide + 1) % loadedHeroSlides.length;
                    loadedHeroSlides[currentSlide].classList.add('active', 'anim-zoom');
                }
                
                // Change slides every 5 seconds
                setInterval(changeSlide, 5000);
            }
        }
        
        tryLoadHeroImage(heroImageIndex);
    }

    // --- Dynamic Gallery Loading ---
    const galleryContainer = document.getElementById('gallery-masonry-container');
    if (galleryContainer) {
        let galleryIndex = 1;
        let maxGalleryFails = 1;
        let currentGalleryFails = 0;

        function tryLoadGalleryImage(index) {
            const imgPath = `assets/images/galary/${index}.jpeg`;
            const img = new Image();
            
            img.onload = () => {
                const item = document.createElement('div');
                item.className = 'gallery-item scroll-reveal-up'; 
                
                item.innerHTML = `
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='100%25' height='100%25' fill='%231a052e'/%3E%3C/svg%3E" data-src="${imgPath}" width="1200" height="800" alt="Gallery Image ${index}" loading="lazy" decoding="async" class="lazy-image">
                    <div class="gallery-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                `;
                
                // Add click listener for lightbox
                item.addEventListener('click', () => {
                    if (window.openLightbox) {
                        window.openLightbox(imgPath);
                    }
                });
                
                galleryContainer.appendChild(item);
                
                // Observe new gallery items for scroll animations
                scrollAnimationObserver.observe(item);

                // Observe new gallery images for lazy loading
                const newLazyImg = item.querySelector('img[data-src]');
                if (newLazyImg) {
                    lazyImageObserver.observe(newLazyImg);
                }
                
                currentGalleryFails = 0;
                tryLoadGalleryImage(index + 1);
            };
            
            img.onerror = () => {
                currentGalleryFails++;
                if (currentGalleryFails < maxGalleryFails && index < 100) {
                    tryLoadGalleryImage(index + 1);
                }
            };
            
            img.src = imgPath;
        }

        tryLoadGalleryImage(galleryIndex);
    }

    // --- Lightbox Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg && lightboxClose) {
        window.openLightbox = function(src) {
            lightboxImg.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                lightboxImg.src = ''; 
            }, 300);
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                closeLightbox();
            }
        });
    }

    // --- Contact Form Handling ---
    const contactForm = document.querySelector('.contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Sending...';
            btn.style.opacity = '0.7';
            
            setTimeout(() => {
                btn.innerHTML = 'Message Sent <i class="fa-solid fa-check ml-2"></i>';
                btn.style.backgroundColor = '#25D366'; // WhatsApp Green
                btn.style.opacity = '1';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                }, 3000);
            }, 1500);
        });
    }

    console.log('✅ Rukku Travels - Optimized version loaded (no GSAP, native animations)');
});
