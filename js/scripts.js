/**
 * RUKKU TRAVELS - MAIN SCRIPT
 * Handles interactions, mobile menu, and GSAP Animations
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            // Trigger initial hero animations after loader disappears
            initHeroAnimations();
        }, 100); // Reduced delay for faster perceived performance
    });

    // --- Sticky Header ---
    const header = document.querySelector('.header');
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });
    // Trigger once on load in case page is already scrolled
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

    // --- Button Ripple Effect ---
    const rippleButtons = document.querySelectorAll('.btn-ripple');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            // Actually CSS pseudo element is handling active state, but 
            // if we wanted JS ripple we append here. Since CSS is doing it well via :active, 
            // we can leave this minimal or enhance it.
            // Let's enhance it with JS for a true material ripple:
            
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

    // Dynamically inject the ripple keyframes since we added it via JS
    const style = document.createElement('style');
    style.innerHTML = `
        .btn { position: relative; overflow: hidden; }
        @keyframes rippleAnim {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // --- Sparkles Generator (Optimized for Performance) ---
    const sparklesContainer = document.getElementById('sparkles-container');
    if (sparklesContainer) {
        // Disabled continuous heavy JS DOM manipulation to fix severe rendering lag
    }

    // --- Dynamic Background Loading for Hero ---
    const heroBgContainer = document.getElementById('hero-bg-container');
    if (heroBgContainer) {
        let heroImageIndex = 1;
        let loadedHeroSlides = [];
        let maxHeroFails = 1; // Stop after 1 failure to avoid console noise
        let currentHeroFails = 0;

        function tryLoadHeroImage(index) {
            const imgPath = `assets/images/${index}.jpeg`;
            const img = new Image();
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
                setInterval(() => {
                    loadedHeroSlides[currentSlide].classList.remove('active', 'anim-zoom');
                    currentSlide = (currentSlide + 1) % loadedHeroSlides.length;
                    loadedHeroSlides[currentSlide].classList.add('active', 'anim-zoom');
                }, 5000);
            }
        }
        
        tryLoadHeroImage(heroImageIndex);
    }

    // --- Dynamic Gallery Loading ---
    const galleryContainer = document.getElementById('gallery-masonry-container');
    if (galleryContainer) {
        let galleryIndex = 1;
        let maxGalleryFails = 1; // Stop immediately after first failure to reduce console noise
        let currentGalleryFails = 0;

        function tryLoadGalleryImage(index) {
            const imgPath = `assets/images/galary/${index}.jpeg`;
            const img = new Image();
            img.onload = () => {
                const item = document.createElement('div');
                item.className = 'gallery-item scroll-reveal-up'; 
                
                item.innerHTML = `
                    <img src="${imgPath}" alt="Gallery Image ${index}" loading="lazy">
                    <div class="gallery-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                `;
                
                // Add click listener for lightbox
                item.addEventListener('click', () => {
                    if (window.openLightbox) {
                        window.openLightbox(imgPath);
                    }
                });
                
                galleryContainer.appendChild(item);
                
                // Manually apply GSAP styles here for initial state if GSAP already ran
                if (typeof gsap !== 'undefined') {
                    gsap.set(item, { y: 60, opacity: 0 });
                    gsap.to(item, {
                        y: 0, 
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
                
                currentGalleryFails = 0;
                tryLoadGalleryImage(index + 1);
            };
            img.onerror = () => {
                currentGalleryFails++;
                if (currentGalleryFails < maxGalleryFails && index < 100) {
                    tryLoadGalleryImage(index + 1);
                } else {
                    if (typeof ScrollTrigger !== 'undefined') {
                        setTimeout(() => ScrollTrigger.refresh(), 500);
                    }
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

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Function to initialize hero animations
        function initHeroAnimations() {
            if (!document.querySelector('.agency-title')) return;
            const tl = gsap.timeline();
            tl.fromTo('.agency-title', 
                { y: 50, opacity: 0, scale: 0.9 }, 
                { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
            )
            .fromTo('.hero-title', 
                { y: 50, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
                "-=0.8"
            )
            .fromTo('.hero-subtitle', 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                "-=0.6"
            )
            .fromTo('.hero-actions', 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                "-=0.6"
            );
        }

        // Standard Scroll Reveal Up
        gsap.utils.toArray('.scroll-reveal-up').forEach(element => {
            gsap.fromTo(element, 
                { y: 60, opacity: 0 },
                {
                    y: 0, 
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%", // triggers when top of element hits 85% of viewport
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Left Reveal
        gsap.utils.toArray('.scroll-reveal-left').forEach(element => {
            gsap.fromTo(element, 
                { x: -60, opacity: 0 },
                {
                    x: 0, 
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%"
                    }
                }
            );
        });

        // Right Reveal
        gsap.utils.toArray('.scroll-reveal-right').forEach(element => {
            gsap.fromTo(element, 
                { x: 60, opacity: 0 },
                {
                    x: 0, 
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%"
                    }
                }
            );
        });

        // Parallax Effect for Backgrounds
        if (document.querySelector('.hero')) {
            gsap.to('.hero-bg', {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        if (document.querySelector('.special-feature')) {
            gsap.to('.feature-bg', {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: ".special-feature",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // Form Submit Prevent Default (for demo)
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
                    btn.style.backgroundColor = '#25D366'; // WhatsApp Green for success
                    btn.style.opacity = '1';
                    contactForm.reset();
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = ''; // Reset to default CSS
                    }, 3000);
                }, 1500);
            });
        }
    } else {
        console.warn("GSAP or ScrollTrigger not loaded.");
        // Fallback for hero animations if GSAP fails
        document.querySelectorAll('.reveal-text, .reveal-fade').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        });
    }
});
