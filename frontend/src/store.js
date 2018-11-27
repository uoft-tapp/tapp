import { createStore, applyMiddleware } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import rootReducer from "./rootReducer"
import thunk from "redux-thunk"

const configureStore = () => {
    const persistConfig = {
        key: "root",
        storage,
        whitelist: ["auth"]
    }
    const persistedReducer = persistReducer(persistConfig, rootReducer)
    const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)))
    const persistor = persistStore(store)

    if (process.env.NODE_ENV !== "production") {
        if (module.hot) {
            module.hot.accept("./rootReducer", () => {
                store.replaceReducer(persistedReducer)
            })
        }
    }

    return { store, persistor }
}

export default configureStore
