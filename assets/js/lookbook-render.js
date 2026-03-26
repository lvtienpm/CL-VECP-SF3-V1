$(document).ready(function() {
    const renderLookbook = async () => {
        const container = $('.lookbook-grid-container');
        if (!container.length) return;

        try {
            const response = await fetch('../assets/data/lookbook.json');
            const lookbookImages = await response.json();

            // Clear existing static columns
            container.empty();

            // Determine number of columns based on screen width
            let columnCount = 5;
            const windowWidth = $(window).width();
            if (windowWidth < 576) {
                columnCount = 2;
            } else if (windowWidth < 991) {
                columnCount = 3;
            }

            // Create columns
            const columns = [];
            for (let i = 0; i < columnCount; i++) {
                const $col = $('<div class="lookbook-column"></div>');
                columns.push($col);
                container.append($col);
            }

            // Distribute images into columns
            lookbookImages.forEach((imgSrc, index) => {
                const columnIndex = index % columnCount;
                const itemHTML = `
                    <div class="lookbook-item">
                        <img src="${imgSrc}" alt="Lookbook Image ${index + 1}" class="img-fluid">
                    </div>
                `;
                columns[columnIndex].append(itemHTML);
            });
        } catch (error) {
            console.error('Lỗi khi nạp dữ liệu Lookbook:', error);
        }
    };

    renderLookbook();

    // Re-render on resize to maintain grid balance
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderLookbook, 250);
    });
});
