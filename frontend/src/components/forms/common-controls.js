import React from "react";
import { Form, Col } from "react-bootstrap";

/**
 * A higher-order-function which returns a function that creates editable fields.
 * For example, `fieldEditorFactory(x, setX)("I set foo", "foo", "number")` returns
 * a react `<input />` element that will call `setX({...x, foo: <new foo val>})` whenever
 * the input changes.
 *
 * A `type=` parameter can be passed in; when used, some types are coerced. For example,
 * `type=number` will automatically coerce strings to numbers so `setBoundData` would be
 * passed an object with the specified attribute cast as a number.
 *
 * @export
 * @param {object} boundData - object whose attributes will be (non-destructively) set
 * @param {function(object): void} setBoundData - setter function
 * @returnType {function(title: string, attr: string, type: string, inputAttrs: object): React.Node}
 */
export function fieldEditorFactory(boundData, setBoundData) {
    /**
     * Create a callback function which updates the specified attribute.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr, coerceFunc = (x) => x) {
        return (e) => {
            const newVal = e.target.value || "";
            const newData = { ...boundData, [attr]: coerceFunc(newVal) };
            setBoundData(newData);
        };
    }

    /**
     * Create a bootstrap form component that updates the specified attr
     * of `boundData`
     *
     * @param {string} title - Label text of the form control
     * @param {string} attr - attribute of `boundData` to be updated when this form control changes
     * @param {string?} type - the type of the `<input />` element
     * @param {object?} inputAttrs - additional attributes to be passed to the `<input />` element
     * @returnType {React.Node}
     */
    function createFieldEditor(title, attr, type = "text", inputAttrs = {}) {
        // Function called on the value before it is passed to setBoundData
        let coerceFunc = (x) => x;
        // Function that is called on the value before it is passed to the `<input />`
        // element
        let valueFunc = (x) => x || "";

        // depending on the type we want to coerce values appropriately
        switch (type) {
            case "number":
                coerceFunc = Number;
                break;
            case "date":
                coerceFunc = (x) => new Date(x).toISOString();
                valueFunc = (x) => {
                    try {
                        return new Date(x).toISOString().slice(0, 10);
                    } catch (e) {
                        return "";
                    }
                };
                break;
            default:
                break;
        }

        return (
            <React.Fragment>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                    type={type}
                    value={valueFunc(boundData[attr])}
                    onChange={setAttrFactory(attr, coerceFunc)}
                    {...inputAttrs}
                />
            </React.Fragment>
        );
    }

    return createFieldEditor;
}

/**
 * Place all children side-by-side in a react-boostrap `Form.Row`
 *
 * @export
 * @param {*} props
 * @returnType {React.Node}
 */
export function DialogRow(props) {
    const { children, icon = null } = props;
    let iconNode = null;
    if (icon) {
        iconNode = <div className="input-row-icon">{icon}</div>;
    }
    return (
        <Form.Row style={{ alignItems: "baseline" }}>
            {iconNode}
            {React.Children.map(children, (child, index) => {
                return (
                    <Form.Group as={Col} key={index}>
                        {child}
                    </Form.Group>
                );
            })}
        </Form.Row>
    );
}
