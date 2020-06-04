import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { docApiPropTypes } from "../../api/defs/doc-generation";
import { fieldEditorFactory, DialogRow } from "./common-controls";
/**
 * Edit a session
 *
 * @export
 * @param {{session: object, setSession: function}} props
 * @returns
 */
export function SessionEditor(props) {
    const { session, setSession } = props;

    const createFieldEditor = fieldEditorFactory(session, setSession);

    return (
        <Form>
            <DialogRow>
                {createFieldEditor("Session Name (e.g. 2019 Fall)", "name")}
                {createFieldEditor("Start Date", "start_date", "date")}
                {createFieldEditor("End Date", "end_date", "date")}
            </DialogRow>
            <DialogRow>
                {createFieldEditor(
                    "Rate 1 (pre-January rate)",
                    "rate1",
                    "number",
                    {
                        step: "0.01",
                        min: 0,
                    }
                )}
                {createFieldEditor(
                    "Rate 2 (post-January rate)",
                    "rate2",
                    "number",
                    {
                        step: "0.01",
                        min: 0,
                    }
                )}
            </DialogRow>
        </Form>
    );
}
SessionEditor.propTypes = {
    session: docApiPropTypes.session.isRequired,
    setSession: PropTypes.func.isRequired,
};
