import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";
import { find, getUnusedId, getAttributesCheckMessage } from "./utils";

export const assignmentsRoutes = {
    get: {
        "/sessions/:session_id/assignments": documentCallback({
            func: (data, params) =>
                data.assignments_by_session[params.session_id].map(id =>
                    find({ id }, data.assignments)
                ),
            summary: "Get assignments associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.assignment)
        }),
        "/assignments/:assignment_id/active_offer": documentCallback({
            // XXX impliment
            func: () => ({}),
            summary: "Get the active offer associated with an assignment",
            returns: docApiPropTypes.offer
        })
    },
    post: {
        "/assignments": documentCallback({
            func: (data, params, body) => {
                const assignments = data.assignments;
                const assignment = find(body, assignments);
                if (assignment) {
                    // update an existing assignment
                    return Object.assign(assignment, body);
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
                const newAssignment = { ...body, id: newId };
                // Add the assignment to the list of all applicants
                assignments.push(newAssignment);
                // Figure out what session it is assigned to and add it there too
                const session_id = Object.keys(data.positions_by_session).find(
                    x =>
                        data.positions_by_session[x].includes(
                            newAssignment.position_id
                        )
                );
                if (session_id) {
                    data.assignments_by_session[session_id].push(
                        newAssignment.id
                    );
                }
                return newAssignment;
            },
            summary: "Upsert an assignment",
            returns: docApiPropTypes.assignment
        })
    }
};
