/**=====================
    Redux Store JS (Root Store)
    Combines Cart and Wishlist reducers
==========================**/
(function () {
    const CART_STORAGE_KEY = 'thefaded_cart';
    const WISHLIST_STORAGE_KEY = 'thefaded_wishlist';
    const OLD_STORAGE_KEY = 'thefaded_cart_state';

    const loadState = () => {
        try {
            let cartState = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
            let wishlistState = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY));

            if (!cartState && !wishlistState) {
                const oldState = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
                if (oldState) {
                    console.log("Migration dữ liệu từ LocalStorage cũ...");
                    if (Array.isArray(oldState.cart)) {
                        cartState = { items: oldState.cart, totalPrice: oldState.totalPrice || 0, totalItems: oldState.totalItems || 0 };
                    } else {
                        cartState = oldState.cart;
                    }
                    if (Array.isArray(oldState.wishlist)) {
                        wishlistState = { items: oldState.wishlist };
                    } else {
                        wishlistState = oldState.wishlist;
                    }
                }
            }

            if (wishlistState && wishlistState.items) {
                wishlistState.items = wishlistState.items.filter(item => typeof item === 'object');
            }

            return {
                cart: cartState || undefined,
                wishlist: wishlistState || undefined
            };
        } catch (err) {
            console.error("Lỗi tải LocalStorage:", err);
            return undefined;
        }
    };

    if (typeof Redux !== 'undefined' && typeof cartReducer !== 'undefined' && typeof wishlistReducer !== 'undefined') {
        const rootReducer = Redux.combineReducers({
            cart: cartReducer,
            wishlist: wishlistReducer
        });

        const persistedState = loadState();
        const store = Redux.createStore(rootReducer, persistedState);

        // TỐI ƯU HÓA: Chỉ lưu vào LocalStorage khi phần đó thay đổi thực sự
        let currentCart = store.getState().cart;
        let currentWishlist = store.getState().wishlist;

        store.subscribe(() => {
            const previousCart = currentCart;
            const previousWishlist = currentWishlist;
            const newState = store.getState();

            currentCart = newState.cart;
            currentWishlist = newState.wishlist;

            // Nếu Giỏ hàng thay đổi thì mới lưu vào Cart Key
            if (currentCart !== previousCart) {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
            }
            // Nếu Yêu thích thay đổi thì mới lưu vào Wishlist Key
            if (currentWishlist !== previousWishlist) {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(currentWishlist));
            }

            // Dọn dẹp key cũ sau khi chuyển đổi thành công
            if (localStorage.getItem(OLD_STORAGE_KEY)) {
                localStorage.removeItem(OLD_STORAGE_KEY);
            }
        });

        window.cartStore = store;
        window.dispatchAddToCart = (product) => store.dispatch({ type: 'ADD_TO_CART', payload: product });
        window.dispatchRemoveFromCart = (sku) => store.dispatch({
            type: 'REMOVE_FROM_CART',
            payload: sku
        });
        window.dispatchUpdateCartQuantity = (sku, quantity) => store.dispatch({
            type: 'UPDATE_CART_QUANTITY',
            payload: { sku, quantity }
        });
        window.dispatchToggleWishlist = (product) => store.dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
    } else {
        console.error("Lỗi: Redux hoặc các Reducer chưa sẵn sàng!");
    }
})();
