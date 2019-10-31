import {
    getUnusedId,
    find,
    getAttributesCheckMessage,
    deleteInArray
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const instructorsRoutes = {
    get: {
        "/instructors": documentCallback({
            func: data => data.instructors,
            summary: "Get a list of all instructors",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.instructor)
        }),
        "/positions/:position_id/instructors": documentCallback({
            func: (data, params) => {
                const { position_id } = params;
                return [
                    ...(data.positions[position_id] || { instructors: [] })
                        .instructors
                ];
            },
            summary: "Get instructors associated with the current position",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.instructor)
        })
    },
    post: {
        "/instructors": documentCallback({
            func: (data, params, body) => {
                const instructors = data.instructors;
                // body should be an instructor object. If it contains an id,
                // update an existing instructor. Otherwise, create a new one.
                const matchingInstructor = find(body, instructors);
                if (matchingInstructor) {
                    return Object.assign(matchingInstructor, body);
                }

                // if we're here, we need to create a new session
                // but check if the session name is empty or duplicate
                const message = getAttributesCheckMessage(body, instructors, {
                    utorid: { required: true, unique: true },
                    first_name: { required: true },
                    last_name: { required: true }
                });
                if (message) {
                    throw new Error(message);
                }
                const newId = getUnusedId(instructors);
                const newInstructor = { ...body, id: newId };
                instructors.push(newInstructor);
                return newInstructor;
            },
            summary: "Upsert an instructor",
            posts: docApiPropTypes.instructor,
            returns: docApiPropTypes.instructor
        }),
        "/instructors/delete": documentCallback({
            func: (data, params, body) => {
                const instructors = data.instructors;
                const matchingInstructor = find(body, instructors);
                if (!matchingInstructor) {
                    throw new Error(
                        `Could not find instructor with id=${body.id} to delete`
                    );
                }
                deleteInArray(matchingInstructor, instructors);
                // if we found the session with matching id, delete it.
                return body;
            },
            summary: "Delete an instructor (removes from all positions)",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.instructor
        }),
        "/positions/:position_id/instructors": documentCallback({
            func: (data, params, body) => {
                const { position_id } = params;
                const instructor = find(body, data.instructors);
                if (!instructor) {
                    throw new Error(
                        `Cannot find instructor with id=${body.id}`
                    );
                }
                const position = find({ id: position_id }, data.positions);
                const instructors = (position.instructors =
                    position.instructors || []);
                instructors.push(instructor.utorid);
                return instructor;
            },
            summary: "Associate an instructor with a position",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.instructor
        }),
        "/positions/:position_id/instructors/delete": documentCallback({
            func: (data, params, body) => {
                const { position_id } = params;
                const instructor = find(body, data.instructors);
                if (!instructor) {
                    throw new Error(
                        `Cannot find instructor with id=${body.id}`
                    );
                }
                const position = find({ id: position_id }, data.positions);
                const instructors = (position.instructors =
                    position.instructors || []);
                deleteInArray(instructor.utorid, instructors);
                return { ...instructor };
            },
            summary: "Remove an instructor from the specified position",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.instructor
        })
    }
};
