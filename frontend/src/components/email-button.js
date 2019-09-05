import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";

/**
 * Renders an dropdown email button
 *
 * The data is a list of ids to be emailed by the backend.
 *
 * @export
 * @param {list[object]} props.data
 */
export function EmailButton(props) {
    let { data } = props;

    /**
     * Email to the applicants (using ids) by invoking email service provided by the backend
     */
    const emailHandler = () => {
        console.log("data read from redux: " + data);
        throw new Error("Email function not implemented!");
    };

    /**
     * Email contract to the applicants (using ids) by invoking email service provided by the backend
     */
    const emailContract = () => {
        throw new Error("Email contract not implemented!");
    };

    /**
     * Nag offers to the applicants (using ids) by invoking email service provided by the backend
     */
    const nagOffers = () => {
        throw new Error("Nag offer function not implemented!");
    };

    return (
        <DropdownButton id="dropdown-basic-button" title="Email">
            <Dropdown.Item onClick={() => emailHandler()}>
                Email Blank
            </Dropdown.Item>
            <Dropdown.Item onClick={() => emailContract()}>
                Email Contract
            </Dropdown.Item>
            <Dropdown.Item onClick={() => nagOffers()}>
                Nag Offers
            </Dropdown.Item>
        </DropdownButton>
    );
}

EmailButton.propTypes = {
    data: PropTypes.arrayOf(PropTypes.any)
};
