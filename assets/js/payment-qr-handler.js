/**=====================
    Payment QR Handler JS
==========================**/
(function () {
    "use strict";

    const STORAGE_KEYS = {
        PENDING_ORDER: 'pending_order'
    };

    const DOM = {
        qrImage: document.getElementById('qr-image'),
        qrAmount: document.getElementById('qr-amount'),
        qrMemo: document.getElementById('qr-memo')
    };

    // Thông tin ngân hàng mặc định của Shop
    const SHOP_BANK_INFO = {
        bankId: 'vcb', // Vietcombank
        accountNo: '1234567890',
        accountName: 'NGUYEN VAN A'
    };

    function init() {
        const orderDataRaw = localStorage.getItem(STORAGE_KEYS.PENDING_ORDER);
        if (!orderDataRaw) {
            window.location.href = 'index.html';
            return;
        }

        const data = JSON.parse(orderDataRaw);
        renderPaymentInfo(data);
    }

    function renderPaymentInfo(data) {
        const amount = data.summary.total;
        const orderId = data.id;

        // 1. Cập nhật Text hiển thị
        if (DOM.qrAmount) {
            DOM.qrAmount.textContent = `${amount.toLocaleString('vi-VN')} VNĐ`;
        }
        if (DOM.qrMemo) {
            DOM.qrMemo.textContent = `THANH TOAN ${orderId}`;
        }

        // 2. Tạo mã QR động theo định dạng yêu cầu của khách
        // Cấu trúc: STT:<OrderID>|Amount:<Amount>|Bank:Vietcombank
        const qrData = `STT:${orderId}|Amount:${amount}|Bank:Vietcombank`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
        
        if (DOM.qrImage) {
            DOM.qrImage.src = qrUrl;
        }
    }

    document.addEventListener('DOMContentLoaded', init);

})();
