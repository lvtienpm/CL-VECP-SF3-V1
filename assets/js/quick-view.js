document.addEventListener('DOMContentLoaded', () => {
    let currentProduct = null;

    // --- Dynamic Modal Injection ---
    const injectModal = () => {
        if (document.getElementById('view')) return; // Already exists

        const modalHTML = `
            <!-- Quick View Modal Box Start -->
            <div class="modal fade theme-modal view-modal" id="view" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-sm-down">
                    <div class="modal-content">
                        <div class="modal-header p-0">
                            <button type="button" class="btn-close" data-bs-dismiss="modal">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-sm-4 g-2">
                                <div class="col-lg-6">
                                    <div class="slider-image">
                                        <img src="" id="qv-image" class="img-fluid blur-up lazyload" alt="product">
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="right-sidebar-modal">
                                        <h4 class="title-name" id="qv-name">Tải dữ liệu...</h4>
                                        <h4 class="price" id="qv-price">0 VNĐ</h4>

                                        <div class="product-detail">
                                            <h4>Chi tiết sản phẩm :</h4>
                                            <p id="qv-description">Đang tải...</p>
                                        </div>

                                        <ul class="brand-list">
                                            <li>
                                                <div class="brand-box">
                                                    <h5>Thương hiệu:</h5>
                                                    <h6 id="qv-brand">THE FADED</h6>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="brand-box">
                                                    <h5>Mã sản phẩm:</h5>
                                                    <h6 id="qv-sku">N/A</h6>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="brand-box">
                                                    <h5>Phân loại:</h5>
                                                    <h6 id="qv-category">N/A</h6>
                                                </div>
                                            </li>
                                        </ul>

                                        <div class="select-size">
                                            <h4>Kích thước (Size) :</h4>
                                            <select class="form-select select-form-size" id="qv-size-select">
                                                <option selected="" value="">Chọn kích cỡ</option>
                                            </select>
                                        </div>

                                        <div class="modal-button">
                                            <button id="qv-add-to-cart" class="btn btn-md add-cart-button icon">Thêm vào giỏ hàng</button>
                                            <button id="qv-view-detail" class="btn theme-bg-color view-button icon text-white fw-bold btn-md">Xem chi tiết hơn</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Quick View Modal Box End -->
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    };

    injectModal();

    const modal = document.getElementById('view');

    // Selectors (must be after injection)
    const qvImage = document.getElementById('qv-image');
    const qvName = document.getElementById('qv-name');
    const qvPrice = document.getElementById('qv-price');
    const qvDescription = document.getElementById('qv-description');
    const qvBrand = document.getElementById('qv-brand');
    const qvSku = document.getElementById('qv-sku');
    const qvCategory = document.getElementById('qv-category');
    const qvSizeSelect = document.getElementById('qv-size-select');
    const qvAddToCart = document.getElementById('qv-add-to-cart');
    const qvViewDetail = document.getElementById('qv-view-detail');

    if (!modal) return;

    // Listen for clicks on the parent containers (event delegation)
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.quick-view-btn');
        if (btn) {
            const productId = parseInt(btn.dataset.id);
            await loadQuickView(productId);
        }
    });

    const loadQuickView = async (productId) => {
        try {
            // Fetch both data sources in parallel
            const [baseRes, detailsRes] = await Promise.all([
                fetch('assets/data/products.json'),
                fetch('assets/data/product-details.json')
            ]);

            const [products, detailsList] = await Promise.all([
                baseRes.json(),
                detailsRes.json()
            ]);

            const baseProduct = products.find(p => p.id === productId);
            const detailedProduct = detailsList.find(p => p.id === productId);

            if (!baseProduct && !detailedProduct) {
                console.error("Không tìm thấy sản phẩm ID:", productId);
                return;
            }

            // Merge data: products.json is usually more up-to-date for price/name
            // but product-details.json has more specific info
            currentProduct = {
                ...detailedProduct,
                ...baseProduct
            };

            // Ensure we keep the deeper details from product-details if they exist
            if (detailedProduct) {
                currentProduct.sizes = detailedProduct.sizes || currentProduct.sizes;
                currentProduct.shortDescription = detailedProduct.shortDescription || "";
                currentProduct.description = detailedProduct.description || currentProduct.description;
                currentProduct.sku = detailedProduct.sku || (detailedProduct.details ? detailedProduct.details.sku : currentProduct.sku);
            }

            populateModal(currentProduct);
        } catch (error) {
            console.error("Lỗi khi hợp nhất dữ liệu Quick View:", error);
        }
    };

    const populateModal = (product) => {
        // Basic Info
        if (qvImage) qvImage.src = product.image;
        if (qvName) qvName.innerText = product.name;

        // Price formatting support (using window.formatCurrency from script.js if available)
        const formatPrice = (val) => {
            if (typeof window.formatCurrency === 'function') return window.formatCurrency(val);
            return val + " VNĐ";
        };

        if (qvPrice) {
            let priceHTML = `<strong>${formatPrice(product.price)}</strong>`;
            if (product.originalPrice && product.originalPrice > product.price) {
                priceHTML += ` <del style="font-size: 0.8em; margin-left: 10px; color: #999;">${formatPrice(product.originalPrice)}</del>`;
            }
            qvPrice.innerHTML = priceHTML;
        }

        // Use shortDescription as priority for Modal, fallback to description or type
        if (qvDescription) {
            qvDescription.innerText = product.shortDescription || product.description || (product.details ? product.details.type : "");
        }

        // Brand/SKU/Category
        if (qvBrand) qvBrand.innerText = product.brand || "THE FADED";
        if (qvSku) qvSku.innerText = product.sku || (product.details ? product.details.sku : (product.sku_base || "N/A"));

        const categoryText = Array.isArray(product.category) ? product.category[0] : (product.category || (product.details ? product.details.type : "Chưa phân loại"));
        if (qvCategory) qvCategory.innerText = categoryText;

        // Sizes
        if (qvSizeSelect) {
            qvSizeSelect.innerHTML = '<option selected="" value="">Chọn kích cỡ</option>';
            const sizes = product.sizes || ["Size S", "Size M", "Size L", "Size XL", "Size XXL"];

            sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.innerText = size; // e.g. "Size L (68-75kg)"
                qvSizeSelect.appendChild(option);
            });
        }

        // View Detail Link
        if (qvViewDetail) {
            qvViewDetail.onclick = () => {
                window.location.href = `product-left-thumbnail.html?id=${product.id}`;
            };
        }
    };

    // Add to Cart Logic
    if (qvAddToCart) {
        qvAddToCart.addEventListener('click', () => {
            const qvSizeSelect = modal.querySelector('#qv-size-select');
            const selectedSizeRaw = qvSizeSelect ? qvSizeSelect.value : "";

            // Kiểm tra kích cỡ ngay lập tức
            if (!selectedSizeRaw) {
                if (window.showToast) {
                    window.showToast("Vui lòng chọn kích cỡ sản phẩm!", "error");
                }
                return;
            }

            // Thực hiện các logic xử lý SKU và thêm vào giỏ hàng tiếp theo
            const sizeClean = selectedSizeRaw.replace(/Size\s+([A-Z0-9]+).*/i, '$1').trim();

            // Base SKU
            const baseSku = currentProduct.sku || (currentProduct.details ? currentProduct.details.sku : `PROD-${currentProduct.id}`);
            const uniqueSku = `${baseSku}-${sizeClean}`;

            // Prices
            const getNumeric = (val) => {
                if (!val) return 0;
                return parseInt(val.toString().replace(/[^\d]/g, '')) || 0;
            };

            const productToDispatch = {
                id: currentProduct.id,
                sku: uniqueSku,
                name: currentProduct.name,
                price: getNumeric(currentProduct.price),
                old_price: getNumeric(currentProduct.oldPrice || currentProduct.originalPrice || 0),
                image: currentProduct.image,
                size: sizeClean,
                quantity: 1
            };

            if (window.dispatchAddToCart) {
                window.dispatchAddToCart(productToDispatch);
                window.showToast(`Đã thêm "${currentProduct.name}" (Size ${sizeClean}) vào giỏ hàng!`);

                // Close modal using Bootstrap API
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else {
                console.error("Redux dispatcher not found!");
            }
        });
    }
});
