import React from "react";
import PropTypes from "prop-types";

export class PositionsList extends React.Component {
    static propTypes = {
        positions: PropTypes.arrayOf(
            PropTypes.shape({
                position_code: PropTypes.string,
                position_title: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { positions } = this.props;
        let positionsList = <div>No Positions...</div>;
        if (positions.length > 0) {
            positionsList = (
                <ul>
                    {positions.map(position => (
                        <li key={position.id}>
                            {position.position_code} {position.position_title}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available Positions</h3>
                {positionsList}
            </div>
        );
    }
}
