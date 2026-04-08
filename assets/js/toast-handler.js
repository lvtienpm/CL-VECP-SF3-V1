// Cấu hình mặc định cho iziToast
if (typeof iziToast !== 'undefined') {
    iziToast.settings({
        timeout: 3000,
        resetOnHover: true,
        icon: 'fa-solid',
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        position: 'topRight',
        maxWidth: 400,
        layout: 2,
        progressBar: true,
        animateInside: true,
        pauseOnHover: true,
        theme: 'light',
    });
}

// Hàm tạo âm thanh "Pop" tinh tế
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine'; // Âm thanh mềm mại
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // Tần số nốt A5
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Giảm tông nhanh

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Âm lượng cực nhỏ (5%)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1); // Nhỏ dần

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn("Chrome requires user interaction to play audio first time.");
    }
};

// 1. Hàm thông báo chung
window.showToast = (message, type = "success") => {
    // Phát âm thanh khi hiện thông báo
    playNotificationSound();

    if (typeof iziToast === 'undefined') {
        console.error("iziToast is not loaded!");
        alert(message);
        return;
    }

    const config = {
        message: message,
        title: type === 'success' ? 'Thành công' :
            (type === 'error' || type === 'danger' ? 'Lỗi' :
                (type === 'warning' ? 'Cảnh báo' : 'Thông báo')),
        progressBarColor: type === 'success' ? '#0da487' :
            (type === 'error' || type === 'danger' ? '#ef3f4e' :
                (type === 'warning' ? '#ffa502' : '#3498db')),
        icon: type === 'success' ? 'fa-solid fa-circle-check' :
            (type === 'error' || type === 'danger' ? 'fa-solid fa-circle-exclamation' :
                (type === 'warning' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info')),
    };

    if (type === 'success') iziToast.success(config);
    else if (type === 'error' || type === 'danger') iziToast.error(config);
    else if (type === 'warning') iziToast.warning(config);
    else iziToast.info(config);
};

// 2. Hàm hộp thoại xác nhận (Confirm) - Premium Style
window.showConfirmToast = (message, onConfirm, onCancel = null) => {
    if (typeof iziToast === 'undefined') {
        if (confirm(message)) onConfirm();
        return;
    }

    // Phát âm thanh khi hiện bảng hỏi
    playNotificationSound();

    iziToast.question({
        timeout: 20000,
        close: false,
        overlay: true,
        displayMode: 'once',
        id: 'question',
        zindex: 99999,
        title: '<i class="fa-regular fa-circle-question" style="margin-right: 10px; font-size: 24px; vertical-align: middle;"></i> XÁC NHẬN',
        message: message,
        position: 'center',
        theme: 'light',
        backgroundColor: '#fff',
        titleColor: '#222',
        messageColor: '#666',
        icon: null, // Tắt icon mặc định của iziToast để dùng icon nhúng trong title
        layout: 2,
        buttons: [
            ['<button class="btn-confirm-toast">Xác nhận</button>', function (instance, toast) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                if (onConfirm) onConfirm();
            }, true],
            ['<button class="btn-cancel-toast">Quay lại</button>', function (instance, toast) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                if (onCancel) onCancel();
            }],
        ],
    });
};

// Inject CSS cho nút bấm của Confirm Toast
(function injectToastStyles() {
    if (document.getElementById('iziToast-custom-css')) return;
    const style = document.createElement('style');
    style.id = 'iziToast-custom-css';
    style.textContent = `
        .iziToast-buttons {
            display: flex !important;
            gap: 12px !important;
            margin-top: 15px !important;
        }
        .btn-confirm-toast {
            background-color: #ef3f4e !important;
            color: white !important;
            border-radius: 8px !important;
            padding: 8px 20px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            border: none !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        .btn-confirm-toast:hover {
            background-color: #d83544 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(239, 63, 78, 0.2) !important;
        }
        .btn-cancel-toast {
            background-color: #f8f8f8 !important;
            color: #666 !important;
            border-radius: 8px !important;
            padding: 8px 20px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            border: 1px solid #ddd !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        .btn-cancel-toast:hover {
            background-color: #eeeeee !important;
            color: #333 !important;
        }
        .iziToast-wrapper-center .iziToast {
            border-radius: 15px !important;
            box-shadow: 0 15px 45px rgba(0,0,0,0.1) !important;
            border: 1px solid rgba(0,0,0,0.05) !important;
            padding: 30px !important;
            text-align: left !important;
        }
        .iziToast-wrapper-center .iziToast-message {
            margin-bottom: 5px !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-top: 10px !important;
        }
        .iziToast-wrapper-center .iziToast-title {
            font-size: 18px !important;
            font-weight: 800 !important;
            display: flex !important;
            align-items: center !important;
        }
        .iziToast-wrapper-center .iziToast-icon {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
})();
