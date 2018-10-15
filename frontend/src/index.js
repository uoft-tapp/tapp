import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { PersistGate } from "redux-persist/integration/react"
import "./styles/sass/main.scss"
import App from "./App"
import configureStore from "./store"

const { store, persistor } = configureStore()

const render = Component => {
    return ReactDOM.render(
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <BrowserRouter>
                    <Component />
                </BrowserRouter>
            </PersistGate>
        </Provider>,
        document.getElementById("root")
    )
}

render(App)

// Hot module reloading
// https://medium.com/@brianhan/hot-reloading-cra-without-eject-b54af352c642
if (module.hot) {
    module.hot.accept("./App", () => {
        const NextApp = require("./App").default
        render(NextApp)
    })
}
