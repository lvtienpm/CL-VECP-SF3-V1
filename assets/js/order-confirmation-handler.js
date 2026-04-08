/**=====================
    Order Confirmation Handler JS
==========================**/
(function () {
    "use strict";

    const STORAGE_KEYS = {
        PENDING_ORDER: 'pending_order',
        CART: 'thefaded_cart'
    };

    const DOM = {
        name: document.getElementById('conf-name'),
        address: document.getElementById('conf-address'),
        email: document.getElementById('conf-email'),
        phone: document.getElementById('conf-phone'),
        province: document.getElementById('conf-province'),
        district: document.getElementById('conf-district'),
        ward: document.getElementById('conf-ward'),
        deliveryMethod: document.getElementById('conf-delivery-method'),
        deliveryDate: document.getElementById('conf-delivery-date'),
        paymentMethod: document.getElementById('conf-payment-method'),
        paymentDesc: document.getElementById('conf-payment-desc'),
        cartItems: document.getElementById('conf-cart-items'),
        subtotal: document.getElementById('conf-subtotal'),
        shipping: document.getElementById('conf-shipping'),
        total: document.getElementById('conf-total'),
        itemCount: document.getElementById('conf-item-count'),
        actionBtn: document.getElementById('conf-action-btn'),
        paymentSummaryBox: document.getElementById('payment-summary-box')
    };

    const paymentConfig = {
        'payment-cod': {
            title: 'Thanh toán khi nhận hàng (COD)',
            desc: 'Quý khách sẽ thanh toán tiền mặt cho nhân viên giao hàng sau khi kiểm tra sản phẩm.',
            btnText: 'Hoàn tất đặt hàng',
            nextStep: 'HOME'
        },
        'payment-qr': {
            title: 'Quét mã QR qua Ngân hàng',
            desc: 'Hệ thống đã chuẩn bị mã QR chính xác với số tiền đơn hàng của bạn.',
            btnText: 'Tiến hành quét mã QR',
            nextStep: 'QR_PAGE'
        },
        'payment-contact': {
            title: 'Liên hệ nhân viên hỗ trợ',
            desc: 'Nhân viên sẽ gọi cho bạn trong ít phút để hỗ trợ hoàn tất thanh toán.',
            btnText: 'Liên hệ hỗ trợ',
            nextStep: 'CONTACT'
        }
    };

    function init() {
        const orderDataRaw = localStorage.getItem(STORAGE_KEYS.PENDING_ORDER);
        if (!orderDataRaw) {
            // Nếu không có dữ liệu đơn hàng chờ, quay về trang chủ
            window.location.href = 'index.html';
            return;
        }

        const data = JSON.parse(orderDataRaw);
        renderOrder(data);
    }

    function renderOrder(data) {
        // 1. Thông tin khách hàng
        if (DOM.name) DOM.name.textContent = data.shippingAddress.name;
        if (DOM.phone) DOM.phone.textContent = data.shippingAddress.phone;
        if (DOM.email) DOM.email.textContent = data.shippingAddress.email || 'Chưa cung cấp';
        if (DOM.province) DOM.province.textContent = data.shippingAddress.province || '';
        if (DOM.district) DOM.district.textContent = data.shippingAddress.district || '';
        if (DOM.ward) DOM.ward.textContent = data.shippingAddress.ward || '';
        if (DOM.address) DOM.address.textContent = data.shippingAddress.address;

        // 2. Vận chuyển
        if (DOM.deliveryMethod) {
            const isStandard = data.deliveryMethod === 'Tiêu chuẩn';
            DOM.deliveryMethod.textContent = isStandard ? 'Giao hàng tiêu chuẩn' : 'Giao hàng vào ngày hẹn';
            
            if (DOM.deliveryDate) {
                if (isStandard) {
                    DOM.deliveryDate.textContent = 'Dự kiến nhận hàng trong 2-3 ngày làm việc.';
                } else {
                    // Định dạng lại ngày từ YYYY-MM-DD sang DD/MM/YYYY
                    const dateParts = data.deliveryMethod.split('-');
                    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : data.deliveryMethod;
                    DOM.deliveryDate.textContent = `Ngày hẹn giao hàng: ${formattedDate}`;
                }
            }
        }

        // 3. Thanh toán
        const pInfo = paymentConfig[data.paymentMethod] || paymentConfig['payment-cod'];
        if (DOM.paymentMethod) DOM.paymentMethod.textContent = pInfo.title;
        if (DOM.paymentDesc) DOM.paymentDesc.textContent = pInfo.desc;
        if (DOM.actionBtn) DOM.actionBtn.textContent = pInfo.btnText;

        // 4. Giỏ hàng
        if (DOM.cartItems) {
            DOM.cartItems.innerHTML = data.items.map(item => `
                <li>
                    <img src="${item.image || 'assets/images/product/sp1.jpg'}" 
                         class="img-fluid blur-up lazyloaded checkout-image" alt="${item.name}">
                    <h4>${item.name} <span>X ${item.quantity}</span></h4>
                    <h4 class="price">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</h4>
                </li>
            `).join('');
        }

        // 5. Tổng tiền
        if (DOM.subtotal) DOM.subtotal.textContent = `${data.summary.subtotal.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.shipping) DOM.shipping.textContent = `${data.summary.shipping.toLocaleString('vi-VN')} VNĐ`;
        if (DOM.total) DOM.total.textContent = `${data.summary.total.toLocaleString('vi-VN')} VNĐ`;

        // 5.1. Cập nhật tiêu đề số lượng (Header Summary)
        if (DOM.itemCount) {
            const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);
            DOM.itemCount.textContent = totalQty;
        }

        // 6. Hiển thị khung tóm tắt thanh toán (QR/COD)
        renderPaymentSummary(data);

        // 7. Gắn sự kiện nút hành động
        if (DOM.actionBtn) {
            DOM.actionBtn.addEventListener('click', () => handleFinalConfirm(pInfo.nextStep));
        }
    }

    function renderPaymentSummary(data) {
        if (!DOM.paymentSummaryBox) return;

        const pInfo = paymentConfig[data.paymentMethod] || paymentConfig['payment-cod'];

        DOM.paymentSummaryBox.innerHTML = `
            <div class="delivery-option">
                <div class="card-body p-4 bg-light rounded-4">
                    <div class="d-flex align-items-center gap-3">
                        <div>
                            <h5 class="fw-bold theme-color mb-1">${pInfo.title}</h5>
                            <p class="text-content mb-0">${pInfo.desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function handleFinalConfirm(step) {
        // Không xoá giỏ hàng ở đây nữa, chỉ xoá khi đến order-success.html

        if (step === 'QR_PAGE') {
            window.location.href = 'payment-qr.html';
        } else if (step === 'CONTACT') {
            window.location.href = 'contact-us.html';
        } else {
            window.location.href = 'order-success.html';
        }
    }

    document.addEventListener('DOMContentLoaded', init);

})();
