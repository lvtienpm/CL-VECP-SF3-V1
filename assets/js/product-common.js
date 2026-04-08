/**=====================
    Product Common JS
    Shared utilities and Store integration
==========================**/

// 1. Định dạng tiền tệ VNĐ
window.formatCurrency = (number) => {
    if (!number) return "0 VNĐ";
    return number.toLocaleString('vi-VN').replace(/,/g, '.') + ' VNĐ';
};


// 3. Cập nhật giao diện Header từ Store
window.updateHeaderUI = (state) => {
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => el.innerText = state.cart.totalItems);

    const cartTotals = document.querySelectorAll('.cart-total-price');
    cartTotals.forEach(el => el.innerText = window.formatCurrency(state.cart.totalPrice));

    const cartList = document.querySelector('.cart-list');
    if (cartList) {
        if (state.cart.items.length === 0) {
            cartList.innerHTML = '<li class="text-center p-3" style="color: var(--theme-color); font-weight: bold;"><div class="flex-col mx-auto gap-4  flex  items-center justify-center"><img class="aspect-square object-contain" src="../assets/images/icon/cart_empty_background.png" alt="Giỏ hàng trống" width="320" height="320"><h4 class="text-h4  font-semibold">Giỏ hàng chưa có gì!</h4></div></li>';
        } else {
            cartList.innerHTML = state.cart.items.map(item => `
                <li class="product-box-contain">
                    <div class="drop-cart">
                        <a href="product-detail.html" class="drop-image">
                            <img src="${item.image}" class="blur-up lazyloaded" alt="${item.name}">
                        </a>
                        <div class="drop-contain">
                            <a href="product-detail.html"><h5>${item.name}</h5></a>
                            <h6><span>${item.quantity} x</span> ${window.formatCurrency(item.price)}</h6>
                            <small class="text-muted d-block mb-1">Size: ${item.size.replace(/Size\s+/i, '')}</small>
                            <button class="close-button close_button" onclick="dispatchRemoveFromCart('${item.sku}')">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                </li>
            `).join('');
        }
    }

    const wishlistIds = state.wishlist.items.map(item => item.id);
    window.updateWishlistIcons(wishlistIds);
};

// 4. Cập nhật icon yêu thích
window.updateWishlistIcons = (wishlistIds) => {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(btn => {
        const id = parseInt(btn.dataset.id);
        const icon = btn.querySelector('i');
        if (icon) {
            if (wishlistIds.includes(id)) {
                btn.classList.add('active');
                icon.classList.replace('fa-regular', 'fa-solid');
                icon.style.color = '#ef3f4e';
            } else {
                btn.classList.remove('active');
                icon.classList.replace('fa-solid', 'fa-regular');
                icon.style.color = '';
            }
        }
    });
};

// 5. Đăng ký Store và các sự kiện chung
document.addEventListener('DOMContentLoaded', () => {
    if (window.cartStore) {
        window.cartStore.subscribe(() => {
            window.updateHeaderUI(window.cartStore.getState());
        });
        window.updateHeaderUI(window.cartStore.getState());
    }
});
