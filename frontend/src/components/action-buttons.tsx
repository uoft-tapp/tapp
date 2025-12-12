import React from "react";
import classNames from "classnames";
import { Dropdown } from "react-bootstrap";

import "./action-buttons.css";

interface PropsWithChildren {
    [attr: string]: any;
    children: React.ReactNode;
}
interface ActionButtonProps extends PropsWithChildren {
    icon?: React.ReactNode | React.FC<{}>;
    onClick?: () => any;
    active?: boolean;
    disabled?: any;
}

interface ActionMenuButtonProps extends ActionButtonProps {
    menu: React.ReactNode;
}

/**
 * Wrap `icon` in a span (if it is non-null). `icon` may be a function,
 * in which case it is rendered as a react element.
 *
 * @param {(React.ReactNode | Function)} icon
 * @returns {React.ReactNode}
 */
function wrapIcon(
    icon: React.FC<{}> | React.ReactNode | null
): React.ReactNode {
    if (!icon) {
        return icon;
    }
    if (typeof icon === "function") {
        const Icon = icon;
        icon = <Icon />;
    }
    return <span className="me-2">{icon}</span>;
}

/**
 * Container to house `ActionButton`s.
 *
 * @export
 * @param {PropsWithChildren} { children }
 * @returns
 */
export function ActionsList({ children }: PropsWithChildren) {
    return (
        <div className="page-actions">
            <Dropdown>{children}</Dropdown>
        </div>
    );
}

/**
 * Label a group of `ActionButton`s
 *
 * @export
 * @param {PropsWithChildren} { children }
 * @returns
 */
export function ActionHeader({ children }: PropsWithChildren) {
    return <Dropdown.Header>{children}</Dropdown.Header>;
}

/**
 * An action button. Behaves like a button but is styled to fit in the `ActionsList`
 * area. Accepts an optional `icon` and an `active` boolean which determines whether
 * the button is permanently highlighted.
 *
 * @export
 * @param {ActionButtonProps} {
 *     icon = null,
 *     children,
 *     active,
 *     ...rest
 * }
 * @returns
 */
export function ActionButton({
    icon = null,
    children,
    active,
    disabled,
    ...rest
}: ActionButtonProps) {
    const iconNode = wrapIcon(icon);
    if (disabled) {
        rest = { ...rest, onClick: () => {} };
    }
    return (
        <Dropdown.Item
            as="button"
            className={classNames({ active, disabled }, "px-2", "p-1")}
            {...rest}
        >
            {iconNode}
            {children}
        </Dropdown.Item>
    );
}

/**
 * Display an action button with a `menu` that can be toggled. `menu` is expected
 * to be a React component. If you want a list of items in the menu, you may wrap
 * them in a `<React.Fragment />` tag. You can (and should) use `ActionButton`s in
 * the menu.
 *
 * @export
 * @param {ActionMenuButtonProps} {
 *     icon = null,
 *     children,
 *     menu = null,
 *     active,
 *     ...rest
 * }
 * @returns
 */
export function ActionMenuButton({
    icon = null,
    children,
    menu = null,
    active,
    disabled = false,
    ...rest
}: ActionMenuButtonProps) {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [menuHeight, setMenuHeight] = React.useState(0);
    const menuSizerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (menuSizerRef == null || menuSizerRef.current == null) {
            return;
        }
        setMenuHeight(menuSizerRef.current.clientHeight);
    }, [children]);

    const iconNode = wrapIcon(icon);

    return (
        <>
            <div
                className={classNames("action-accordion", {
                    dropright: !menuOpen,
                })}
            >
                <button
                    className={classNames(
                        "dropdown-item",
                        {
                            active,
                            disabled,
                        },
                        "ps-2",
                        "p-1"
                    )}
                    {...rest}
                >
                    {iconNode}
                    {children}
                </button>
                {!disabled && (
                    <button
                        className="dropdown-item dropdown-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                    ></button>
                )}
            </div>
            <div
                className={classNames("action-accordion-item-container", {
                    closed: !menuOpen,
                })}
                style={{ height: menuHeight }}
            >
                <div ref={menuSizerRef}>{menu}</div>
            </div>
        </>
    );
}
