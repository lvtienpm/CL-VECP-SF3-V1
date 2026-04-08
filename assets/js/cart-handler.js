/**=====================
    Cart Handler JS (Dynamic Cart)
==========================**/
(function () {
    "use strict";

    // Khởi tạo các DOM elements chính
    const DOM = {
        itemList: document.getElementById('cart-item-list'),
        subtotal: document.getElementById('cart-subtotal'),
        total: document.getElementById('cart-total'),
        shipping: document.getElementById('cart-shipping'),
        discount: document.getElementById('cart-discount'),
        couponInput: document.getElementById('coupon-input'),
        applyCouponBtn: document.getElementById('apply-coupon-btn')
    };

    const COUPON_STORAGE_KEY = 'active_coupon';

    // Hàm render danh sách sản phẩm
    function render() {
        if (!window.cartStore || !DOM.itemList) return;

        const cart = window.cartStore.getState().cart;
        const items = cart.items || [];

        // 1. Kiểm tra giỏ hàng trống
        if (items.length === 0) {
            DOM.itemList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="empty-cart">
                            <img src="assets/images/icon/cart_empty_background.png" class="img-fluid mb-3" alt="Empty Cart" style="max-width: 400px;">
                            <h3>Giỏ hàng của bạn đang trống!</h3>
                            <p class="text-content mb-4">Hãy tiếp tục mua sắm để tìm thấy những sản phẩm ưng ý nhất.</p>
                            <a href="index.html" class="btn theme-bg-color text-white btn-md mt-3 btn-animation"
                                style="width: fit-content; margin: 0 auto; display: block;">
                                Tiếp tục mua sắm
                            </a>
                        </div>
                    </td>
                </tr>
            `;
            updateSummary(0);
            return;
        }

        // 2. Render từng dòng sản phẩm
        DOM.itemList.innerHTML = items.map(item => {
            const savings = (item.old_price && item.old_price > item.price) ? (item.old_price - item.price) : 0;

            return `
            <tr class="product-box-contain">
                <td class="product-detail">
                    <div class="product border-0">
                        <a href="product-left-thumbnail.html?id=${item.id}" class="product-image">
                            <img src="${item.image || '../assets/images/product/sp1.jpg'}" class="img-fluid blur-up lazyloaded" alt="${item.name}">
                        </a>
                        <div class="product-detail">
                            <ul>
                                <li class="name">
                                    <a href="product-left-thumbnail.html?id=${item.id}">${item.name}</a>
                                </li>

                                <li class="text-content"><span class="text-title">Thương hiệu:</span> THE FADED</li>

                                <li class="text-content"><span class="text-title">Size:</span> ${item.size || 'M'}</li>

                                <li>
                                    <h5 class="text-content d-inline-block">Giá :</h5>
                                    <span>${item.price.toLocaleString('vi-VN')} VNĐ</span>
                                </li>

                                ${savings > 0 ? `<li><h5 class="saving theme-color">Tiết kiệm : ${savings.toLocaleString('vi-VN')} VNĐ</h5></li>` : ''}

                                <li class="quantity-price-box d-xl-none">
                                    <div class="cart_qty">
                                        <div class="input-group">
                                            <button type="button" class="btn qty-left-minus" onclick="updateQty('${item.sku}', ${item.quantity - 1})">
                                                <i class="fa fa-minus ms-0"></i>
                                            </button>
                                            <input class="form-control input-number qty-input" type="text" value="${item.quantity}" readonly>
                                            <button type="button" class="btn qty-right-plus" onclick="updateQty('${item.sku}', ${item.quantity + 1})">
                                                <i class="fa fa-plus ms-0"></i>
                                            </button>
                                        </div>
                                    </div>
                                </li>

                                <li class="d-xl-none">
                                    <h5>Tổng: ${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</h5>
                                </li>
                            </ul>
                        </div>
                    </div>
                </td>

                <td class="price d-xl-table-cell d-none">
                    <h4 class="table-title text-content">Đơn giá</h4>
                    <h5>${item.price.toLocaleString('vi-VN')} VNĐ</h5>
                    ${savings > 0 ? `<h6 class="theme-color">Tiết kiệm : ${savings.toLocaleString('vi-VN')} VNĐ</h6>` : ''}
                </td>

                <td class="quantity d-xl-table-cell d-none">
                    <h4 class="table-title text-content">Số lượng</h4>
                    <div class="quantity-price">
                        <div class="cart_qty">
                            <div class="input-group">
                                <button type="button" class="btn qty-left-minus" onclick="updateQty('${item.sku}', ${item.quantity - 1})">
                                    <i class="fa fa-minus ms-0"></i>
                                </button>
                                <input class="form-control input-number qty-input" type="text" value="${item.quantity}" readonly>
                                <button type="button" class="btn qty-right-plus" onclick="updateQty('${item.sku}', ${item.quantity + 1})">
                                    <i class="fa fa-plus ms-0"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </td>

                <td class="subtotal">
                    <h4 class="table-title text-content">Thành tiền</h4>
                    <h5>${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</h5>
                </td>

                <td class="save-remove">
                    <h4 class="table-title text-content">Thao tác</h4>
                    <a class="save notifi-wishlist" href="javascript:void(0)" onclick="addToWishlist(${item.id})"
                        data-bs-toggle="tooltip" data-bs-placement="top" title="Yêu thích">
                        <i class="${window.cartStore.getState().wishlist.items.some(i => i.id === item.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" 
                           style="${window.cartStore.getState().wishlist.items.some(i => i.id === item.id) ? 'color: #ef3f4e;' : ''}"></i>
                    </a>
                    <a class="remove close_button" href="javascript:void(0)" onclick="removeFromCart('${item.sku}')">
                        <i class="fa-regular fa-trash-can" title="Xóa sản phẩm"
                            data-bs-toggle="tooltip" data-bs-placement="top"></i>
                    </a>
                </td>
            </tr>
        `;
        }).join('');

        // 3. Cập nhật tổng kết
        updateSummary(cart.totalPrice);
    }

    // Hàm cập nhật phần tổng tiền
    function updateSummary(subtotal) {
        if (!DOM.subtotal) return;

        const shipping = subtotal > 0 ? 30000 : 0;

        // Lấy mã giảm giá đã áp dụng (nếu có)
        const activeCoupon = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || 'null');
        const discountAmount = activeCoupon ? activeCoupon.discountAmount : 0;

        const total = Math.max(0, subtotal + shipping - discountAmount);

        DOM.subtotal.textContent = `${subtotal.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.shipping) DOM.shipping.textContent = `${shipping.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.discount) DOM.discount.textContent = `(-) ${discountAmount.toLocaleString('vi-VN')} VNĐ`;
        DOM.total.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
    }

    // --- Các hàm xử lý Sự kiện ---
    window.applyCoupon = () => {
        const code = DOM.couponInput.value.trim().toUpperCase();
        if (!code) {
            if (window.showToast) window.showToast('Vui lòng nhập mã giảm giá!', "warning");
            return;
        }

        // Mô phỏng kiểm tra mã: THEFADED giảm 100.000 VNĐ
        if (code === 'THEFADED') {
            const couponData = {
                code: 'THEFADED',
                discountAmount: 100000,
                type: 'fixed'
            };
            localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponData));
            if (window.showToast) window.showToast('Áp dụng mã giảm giá thành công!');
            render();
        } else {
            if (window.showToast) window.showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn!', "error");
        }
    };

    window.addToWishlist = (id) => {
        // Tìm sản phẩm trong giỏ hàng để lấy thông tin cơ bản
        const item = window.cartStore.getState().cart.items.find(i => i.id === id);
        if (item && window.dispatchToggleWishlist) {
            window.dispatchToggleWishlist(item);
            if (window.showToast) {
                const isFav = window.cartStore.getState().wishlist.items.some(i => i.id === id);
                window.showToast(isFav ? "Đã thêm vào yêu thích!" : "Đã xóa khỏi yêu thích!", isFav ? "success" : "info");
            }
        }
    };

    window.updateQty = (sku, quantity) => {
        if (quantity < 1) return;
        if (window.dispatchUpdateCartQuantity) {
            window.dispatchUpdateCartQuantity(sku, quantity);
        }
    };

    window.removeFromCart = (sku) => {
        const item = window.cartStore.getState().cart.items.find(i => i.sku === sku);
        if (!item) return;

        if (window.showConfirmToast) {
            window.showConfirmToast(
                `Bạn có chắc chắn muốn xóa "<strong>${item.name}</strong>" khỏi giỏ hàng không?`,
                () => {
                    if (window.dispatchRemoveFromCart) {
                        window.dispatchRemoveFromCart(sku);
                        if (window.showToast) {
                            window.showToast(`Đã xóa sản phẩm khỏi giỏ hàng!`, "info");
                        }
                    }
                }
            );
        } else {
            // Fallback nếu không có confirm toast
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                window.dispatchRemoveFromCart(sku);
            }
        }
    };

    // --- Khởi chạy ---
    document.addEventListener('DOMContentLoaded', () => {
        // Render lần đầu
        render();

        // Gắn sự kiện cho nút giảm giá
        if (DOM.applyCouponBtn) {
            DOM.applyCouponBtn.addEventListener('click', window.applyCoupon);
        }

        // Lắng nghe store thay đổi để render lại
        if (window.cartStore) {
            window.cartStore.subscribe(render);
        }
    });

})();
