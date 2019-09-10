import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { readFile } from "../libs/fileManager";

/**
 * Renders an dropdown import button component that imports data from file.
 *
 * The data should be in json format.
 *
 * @export
 * @param {function(list[object])} props.uploadFunc
 */
export function ImportButton(props) {
    let { uploadFunc } = props;
    const [data, setData] = useState(null); // eslint-disable-line
    const [dialogContents, setDialogContents] = useState(""); // eslint-disable-line
    const [dialogOpen, setDialogOpen] = useState(false);

    /**
     * closes the dialog by setting dialogOpen to false
     */
    function handleClose() {
        setDialogOpen(false);
    }

    /**
     * Read the json file content and import the data in it to the backend.
     *
     * Implementation details discussed in TAPP meeting on Aug 29:
     *   - assume frontend data is up to date
     *   - upload the assignment object
     *   - if there's an part of inconsistency between the imported data and frontend data
     *   then apiGET that part of data and re-verify it
     *
     * @param {event} e
     */
    function importFile(e) {
        let importClicked = data => {
            // passed in data is of json format
            console.log(data);
            throw new Error("Not implemented!");

            /* TODO: 
            * const diffs = getDiffs(data, ...dataFromBackend);
            * if (diffs) {
            *     setData(data)
            *     setDialogContents(diffs);
            *     setDialogOpen(true);
            * } else {
            *     uploadFunc(data)
            } */
        };

        readFile(e.target, importClicked);
    }

    return (
        <div>
            <DropdownButton id="dropdown-basic-button" title="Import">
                <input
                    id="raised-button-file"
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={importFile}
                />
                <label htmlFor="raised-button-file">
                    <Dropdown.Item>Import From File</Dropdown.Item>
                </label>
            </DropdownButton>

            <Modal show={dialogOpen} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>The following will be overwritten</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>{dialogContents}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => uploadFunc(data)}>
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

ImportButton.propTypes = {
    uploadFunc: PropTypes.func
};
