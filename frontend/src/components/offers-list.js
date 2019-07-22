import React from "react";
import PropTypes from "prop-types";

export class OffersList extends React.Component {
    static propTypes = {
        offers: PropTypes.arrayOf(
            PropTypes.shape({
                offers_id: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { offers } = this.props;
        let offersList = <div>No offers...</div>;
        if (offersList.length > 0) {
            offersList = (
                <ul>
                    {offers.map(offers => (
                        <li key={offers.id}>Offer ID#: {offers.offers_id}</li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available offers</h3>
                {offersList}
            </div>
        );
    }
}
