document.addEventListener("DOMContentLoaded", () => {
    let currentGallery = [];
    let currentIndex = 0;

    // 1. Inject Lightbox Structure into the DOM with Navigation Controls
    const injectLightbox = () => {
        if (document.getElementById('fkLightbox')) return;

        const lightboxHTML = `
            <div id="fkLightbox" class="fk-lightbox-overlay">
                <button class="fk-lightbox-nav fk-lightbox-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
                <div class="fk-lightbox-container">
                    <button class="fk-lightbox-close" aria-label="Close Gallery">&times;</button>
                    <img src="" class="fk-lightbox-image" alt="Product Zoomed View">
                </div>
                <button class="fk-lightbox-nav fk-lightbox-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    };

    injectLightbox();

    const lightbox = document.getElementById('fkLightbox');
    const lightboxImg = lightbox.querySelector('.fk-lightbox-image');
    const closeBtn = lightbox.querySelector('.fk-lightbox-close');
    const prevBtn = lightbox.querySelector('.fk-lightbox-prev');
    const nextBtn = lightbox.querySelector('.fk-lightbox-next');

    /**
     * Updates the lightbox content based on the current index in the gallery.
     */
    const updateLightboxImage = () => {
        const imgSrc = currentGallery[currentIndex];
        if (imgSrc) {
            // Apply a quick fade transition
            lightboxImg.style.opacity = '0.4';
            setTimeout(() => {
                lightboxImg.src = imgSrc;
                lightboxImg.style.opacity = '1';
                // Reset zoom state on image change
                lightboxImg.classList.remove('zoomed');
                lightboxImg.style.transform = 'none';
            }, 150);
        }

        // Update arrow visibility (only hide if only one image exists)
        if (currentGallery.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    };

    /**
     * Toggles zoom state and sets up panning logic.
     */
    const toggleZoom = (e) => {
        if (!lightboxImg.src) return;

        lightboxImg.classList.toggle('zoomed');

        if (lightboxImg.classList.contains('zoomed')) {
            updateZoomPosition(e);
        } else {
            lightboxImg.style.transform = 'none';
        }
    };

    /**
     * Updates the transform-origin based on mouse position relative to image.
     */
    const updateZoomPosition = (e) => {
        if (!lightboxImg.classList.contains('zoomed')) return;

        const rect = lightboxImg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        lightboxImg.style.transformOrigin = `${x}% ${y}%`;
        lightboxImg.style.transform = 'scale(2.5)';
    };

    /**
     * Opens the gallery starting at a specific index.
     * @param {number} idx - Index of the image to open.
     */
    const openGallery = (idx) => {
        // Find all main product images, excluding slick clones for accuracy
        const imageElements = document.querySelectorAll('.product-main-2 .slider-image img:not(.slick-cloned)');
        currentGallery = Array.from(imageElements).map(img => img.src);

        currentIndex = idx;
        if (currentIndex === -1) currentIndex = 0;

        updateLightboxImage();
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    /**
     * Navigates to the next image in the gallery.
     */
    const showNext = () => {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightboxImage();
    };

    /**
     * Navigates to the previous image in the gallery.
     */
    const showPrev = () => {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightboxImage();
    };

    /**
     * Closes the lightbox and restores page state.
     */
    const closeLightbox = () => {
        lightbox.classList.remove('show');
        document.body.style.overflow = ''; // Restore background scroll
        setTimeout(() => {
            if (!lightbox.classList.contains('show')) {
                lightboxImg.src = '';
            }
        }, 300);
    };

    // Global click listener using Event Delegation
    document.addEventListener('click', (event) => {
        // Case 1: Direct click on product main slider image
        const targetImg = event.target.closest('.product-main-2 .slider-image img');
        if (targetImg) {
            // Find its index among the non-cloned images
            const allImages = Array.from(document.querySelectorAll('.product-main-2 .slider-image img:not(.slick-cloned)'));
            const realIdx = allImages.findIndex(img => img.src === targetImg.src);
            openGallery(realIdx !== -1 ? realIdx : 0);
            return;
        }

        // Case 2: Click on elevateZoom container (which overlays the image)
        const zoomOverlay = event.target.closest('.zoomContainer');
        if (zoomOverlay) {
            // Map the zoom overlay back to the currently active slide's image
            const activeSlide = document.querySelector('.product-main-2 .slick-current, .product-main-2 .slick-active');
            if (activeSlide) {
                const activeImg = activeSlide.querySelector('.slider-image img');
                const allImages = Array.from(document.querySelectorAll('.product-main-2 .slider-image img:not(.slick-cloned)'));
                const realIdx = allImages.findIndex(img => img.src === activeImg.src);
                openGallery(realIdx !== -1 ? realIdx : 0);
            }
        }
    });

    // Gallery Control Events
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    // Zoom Controls on the Lightbox Image
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZoom(e);
    });
    lightboxImg.addEventListener('mousemove', (e) => {
        if (lightboxImg.classList.contains('zoomed')) {
            updateZoomPosition(e);
        }
    });

    lightbox.addEventListener('click', (e) => {
        // Close if clicking the backdrop, not the image or nav buttons
        if (e.target === lightbox || e.target.classList.contains('fk-lightbox-container')) {
            closeLightbox();
        }
    });

    // Accessibility: Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;

        switch (e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowRight': showNext(); break;
            case 'ArrowLeft': showPrev(); break;
        }
    });

    // Inject Zoom-Specific Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .fk-lightbox-container {
            overflow: hidden;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: default;
        }
        .fk-lightbox-image {
            transition: opacity 0.3s ease, transform 0.1s ease-out;
            cursor: zoom-in;
            max-width: 90vw;
            max-height: 85vh;
            object-fit: contain;
        }
        .fk-lightbox-image.zoomed {
            cursor: zoom-out;
        }
    `;
    document.head.appendChild(style);
});
