import React from "react";
import { HasId } from "../api/defs/types";
import { formatDate, formatMoney } from "../libs/utils";
import { EditableField } from "./edit-field-widgets";

export type EditableType =
    | "boolean"
    | "paragraph"
    | "checkbox"
    | "date"
    | "email"
    | "file"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "search"
    | "text"
    | "time"
    | "url"
    | "week"
    | "money";

/**
 * A cell that renders editable applicant information. `upsert` is called when the value is edited.
 *
 * @export
 * @template T
 * @param {{
 *     column: any;
 *     upsert: Function;
 *     field: string;
 *     value: string;
 *     row: { original: T };
 *     type?: EditableType;
 *     editable?: boolean;
 * }} {
 *     column,
 *     upsert,
 *     field,
 *     value,
 *     row,
 *     type = "text",
 *     editable = true,
 * }
 * @returns {React.ReactElement}
 */
export function EditableCell<T extends HasId, Field extends keyof T = keyof T>({
    column,
    upsert,
    field,
    value,
    row,
    type = "text",
    editable = true,
}: {
    column: any;
    upsert: (obj: Partial<T> & HasId) => any;
    field: Field;
    value: string | number | null;
    row: { original: T };
    type?: EditableType;
    editable?: boolean;
}): React.ReactElement {
    const title = `Edit ${"" + column.Header}`;

    async function onChange(newVal: string | number | null) {
        const id = (row.original || (row as any)._original).id;
        try {
            return await upsert({ id, [field]: newVal } as any);
        } catch (e) {
            console.warn(e);
        }
    }

    // gets passed down to the input element in the EditFieldDialog
    let inputDialogValue;
    // gets displayed on the field
    let displayValue;

    switch (type) {
        case "date":
            displayValue = formatDate("" + value);
            inputDialogValue = ("" + value).slice(0, 10);
            break;
        case "money":
            displayValue = value != null ? formatMoney("" + value) : "";
            inputDialogValue = value || "";
            break;
        case "boolean":
            displayValue = value ? "True" : "False";
            inputDialogValue = !!value;
            break;
        default:
            displayValue = value || "";
            inputDialogValue = value || "";
            break;
    }

    return (
        <EditableField
            title={title}
            value={inputDialogValue}
            onChange={onChange}
            editable={editable}
            type={type}
        >
            {displayValue}
        </EditableField>
    );
}
