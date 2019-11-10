import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";
import {
    find,
    getUnusedId,
    getAttributesCheckMessage,
    findAllById,
    sum,
    splitDateRangeAtNewYear,
    deleteInArray
} from "./utils";
import { splitObjByProps } from "../actions/utils";

/**
 * Grabs a bunch of data from the wage chunks related to an assignment
 *
 * @param {string} assignment_id
 * @param {object} data - the full mockAPI data object
 * @returnType {{hours: number, wage_chunks: object[]}}
 */
function getWageChunkInfo(assignment_id, data) {
    const wageChunks = findAllById(
        [assignment_id],
        data.wage_chunks,
        "assignment_id"
    );
    const hours = sum(...wageChunks.map(x => x.hours));
    return { hours, wageChunks };
}

/**
 * Pieces together all the details of an assignment from the mockAPI data
 *
 * @param {object} assignment - an assignment
 * @param {object} data - mockAPI data
 * @returns
 */
function assembleAssignment(assignment, data) {
    if (!assignment) {
        return assignment;
    }
    const { hours } = getWageChunkInfo(assignment.id, data);
    return { ...assignment, hours: hours };
}

export const assignmentsRoutes = {
    get: {
        "/sessions/:session_id/assignments": documentCallback({
            func: (data, params) => {
                const assignments = data.assignments_by_session[
                    params.session_id
                ].map(id => find({ id }, data.assignments));
                return assignments.map(assignment =>
                    assembleAssignment(assignment, data)
                );
            },
            summary: "Get assignments associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.assignment)
        }),
        "/assignments/:assignment_id": documentCallback({
            func: (data, params) =>
                assembleAssignment(
                    find({ id: params.assignment_id }, data.assignments),
                    data
                ),
            summary: "Get an assignment",
            returns: docApiPropTypes.assignment
        }),
        "/assignments/:assignment_id/active_offer": documentCallback({
            // XXX impliment
            func: () => ({}),
            summary: "Get the active offer associated with an assignment",
            returns: docApiPropTypes.offer
        }),
        "/assignments/:assignment_id/wage_chunks": documentCallback({
            func: (data, params) =>
                getWageChunkInfo(params.assignment_id, data).wageChunks,
            summary: "Get the wage_chunks associated with an assignment",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk)
        })
    },
    post: {
        "/assignments": documentCallback({
            func: (data, params, body) => {
                const assignments = data.assignments;
                const assignment = find(body, assignments);
                // The computed assignment will have fields in it that are computed
                // e.g., from wage_chunks
                const computedAssignment = assembleAssignment(assignment, data);
                if (assignment) {
                    // If the hours have changed, we need to update the corresponding
                    // wage chunks
                    if (
                        body.hours != null &&
                        +body.hours !== computedAssignment.hours
                    ) {
                        // the chagne in hours
                        const delta = +body.hours - computedAssignment.hours;
                        const { wageChunks } = getWageChunkInfo(
                            assignment.id,
                            data
                        );
                        // we adjust each wage chunk an equal amount
                        const perChunkDelta = delta / wageChunks.length;
                        for (const chunk of wageChunks) {
                            chunk.hours += perChunkDelta;
                        }
                    }

                    // update an existing assignment, then return a recomputed
                    // version
                    return assembleAssignment(
                        Object.assign(assignment, body),
                        data
                    );
                }
                // create a new assignment
                const message = getAttributesCheckMessage(body, assignments, {
                    position_id: { required: true },
                    applicant_id: { required: true }
                });
                if (message) {
                    throw new Error(message);
                }
                const newId = getUnusedId(assignments);
                // Some properties of an assignment are stored directly, others are computed.
                // split off the computed properties so we can handle them separately.
                const [baseProps, computedProps] = splitObjByProps(body, [
                    "hours"
                ]);
                const newAssignment = { ...baseProps, id: newId };

                // Add the assignment to the list of all applicants
                assignments.push(newAssignment);

                // Figure out what session it is assigned to and add it there too
                const session_id = Object.keys(
                    data.positions_by_session
                ).find(x =>
                    data.positions_by_session[x].includes(
                        newAssignment.position_id
                    )
                );
                if (session_id) {
                    data.assignments_by_session[session_id].push(
                        newAssignment.id
                    );
                }

                // create the associated wage_chunk(s)
                if (computedProps.hours != null) {
                    const dateRanges = splitDateRangeAtNewYear(
                        newAssignment.start_date,
                        newAssignment.end_date
                    );
                    const hoursPerChunk =
                        +computedProps.hours / dateRanges.length;
                    // add a wage chunk for each date range
                    for (const range of dateRanges) {
                        const newWageChunkId = getUnusedId(data.wage_chunks);
                        data.wage_chunks.push({
                            id: newWageChunkId,
                            assignment_id: newAssignment.id,
                            hours: hoursPerChunk,
                            start_date: range.start_date,
                            end_date: range.end_date
                        });
                    }
                }

                return assembleAssignment(newAssignment, data);
            },
            posts: docApiPropTypes.assignment,
            summary: "Upsert an assignment",
            returns: docApiPropTypes.assignment
        }),
        "/assignments/:assignment_id/wage_chunks": documentCallback({
            func: (data, params, body) => {
                const existingWageChunks = getWageChunkInfo(
                    params.assignment_id,
                    data
                ).wageChunks;
                // Find which wage chunks need to be updated and which need to be inserted
                const updateList = [],
                    insertList = [];
                for (const chunk of body) {
                    const match = find(chunk, existingWageChunks);
                    if (match) {
                        updateList.push({
                            existingWageChunk: match,
                            newWageChunk: chunk
                        });
                    } else {
                        insertList.push(chunk);
                    }
                }

                // Update everything that needs updating first
                for (const { existingWageChunk, newWageChunk } of updateList) {
                    Object.assign(existingWageChunk, newWageChunk);
                }

                // Insert everything that needs inserting
                for (const newWageChunk of insertList) {
                    const newWageChunkId = getUnusedId(data.wage_chunks);
                    data.wage_chunks.push({
                        ...newWageChunk,
                        id: newWageChunkId
                    });
                }

                // Delete everythign that wasn't in the `body` list.
                // That is, everything that is in the `existingWageChunks`
                // list but not on the `updateList` needs to be deleted
                const updated = updateList.map(x => x.existingWageChunk);
                const deleteList = existingWageChunks.filter(
                    chunk => !find(chunk, updated)
                );
                for (const chunk of deleteList) {
                    deleteInArray(chunk, data.wage_chunks);
                }

                return getWageChunkInfo(params.assignment_id, data).wageChunks;
            },
            summary:
                "Sets the wage chunks of an assignment to the specified list. The contents of the list are upserted.",
            posts: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk),
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk)
        })
    }
};
