import { createStore, applyMiddleware } from "redux"
import createSagaMiddleware from "redux-saga"
import { composeWithDevTools } from "redux-devtools-extension"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import rootReducer from "./rootReducer"
import rootSaga from "./rootSaga"

const configureStore = () => {
    const persistConfig = {
        key: "root",
        storage,
        whitelist: ["auth"]
    }
    const persistedReducer = persistReducer(persistConfig, rootReducer)
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(
        persistedReducer,
        composeWithDevTools(applyMiddleware(sagaMiddleware))
    )
    const persistor = persistStore(store)
    sagaMiddleware.run(rootSaga)

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
