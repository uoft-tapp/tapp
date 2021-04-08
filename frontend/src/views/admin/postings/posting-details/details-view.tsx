import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button, Container, Modal, Row, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Column } from "react-table";
import {
    deletePostingPosition,
    positionsSelector,
    upsertPosting,
    upsertPostingPosition,
} from "../../../../api/actions";
import { Posting, PostingPosition } from "../../../../api/defs/types";
import { AdvancedFilterTable } from "../../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../../components/table-utils";
import { arrayDiff, formatDate } from "../../../../libs/utils";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

interface PostingPositionRow {
    id: number;
    position_id: number;
    posting_id: number;
    position_code: string;
    position_title: string;
    num_positions: number | null;
    hours: number | null;
    true_posting_position: boolean;
}

const emptyCustomQuestions = {
    pages: [
        {
            name: "page1",
        },
    ],
};

/**
 * Validate JSON to be in the format expected for
 * extra posting questions.
 *
 * @param {string} json
 * @returns
 */
function validateJson(json: string) {
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed?.pages)) {
            return { valid: true, message: "" };
        }
        return {
            valid: false,
            message:
                'Expected the root of the JSON object to be `{ "pages": [...] }`',
        };
    } catch (e) {
        return {
            valid: false,
            message:
                "The JSON data is not formatted correctly. (" + e.message + ")",
        };
    }
}

const DEFAULT_COLUMNS: Column<PostingPositionRow>[] = [
    {
        Header: generateHeaderCell("Position Code"),
        accessor: "position_code",
    },
    {
        Header: generateHeaderCell("Num Positions"),
        accessor: "num_positions",
    },
    {
        Header: generateHeaderCell("Hours per Assignment"),
        accessor: "hours",
    },
];

export function ConnectedPostingDetailsView({ posting }: { posting: Posting }) {
    const dispatch = useThunkDispatch();
    const [customQuestions, setCustomQuestions] = React.useState(
        JSON.stringify(
            posting.custom_questions || emptyCustomQuestions,
            null,
            4
        )
    );
    const [customQuestionsVisible, setCustomQuestionsVisible] = React.useState(
        false
    );
    const customQuestionsValid = validateJson(customQuestions);
    const posting_id = posting.id;
    const positions = useSelector(positionsSelector);
    const { postingPositions, tableData, selected } = React.useMemo(() => {
        const postingPositions = posting.posting_positions;
        // We want a row for every position; since we are only looking at a single
        // posting, the position ids form a unique set of ids.
        const tableData = positions.map(
            (position): PostingPositionRow => {
                const postingPosition = postingPositions.find(
                    (postingPosition) =>
                        postingPosition.position.id === position.id
                );
                const overrideData: Partial<PostingPositionRow> = {};
                if (postingPosition) {
                    overrideData.hours = postingPosition.hours;
                    overrideData.num_positions = postingPosition.num_positions;
                    overrideData.true_posting_position = true;
                }
                return {
                    id: position.id,
                    position_id: position.id,
                    hours: position.hours_per_assignment,
                    num_positions: position.desired_num_assignments,
                    posting_id: posting_id || 0,
                    position_code: position.position_code,
                    position_title: position.position_title || "",
                    true_posting_position: false,
                    ...overrideData,
                };
            }
        );
        const selected = tableData
            .filter((row) => row.true_posting_position)
            .map((row) => row.id);
        return { postingPositions, tableData, selected };
    }, [posting_id, posting, positions]);

    const selectionChange = React.useCallback(
        async (newSelection: number[]) => {
            const added = arrayDiff(newSelection, selected);
            const removed = arrayDiff(selected, newSelection);
            const removedPostingPositions = postingPositions.filter(
                (positionPosting) =>
                    removed.includes(positionPosting.position.id)
            );
            const newPostingPositions = positions
                .filter((position) => added.includes(position.id))
                .map(
                    (position): PostingPosition => ({
                        position,
                        posting,
                        hours: position.hours_per_assignment,
                        num_positions: position.desired_num_assignments,
                    })
                );

            const promises = (removedPostingPositions.map((postingPosition) =>
                dispatch(deletePostingPosition(postingPosition))
            ) as any[]).concat(
                newPostingPositions.map((postingPosition) =>
                    dispatch(upsertPostingPosition(postingPosition))
                )
            );
            try {
                await Promise.all(promises);
            } catch (e) {}
        },
        [selected, positions, postingPositions, posting, dispatch]
    );

    const updateCustomQuestions = React.useCallback(
        async (customQuestions) => {
            try {
                await dispatch(
                    upsertPosting({
                        id: posting.id,
                        custom_questions: JSON.parse(customQuestions),
                    })
                );
            } catch (e) {}
        },
        [dispatch, posting]
    );

    let numCustomQuestions = 0;
    const pages = posting.custom_questions?.pages;
    if (Array.isArray(pages)) {
        for (const page of pages) {
            numCustomQuestions +=
                page?.elements?.length || page?.questions?.length || 0;
        }
    }

    return (
        <React.Fragment>
            <table>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <td>{posting.name}</td>
                    </tr>
                    <tr>
                        <th>Open Date</th>
                        <td>{formatDate(posting.open_date || "")}</td>
                    </tr>
                    <tr>
                        <th>Close Date</th>
                        <td>{formatDate(posting.close_date || "")}</td>
                    </tr>
                    <tr>
                        <th>Intro Text</th>
                        <td>{posting.intro_text}</td>
                    </tr>
                </tbody>
            </table>
            <AdvancedFilterTable
                columns={DEFAULT_COLUMNS}
                data={tableData}
                filterable={true}
                selected={selected}
                setSelected={selectionChange}
            />
            <h4>Custom Questions</h4>
            <p>There are currently {numCustomQuestions} custom questions.</p>
            <Button onClick={() => setCustomQuestionsVisible(true)}>
                Edit Custom Questions
            </Button>
            <Modal
                show={customQuestionsVisible}
                onHide={() => setCustomQuestionsVisible(false)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Custom Questions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <p>
                                To edit custom survey questions, please go to{" "}
                                <a
                                    href="https://surveyjs.io/create-survey"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    surveyjs.io/create-survey
                                </a>{" "}
                                and click the <em>JSON Editor</em> tab. You may
                                then copy and paste the text below into the JSON
                                editor and switch to the{" "}
                                <em>Survey Designer</em> tab. When you are done,
                                switch back to the <em>JSON Editor</em> tab and
                                copy-and-paste the JSON data below.
                            </p>
                        </Row>
                        <Row className="mb-2">
                            <CopyToClipboard text={customQuestions}>
                                <Button>Copy Custom Questions</Button>
                            </CopyToClipboard>
                        </Row>
                        <Row>
                            <textarea
                                style={{ width: "100%", minHeight: "20em" }}
                                value={customQuestions}
                                onChange={(e) =>
                                    setCustomQuestions(e.target.value)
                                }
                            ></textarea>
                        </Row>
                        <Row>
                            {!customQuestionsValid.valid && (
                                <Alert variant="danger">
                                    {customQuestionsValid.message}
                                </Alert>
                            )}
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setCustomQuestionsVisible(false)}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button
                        title="Save"
                        disabled={!customQuestionsValid.valid}
                        onClick={async () => {
                            await updateCustomQuestions(customQuestions);
                            setCustomQuestionsVisible(false);
                        }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
