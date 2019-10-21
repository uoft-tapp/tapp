import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { DevFrame as _DevFrame } from "./views/dev_frame";
import "./styles/sass/main.scss";
import App from "./App";
import configureStore from "./store";

const { store, persistor } = configureStore();

// In production, we don't want to wrap the app in a dev frame,
// but we do want to in development
let DevFrame = function(props) {
    return <React.Fragment>{props.children}</React.Fragment>;
};
/* eslint-disable */
if (process.env.REACT_APP_DEV_FEATURES) {
    DevFrame = _DevFrame;
}
/* eslint-enable */

const render = Component => {
    return ReactDOM.render(
        <HashRouter>
            <Provider store={store}>
                <DevFrame>
                    <PersistGate persistor={persistor}>
                        <Component />
                    </PersistGate>
                </DevFrame>
            </Provider>
        </HashRouter>,
        document.getElementById("root")
    );
};

render(App);

// Hot module reloading
// https://medium.com/@brianhan/hot-reloading-cra-without-eject-b54af352c642

/*eslint-disable */
if (module.hot) {
    module.hot.accept("./App", () => {
        const NextApp = require("./App").default;
        render(NextApp);
    });
}
/*eslint-enable */
