import {
    getUnusedId,
    find,
    getAttributesCheckMessage,
    deleteInArray,
    findAllById
} from "./utils";

export const instructorsRoutes = {
    get: {
        "/instructors": data => data.instructors,
        "/positions/:position_id/instructors": (data, params) => {
            const { position_id } = params;
            return [
                ...(data.positions[position_id] || { instructors: [] })
                    .instructors
            ];
        }
    },
    post: {
        "/sessions/:session_id/positions": (data, params, body) => {
            const { session_id } = params;
            const positions = data.positions;
            // Get the appropriate array; if it doesn't exist, initilize it
            // to an empty array
            const positions_by_session = (data.positions_by_session[
                session_id
            ] = data.positions_by_session[session_id] || []);
            // body should be a session object. If it contains an id,
            // update an existing session. Otherwise, create a new one.
            const matchingPosition = find(body, positions);
            if (matchingPosition) {
                return Object.assign(matchingPosition, body);
            }
            // if we're here, we need to create a new session
            // but check if the session name is empty or duplicate
            const message = getAttributesCheckMessage(
                body,
                findAllById(positions_by_session, positions),
                {
                    position_code: { required: true, unique: true },
                    position_title: { required: true }
                }
            );
            if (message) {
                throw new Error(message);
            }
            // create new session
            const newId = getUnusedId(positions);
            const newPosition = { ...body, id: newId };
            positions.push(newPosition);
            positions_by_session.push(newId);
            return newPosition;
        },
        "/instructors": (data, params, body) => {
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
        "/instructors/delete": (data, params, body) => {
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
        "/positions/:position_id/add_instructor": (data, params, body) => {
            const { position_id } = params;
            const instructor = find(body, data.instructors);
            if (!instructor) {
                throw new Error(`Cannot find instructor with id=${body.id}`);
            }
            const position = find({ id: position_id }, data.positions);
            const instructors = (position.instructors =
                position.instructors || []);
            instructors.push(instructor.utorid);
            return { ...instructor };
        },
        "/positions/:position_id/instructors/delete": (data, params, body) => {
            const { position_id } = params;
            const instructor = find(body, data.instructors);
            if (!instructor) {
                throw new Error(`Cannot find instructor with id=${body.id}`);
            }
            const position = find({ id: position_id }, data.positions);
            const instructors = (position.instructors =
                position.instructors || []);
            deleteInArray(instructor.utorid, instructors);
            return { ...instructor };
        }
    }
};
