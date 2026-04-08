/**=====================
    Dashboard Address Management JS
    Handles rendering, deleting and editing addresses in the user dashboard.
==========================**/
document.addEventListener('DOMContentLoaded', () => {
    const dashboardList = document.getElementById('dashboard-address-list');
    let currentEditIndex = null; // Theo dõi địa chỉ đang được sửa

    const renderDashboardAddresses = () => {
        if (!dashboardList) return;

        const saved = JSON.parse(localStorage.getItem('user_addresses') || '[]');

        if (saved.length === 0) {
            dashboardList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <img src="../assets/images/inner-page/empty-search.png" class="img-fluid mb-3" style="max-width: 150px;" alt="">
                    <h4 class="text-content">Quý khách chưa có địa chỉ nào được lưu.</h4>
                    <p class="text-content">Vui lòng thêm địa chỉ mới.</p>
                </div>`;
            return;
        }

        dashboardList.innerHTML = saved.map((data, index) => {
            const typeText = data.type === 'home' ? 'Nhà riêng' : (data.type === 'office' ? 'Văn phòng' : 'Khác');

            return `
                <div class="col-xxl-6 col-xl-6 col-lg-12 col-md-6">
                    <div class="address-box">
                        <div>
                            <div class="label">
                                <label>${typeText}</label>
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

                        <div class="button-group">
                            <button class="btn btn-sm add-button w-100" onclick="editDashboardAddress(${index})"><i data-feather="edit"></i> Chỉnh sửa</button>
                            <button class="btn btn-sm add-button w-100" onclick="deleteDashboardAddress(${index})"><i data-feather="trash-2"></i> Xóa</button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Refresh feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    };

    window.deleteDashboardAddress = (index) => {
        const deleteStep = () => {
            const saved = JSON.parse(localStorage.getItem('user_addresses') || '[]');
            saved.splice(index, 1);
            localStorage.setItem('user_addresses', JSON.stringify(saved));
            renderDashboardAddresses();
            if (window.showToast) window.showToast('Đã xóa địa chỉ thành công!', 'success');
        };

        if (window.showConfirmToast) {
            window.showConfirmToast('Bạn có chắc chắn muốn xóa địa chỉ này không? Thao tác này không thể hoàn tác.', deleteStep);
        } else if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
            deleteStep();
        }
    };

    window.editDashboardAddress = (index) => {
        currentEditIndex = index;
        const saved = JSON.parse(localStorage.getItem('user_addresses') || '[]');
        const data = saved[index];

        if (!data) return;

        // Thay đổi tiêu đề Modal
        const modalTitle = document.getElementById('exampleModalLabel');
        if (modalTitle) modalTitle.textContent = 'Chỉnh sửa địa chỉ';

        // Đổ dữ liệu cơ bản
        const fieldMapping = {
            'fname': data.fname,
            'phone': data.phone,
            'email': data.email,
            'address': data.address,
            'address-type': data['address-type'] || data.type
        };

        Object.keys(fieldMapping).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = fieldMapping[id];
        });

        // Xử lý Cascading Selects (Tỉnh -> Huyện -> Xã)
        const provinceSelect = document.getElementById('province');
        const districtSelect = document.getElementById('district');
        const wardSelect = document.getElementById('ward');

        if (provinceSelect && data.province) {
            provinceSelect.value = data.province;
            provinceSelect.dispatchEvent(new Event('change'));

            // Đợi danh sách Huyện tải xong rồi mới chọn
            setTimeout(() => {
                if (districtSelect && data.district) {
                    districtSelect.value = data.district;
                    districtSelect.dispatchEvent(new Event('change'));

                    // Đợi danh sách Xã tải xong rồi mới chọn
                    setTimeout(() => {
                        if (wardSelect && data.ward) {
                            wardSelect.value = data.ward;
                        }
                    }, 100);
                }
            }, 100);
        }

        // Mở Modal
        if (addressModal) addressModal.show();
    };

    // --- LOGIC LƯU ĐỊA CHỈ MỚI ---
    const saveAddressBtn = document.getElementById('saveAddressBtn');
    const addressModalEl = document.getElementById('add-address');
    const addressModal = addressModalEl ? new bootstrap.Modal(addressModalEl) : null;

    const clearDashboardAddressForm = () => {
        // Trả lại tiêu đề Modal mặc định
        const modalTitle = document.getElementById('exampleModalLabel');
        if (modalTitle) modalTitle.textContent = 'Thêm địa chỉ mới';

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
    };

    const saveDashboardAddress = () => {
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
            if (window.showToast) window.showToast('Vui lòng điền đầy đủ thông tin địa chỉ!', 'warning');
            return;
        }

        const saved = JSON.parse(localStorage.getItem('user_addresses') || '[]');
        
        if (currentEditIndex !== null) {
            // Cập nhật địa chỉ cũ
            saved[currentEditIndex] = data;
            if (window.showToast) window.showToast('Đã cập nhật địa chỉ thành công!', 'success');
        } else {
            // Thêm địa chỉ mới
            saved.push(data);
            if (window.showToast) window.showToast('Đã thêm địa chỉ mới thành công!', 'success');
        }

        localStorage.setItem('user_addresses', JSON.stringify(saved));
        currentEditIndex = null; // Reset sau khi lưu

        // Đóng modal & render lại
        if (addressModalEl) {
            const modalInstance = bootstrap.Modal.getInstance(addressModalEl);
            if (modalInstance) modalInstance.hide();
        }

        renderDashboardAddresses();
    };

    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', saveDashboardAddress);
    }

    if (addressModalEl) {
        addressModalEl.addEventListener('show.bs.modal', (event) => {
            // relatedTarget là nút đã kích hoạt Modal
            // Nếu có relatedTarget (tức là nhấn nút Thêm mới trên giao diện) -> Xóa form
            // Nếu không có (mở bằng code JS) -> Giữ nguyên để điền dữ liệu sửa
            if (event.relatedTarget) {
                currentEditIndex = null;
                clearDashboardAddressForm();
            }
        });
    }

    // Initial render
    renderDashboardAddresses();
});
