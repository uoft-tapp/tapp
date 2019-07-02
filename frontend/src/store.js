import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";
import thunk from "redux-thunk";

/* eslint-disable */
const configureStore = () => {
    const persistConfig = {
        key: "root",
        storage,
        whitelist: ["auth", "application"]
    };
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    const store = createStore(
        persistedReducer,
        composeWithDevTools(applyMiddleware(thunk))
    );
    const persistor = persistStore(store);

    if (process.env.NODE_ENV !== "production") {
        if (module.hot) {
            module.hot.accept("./rootReducer", () => {
                store.replaceReducer(persistedReducer);
            });
        }
    }

    return { store, persistor };
};
<<<<<<< HEAD
/* eslint-enable */
=======
>>>>>>> refactor(frontend) use apiGET, apiPOST for fetching positions, posting applications

export default configureStore;
