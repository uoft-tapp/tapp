import React from "react";
import FileSaver from "file-saver";
import { matchingDataSelector, updatedSelector } from "../actions";
import { useSelector } from "react-redux";
import { setUpdated } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";
import { Button } from "react-bootstrap";

export function ExportMatchingDataButton() {
    const matchingData = useSelector(matchingDataSelector);
    const updated = useSelector(updatedSelector);
    const dispatch = useThunkDispatch();

    function onClick() {
        const blob = new Blob([JSON.stringify(matchingData, null, 4)], {
            type: "text/plain;charset=utf-8",
        });
        FileSaver.saveAs(
            blob,
            `matching_data-${new Date().toLocaleDateString("en-CA", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })}.json`
        );

        dispatch(setUpdated(false));
    }

    return (
        <Button variant="outline-primary" size="sm" onClick={onClick}>
            {updated && <span className="change-icon">●</span>}
            Export Data
        </Button>
    );
}
