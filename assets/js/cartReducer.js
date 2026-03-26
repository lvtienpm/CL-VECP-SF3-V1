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
            const existingItem = state.items.find(item => item.id === product.id);
            
            let newItems;
            if (existingItem) {
                newItems = state.items.map(item =>
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            } else {
                newItems = [...state.items, { ...product, quantity: 1 }];
            }

            return {
                ...state,
                items: newItems,
                totalPrice: state.totalPrice + product.price,
                totalItems: state.totalItems + 1
            };
        }

        case 'REMOVE_FROM_CART': {
            const productId = action.payload;
            const itemToRemove = state.items.find(item => item.id === productId);
            if (!itemToRemove) return state;

            const newItems = state.items.filter(item => item.id !== productId);
            return {
                ...state,
                items: newItems,
                totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity),
                totalItems: state.totalItems - itemToRemove.quantity
            };
        }

        case 'UPDATE_CART_QUANTITY': {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (!item || quantity < 1) return state;

            const diff = quantity - item.quantity;
            const newItems = state.items.map(item =>
                item.id === id ? { ...item, quantity: quantity } : item
            );

            return {
                ...state,
                items: newItems,
                totalPrice: state.totalPrice + (item.price * diff),
                totalItems: state.totalItems + diff
            };
        }

        default:
            return state;
    }
}
