import React from "react";
import PropTypes from "prop-types";
import { Dropdown, FormControl } from "react-bootstrap";
import { HasId } from "../api/defs/types";
/**
 * react-bootstrap dropdown menu that is filterable. Expects
 * children which are `Dropdown.Item` and contain just text
 * as content. To use, set as the `as=` attribute on a `Dropdown.Menu`.
 *
 * Notes: Because of the way react-bootstrap works, this
 * component must be wrapped in a `React.forwardRef`.
 */
const FilterableMenuContents = React.forwardRef(
    (
        props: {
            children: React.ReactNode[];
            style?: React.StyleHTMLAttributes<{}>;
            className: string;
            clearFilter: boolean;
        },
        ref: React.Ref<HTMLDivElement>
    ) => {
        const { children, style, className, clearFilter } = props;
        const [filter, setFilter] = React.useState("");
        // If the `clearFilter` flag is set, make sure we start
        // with an empty filter. This is used to clear the filter when the
        // widget is hidden.
        React.useEffect(() => {
            if (clearFilter) {
                setFilter("");
            }
        }, [clearFilter]);
        function onChange(e: React.ChangeEvent<HTMLInputElement>) {
            setFilter(e.currentTarget.value);
        }
        // Filter the child `Dropdown.Item` items
        const sessionList = React.Children.toArray(children).filter((child) => {
            let ret = false;
            if (typeof child === "string") {
                ret = child.includes(filter.trim());
            } else if (typeof child === "number") {
                ret = ("" + child).includes(filter.trim());
            } else {
                ret = (child as any).props.children
                    .toLowerCase()
                    .includes(filter.trim());
            }
            return !filter.trim() || ret;
        });
        // The sessions list could be empty for two reasons: there are
        // no sessions, or we've filtered them all away. Display an
        // appropriate message in either case
        const emptyListMessage =
            children.length === 0
                ? "No Available Sessions"
                : "No Matching Sessions";
        return (
            <div style={style} className={className} ref={ref}>
                <FormControl
                    autoFocus
                    className="mx-3 my-2 w-auto"
                    placeholder="Type to filter..."
                    title="Filter sessions"
                    onChange={onChange}
                    value={filter}
                    tabIndex={0}
                />
                <ul className="list-unstyled my-0">
                    {sessionList.length > 0 ? (
                        sessionList
                    ) : (
                        <li className="dropdown-item text-muted">
                            {emptyListMessage}
                        </li>
                    )}
                </ul>
            </div>
        );
    }
);
/**
 * A menu that nests inside a `Dropdown`. Pass in a list
 * `items` which are objects of the form `{id: ..., name: ...}`.
 * When `onSelect` is triggered, it will be passed the index of the clicked-upon
 * item in the `items` array.
 */
export function FilterableMenu({
    items,
    activeItemId,
    clearFilter,
}: {
    items: (HasId & { name: string })[];
    activeItemId: number | null;
    clearFilter: boolean;
}) {
    return (
        <Dropdown.Menu as={FilterableMenuContents} clearFilter={clearFilter}>
            {items.map((s, index) => (
                <Dropdown.Item
                    key={s.id}
                    // `eventKey` must be a string. If it is a number, 0 is coerced to null
                    eventKey={"" + index}
                    active={activeItemId === s.id}
                >
                    {s.name}
                </Dropdown.Item>
            ))}
        </Dropdown.Menu>
    );
}
FilterableMenu.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.any.isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    activeItemId: PropTypes.any,
    clearFilter: PropTypes.bool,
};
