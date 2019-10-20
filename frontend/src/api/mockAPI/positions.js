import {
    getUnusedId,
    find,
    getAttributesCheckMessage,
    deleteInArray,
    findAllById
} from "./utils";

export const positionsRoutes = {
    get: {
        "/sessions/:session_id/positions": (data, params) =>
            findAllById(
                data.positions_by_session[params.session_id],
                data.positions
            )
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
        "/positions": (data, params, body) => {
            const positions = data.positions;
            // body should be a session object. If it contains an id,
            // update an existing session. Otherwise, create a new one.
            const matchingPosition = find(body, positions);
            if (matchingPosition) {
                return Object.assign(matchingPosition, body);
            }
            throw new Error(`Cannot find position with id=${body.id}`);
        },
        "/positions/delete": (data, params, body) => {
            const positions = data.positions;
            // body should be a session object. If it contains an id,
            // update an existing session. Otherwise, create a new one.
            const matchingPosition = find(body, positions);
            if (!matchingPosition) {
                throw new Error(`Cannot find position with id=${body.id}`);
            }
            deleteInArray(matchingPosition, positions);
            return {};
        }
    }
};
