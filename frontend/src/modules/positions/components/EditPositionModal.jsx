import React from "react"
import { connect } from "react-redux"
import { closeEditPositionModal, savePositions, deletePosition } from "../actions"
import moment from "moment"
import { Modal, Button } from "react-bootstrap"

const validNumber = val => (val && isNaN(val) ? "Not a valid number" : false)
const validDate = val =>
    val && moment(val, "YYYY/MM/DD", true).isValid() ? false : "Not a valid date"

const editableFields = [
    { label: "Current Enrolment", value: "current_enrolment", validate: [validNumber] },
    { label: "Enrolment Cap", value: "cap_enrolment", validate: [validNumber] },
    { label: "Waitlisted", value: "num_waitlisted", validate: [validNumber] },
    { label: "Openings", value: "openings", validate: [validNumber] },
    { label: "Hours", value: "hours", validate: [validNumber] },
    { label: "Start Date", value: "start_date", validate: [validDate] },
    { label: "End Date", value: "end_date", validate: [validDate] }
]

class EditPositionModal extends React.Component {
    state = editableFields.reduce((acc, cur) => ({ ...acc, [cur.value]: "" }), {})
    componentDidMount() {
        this.setState(
            editableFields.reduce(
                (acc, cur) => ({ ...acc, [cur.value]: this.props.position[cur.value] || "" }),
                {}
            )
        )
    }
    handleChange = prop => event => this.setState({ [prop]: event.target.value })
    handleSave = () => {
        this.props.savePositions({
            positionId: this.props.position.id,
            newValues: editableFields.reduce(
                (acc, cur) => ({
                    ...acc,
                    [cur.value]: isNaN(this.state[cur.value])
                        ? this.state[cur.value]
                        : Number(this.state[cur.value])
                }),
                {}
            )
        })
        this.props.handleHide()
    }
    handleDelete = () => {
        this.props.deletePosition({ positionId: this.props.position.id })
        this.props.handleHide()
    }
    getInvalid = () =>
        editableFields.reduce((acc, cur) => {
            if (acc) {
                return acc
            }
            const errorMessage = cur.validate.reduce(
                (running, validator) => running || validator(this.state[cur.value]),
                false
            )
            return errorMessage ? `${cur.label}: ${errorMessage}` : acc
        }, false)
    getDisabled = () =>
        editableFields.reduce(
            (acc, cur) => acc && this.state[cur.value] === this.props.position[cur.value],
            true
        )
    render() {
        const { position, show, handleHide } = this.props
        const disabled = this.getDisabled()
        const invalid = this.getInvalid()
        return (
            <Modal show={show} onHide={handleHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit {position.course_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: "left" }}>
                    {editableFields.map(({ label, value }) => (
                        <div key={value} style={{ marginBottom: "8px" }}>
                            <label style={{ width: "45%", textAlign: "right", marginRight: "5%" }}>
                                {label}
                            </label>
                            <input value={this.state[value]} onChange={this.handleChange(value)} />
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={this.handleDelete} style={{ float: "left" }}>
                        Delete
                    </Button>
                    <Button onClick={handleHide}>Cancel</Button>
                    <Button
                        bsStyle="primary"
                        disabled={disabled || !!invalid}
                        onClick={this.handleSave}
                    >
                        {invalid || "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

const getPosition = (list, id) => {
    if (id === null) {
        return {}
    } else {
        return list.find(pos => pos.id === id)
    }
}

export default connect(
    ({ positions }) => ({
        editPosition: positions.editPosition,
        show: positions.editPosition !== null,
        position: getPosition(positions.list, positions.editPosition)
    }),
    { handleHide: closeEditPositionModal, savePositions, deletePosition }
)(({ editPosition, ...rest }) => <EditPositionModal key={editPosition} {...rest} />)
