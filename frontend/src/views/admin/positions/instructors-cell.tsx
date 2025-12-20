import React from "react";
import { useSelector } from "react-redux";
import { upsertPosition, instructorsSelector } from "../../../api/actions";
import { Badge, Modal, Button, Spinner } from "react-bootstrap";
import { EditFieldIcon } from "../../../components/edit-field-widgets";
import { Typeahead } from "react-bootstrap-typeahead";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { Instructor, Position } from "../../../api/defs/types";

/**
 * Turn a list of instructor objects into a hash string for comparison as to whether
 * an instructor list has changed.
 *
 * @param {*} instructors
 * @returns
 */
export function hashInstructorList(instructors: Instructor[]) {
    return instructors
        .map((i) => `${i.last_name}, ${i.first_name}`)
        .sort()
        .join(";");
}

/**
 * A dialog allowing one to edit instructors. `onChange` is called
 * when "save" is clicked while editing this value.
 *
 * @param {*} props
 * @returns
 */
function EditInstructorsDialog({
    position,
    show,
    onHide,
    onChange,
}: {
    position: Position;
    show: boolean;
    onHide: Function;
    onChange: Function;
}) {
    const value = position.instructors;
    const allInstructors = useSelector(instructorsSelector);
    const [fieldVal, setFieldVal] = React.useState(value);
    const [inProgress, setInProgress] = React.useState(false);

    function cancelClick() {
        setFieldVal(value);
        onHide();
    }

    function saveClick() {
        async function doSave() {
            if (hashInstructorList(fieldVal) !== hashInstructorList(value)) {
                setInProgress(true);
                // Only call `onChange` if the value has changed
                await onChange(fieldVal, value);
            }
        }
        doSave().finally(() => {
            //onHide();
            setInProgress(false);
        });
    }
    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    const changeIndicator =
        // eslint-disable-next-line
        hashInstructorList(fieldVal) == hashInstructorList(value) ? null : (
            <span>
                Change from{" "}
                <span className="field-dialog-formatted-name">
                    {value
                        .map(
                            (instructor) =>
                                `${instructor.first_name} ${instructor.last_name}`
                        )
                        .join(", ")}
                </span>{" "}
                to{" "}
                <span className="field-dialog-formatted-name">
                    {fieldVal
                        .map(
                            (instructor) =>
                                `${instructor.first_name} ${instructor.last_name}`
                        )
                        .join(", ")}
                </span>
            </span>
        );

    return (
        <Modal show={show} onHide={cancelClick}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit Instructors for {position.position_code}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Typeahead
                    id="instructors-input"
                    ignoreDiacritics={true}
                    multiple
                    placeholder="Instructors..."
                    labelKey={
                        ((option: Instructor) =>
                            `${option.first_name} ${option.last_name}`) as any
                    }
                    selected={fieldVal}
                    options={allInstructors}
                    onChange={setFieldVal as any}
                />{" "}
                {changeIndicator}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={cancelClick} variant="outline-secondary">
                    Cancel
                </Button>
                <Button onClick={saveClick}>{spinner}Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export function EditInstructorsCell({ row }: { row: { original: Position } }) {
    const position = row.original;
    const [dialogShow, setDialogShow] = React.useState(false);
    const dispatch = useThunkDispatch();

    return (
        <div className="show-on-hover-wrapper">
            {position.instructors.map((instructor = {} as any) => {
                const name = `${instructor.first_name} ${instructor.last_name}`;
                return (
                    <Badge bg="secondary" className="me-1" key={name}>
                        {name}
                    </Badge>
                );
            })}
            <EditFieldIcon
                title="Edit the instructors for this position"
                hidden={false}
                onClick={() => setDialogShow(true)}
            />
            <EditInstructorsDialog
                position={position}
                show={dialogShow}
                onHide={() => setDialogShow(false)}
                onChange={async (newInstructors: Instructor[]) => {
                    await dispatch(
                        upsertPosition({
                            id: position.id,
                            instructors: newInstructors,
                        })
                    );
                    setDialogShow(false);
                }}
            />
        </div>
    );
}
