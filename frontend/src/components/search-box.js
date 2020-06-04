import React from "react";
import PropTypes from "prop-types";
import "./components.css";

export class SearchBox extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(
            PropTypes.shape({
                first_name: PropTypes.string,
                last_name: PropTypes.string,
            })
        ).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            filters: "",
            data: this.props.data,
        };
    }

    filter(event) {
        let input = event.target.value;
        let newData = this.props.data.filter((x) => {
            for (let key in x) {
                let v = x[key] && x[key].toString().toLowerCase();
                if (v && v.indexOf(input.toLowerCase()) !== -1) {
                    return true;
                }
            }
            return false;
        });
        this.setState({
            filters: input,
            data: newData,
        });
    }

    componentWillReceiveProps(nextProps) {
        //constructor is only invoked when the component is first created. if data change, need to update on componentWillReceiveProps
        if (nextProps.data !== this.props.data) {
            this.setState({ data: nextProps.data });
        }
    }

    render() {
        let applicants = this.state.data;
        let applicantsList = <div>No Applicants...</div>;
        if (applicants.length > 0) {
            applicantsList = (
                <ul>
                    {applicants.map((applicant) => (
                        <li key={applicant.id}>
                            {applicant.first_name} {applicant.last_name}
                        </li>
                    ))}
                </ul>
            );
        }

        return (
            <div className="search-box">
                <input
                    className="search"
                    type="text"
                    name=""
                    value={this.state.filters}
                    placeholder="Search here"
                    onChange={this.filter.bind(this)}
                />
                {applicantsList}
            </div>
        );
    }
}
