import React from "react";
import { formatDate } from "../libs/utils";
import { EditableField } from "./edit-field-widgets";

export type EditableType =
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";

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
export function EditableCell<T>({
    column,
    upsert,
    field,
    value,
    row,
    type = "text",
    editable = true,
}: {
    column: any;
    upsert: Function;
    field: string;
    value: string;
    row: { original: T };
    type?: EditableType;
    editable?: boolean;
}): React.ReactElement {
    const title = `Edit ${"" + column.Header}`;
    const isDate = type === "date";

    async function onChange(newVal: string | number | null) {
        const id = (row.original || (row as any)._original).id;
        return await upsert({ id, [field]: newVal });
    }

    const formattedValue = isDate ? (value || "").slice(0, 10) : value || "";

    return (
        <EditableField
            title={title}
            value={formattedValue}
            onChange={onChange}
            editable={editable}
            type={type}
        >
            {isDate ? formatDate(value) : value}
        </EditableField>
    );
}
