import React from "react";
import { Form } from "react-bootstrap";
import { fieldEditorFactory, DialogRow } from "./common-controls";
import { Posting } from "../../api/defs/types";

export function PostingEditor({
    posting,
    setPosting,
}: {
    posting: Posting;
    setPosting: (position: Posting) => void;
}) {
    const createFieldEditor = fieldEditorFactory(posting, setPosting);

    return (
        <Form>
            <DialogRow>
                {createFieldEditor("Posting Name (e.g. 2019 Fall)", "name")}
            </DialogRow>
            <DialogRow>
                {createFieldEditor("Open Date", "open_date", "date")}
                {createFieldEditor("Close Date", "close_date", "date")}
            </DialogRow>
            <DialogRow>
                {createFieldEditor("Intro Text", "intro_text", "text")}
            </DialogRow>
        </Form>
    );
}
