import React from "react";
import classNames from "classnames";

interface ContentAreaProps {
    children: React.ReactChild;
    className?: string;
}

/**
 * Wrap the content area of a page with the appropriate classes.
 *
 * @export
 * @param {ContentAreaProps} {
 *     children,
 *     className,
 *     ...rest
 * }
 * @returns
 */
export function ContentArea({
    children,
    className,
    ...rest
}: ContentAreaProps) {
    return (
        <div className={classNames("page-content", className)} {...rest}>
            {children}
        </div>
    );
}
