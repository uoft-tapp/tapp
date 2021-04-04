import React, { Suspense } from "react";
import { useRouteMatch } from "react-router";

const MainEntry = React.lazy(() => import("./main-entry"));
const PublicEntry = React.lazy(() => import("./public-entry"));

/**
 * Dynamically load the correct entry component based on the route string.
 *
 * @export
 * @returns
 */
export default function DynamicEntryRouter() {
    const publicRoute = useRouteMatch("/public");
    let content = <MainEntry />;
    if (publicRoute) {
        content = <PublicEntry />;
    }

    return (
        <React.Fragment>
            <Suspense fallback="Loading...">{content}</Suspense>
        </React.Fragment>
    );
}
