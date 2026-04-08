/**=====================
    Address API JS (Provinces Open API)
    Handles cascading dropdowns for Province -> District -> Ward
    Supports multiple modal instances.
==========================**/
document.addEventListener('DOMContentLoaded', () => {
    let addressData = [];

    /**
     * Initializes cascading logic for a set of dropdowns.
     */
    const initAddressSelection = (provinceId, districtId, wardId) => {
        const provinceSelect = document.getElementById(provinceId);
        const districtSelect = document.getElementById(districtId);
        const wardSelect = document.getElementById(wardId);

        if (!provinceSelect || !districtSelect || !wardSelect) return;

        // Function to populate Province dropdown
        const populateProvinces = () => {
            provinceSelect.innerHTML = '<option selected disabled>Chọn Tỉnh/Thành phố</option>';
            addressData.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                provinceSelect.appendChild(option);
            });
        };

        // Handle Province Change
        provinceSelect.addEventListener('change', () => {
            const provinceCode = parseInt(provinceSelect.value);
            const province = addressData.find(p => p.code === provinceCode);

            districtSelect.innerHTML = '<option selected disabled>Chọn Quận/Huyện</option>';
            districtSelect.disabled = false;

            wardSelect.innerHTML = '<option selected disabled>Chọn Phường/Xã</option>';
            wardSelect.disabled = true;

            if (province && province.districts) {
                province.districts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.code;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
            }
        });

        // Handle District Change
        districtSelect.addEventListener('change', () => {
            const provinceCode = parseInt(provinceSelect.value);
            const districtCode = parseInt(districtSelect.value);

            const province = addressData.find(p => p.code === provinceCode);
            if (!province) return;

            const district = province.districts.find(d => d.code === districtCode);

            wardSelect.innerHTML = '<option selected disabled>Chọn Phường/Xã</option>';
            wardSelect.disabled = false;

            if (district && district.wards) {
                district.wards.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.code;
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
            }
        });

        // If data is already loaded, populate immediately
        if (addressData.length > 0) {
            populateProvinces();
        }

        return populateProvinces; 
    };

    // Fetch all data with depth=3 (Provinces -> Districts -> Wards) using Axios
    axios.get('https://provinces.open-api.vn/api/?depth=3')
        .then(response => {
            addressData = response.data;

            // Initialize for Add Address Modal
            const populateAdd = initAddressSelection('province', 'district', 'ward');
            if (populateAdd) populateAdd();

            // Initialize for Edit Profile Modal
            const populateEdit = initAddressSelection('province-edit', 'district-edit', 'ward-edit');
            if (populateEdit) populateEdit();
        })
        .catch(error => {
            console.error('Error fetching address data:', error);
            ['province', 'province-edit'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '<option selected disabled>Lỗi khi tải dữ liệu</option>';
            });
        });
});
