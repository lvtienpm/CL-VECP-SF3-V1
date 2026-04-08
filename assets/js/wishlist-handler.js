/**=====================
    Wishlist Handler JS
==========================**/

document.addEventListener('DOMContentLoaded', function () {
    const wishlistContainer = document.getElementById('wishlist-container');
    const wishlistEmpty = document.getElementById('wishlist-empty');

    function renderWishlist() {
        if (!window.cartStore || !wishlistContainer) return;

        const state = window.cartStore.getState();
        const items = state.wishlist.items;

        // Kiểm tra xem có sản phẩm nào không
        if (items.length === 0) {
            wishlistContainer.innerHTML = '';
            wishlistEmpty.classList.remove('d-none');
            return;
        }

        wishlistEmpty.classList.add('d-none');

        let html = '';
        items.forEach(product => {
            // Truyền ID sản phẩm qua URL để trang chi tiết biết cần hiển thị món nào
            const productLink = product.link ? `${product.link}?id=${product.id}` : `product-left-thumbnail.html?id=${product.id}`;

            html += `
                <div class="col-6 col-md-4 col-lg-3 col-xl-2-4 col-xxl-2-4 product-box-contain">
                    <div class="product-box-4 h-100">
                        <div class="product-header">
                            <div class="product-image">
                                <a href="${productLink}">
                                    <img src="${product.image}" class="img-fluid" alt="${product.name}">
                                </a>

                                <div class="product-header-top">
                                    <button class="btn wishlist-button close_button" onclick="handleRemoveFromWishlist(event, '${product.id}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                <ul class="option">
                                    <li data-bs-toggle="tooltip" data-bs-placement="top" title="Xem nhanh">
                                        <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#view"
                                            class="quick-view-btn" data-id="${product.id}">
                                            <i class="fa-regular fa-eye"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="product-footer">
                            <div class="product-detail">
                                <span class="span-name-tag">${product.category || 'THE FADED'}</span>

                                <a href="${productLink}">
                                    <h5 class="name">${product.name}</h5>
                                </a>
                                <h5 class="price theme-color">
                                    <strong>${product.price ? product.price.toLocaleString('vi-VN') : '0'} VNĐ</strong>
                                    ${product.originalPrice ? `<del>${product.originalPrice.toLocaleString('vi-VN')} VNĐ</del>` : ''}
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        wishlistContainer.innerHTML = html;

        // Re-init tooltips nếu cần
        if (window.feather) feather.replace();
    }

    // Đăng ký lắng nghe sự thay đổi của Store
    if (window.cartStore) {
        window.cartStore.subscribe(renderWishlist);
        renderWishlist(); // Render lần đầu
    }

    // Các hàm xử lý sự kiện (Global để onclick có thể gọi)
    window.handleRemoveFromWishlist = function (event, productId) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Chuyển đổi productId sang kiểu phù hợp nếu cần để so sánh chính xác
        window.cartStore.dispatch({
            type: 'REMOVE_FROM_WISHLIST',
            payload: productId
        });

        if (window.showToast) {
            window.showToast("Đã xóa khỏi danh sách yêu thích");
        }
    };

    window.handleAddToCartFromWishlist = function (productId) {
        const state = window.cartStore.getState();
        const product = state.wishlist.items.find(item => item.id === productId);

        if (product) {
            // Kiểm tra xem sản phẩm có cần chọn size không (mặc định mở Quick View để an toàn)
            if (window.initQuickView) {
                window.initQuickView(productId);
            } else {
                // Nếu là sản phẩm đơn giản, add thẳng
                if (window.dispatchAddToCart) {
                    window.dispatchAddToCart({
                        ...product,
                        quantity: 1
                    });
                }
            }
        }
    };

    window.handleQuickView = function (productId) {
        if (window.initQuickView) {
            window.initQuickView(productId);
        }
    };
});
