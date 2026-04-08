/**=====================
    Wishlist Reducer JS
==========================**/
const wishlistInitialState = {
    items: [] // { id, name, price, image }
};

function wishlistReducer(state = wishlistInitialState, action) {
    switch (action.type) {
        case 'TOGGLE_WISHLIST': {
            const product = action.payload;
            const exists = state.items.find(item => item.id === product.id);
            
            let newItems;
            if (exists) {
                // Nếu đã có thì xóa khỏi danh sách
                newItems = state.items.filter(item => item.id !== product.id);
            } else {
                // Nếu chưa có thì thêm đầy đủ thông tin sản phẩm
                newItems = [...state.items, product];
            }

            return {
                ...state,
                items: newItems
            };
        }

        case 'REMOVE_FROM_WISHLIST': {
            const productId = action.payload;
            return {
                ...state,
                items: state.items.filter(item => item.id != productId)
            };
        }

        default:
            return state;
    }
}
