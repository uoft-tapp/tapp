import React from "react";
import { Button, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { readFile } from "../libs/fileManager";

export class ImportButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            dialogContents: "",
            dialogOpen: false
        };
    }

    /* assume frontend data is up to date
     *  upload the assignment object
     *  if there's an part of inconsistency between the imported data and frontend data
     *  then apiGET that part of data and re-verify it
     */

    handleClose = () => {
        this.setState({ dialogOpen: false });
    };

    uploadDataToBackend = () => {
        // TODO
    };

    importFile = () => {
        let loadDataFunc = data => {
            // passed in data is of json format
            console.log(data);

            /* TODO: 
            * const diffs = getDiffs(data, ...dataFromBackend);
            * if (diffs) {
            *     this.setState({ data: data, dialogContents: diffs, dialogOpen: true})
            * } else {
            *     uploadDataToBackend(data)
            } */
        };

        readFile(document.getElementById("file-input"), loadDataFunc);
    };

    render() {
        return (
            <div>
                <DropdownButton id="dropdown-basic-button" title="Import">
                    <Dropdown.Item
                        onClick={() =>
                            document.getElementById("file-input").click()
                        }
                    >
                        Import From File
                    </Dropdown.Item>
                    <input
                        id="file-input"
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        onChange={() => this.importFile()}
                    />
                </DropdownButton>

                <Modal show={this.state.dialogOpen} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            The following will be overwritten
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>{this.state.dialogContents}</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => this.uploadDataToBackend()}
                        >
                            Proceed
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
