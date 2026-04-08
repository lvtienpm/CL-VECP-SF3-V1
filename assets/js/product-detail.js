/**=====================
    Product Detail JS (ES6+)
    Handles Dynamic Content Loading from JSON
==========================**/
document.addEventListener('DOMContentLoaded', async () => {
    const productsPath = 'assets/data/products.json';
    const detailsPath = 'assets/data/product-details.json';

    // 1. Get Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 23; // Default to 23 if not found

    try {
        // 2. Fetch both JSON files
        const [productsRes, detailsRes] = await Promise.all([
            fetch(productsPath),
            fetch(detailsPath)
        ]);

        const products = await productsRes.json();
        const detailsList = await detailsRes.json();

        // 3. Find matching product data
        const basicInfo = products.find(p => p.id === productId);
        const extendedInfo = detailsList.find(p => p.id === productId);

        if (!basicInfo) {
            console.error("Không tìm thấy sản phẩm với ID:", productId);
            return;
        }

        renderProductDetail(basicInfo, extendedInfo);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
    }

    function renderProductDetail(basic, extended) {
        // --- Basic Info ---
        const nameEl = document.getElementById('product-name');
        const priceEl = document.getElementById('product-price');
        const originalPriceEl = document.getElementById('product-original-price');
        const discountPercentEl = document.getElementById('product-discount-percent');
        const offerBadgeEl = document.getElementById('product-offer-badge');

        if (nameEl) nameEl.innerText = basic.name;
        if (priceEl) priceEl.innerText = window.formatCurrency(basic.price);

        if (basic.originalPrice && basic.originalPrice > basic.price) {
            if (originalPriceEl) {
                originalPriceEl.innerText = window.formatCurrency(basic.originalPrice);
                originalPriceEl.style.display = 'inline-block';
            }
            const discount = Math.round(((basic.originalPrice - basic.price) / basic.originalPrice) * 100);
            if (discountPercentEl) {
                discountPercentEl.innerText = `(Giảm ${discount}%)`;
                discountPercentEl.style.display = 'inline-block';
            }
            if (offerBadgeEl) {
                offerBadgeEl.innerText = `Giảm ${discount}%`;
                offerBadgeEl.style.display = 'block';
            }
        } else {
            if (originalPriceEl) originalPriceEl.style.display = 'none';
            if (discountPercentEl) discountPercentEl.style.display = 'none';
            if (offerBadgeEl) offerBadgeEl.style.display = 'none';
        }

        // --- Breadcrumbs ---
        const bcCat = document.getElementById('breadcrumb-category');
        const bcProd = document.getElementById('breadcrumb-product');
        if (bcCat && basic.category) {
            bcCat.innerText = Array.isArray(basic.category) ? basic.category[0] : basic.category;
        }
        if (bcProd) bcProd.innerText = basic.name;

        // --- Extended Info (from product-details.json) ---
        if (extended) {
            // Short Description
            const descEl = document.getElementById('product-short-description');
            if (descEl) descEl.innerHTML = `<p>${extended.shortDescription || ""}</p>`;

            // Sizes
            const sizeContainer = document.getElementById('product-sizes-container');
            if (sizeContainer && extended.sizes && extended.sizes.length > 0) {
                sizeContainer.innerHTML = extended.sizes.map((size, idx) =>
                    `<li><a href="javascript:void(0)" class="${idx === 0 ? 'active' : ''}">${size}</a></li>`
                ).join('');

                sizeContainer.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', function () {
                        sizeContainer.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
            }

            // Sale Timer
            const timerBox = document.getElementById('product-sale-timer');
            if (timerBox) {
                const now = new Date();
                const endDate = extended.saleEndDate ? new Date(extended.saleEndDate) : null;
                const isPast = endDate && endDate <= now;

                if (extended.hasSaleTimer && endDate && !isPast) {
                    timerBox.style.display = 'block';
                    if (typeof window.initializeClock === 'function') {
                        window.initializeClock('product-sale-timer', extended.saleEndDate);
                    }
                } else {
                    timerBox.style.display = 'none';
                }
            }

            // Metadata Detail
            const typeEl = document.getElementById('product-type');
            const skuEl = document.getElementById('product-sku');
            const dateEl = document.getElementById('product-date');
            const stockEl = document.getElementById('product-stock');
            const tagsEl = document.getElementById('product-tags');

            if (typeEl) typeEl.innerText = extended.details?.type || "";
            if (skuEl) skuEl.innerText = extended.details?.sku || "";
            if (dateEl) dateEl.innerText = extended.details?.dateAdded || "";
            if (stockEl) {
                stockEl.innerText = (extended.details?.stockCount > 0)
                    ? `Còn lại ${extended.details.stockCount} sản phẩm`
                    : "Hết hàng";
            }
            if (tagsEl && extended.details?.tags) tagsEl.innerText = extended.details.tags.join(', ');

            // Gallery / Images
            const galleryImages = (extended.gallery && extended.gallery.length > 0) ? extended.gallery : [basic.image];
            renderGallery(galleryImages);
        } else {
            // Fallback if no extended info
            renderGallery([basic.image]);
            const descEl = document.getElementById('product-short-description');
            if (descEl) descEl.innerText = "Thông tin chi tiết đang được cập nhật.";

            // Hide timer by default if no extended info
            const timerBox = document.getElementById('product-sale-timer');
            if (timerBox) timerBox.style.display = 'none';
        }

        // --- Action Buttons ---
        const product = { ...basic, ...extended }; // Gộp dữ liệu để có đầy đủ SKU, mô tả...
        initActions(product);
    }

    function renderGallery(images) {
        const mainContainer = document.getElementById('product-main-slider');
        const thumbContainer = document.getElementById('product-thumbnails-slider');

        if (!mainContainer || !thumbContainer) return;

        mainContainer.innerHTML = images.map((img, idx) => `
            <div>
                <div class="slider-image" style="cursor: zoom-in;">
                    <img src="${img}" 
                         class="img-fluid blur-up lazyload image_zoom_cls-${idx}" 
                         alt="product">
                </div>
            </div>
        `).join('');

        thumbContainer.innerHTML = images.map(img => `
            <div>
                <div class="sidebar-image" style="cursor: pointer;">
                    <img src="${img}" class="img-fluid blur-up lazyload" alt="thumbnail">
                </div>
            </div>
        `).join('');

        // Initialize / Refresh Slick sliders
        setTimeout(() => {
            initSlick();
        }, 200);
    }

    function initSlick() {
        if (typeof $ === 'undefined' || !$.fn.slick) return;

        const mainSlider = $('#product-main-slider');
        const thumbSlider = $('#product-thumbnails-slider');
        const imageCount = mainSlider.children().length;

        // Cleanup
        if (mainSlider.hasClass('slick-initialized')) mainSlider.slick('unslick');
        if (thumbSlider.hasClass('slick-initialized')) thumbSlider.slick('unslick');

        // Logic ẩn hiện khi chỉ có 1 ảnh
        const mainCol = mainSlider.parent();
        const thumbCol = thumbSlider.parent();
        if (imageCount <= 1) {
            thumbCol.hide().addClass('d-none');
            mainCol.attr('class', 'col-xxl-12 col-xl-12 col-lg-12 col-md-12 order-1');
        } else {
            thumbCol.show().removeClass('d-none');
            mainCol.attr('class', 'col-xxl-10 col-lg-10 col-md-10 order-xxl-2 order-lg-2 order-md-2');
        }

        // Khởi tạo Ảnh chính (theo đúng class template yêu cầu)
        mainSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: imageCount > 1 ? '#product-thumbnails-slider' : null,
            infinite: (imageCount > 1)
        });

        // Khởi tạo Ảnh nhỏ (DÙNG NGUYÊN VĂN CẤU HÌNH BẠN GỬI)
        if (imageCount > 1) {
            thumbSlider.slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                asNavFor: '#product-main-slider',
                dots: false,
                focusOnSelect: true,
                vertical: true,
                responsive: [
                    {
                        breakpoint: 1400,
                        settings: {
                            vertical: true, 
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            vertical: true, // Lại xoay dọc ở màn hình này (theo template)
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            vertical: false, // Chuyển ngang ở Tablet
                        }
                    },
                    {
                        breakpoint: 430,
                        settings: {
                            slidesToShow: 3,
                            vertical: false, // Chuyển ngang ở Mobile
                        }
                    }
                ]
            });
        }

        // Căn chỉnh lại vị trí để ổn định giao diện
        const refreshSlick = () => {
            if (mainSlider.hasClass('slick-initialized')) mainSlider.slick('setPosition');
            if (thumbSlider.hasClass('slick-initialized')) thumbSlider.slick('setPosition');
        };
        setTimeout(refreshSlick, 200);
        setTimeout(refreshSlick, 1000);
        $(window).off('resize.detailPage').on('resize.detailPage', refreshSlick);
    }



    function initActions(product) {
        // 1. References (Quantity buttons are handled by quantity-2.js)
        const qtyInput = document.getElementById('product-quantity');

        // 2. Size selection logic
        const sizesContainer = document.getElementById('product-sizes-container');
        if (sizesContainer) {
            sizesContainer.addEventListener('click', (e) => {
                const target = e.target.closest('li');
                if (target) {
                    // Remove active from others
                    sizesContainer.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    // Add active to current
                    target.classList.add('active');
                }
            });
        }

        // 3. Add to Cart Logic (Redux)
        const addBtn = document.getElementById('add-to-cart-btn');
        if (addBtn && qtyInput) {
            addBtn.addEventListener('click', () => {
                const qty = parseInt(qtyInput.value) || 1;

                // Helper to extract digits and dots, then remove dots (e.g. "1.500.000 VNĐ" -> 1500000)
                const getNumeric = (val) => {
                    const match = (val || "0").toString().replace(/\s/g, '').match(/[\d.]+/);
                    return match ? parseFloat(match[0].replace(/\./g, '')) : 0;
                };

                const numericPrice = getNumeric(product.price);
                const numericOldPrice = getNumeric(product.old_price || product.oldPrice || product.originalPrice);

                // Get selected size (e.g. "Size L" -> "L")
                const selectedSizeEl = sizesContainer ? sizesContainer.querySelector('a.active') : null;
                
                // Nếu chưa chọn size, báo lỗi
                if (!selectedSizeEl) {
                    if (window.showToast) {
                        window.showToast("Vui lòng chọn kích cỡ sản phẩm!", "error");
                    }
                    return;
                }

                const rawSize = selectedSizeEl.innerText.trim();
                const selectedSize = rawSize.replace(/Size\s+/i, ''); // Remove "Size " prefix

                // Generate UNIQUE SKU for the cart (Base SKU + Size)
                const baseSku = product.sku || product.details?.sku || `PROD-${product.id}`;
                const uniqueSku = `${baseSku}-${selectedSize.replace(/\s+/g, '')}`;

                const productToDispatch = {
                    id: product.id,
                    sku: uniqueSku,
                    name: product.name,
                    price: numericPrice,
                    old_price: numericOldPrice,
                    image: product.image,
                    size: selectedSize,
                    quantity: qty
                };

                if (window.dispatchAddToCart) {
                    window.dispatchAddToCart(productToDispatch);
                    window.showToast(`Đã thêm ${qty} "${product.name}" (Size: ${selectedSize}) vào giỏ hàng!`);
                } else {
                    console.warn("dispatchAddToCart not found, check store.js initialization");
                }
            });
        }

        // 3. Wishlist (Redux)
        const favBtn = document.getElementById('wishlist-btn-detail');
        if (favBtn) {
            // Update initial state of wishlist button
            if (window.cartStore) {
                const isFav = window.cartStore.getState().wishlist.items.some(item => item.id === product.id);
                if (isFav) favBtn.classList.add('active');
            }

            favBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.dispatchToggleWishlist) {
                    const isAdding = !window.cartStore.getState().wishlist.items.some(item => item.id === product.id);
                    window.dispatchToggleWishlist(product);
                    favBtn.classList.toggle('active');
                    window.showToast(isAdding ? "Đã thêm vào yêu thích!" : "Đã xóa khỏi yêu thích!");
                }
            });
        }
    }
});
