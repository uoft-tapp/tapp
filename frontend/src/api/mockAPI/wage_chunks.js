import { documentCallback, docApiPropTypes } from "../defs/doc-generation";
import {
    find,
    getUnusedId,
    getAttributesCheckMessage,
    deleteInArray
} from "./utils";

export const wageChunkRoutes = {
    get: {},
    post: {
        "/wage_chunks": documentCallback({
            func: (data, params, body) => {
                const wageChunks = data.wage_chunks;
                const wageChunk = find(body, wageChunks);
                if (wageChunk) {
                    return Object.assign(wageChunk, body);
                }
                // create a new assignment
                const message = getAttributesCheckMessage(body, wageChunks, {
                    assignment_id: { required: true },
                    hours: { required: true }
                });
                if (message) {
                    throw new Error(message);
                }
                const newId = getUnusedId(wageChunks);
                const newWageChunk = { ...body, id: newId };

                // Add the wage chunk
                wageChunks.push(newWageChunk);

                return newWageChunk;
            },
            posts: docApiPropTypes.wageChunk,
            summary: "Upsert a wage_chunk",
            returns: docApiPropTypes.wageChunk
        }),
        "/wage_chunks/delete": documentCallback({
            func: (data, params, body) => {
                const wageChunks = data.wage_chunks;
                const wageChunk = find(body, wageChunks);
                if (!wageChunk) {
                    throw new Error(
                        `Could not find wage chunk with id=${body.id} to delete`
                    );
                }
                deleteInArray(wageChunk, wageChunks);
                return wageChunk;
            },
            posts: docApiPropTypes.wageChunk,
            summary: "Delete a wage_chunk. Must have a valid id specified.",
            returns: docApiPropTypes.wageChunk
        })
    }
};
