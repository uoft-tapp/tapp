import React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

export class ImportButton extends React.Component {
    isJsonFile = file => {
        let type = file.type;
        if (type !== "") {
            return type === "application/json";
        } else {
            let name = file.name.split(".");
            return name[name.length - 1] === "json";
        }
    };

    uploadFile = () => {
        let fileInput = document.getElementById("file-input");
        let files = fileInput.files;

        if (files.length > 0) {
            if (this.isJsonFile(files[0])) {
                if (
                    window.confirm(
                        `Do you want to import ${
                            files[0].name
                        } into the database?`
                    )
                ) {
                    let importFunc = data => {
                        try {
                            data = JSON.parse(data);
                            // TODO: import data
                        } catch (e) {
                            throw new Error(
                                `Unsupported data format ${e.toString()}`
                            );
                        }
                    };

                    let reader = new FileReader();
                    reader.onload = event => importFunc(event.target.result);
                    reader.readAsText(files[0]);
                }
                fileInput.value = "";
            } else {
                throw new Error("Error: The file you selected is not a CSV.");
            }
        }
    };

    render() {
        return (
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
                    onChange={() => this.uploadFile()}
                />
            </DropdownButton>
        );
    }
}
