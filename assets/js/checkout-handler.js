/**=====================
    Checkout Handler JS (Dynamic Checkout)
==========================**/
(function () {
    "use strict";

    // --- 1. Khởi tạo & Cấu hình ---
    const DOM = {
        cartItems: document.getElementById('checkout-cart-items'),
        subtotal: document.getElementById('checkout-subtotal'),
        shipping: document.getElementById('checkout-shipping'),
        tax: document.getElementById('checkout-tax'),
        discount: document.getElementById('checkout-discount'),
        total: document.getElementById('checkout-total'),

        addressList: document.getElementById('address-list'),
        saveAddressBtn: document.getElementById('saveAddressBtn'),
        confirmBtn: document.getElementById('confirm-order-btn'),

        // Modal & Form
        addressModalEl: document.getElementById('add-address'),
        addressForm: document.getElementById('addressForm'),

        // Radios
        paymentRadios: document.querySelectorAll('input[name="paymentMethod"]'),
        deliveryRadios: document.querySelectorAll('input[name="standard"]'),
        futureDateInput: document.querySelector('.future-box input[type="date"]'),

        // Future Box summary
        futureItemCount: document.getElementById('future-item-count'),
        futureTotalPrice: document.getElementById('future-total-price')
    };

    const STORAGE_KEYS = {
        ADDRESSES: 'user_addresses',
        COUPON: 'active_coupon',
        PENDING_ORDER: 'pending_order'
    };

    const addressModal = DOM.addressModalEl ? new bootstrap.Modal(DOM.addressModalEl) : null;

    // --- 2. Logic Hiển thị Giỏ hàng ---
    function renderSummary() {
        if (!window.cartStore || !DOM.cartItems) return;

        const cart = window.cartStore.getState().cart;
        const items = cart.items || [];

        if (items.length === 0) {
            DOM.cartItems.innerHTML = '<li class="text-center py-3">Giỏ hàng trống!</li>';
            updatePrices(0);
            return;
        }

        // Render danh sách sản phẩm
        DOM.cartItems.innerHTML = items.map(item => `
            <li>
                <img src="${item.image || 'assets/images/product/sp1.jpg'}" 
                     class="img-fluid blur-up lazyloaded checkout-image" alt="${item.name}">
                <h4>${item.name} <span>X ${item.quantity}</span></h4>
                <h4 class="price">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</h4>
            </li>
        `).join('');

        // Cập nhật số lượng sản phẩm vào Future Box
        if (DOM.futureItemCount) {
            DOM.futureItemCount.textContent = `${items.reduce((total, item) => total + item.quantity, 0)} Sản phẩm`;
        }

        updatePrices(cart.totalPrice);
    }

    function updatePrices(subtotal) {
        const shipping = subtotal > 0 ? 30000 : 0;
        const tax = Math.round(subtotal * 0.1); // VAT 10%

        // Lấy mã giảm giá từ localStorage
        const activeCoupon = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPON) || 'null');
        const discountAmount = activeCoupon ? activeCoupon.discountAmount : 0;

        const total = Math.max(0, subtotal + shipping + tax - discountAmount);

        if (DOM.subtotal) DOM.subtotal.textContent = `${subtotal.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.shipping) DOM.shipping.textContent = `${shipping.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.tax) DOM.tax.textContent = `${tax.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.discount) DOM.discount.textContent = `(-) ${discountAmount.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.total) DOM.total.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;

        // Cập nhật tổng tiền vào Future Box
        if (DOM.futureTotalPrice) {
            DOM.futureTotalPrice.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
        }
    }

    // --- 3. Logic Xử lý Địa chỉ ---
    function loadAddresses(selectIndex = 0) {
        if (!DOM.addressList) return;
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');

        if (saved.length > 0) {
            DOM.addressList.innerHTML = '';
            saved.forEach((addr, index) => renderAddress(addr, index === selectIndex));
        } else {
            DOM.addressList.innerHTML = '<div class="col-12 text-content">Chưa có địa chỉ nào. Vui lòng thêm mới!</div>';
        }
    }

    function renderAddress(data, isSelected = false) {
        const id = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const typeText = data.type === 'home' ? 'Nhà riêng' : (data.type === 'office' ? 'Văn phòng' : 'Khác');

        const html = `
            <div class="col-xxl-6 col-xl-6 col-lg-12 col-md-6">
                <div class="address-box ${isSelected ? 'active' : ''}">
                    <div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="addressSelect" id="${id}" ${isSelected ? 'checked' : ''}>
                        </div>

                        <div class="label">
                            <label for="${id}" style="cursor:pointer">${typeText}</label>
                        </div>

                        <div class="table-responsive address-table">
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <td colspan="2" class="fw-bold fs-6 text-dark">${data.fname}</td>
                                    </tr>
                                    <tr>
                                        <td>Điện thoại: </td>
                                        <td>${data.phone}</td>
                                    </tr>
                                    <tr>
                                        <td>Email: </td>
                                        <td>${data.email || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Tỉnh/TP: </td>
                                        <td>${data.provinceName || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Quận/Huyện: </td>
                                        <td>${data.districtName || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Phường/Xã: </td>
                                        <td>${data.wardName || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Địa chỉ: </td>
                                        <td>
                                            <p class="text-truncate-2 mb-0">${data.address}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;
        DOM.addressList.insertAdjacentHTML('beforeend', html);

        // Xử lý sự kiện click để chọn địa chỉ (Active State)
        const box = DOM.addressList.lastElementChild.querySelector('.address-box');
        box.dataset.address = JSON.stringify(data); // Lưu dữ liệu an toàn tại đây
        box.addEventListener('click', () => {
            document.querySelectorAll('.address-box').forEach(b => b.classList.remove('active'));
            box.classList.add('active');
            box.querySelector('input[type="radio"]').checked = true;
        });
    }

    function saveNewAddress() {
        const fields = ['fname', 'phone', 'email', 'address', 'province', 'district', 'ward', 'address-type'];
        const data = {};
        let isValid = true;

        fields.forEach(f => {
            const el = document.getElementById(f);
            if (!el || (el.tagName === 'SELECT' && !el.value) || (el.tagName !== 'SELECT' && !el.value.trim())) {
                isValid = false;
                if (el) el.classList.add('is-invalid');
            } else {
                if (el) el.classList.remove('is-invalid');
                data[f] = el.value.trim();

                // Lưu tên hiển thị cho các trường Select
                if (el.tagName === 'SELECT') {
                    const text = el.options[el.selectedIndex].text;
                    if (f === 'province') data.provinceName = text;
                    if (f === 'district') data.districtName = text;
                    if (f === 'ward') data.wardName = text;
                    if (f === 'address-type') data.type = el.value;
                }
            }
        });

        if (!isValid) {
            if (window.showToast) window.showToast('Vui lòng điền đầy đủ thông tin và chọn các cấp địa lý!', 'warning');
            return;
        }

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');
        saved.push(data);
        localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(saved));

        // Render lại danh sách và tự động chọn cái vừa thêm (cái cuối cùng)
        loadAddresses(saved.length - 1);

        closeModal();
        clearAddressForm(); // Dọn dẹp form sau khi lưu
        if (window.showToast) window.showToast('Đã lưu và chọn địa chỉ mới!');
    }

    function clearAddressForm() {
        const fields = ['fname', 'phone', 'email', 'address', 'province', 'district', 'ward', 'address-type'];
        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) {
                if (el.tagName === 'SELECT') {
                    el.selectedIndex = 0;
                } else {
                    el.value = '';
                }
                el.classList.remove('is-invalid');
            }
        });

        // Reset đặc biệt cho các ô chọn địa lý
        const district = document.getElementById('district');
        const ward = document.getElementById('ward');
        if (district) district.innerHTML = '<option selected disabled>Chọn Quận/Huyện</option>';
        if (ward) ward.innerHTML = '<option selected disabled>Chọn Phường/Xã</option>';
    }

    function closeModal() {
        if (addressModal) {
            addressModal.hide();
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style = '';
            }, 300);
        }
    }

    // --- 4. Logic Chốt Đơn hàng (Confirm) ---
    function confirmOrder() {
        // A. Kiểm tra giỏ hàng
        const cart = window.cartStore.getState().cart;
        if (cart.items.length === 0) {
            if (window.showToast) window.showToast('Giỏ hàng của bạn đang trống!', "error");
            return;
        }

        // B. Kiểm tra địa chỉ
        const selectedAddressBox = document.querySelector('.address-box.active');
        if (!selectedAddressBox) {
            if (window.showToast) window.showToast('Vui lòng chọn địa chỉ nhận hàng!', "error");
            return;
        }

        const addressData = JSON.parse(selectedAddressBox.getAttribute('data-address'));

        // C. Kiểm tra phương thức giao hàng
        const deliveryType = document.querySelector('input[name="standard"]:checked').id;
        let deliveryDate = 'Tiêu chuẩn';
        if (deliveryType === 'future') {
            if (!DOM.futureDateInput.value) {
                if (window.showToast) window.showToast('Vui lòng chọn ngày nhận hàng!', "error");
                return;
            }
            deliveryDate = DOM.futureDateInput.value;
        }

        // D. Kiểm tra phương thức thanh toán
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPayment) {
            if (window.showToast) window.showToast('Vui lòng chọn phương thức thanh toán!', "error");
            return;
        }

        // E. Tạo Object đơn hàng
        const orderId = 'FK' + Math.floor(Math.random() * 900000 + 100000);
        const subtotal = cart.totalPrice;
        const shipping = 30000;
        const tax = Math.round(subtotal * 0.1);
        const activeCoupon = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPON) || 'null');
        const discount = activeCoupon ? activeCoupon.discountAmount : 0;
        const total = subtotal + shipping + tax - discount;

        const orderData = {
            id: orderId,
            items: cart.items,
            summary: {
                subtotal, shipping, tax, discount, total
            },
            shippingAddress: {
                name: addressData.fname,
                address: addressData.address,
                ward: addressData.wardName,
                district: addressData.districtName,
                province: addressData.provinceName,
                phone: addressData.phone,
                email: addressData.email
            },
            deliveryMethod: deliveryDate,
            paymentMethod: selectedPayment.id,
            orderDate: new Date().toISOString()
        };

        // Lưu vào LocalStorage
        localStorage.setItem(STORAGE_KEYS.PENDING_ORDER, JSON.stringify(orderData));

        // CHUYỂN TRANG: Nếu là QR thì có thể sang trang QR, ở đây mặc định sang confirmation
        location.href = 'order-confirmation.html';
    }

    // --- 5. Lắng nghe & Khởi chạy ---
    document.addEventListener('DOMContentLoaded', () => {
        // Render dữ liệu
        renderSummary();
        loadAddresses();

        // Gắn sự kiện
        if (DOM.saveAddressBtn) {
            DOM.saveAddressBtn.addEventListener('click', saveNewAddress);
        }

        if (DOM.confirmBtn) {
            DOM.confirmBtn.addEventListener('click', confirmOrder);
        }

        // Dọn dẹp form mỗi khi mở Modal thêm địa chỉ mới
        if (DOM.addressModalEl) {
            DOM.addressModalEl.addEventListener('show.bs.modal', clearAddressForm);
        }

        // Lắng nghe store (ít khi thay đổi ở trang này nhưng vẫn nên có)
        if (window.cartStore) {
            window.cartStore.subscribe(renderSummary);
        }
    });

})();
