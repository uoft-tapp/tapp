import React from "react";
import PropTypes from "prop-types";

export class OffersList extends React.Component {
    static propTypes = {
        offers: PropTypes.arrayOf(
            PropTypes.shape({
                first_name: PropTypes.string,
                assignment_id: PropTypes.integer
            })
        ).isRequired
    };
    render() {
        const { offers } = this.props;
        let offersList = <div>No Offers...</div>;
        if (offers.length > 0) {
            offersList = (
                <ul>
                    {offers.map(offer => (
                        <li key={offer.id}>
                            Offer ID#: {offer.id} Belongs to Assignment ID#{" "}
                            {offer.assignment_id}, First Name:{" "}
                            {offer.first_name}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>All Offers</h3>
                {offersList}
            </div>
        );
    }
}
