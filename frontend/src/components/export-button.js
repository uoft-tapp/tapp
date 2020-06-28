import React from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";

/**
 * Export button that offers the ability to export as Spreadsheet/CSV/JSON.
 * `onClick` is called when the button is clicked and supplied with
 * one of "spreadsheet", "csv", or "json".
 *
 * @param {*} props
 * @returns
 */
export function ExportButton(props) {
    const { onClick: clickCallback } = props;

    function onClick(option) {
        if (clickCallback) {
            clickCallback(option);
        }
    }

    return (
        <Dropdown as={ButtonGroup} onSelect={onClick}>
            <Button onClick={() => onClick("spreadsheet")}>Export</Button>
            <Dropdown.Toggle split id="dropdown-split-basic" />
            <Dropdown.Menu>
                <Dropdown.Item eventKey="spreadsheet">
                    As Spreadsheet
                </Dropdown.Item>
                <Dropdown.Item eventKey="csv">As CSV</Dropdown.Item>
                <Dropdown.Item eventKey="json">As JSON</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
ExportButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};
