/**=====================
    Cart Reducer JS
==========================**/
const cartInitialState = {
    items: [],
    totalPrice: 0,
    totalItems: 0
};

function cartReducer(state = cartInitialState, action) {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const product = action.payload;
            // Nhận diện sản phẩm DUY NHẤT bằng SKU
            const existingItem = state.items.find(item => item.sku === product.sku);
            
            let newItems;
            const addQty = product.quantity || 1;

            if (existingItem) {
                newItems = state.items.map(item =>
                    (item.sku === product.sku)
                    ? { ...item, quantity: item.quantity + addQty } 
                    : item
                );
            } else {
                newItems = [...state.items, { ...product, quantity: addQty }];
            }

            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                ...state,
                items: newItems,
                totalPrice: totalPrice,
                totalItems: totalItems
            };
        }

        case 'REMOVE_FROM_CART': {
            // Xóa dựa trên SKU chính xác
            const skuToRemove = action.payload;
            const newItems = state.items.filter(item => item.sku !== skuToRemove);

            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                ...state,
                items: newItems,
                totalPrice: totalPrice,
                totalItems: totalItems
            };
        }

        case 'UPDATE_CART_QUANTITY': {
            const { sku, quantity } = action.payload;
            
            const newItems = state.items.map(item => 
                (item.sku === sku) ? { ...item, quantity: quantity } : item
            );

            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                ...state,
                items: newItems,
                totalPrice: totalPrice,
                totalItems: totalItems
            };
        }

        case 'CLEAR_CART': {
            return cartInitialState;
        }

        default:
            return state;
    }
}
