import React from "react";
import { Form, Col, FormControlProps } from "react-bootstrap";
import { EditableType } from "../editable-cell";

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
 * @param {Function} setBoundData - setter function
 * @returnType {function(title: string, attr: string, type: string, inputAttrs: object): React.Node}
 */
export function fieldEditorFactory<T>(
    boundData: T,
    setBoundData: (data: T) => any
) {
    /**
     * Create a callback function which updates the specified attribute.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr: keyof T, coerceFunc = (x: any) => x) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
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
    function createFieldEditor(
        title: string,
        attr: keyof T,
        type: EditableType = "text",
        inputAttrs: Partial<FormControlProps> = {}
    ) {
        // Function called on the value before it is passed to setBoundData
        let coerceFunc = (x: any) => x;
        // Function that is called on the value before it is passed to the `<input />`
        // element
        let valueFunc = (x: any) => x || "";

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
 * Place all children side-by-side in a react-bootstrap `Form.Row`. `colStretch`
 * is an optional array that specifies the relative size each column should be.
 *
 * @export
 * @param {*} props
 * @returnType {React.Node}
 */
export function DialogRow({
    children,
    icon = null,
    colStretch = [],
}: {
    children: JSX.Element[] | JSX.Element;
    icon?: JSX.Element | null;
    colStretch?: number[];
}) {
    let iconNode: JSX.Element | null = null;
    if (icon) {
        iconNode = <div className="input-row-icon">{icon}</div>;
    }
    return (
        <Form.Row style={{ alignItems: "baseline" }}>
            {iconNode}
            {React.Children.map(children, (child, index) => {
                return (
                    <Form.Group
                        as={Col}
                        key={index}
                        xs={colStretch[index] || null}
                        className="form-cell"
                    >
                        {child}
                    </Form.Group>
                );
            })}
        </Form.Row>
    );
}
