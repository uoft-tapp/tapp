import React from "react";
import { useSelector } from "react-redux";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { Duty, Assignment, Ddah } from "../../../api/defs/types";
import { upsertDdah, ddahsSelector } from "../../../api/actions/ddahs";
import { DdahEditor } from "../../../components/ddahs";
import { assignmentsSelector } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

interface PartialDdah {
    assignment: Assignment | null;
    duties: Duty[];
}

const BLANK_DDAH: PartialDdah = {
    assignment: null,
    duties: [],
};

/**
 * Find if there is a conflicting instructor in the passed in list
 * of instructors, or if any required fields are incorrect.
 *
 * @param {object} applicant
 * @param {object[]} ddahs
 */
function getConflicts(ddah: PartialDdah, ddahs: Ddah[]) {
    const ret: {
        delayShow: string;
        immediateShow: React.ReactNode;
    } = { delayShow: "", immediateShow: "" };
    if (ddah.duties.length === 0) {
        ret.delayShow = "A DDAH must have at least one duty";
    }
    if (ddah.assignment == null) {
        ret.delayShow = "A DDAH can only be created for an existing assignment";
        return ret;
    }

    const matchingDdah = ddahs.find(
        (x) => x.assignment.id === (ddah.assignment || {}).id
    );
    if (matchingDdah) {
        ret.immediateShow = (
            <p>
                Another DDAH exists for assignment=
                {ddah.assignment.position.position_code}:{" "}
                <b>
                    {matchingDdah.assignment.applicant.first_name}{" "}
                    {matchingDdah.assignment.applicant.last_name}
                </b>
            </p>
        );
    }
    return ret;
}

export function ConnectedAddDdahDialog(props: {
    show: boolean;
    onHide?: (...args: any) => any;
}) {
    const { show, onHide = () => {} } = props;
    const [newDdah, setNewDdah] = React.useState<PartialDdah>(BLANK_DDAH);
    const [inProgress, setInProgress] = React.useState(false);

    const ddahs = useSelector(ddahsSelector) as Ddah[];
    const dispatch = useThunkDispatch();
    const assignmentsWithDdahHash = {} as { [key: string]: boolean };
    for (const ddah of ddahs) {
        assignmentsWithDdahHash[ddah.assignment.id] = true;
    }
    const assignmentsWithoutDdah = useSelector<any, Assignment[]>(
        assignmentsSelector
    ).filter((x) => {
        // Filter assignments without ddah and status is not withdrawn or rejected
        return (
            !assignmentsWithDdahHash[x.id] &&
            x.active_offer_status !== "withdrawn" &&
            x.active_offer_status !== "rejected"
        );
    });

    function _upsertDdah(ddah: PartialDdah) {
        if (ddah.assignment == null) {
            console.warn(
                "Trying to upsert a DDAH with a null assignment reference"
            );
            return;
        }
        const newDdah = {
            assignment_id: ddah.assignment.id,
            duties: ddah.duties,
        };
        return dispatch(upsertDdah(newDdah));
    }

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewDdah(BLANK_DDAH);
        }
    }, [show]);

    async function createDdah() {
        setInProgress(true);
        await _upsertDdah(newDdah);
        setInProgress(false);
        onHide();
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const conflicts = getConflicts(newDdah, ddahs);

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Add DDAH</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <DdahEditor
                    ddah={newDdah}
                    setDdah={setNewDdah}
                    assignments={assignmentsWithoutDdah}
                />
                {!inProgress && conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createDdah}
                    title={conflicts.delayShow || "Create Instructor"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    {spinner}Create DDAH
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
