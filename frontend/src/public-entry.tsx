import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";

/**
 * This is the entry point for public routes. Most components are not loaded
 * in this route.
 *
 * @export
 * @returns
 */
export default function ConnectedApp() {
    return (
        <React.Fragment>
            <div>This is the public route.</div>
        </React.Fragment>
    );
}
