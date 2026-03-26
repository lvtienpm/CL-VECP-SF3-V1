/**=====================
    Men's Jacket Render JS (ES6+)
    Using shared utilities from product-common.js
==========================**/
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('men-jacket-row');
    const jsonPath = '../assets/data/products.json';
    const targetCategory = "Áo khoác nam";

    let allProducts = [];

    const loadProducts = async () => {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allProducts = await response.json();

            // Lọc các sản phẩm có category chứa targetCategory
            const baseProducts = allProducts.filter(p =>
                Array.isArray(p.category) ? p.category.includes(targetCategory) : p.category === targetCategory
            );

            // Khởi tạo bộ lọc ban đầu
            applyFilters(baseProducts);
            bindFilterEvents(baseProducts);
        } catch (error) {
            console.error("Lỗi khi tải JSON sản phẩm:", error);
        }
    };

    const bindFilterEvents = (baseProducts) => {
        // Lắng nghe tất cả checkbox trong sidebar
        const checkboxes = document.querySelectorAll('.category-list input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => applyFilters(baseProducts));
        });

        // Lắng nghe ô tìm kiếm
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', () => applyFilters(baseProducts));
        }

        // Lắng nghe nút Xóa tất cả
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                checkboxes.forEach(cb => cb.checked = false);
                if (searchInput) searchInput.value = '';
                // Check các nút 'Tất cả'
                ['cat-all', 'sz-all', 'color-all', 'cond-all', 'price-all', 'discount-all'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.checked = true;
                });

                // Reset Stock Status UI
                const stockBtn = document.getElementById('dropdownStockStatus');
                if (stockBtn) stockBtn.querySelector('span').innerText = "Kho hàng";
                container.dataset.currentStock = 'stock-all-top';

                applyFilters(baseProducts);
            });
        }

        // Lắng nghe dropdown sắp xếp
        const sortItems = document.querySelectorAll('.top-filter-menu .dropdown-menu .dropdown-item:not([id^="stock-"])');
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sortType = item.id; // pop, low, high, off
                const sortText = item.innerText;

                // Cập nhật UI dropdown sắp xếp
                const btn = document.getElementById('dropdownMenuButton1');
                if (btn) btn.querySelector('span').innerText = sortText;

                container.dataset.currentSort = sortType;
                applyFilters(baseProducts);
            });
        });

        // Lắng nghe dropdown Kho hàng (Stock Status)
        const stockItems = document.querySelectorAll('.top-filter-menu .dropdown-menu .dropdown-item[id^="stock-"]');
        stockItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const stockType = item.id; // stock-all-top, stock-in-top, stock-out-top
                const stockText = item.innerText;

                // Cập nhật UI dropdown kho hàng
                const btn = document.getElementById('dropdownStockStatus');
                if (btn) btn.querySelector('span').innerText = stockText;

                container.dataset.currentStock = stockType;
                applyFilters(baseProducts);
            });
        });
    };

    const applyFilters = (baseProducts) => {
        let filtered = [...baseProducts];
        const sType = container.dataset.currentSort || 'pop';
        const stockStatus = container.dataset.currentStock || 'stock-all-top';

        const checkboxes = Array.from(document.querySelectorAll('.category-list input[type="checkbox"]:checked'));
        const searchQuery = document.getElementById('search')?.value.toLowerCase().trim();

        // 0. Lọc theo Kho hàng (Stock Status)
        if (stockStatus === 'stock-in-top') {
            filtered = filtered.filter(p => !p.stockStatus || p.stockStatus === 'in-stock');
        } else if (stockStatus === 'stock-out-top') {
            filtered = filtered.filter(p => p.stockStatus === 'out-of-stock');
        }

        // 1. Lọc theo Tìm kiếm (Search)
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                (p.subCategory && p.subCategory.some(sc => sc.toLowerCase().includes(searchQuery)))
            );
        }

        // 2. Lọc theo Loại sản phẩm (Sub-category)
        const activeSubCatFilters = Array.from(document.querySelectorAll('.category-list input[id^="cat-"]:checked'))
            .filter(cb => cb.id !== 'cat-all')
            .map(cb => cb.nextElementSibling.innerText.trim());

        if (activeSubCatFilters.length > 0) {
            filtered = filtered.filter(p => p.subCategory && p.subCategory.some(sc => activeSubCatFilters.includes(sc)));
        }

        // 3. Lọc theo Giá (Price)
        const activePriceFilters = Array.from(document.querySelectorAll('.category-list input[id^="price-"]:checked'))
            .filter(cb => cb.id !== 'price-all')
            .map(cb => cb.id);

        if (activePriceFilters.length > 0) {
            filtered = filtered.filter(p => {
                return activePriceFilters.some(id => {
                    if (id === 'price-1') return p.price < 1000000;
                    if (id === 'price-2') return p.price >= 1000000 && p.price < 2000000;
                    if (id === 'price-3') return p.price >= 2000000 && p.price < 3000000;
                    if (id === 'price-4') return p.price >= 3000000 && p.price < 4000000;
                    if (id === 'price-5') return p.price >= 4000000 && p.price < 5000000;
                    if (id === 'price-6') return p.price >= 5000000;
                    return false;
                });
            });
        }

        // 4. Lọc theo Kích thước (Size)
        const activeSizeFilters = Array.from(document.querySelectorAll('.category-list input[id^="sz-"]:checked'))
            .filter(cb => cb.id !== 'sz-all')
            .map(cb => cb.id.replace('sz-', '').toUpperCase());

        if (activeSizeFilters.length > 0) {
            filtered = filtered.filter(p => p.size && p.size.some(s => activeSizeFilters.includes(s.toUpperCase())));
        }

        // 5. Lọc theo Màu sắc (Color)
        const activeColorFilters = Array.from(document.querySelectorAll('.category-list input[id^="color-"]:checked'))
            .filter(cb => cb.id !== 'color-all')
            .map(cb => cb.id.replace('color-', ''));

        if (activeColorFilters.length > 0) {
            filtered = filtered.filter(p => p.color && p.color.some(c => activeColorFilters.includes(c.toLowerCase())));
        }

        // 6. Lọc theo Tình trạng (Condition)
        const activeCondFilters = Array.from(document.querySelectorAll('.category-list input[id^="cond-"]:checked'))
            .filter(cb => cb.id !== 'cond-all')
            .map(cb => cb.id);

        if (activeCondFilters.length > 0) {
            filtered = filtered.filter(p => {
                return activeCondFilters.some(id => {
                    if (id === 'cond-10') return p.condition === 10;
                    if (id === 'cond-95') return p.condition === 9.5;
                    if (id === 'cond-9') return p.condition === 9;
                    if (id === 'cond-8') return p.condition === 8;
                    if (id === 'cond-7') return p.condition === 7;
                    if (id === 'cond-6') return p.condition === 6;
                    if (id === 'cond-under-6') return p.condition < 6;
                    return false;
                });
            });
        }

        // 7. Sắp xếp (Sort)
        if (sType === 'low') filtered.sort((a, b) => a.price - b.price);
        else if (sType === 'high') filtered.sort((a, b) => b.price - a.price);
        else if (sType === 'off') {
            filtered.sort((a, b) => {
                const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
                const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
                return discB - discA;
            });
        }

        renderProducts(filtered, container);
    };

    const generateProductHTML = (product, index) => {
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
        const isOutOfStock = product.stockStatus === 'out-of-stock';

        return `
            <div class="col wow fadeInUp" data-wow-delay="${delay}s">
                <div class="product-box-4 h-100 ${isOutOfStock ? 'out-of-stock-box' : ''}">
                    ${discountHTML}
                    <div class="product-image">
                        <a href="product-left-thumbnail.html">
                            <img src="${product.image}" class="img-fluid" alt="${product.name}">
                        </a>
                        ${isOutOfStock ? '<div class="out-of-stock-label">Hết hàng</div>' : ''}

                        <ul class="option">
                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="Xem nhanh">
                                <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#view">
                                    <i class="fa-regular fa-eye"></i>
                                </a>
                            </li>

                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="Yêu thích">
                                <a href="javascript:void(0)" class="notifi-wishlist wishlist-btn" data-id="${product.id}">
                                    <i class="fa-regular fa-heart"></i>
                                </a>
                            </li>

                            <li data-bs-toggle="tooltip" data-bs-placement="top" title="So sánh">
                                <a href="compare.html">
                                    <i class="fa-solid fa-right-left"></i>
                                </a>
                            </li>
                        </ul>

                        <a href="javascript:void(0)" class="add-to-cart-btn btn-cart-dynamic ${isOutOfStock ? 'disabled' : ''}" data-id="${product.id}">
                            <i class="fa-solid fa-cart-plus"></i> ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </a>
                    </div>

                    <div class="product-footer">
                        <div class="product-detail">
                            <span class="span-name-tag">${categoryText}</span>
                            <a href="product-left-thumbnail.html">
                                <h5 class="name">${product.name}</h5>
                            </a>

                            <h5 class="price theme-color">
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
                <div class="col-12 text-center py-5 no-product-found">
                    <i class="fa-solid fa-box-open fa-3x mb-3 text-muted"></i>
                    <p>Không có sản phẩm nào trong mục này.</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map(product => generateProductHTML(product)).join('');

        if (typeof WOW !== 'undefined') new WOW().init();
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
        }

        if (window.cartStore) {
            const wishlistItems = window.cartStore.getState().wishlist.items;
            window.updateWishlistIcons(wishlistItems.map(item => item.id));
        }
    };

    const handleProductAction = (e) => {
        const cartBtn = e.target.closest('.btn-cart-dynamic');
        const wishlistBtn = e.target.closest('.wishlist-btn');

        if (cartBtn && !cartBtn.classList.contains('disabled')) {
            e.preventDefault();
            const id = parseInt(cartBtn.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product && window.dispatchAddToCart) {
                window.dispatchAddToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                });
                window.showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
            }
            return;
        }

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

    if (container) container.addEventListener('click', handleProductAction);

    loadProducts();
});
