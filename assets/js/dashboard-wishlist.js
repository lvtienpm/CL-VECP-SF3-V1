/**=====================
    Dashboard Wishlist Handler JS (Sized for Sidebar)
==========================**/

document.addEventListener('DOMContentLoaded', function () {
    const wishlistContainer = document.getElementById('wishlist-container');
    const wishlistEmpty = document.getElementById('wishlist-empty');

    function renderWishlist() {
        const store = window.thefaded_wishlist || window.cartStore;
        if (!store || !wishlistContainer) return;

        const state = store.getState();
        const items = state.wishlist ? state.wishlist.items : [];

        // Cập nhật số lượng tổng cộng trên Dashboard
        const totalCountEl = document.getElementById('wishlist-total-count');
        if (totalCountEl) {
            totalCountEl.innerText = items.length.toLocaleString('vi-VN');
        }

        if (items.length === 0) {
            wishlistContainer.innerHTML = '';
            if (wishlistEmpty) wishlistEmpty.classList.remove('d-none');
            return;
        }

        if (wishlistEmpty) wishlistEmpty.classList.add('d-none');

        let html = '';
        items.forEach(product => {
            const productLink = product.link ? `${product.link}?id=${product.id}` : `product-left-thumbnail.html?id=${product.id}`;

            // SỬ DỤNG CLASS CỦA DASHBOARD: 4 Cột trên màn hình lớn
            html += `
                <div class="col-6 col-md-4 col-lg-4 col-xl-3 col-xxl-3 product-box-contain">
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

        if (window.feather) feather.replace();
    }

    const store = window.thefaded_wishlist || window.cartStore;
    if (store) {
        store.subscribe(renderWishlist);
        renderWishlist();
    }

    // Các hàm xử lý sự kiện Global
    window.handleRemoveFromWishlist = function (event, productId) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const store = window.thefaded_wishlist || window.cartStore;
        if (store) {
            store.dispatch({
                type: 'REMOVE_FROM_WISHLIST',
                payload: productId
            });

            if (window.showToast) {
                window.showToast("Đã xóa khỏi danh sách yêu thích", "success");
            }
        }
    };
});
