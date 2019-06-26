import React from "react";
import { connect } from "react-redux";
import { openPositionEditModal } from "../actions";

const RowActions = connect(
    null,
    { openPositionEditModal }
)(({ openPositionEditModal, original: { id } }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                fontSize: "18px"
            }}
        >
            <span className="fa fa-envelope-o" style={{ cursor: "pointer" }} />
            <span
                className="fa fa-pencil-square-o"
                style={{ cursor: "pointer" }}
                onClick={() => openPositionEditModal(id)}
            />
        </div>
    );
});

export default RowActions;
