import React from "react";
import PropTypes from "prop-types";
import { FaEdit } from "react-icons/fa";
import { Modal, Button, Spinner } from "react-bootstrap";
import { formatDate } from "../libs/utils";
import "./edit-field-widgets.css";
import { EditableType } from "./editable-cell";

/**
 * Formats a date/number/text value for display.
 *
 * @template T
 * @param {T} value
 * @param {EditableType} [type="text"]
 * @returns
 */
function formatValue<T>(value: T, type: EditableType = "text") {
    if (value == null) {
        return null;
    }
    if (type === "date") {
        return formatDate("" + value);
    }
    if (type === "number") {
        return +value;
    }
    return "" + value;
}
interface EditFieldProps<T> {
    title: string;
    value: T;
    show?: boolean;
    onHide?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    type?: EditableType;
    formatter?: (value: T) => React.ReactNode;
}

/**
 * A dialog allowing one to edit `props.value`. `onChange` is called
 * when "save" is clicked while editing this value.
 *
 * @param {*} props
 * @returns
 */
export function EditFieldDialog<T extends string | number | boolean>(
    props: EditFieldProps<T>
) {
    const {
        title,
        value,
        show,
        onHide = () => {},
        onChange = () => {},
        type = "text",
    } = props;
    const { formatter = (v) => formatValue(v, type) } = props;
    const [fieldVal, setFieldVal] = React.useState<T>(value);
    const [inProgress, setInProgress] = React.useState(false);
    const formattedValue = formatter(value);
    const formattedFieldVal = formatter(fieldVal);

    function cancelClick() {
        setFieldVal(value);
        onHide();
    }

    async function saveClick() {
        try {
            if (formattedValue !== formattedFieldVal) {
                setInProgress(true);
                // Only call `onChange` if the value has changed
                await onChange(fieldVal, value);
            }
        } finally {
            setInProgress(false);
            onHide();
        }
    }
    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const changeIndicator =
        formattedValue === formattedFieldVal ? null : (
            <div className="field-dialog-change-content">
                Change from
                <div className="field-dialog-formatted-name">
                    {formattedValue}
                </div>
                to
                <div className="field-dialog-formatted-name">
                    {formattedFieldVal}
                </div>
            </div>
        );
    // Most types we pass directly into an input, but others we create custom options for.
    let inputElement = <i>Unknown Input Type</i>;
    if (["text", "number", "date"].includes(type)) {
        inputElement = (
            <input
                type={type}
                value={fieldVal as string | number}
                onChange={(e) => setFieldVal(e.currentTarget.value as T)}
            />
        );
    }
    if (type === "money") {
        inputElement = (
            <input
                type="number"
                step={0.01}
                value={fieldVal as number}
                onChange={(e) => setFieldVal(e.currentTarget.value as T)}
            />
        );
    }
    if (type === "boolean") {
        inputElement = (
            <label htmlFor="edit-dialog-checkbox">
                <input
                    className="mr-2"
                    type="checkbox"
                    id="edit-dialog-checkbox"
                    checked={fieldVal as any}
                    onChange={(e) => setFieldVal(e.currentTarget.checked as T)}
                />
                {fieldVal ? "True/Enabled" : "False/Disabled"}
            </label>
        );
    }
    if (type === "paragraph") {
        inputElement = (
            <textarea
                style={{ width: "100%" }}
                value={fieldVal as string}
                onChange={(e) => setFieldVal(e.currentTarget.value as T)}
            />
        );
    }

    return (
        <Modal show={show} onHide={cancelClick}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {inputElement} {changeIndicator}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={cancelClick} variant="outline-secondary">
                    Cancel
                </Button>
                <Button onClick={saveClick}>{spinner}Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * An edit icon that appears on hover.
 *
 * @param {*} props
 * @returns
 */
export const EditFieldIcon = React.memo(function EditFieldIcon(props: {
    title: string;
    hidden: boolean;
    onClick: (...args: any[]) => any;
}) {
    const { title, hidden, onClick } = props;
    if (hidden) {
        return null;
    }
    return (
        <div
            className="show-on-hover edit-glyph"
            onClick={onClick}
            title={title}
        >
            <FaEdit />
        </div>
    );
});

/**
 * Adds an "edit" icon which shows up when hovering on the wrapped widget.
 * Clicking the "edit" icon opens a dialog that allows one to edit the value.
 * `onChange` is called if "save" is pressed in the edit dialog.
 *
 * @export
 * @param {{children, title, value, onChange: function, editable: boolean, type?: string}} props
 * @returns
 */
export function EditableField<T extends string | number | boolean>(
    props: EditFieldProps<T> & {
        children: React.ReactNode | null;
        editable: boolean;
    }
) {
    const {
        children,
        title,
        value,
        onChange,
        editable = true,
        type = "text",
    } = props;
    const [dialogShow, setDialogShow] = React.useState(false);

    // This is rendered in every cell of a react table, so performance is important.
    // It takes a long time to render the `EditFieldIcon`, but we only need this icon
    // when we hover on a field. Therefore, we start by not showing the icon. When
    // we move our mouse over the icon for the first time, we render the icon (no need to
    // hide it again, since it's the initial render multiplied across all the cells that causes
    // the slowdown). This causes a slight rendering glitch, but the performance is worth it.
    const [renderEditIcon, setRenderEditIcon] = React.useState(false);
    return (
        <div
            className="show-on-hover-wrapper"
            onMouseEnter={() => setRenderEditIcon(true)}
        >
            {children}
            {renderEditIcon && (
                <EditFieldIcon
                    title={title}
                    hidden={!editable}
                    onClick={() => setDialogShow(true)}
                />
            )}
            {editable && (
                <EditFieldDialog
                    title={title}
                    value={value}
                    onChange={onChange}
                    show={dialogShow}
                    onHide={() => setDialogShow(false)}
                    type={type}
                />
            )}
        </div>
    );
}
EditFieldDialog.propTypes = {
    title: PropTypes.node,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
};
