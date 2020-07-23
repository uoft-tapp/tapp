import React from "react";
import PropTypes from "prop-types";
import { FaEdit } from "react-icons/fa";
import { Modal, Button, Spinner } from "react-bootstrap";
import { formatDate } from "../libs/utils";
import "./edit-field-widgets.css";

/**
 * A dialog allowing one to edit `props.value`. `onChagne` is called
 * when "save" is clicked while editing this value.
 *
 * @param {*} props
 * @returns
 */
function EditFieldDialog(props) {
    const { title, value, show, onHide, onChange, type } = props;
    const [fieldVal, setFieldVal] = React.useState(value);
    const [inProgress, setInProgress] = React.useState(false);
    const isDate = type === "date";

    function cancelClick() {
        setFieldVal(value);
        onHide();
    }

    function saveClick() {
        async function doSave() {
            // eslint-disable-next-line
            if (fieldVal != value) {
                setInProgress(true);
                // Only call `onChange` if the value has changed
                await onChange(fieldVal, value);
            }
        }
        doSave().finally(() => {
            //onHide();
            setInProgress(false);
        });
    }
    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const changeIndicator =
        // eslint-disable-next-line
        fieldVal == value ? null : (
            <span>
                Change from{" "}
                <span className="field-dialog-formatted-name">
                    {isDate ? formatDate(value) : value}
                </span>{" "}
                to{" "}
                <span className="field-dialog-formatted-name">
                    {isDate ? formatDate(fieldVal) : fieldVal}
                </span>
            </span>
        );

    return (
        <Modal show={show} onHide={cancelClick}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type={type}
                    value={fieldVal}
                    onChange={(e) => setFieldVal(e.currentTarget.value)}
                />{" "}
                {changeIndicator}
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
function EditFieldIcon(props) {
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
}

/**
 * Adds an "edit" icon which shows up when hovering on the wrapped widget.
 * Clicking the "edit" icon opens a dialog that allows one to edit the value.
 * `onChange` is called if "save" is pressed in the edit dialog.
 *
 * @export
 * @param {{children, title, value, onChange: function, editable: boolean}} props
 * @returns
 */
export function EditableField(props) {
    const {
        children,
        title,
        value,
        onChange,
        editable = true,
        type = "text",
    } = props;
    const [dialogShow, setDialogShow] = React.useState(false);
    return (
        <div className="show-on-hover-wrapper">
            {children}
            <EditFieldIcon
                title={title}
                hidden={!editable}
                onClick={() => setDialogShow(true)}
            />
            <EditFieldDialog
                title={title}
                value={value}
                onChange={onChange}
                show={dialogShow}
                onHide={() => setDialogShow(false)}
                type={type}
            />
        </div>
    );
}
EditFieldDialog.propTypes = {
    title: PropTypes.node,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
};
