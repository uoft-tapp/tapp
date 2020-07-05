import { documentCallback, docApiPropTypes } from "../defs/doc-generation";
import { find, MockAPIController, findAllById } from "./utils";
import { Assignment } from "./assignments";
import { Position } from "./positions";

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
        // Make sure we apply `this.find` so that the rates are computed.
        return findAllById(
            [matchingAssignment.id],
            this.ownData,
            "assignment_id"
        ).map((x) => this.find(x));
    }
    find(wageChunk) {
        const rawWageChunk = this.rawFind(wageChunk);
        const ret = { ...rawWageChunk };
        if (ret.rate == null) {
            // If the rate is not set, look it up from the session
            const session = this.getSession(wageChunk);
            if (session.rate2 == null) {
                ret.rate = session.rate1;
            } else {
                // Rates switch from session.rate1 to session.rate2 on January 1 of
                // the year following the session start date.
                const start_date = new Date(wageChunk.start_date);
                const end_date = new Date(wageChunk.end_date);
                const session_start_date = new Date(session.start_date);
                // For `Date`, 11 is december
                const december = new Date(
                    session_start_date.getFullYear(),
                    11,
                    31
                );
                if (start_date <= december && end_date <= december) {
                    ret.rate = session.rate1;
                } else {
                    ret.rate = session.rate2;
                }
            }
        }
        return ret;
    }
    getSession(wageChunk) {
        const rawWageChunk = this.rawFind(wageChunk);
        const assignment = new Assignment(this.data).rawFind({
            id: rawWageChunk.assignment_id,
        });
        const position = new Assignment(this.data).getPosition(assignment);
        return new Position(this.data).getSession(position);
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
            assignment_id: matchingAssignment.id,
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
        const existingWageChunks = this.findAllByAssignment(assignment);
        // Now we can upsert all the wageChunks
        wageChunks.forEach((chunk) =>
            this.upsertByAssignment(chunk, matchingAssignment)
        );
        // every wage chunk that is not in the `wageChunks` list gets deleted
        for (const wageChunk of existingWageChunks) {
            if (!find(wageChunk, wageChunks)) {
                this.delete(wageChunk);
            }
        }
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
            returns: docApiPropTypes.wageChunk,
        }),
        "/wage_chunks/delete": documentCallback({
            func: (data, params, body) => new WageChunk(data).delete(body),
            posts: docApiPropTypes.wageChunk,
            summary: "Delete a wage_chunk. Must have a valid id specified.",
            returns: docApiPropTypes.wageChunk,
        }),
    },
};
