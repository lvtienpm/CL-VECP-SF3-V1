/**=====================
    Product Render JS (ES6+)
    Integrated with Redux Store
==========================**/
document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('dynamic-product-row');
    const exclusiveContainer = document.getElementById('exclusive-products-row');
    const jsonPath = 'assets/data/products.json';

    let allProducts = [];

    const loadProducts = async () => {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allProducts = await response.json();

            renderProducts(allProducts, productContainer);

            if (exclusiveContainer) {
                const exclusiveProducts = allProducts.filter(p => p.isExclusive);
                renderProducts(exclusiveProducts, exclusiveContainer);
            }
        } catch (error) {
            console.error("Lỗi khi tải JSON sản phẩm:", error);
        }
    };

    const generateProductHTML = (product, index, containerId) => {
        const delay = (index * 0.05).toFixed(2);
        let discountHTML = '';
        if (product.originalPrice && product.originalPrice > product.price) {
            const percent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            discountHTML = `
                <div class="label-flex">
                    <div class="discount">
                        <label>${percent}%</label>
                    </div>
                </div>`;
        }

        const categoryText = Array.isArray(product.category) ? product.category.join(', ') : product.category;
        const priceClass = containerId === 'exclusive-products-row' ? 'price-vertical' : '';
        const columnClass = containerId === 'exclusive-products-row' ? '' : 'col-6 col-md-4 col-lg-3 col-xl-2-4 col-xxl-2-4';

        let badgesHTML = '';
        if (containerId === 'exclusive-products-row') {
            const percent = (product.originalPrice && product.originalPrice > product.price)
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

            badgesHTML = `
                <div class="product-badges-inline mt-2 d-flex flex-wrap align-items-center gap-1">
                    <div class="product-timer-badge px-2 py-1 rounded small text-white bg-theme-color" style="background-color: #ef5f33; font-weight: 600; font-size: 11px;">
                        00:00:00
                    </div>
                    ${percent > 0 ? `<div class="discount-badge-inline px-2 py-1 rounded small border" style="color: #ef5f33; border-color: #ef5f33 !important; font-weight: 500; font-size: 11px;">Giảm ${percent}%</div>` : ''}
                    <div class="freeship-badge px-2 py-1 rounded small text-white" style="background-color: #0baf9a; font-weight: 500; font-size: 11px;">
                        <i class="fa-solid fa-truck-fast me-1"></i>Freeship
                    </div>
                </div>`;
        }

        return `
            <div class="${columnClass} wow fadeInUp" data-wow-delay="${delay}s">
                <div class="product-box-4 h-100">
                    ${containerId === 'exclusive-products-row' ? '' : discountHTML}
                    <div class="product-image">
                        <a href="product-left-thumbnail.html?id=${product.id}">
                            <img src="${product.image}" class="img-fluid" alt="${product.name}">
                        </a>

                        <ul class="option">
                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="Xem nhanh">
                                <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#view" class="quick-view-btn" data-id="${product.id}">
                                    <i class="fa-regular fa-eye"></i>
                                </a>
                            </li>

                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="Yêu thích">
                                <a href="javascript:void(0)" class="notifi-wishlist wishlist-btn" data-id="${product.id}">
                                    <i class="fa-regular fa-heart"></i>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="product-footer">
                        <div class="product-detail">
                            <span class="span-name-tag">${categoryText}</span>
                            <a href="product-left-thumbnail.html?id=${product.id}">
                                <h5 class="name">${product.name}</h5>
                            </a>

                            ${badgesHTML}

                            <h5 class="price theme-color ${priceClass} mt-2">
                                <strong>${window.formatCurrency(product.price)}</strong>
                                ${product.originalPrice ? `<del>${window.formatCurrency(product.originalPrice)}</del>` : ''}
                            </h5>
                        </div>
                    </div>
                </div>
            </div>`;
    };

    const renderProducts = (products, container) => {
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 j">
                    <div class="no-product-found">
                        <i class="fa-solid fa-box-open fa-3x mb-3 text-muted"></i>
                        <p>Không có sản phẩm nào trong mục này.</p>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = products.slice(0, 10).map((product, index) =>
            generateProductHTML(product, index, container.id)
        ).join('');

        if (typeof WOW !== 'undefined') new WOW().init();
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
        }

        if (window.cartStore) {
            const wishlistItems = window.cartStore.getState().wishlist.items;
            window.updateWishlistIcons(wishlistItems.map(item => item.id));
        }

        // --- Slick Slider initialization for Exclusive Products ---
        if (container.id === 'exclusive-products-row' && typeof $ !== 'undefined' && $.fn.slick) {
            const $slider = $(container);
            if ($slider.hasClass('slick-initialized')) {
                $slider.slick('unslick');
            }
            $slider.slick({
                infinite: true,
                slidesToShow: 4, // Màn hình rất lớn
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                dots: false,
                arrows: true,
                prevArrow: `
                    <button type="button" class="slick-prev custom-arrow" aria-label="Previous">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>`,
                nextArrow: `
                    <button type="button" class="slick-next custom-arrow" aria-label="Next">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>`,
                responsive: [
                    {
                        breakpoint: 1399, // Laptop
                        settings: {
                            slidesToShow: 3,
                        }
                    },
                    {
                        breakpoint: 992, // Tablet
                        settings: {
                            slidesToShow: 2,
                        }
                    },
                    {
                        breakpoint: 576, // Mobile
                        settings: {
                            slidesToShow: 1,
                            arrows: false,
                            dots: true
                        }
                    }
                ]
            });
            initProductTimers(container);
        }
    };

    const initProductTimers = (container) => {
        const timers = container.querySelectorAll('.product-timer-badge');
        timers.forEach(timer => {
            const deadline = new Date();
            deadline.setHours(23, 59, 59, 999);

            function update() {
                const t = Date.parse(deadline) - Date.parse(new Date());
                if (t <= 0) {
                    timer.innerText = "00:00:00";
                    clearInterval(interval);
                    return;
                }
                const seconds = Math.floor((t / 1000) % 60);
                const minutes = Math.floor((t / 1000 / 60) % 60);
                const hours = Math.floor((t / (1000 * 60 * 60)) % 24);

                timer.innerText =
                    ('0' + hours).slice(-2) + ":" +
                    ('0' + minutes).slice(-2) + ":" +
                    ('0' + seconds).slice(-2);
            }
            update();
            const interval = setInterval(update, 1000);
        });
    };

    const handleProductAction = (e) => {
        const wishlistBtn = e.target.closest('.wishlist-btn');

        if (wishlistBtn) {
            e.preventDefault();
            const id = parseInt(wishlistBtn.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product && window.dispatchToggleWishlist) {
                const isAdding = !window.cartStore.getState().wishlist.items.some(item => item.id === product.id);
                window.dispatchToggleWishlist(product);
                window.showToast(isAdding ? "Đã thêm vào yêu thích!" : "Đã xóa khỏi yêu thích!");
            }
            return;
        }
    };

    if (productContainer) productContainer.addEventListener('click', handleProductAction);
    if (exclusiveContainer) exclusiveContainer.addEventListener('click', handleProductAction);

    const tabButtons = document.querySelectorAll('#myTab .nav-link');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filterId = e.currentTarget.id;
            const filtered = (filterId === 'all-tab') ? allProducts :
                (filterId === 'new-product-tab') ? allProducts.filter(p => p.isNew) :
                    (filterId === 'bestseller-tab') ? allProducts.filter(p => p.isBestseller) :
                        (filterId === 'discount-tab') ? allProducts.filter(p => p.originalPrice > p.price) :
                            (filterId === 'exclusive-tab') ? allProducts.filter(p => p.isExclusive) : allProducts;
            renderProducts(filtered, productContainer);
        });
    });

    loadProducts();
});
