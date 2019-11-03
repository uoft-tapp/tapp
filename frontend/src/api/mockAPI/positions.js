import {
    getUnusedId,
    find,
    getAttributesCheckMessage,
    deleteInArray,
    findAllById
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const positionsRoutes = {
    get: {
        "/sessions/:session_id/positions": documentCallback({
            func: (data, params) =>
                findAllById(
                    data.positions_by_session[params.session_id],
                    data.positions
                ),
            summary: "Get positions associated with this session.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.position)
        })
    },
    post: {
        "/sessions/:session_id/positions": documentCallback({
            func: (data, params, body) => {
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
                        position_code: { required: true, unique: true }
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
            summary:
                "Upsert a position associated with a session. If a new position is created, it will be automatically associated with the given session",
            posts: docApiPropTypes.position,
            returns: docApiPropTypes.position
        }),
        "/positions": documentCallback({
            func: (data, params, body) => {
                const positions = data.positions;
                // body should be a session object. If it contains an id,
                // update an existing session. Otherwise, create a new one.
                const matchingPosition = find(body, positions);
                if (matchingPosition) {
                    return Object.assign(matchingPosition, body);
                }
                throw new Error(`Cannot find position with id=${body.id}`);
            },
            summary: "Update a position",
            posts: docApiPropTypes.position,
            returns: docApiPropTypes.position
        }),
        "/positions/delete": documentCallback({
            func: (data, params, body) => {
                const positions = data.positions;
                // body should be a session object. If it contains an id,
                // update an existing session. Otherwise, create a new one.
                const matchingPosition = find(body, positions);
                if (!matchingPosition) {
                    throw new Error(`Cannot find position with id=${body.id}`);
                }
                deleteInArray(matchingPosition, positions);
                return {};
            },
            summary: "Delete a position",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.session
        })
    }
};
