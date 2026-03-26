/**=====================
    Feedback Slider JS
==========================**/
$(document).ready(function () {
    if ($.fn.slick) {
        $('.review-slider').slick({
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            dots: true,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        centerMode: true,
                        centerPadding: '20px',
                    }
                }
            ]
        });
    }
});
