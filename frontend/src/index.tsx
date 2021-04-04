import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import DynamicEntryRouter from "./dynamic-entry-router";
import configureStore from "./store";

const { store, persistor } = configureStore();

// In production, we don't want to wrap the app in a dev frame,
// but we do want to in development
let DevFrame = function (props: any) {
    return <React.Fragment>{props.children}</React.Fragment>;
};
if (process.env.REACT_APP_DEV_FEATURES) {
    // We only want to load the dev frame parts if they are needed,
    // so we use React.lazy to load them on demand.
    const FullDevFrame = React.lazy(async () =>
        import("./views/dev_frame").then((module) => ({
            // Because `React.lazy` expects a default export, we need to fake
            // the default export in the case of a named export.
            default: module.DevFrame,
        }))
    );
    DevFrame = function (props) {
        return (
            <React.Suspense fallback="Loading...">
                <FullDevFrame>{props.children}</FullDevFrame>
            </React.Suspense>
        );
    };
}

const render = (Component: React.ElementType) => {
    return ReactDOM.render(
        <HashRouter>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <DevFrame>
                        <div id="app-body">
                            <Component />
                        </div>
                    </DevFrame>
                </PersistGate>
            </Provider>
        </HashRouter>,
        document.getElementById("root")
    );
};

render(DynamicEntryRouter);

// Hot module reloading
// https://medium.com/@brianhan/hot-reloading-cra-without-eject-b54af352c642

/*eslint-disable */
if ("hot" in module) {
    (module as any).hot.accept("./dynamic-entry-router", () => {
        const NextApp = require("./dynamic-entry-router").default;
        render(NextApp);
    });
}
/*eslint-enable */
