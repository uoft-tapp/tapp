import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Column } from "react-table";
import {
    deletePostingPosition,
    positionsSelector,
    upsertPostingPosition,
} from "../../../api/actions";
import { Posting, PostingPosition } from "../../../api/defs/types";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { arrayDiff, formatDate } from "../../../libs/utils";

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
    const dispatch = useDispatch();
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
        </React.Fragment>
    );
}
