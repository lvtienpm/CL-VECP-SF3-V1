document.addEventListener('DOMContentLoaded', function () {
    const openBtn = document.getElementById('openVideo');
    const closeBtn = document.getElementById('closeVideo');
    const overlay = document.getElementById('videoOverlay');
    const iframe = document.getElementById('videoIframe');
    const overlayBg = document.querySelector('.video-overlay-close');

    // Link video Youtube của bạn (Lưu ý dùng định dạng /embed/)
    const videoSrc = "https://www.youtube.com/embed/6wLHiMVLNbE?autoplay=1";
    // Mở video
    openBtn.addEventListener('click', function () {
        iframe.setAttribute('src', videoSrc);
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Ngăn cuộn trang khi đang xem video
    });

    // Hàm đóng video
    function hideVideo() {
        overlay.style.display = 'none';
        iframe.setAttribute('src', ''); // Reset link để video dừng chạy
        document.body.style.overflow = 'auto'; // Cho phép cuộn lại
    }

    closeBtn.addEventListener('click', hideVideo);
    overlayBg.addEventListener('click', hideVideo); // Click ra ngoài vùng đen để đóng
});