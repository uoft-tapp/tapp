import { documentCallback, docApiPropTypes } from "../defs/doc-generation";
import { find, MockAPIController, findAllById } from "./utils";
import { Assignment } from "./assignments";

export class WageChunk extends MockAPIController {
    constructor(data) {
        super(data, data.wage_chunks);
    }
    validateNew() {
        // There is nothing to validate for a wage chunk
    }
    findAllByAssignment(assignment) {
        const matchingAssignment = new Assignment(this.data).rawFind(
            assignment
        );
        if (!matchingAssignment) {
            throw new Error(
                `Could not find assignment matching ${JSON.stringify(
                    assignment
                )}`
            );
        }
        return findAllById(
            [matchingAssignment.id],
            this.ownData,
            "assignment_id"
        );
    }
    upsertByAssignment(wageChunk, assignment) {
        const matchingAssignment = new Assignment(this.data).rawFind(
            assignment
        );
        if (!matchingAssignment) {
            throw new Error(
                `Could not find assignment matching ${JSON.stringify(
                    assignment
                )}`
            );
        }
        return this.upsert({
            ...wageChunk,
            assignment_id: matchingAssignment.id
        });
    }
    /**
     * Sets the list of wage chunks associated with a given assignment to `wageChunks`.
     * Any wage chunks omitted from the list are deleted.
     *
     * @param {*} wageChunks
     * @param {*} assignment
     * @returns
     * @memberof WageChunk
     */
    setAllByAssignment(wageChunks, assignment) {
        const matchingAssignment = this.rawFind(assignment);
        if (!matchingAssignment) {
            throw new Error(
                `Could not find assignment matching ${JSON.stringify(
                    assignment
                )}`
            );
        }
        const existingWageChunks = this.findAllByAssignment(assignment);
        // every wage chunk that is not in the `wageChunks` list gets deleted
        for (const wageChunk of existingWageChunks) {
            if (!find(wageChunk, wageChunks)) {
                this.delete(wageChunk);
            }
        }
        // Now we can upsert all the wageChunks
        wageChunks.forEach(chunk =>
            this.upsertByAssignment(chunk, matchingAssignment)
        );
        // Recompute the wage chunks list. This is "needless"
        // logically, but it might catch some bugs at some point.
        return this.findAllByAssignment(matchingAssignment);
    }
}

export const wageChunkRoutes = {
    get: {},
    post: {
        "/wage_chunks": documentCallback({
            func: (data, params, body) => new WageChunk(data).upsert(body),
            posts: docApiPropTypes.wageChunk,
            summary: "Upsert a wage_chunk",
            returns: docApiPropTypes.wageChunk
        }),
        "/wage_chunks/delete": documentCallback({
            func: (data, params, body) => new WageChunk(data).delete(body),
            posts: docApiPropTypes.wageChunk,
            summary: "Delete a wage_chunk. Must have a valid id specified.",
            returns: docApiPropTypes.wageChunk
        })
    }
};
