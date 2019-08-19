import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";

export class EmailButton extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(
            PropTypes.shape({
                first_name: PropTypes.string,
                last_name: PropTypes.string,
                email: PropTypes.string
            })
        ).isRequired
    };

    // email applicants
    email = offers => {
        let emails = this.props.data.map(x => x.email);

        var a = document.createElement("a");
        a.href =
            emails.length === 1
                ? "mailto:" + emails[0] // if there is only a single recipient, send normally
                : "mailto:?bcc=" + emails.join(","); // if there are multiple recipients, bcc all
        a.click();
    };

    // email contract link to a single applicant
    emailContract = offers => {
        if (offers.length === 0) {
            this.alert("<b>Error</b>: No offer selected");
            return;
        }
        if (offers.length !== 1) {
            this.alert(
                "<b>Error:</b> Can only email a contract link to a single applicant."
            );
            return;
        }

        let offer = this.getOffersList().get(offers[0]);
        if (!offer.get("link")) {
            // offer does not have a contract link
            this.alert(
                "<b>Error:</b> Offer to " +
                    offer.get("lastName") +
                    ", " +
                    offer.get("firstName") +
                    " does not have an associated contract"
            );
            return;
        }

        var a = document.createElement("a");
        a.href =
            "mailto:" +
            offer.get("email") +
            "?body=Link%20to%20contract:%20" +
            offer.get("link");
        a.click();
    };

    nagOffers(offers) {
        if (offers.length === 0) {
            this.alert("<b>Error</b>: No offer selected");
            return;
        }
        // do nag offer thing
    }

    render() {
        return (
            <DropdownButton id="dropdown-basic-button" title="Email Button">
                <Dropdown.Item onClick={() => this.email(this.props.data)}>Email Blank</Dropdown.Item>
                <Dropdown.Item onClick={() => this.emailContract(this.props.data)}>Email Contract</Dropdown.Item>
                <Dropdown.Item onClick={() => this.nagOffers(this.props.data)}>Nag Offers</Dropdown.Item>
            </DropdownButton>
        );
    }
}
