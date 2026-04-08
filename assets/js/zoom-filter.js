/**=====================
    zoom js disabled - handled by image-lightbox.js for zoom-on-click
==========================**/
/*
if ($(window).width() > 991) {
    $('.product-main, .product-main-2').on('afterChange', function (event, slick, currentSlide, nextSlide) {
        var imgs = $('[class*="image_zoom_cls-"]');
        $('.zoomContainer').remove();
        imgs.removeData('elevateZoom');
        imgs.removeData('zoomImage');
        var temp_zoom_cls = '.image_zoom_cls-' + currentSlide;
        setTimeout(function () {
            $(temp_zoom_cls).elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
            });
        }, 200);
    });
}
if ($(window).width() > 991) {
    setTimeout(function () {
        $('.product-main img, .product-main-2 img').elevateZoom({
            zoomType: "inner",
            cursor: "crosshair",
        });
    }, 100);
}
*/