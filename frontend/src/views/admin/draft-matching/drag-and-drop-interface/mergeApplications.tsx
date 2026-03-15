import type { Application, Posting } from "../../../../api/defs/types";

export type MergedApplication = Application & { mergedFrom: Posting[] };

/**
 * Take an array of 1 or more applications and return a single "merged" application.
 * @param applications
 */
export function mergeApplications(
    applications: Application[] | undefined
): MergedApplication | undefined {
    if (!applications) {
        return undefined;
    }
    if (applications.length === 0) {
        return undefined;
    }
    if (applications.length === 1) {
        return {
            ...applications[0],
            mergedFrom: applications[0].posting
                ? [applications[0].posting]
                : [],
        };
    }
    // We have two or more applications.
    const ret = {
        ...applications[0],
        mergedFrom: applications[0].posting ? [applications[0].posting] : [],
    };
    for (let i = 1; i < applications.length; i++) {
        const app = applications[i];
        // Merge documents
        ret.documents = ret.documents.concat(app.documents);
        // Merge position preferences
        ret.position_preferences = ret.position_preferences.concat(
            app.position_preferences
        );
        // Merge instructor preferences
        ret.instructor_preferences = ret.instructor_preferences.concat(
            app.instructor_preferences
        );
        // Merge comments
        if (app.comments) {
            if (ret.comments) {
                ret.comments += "\n\n" + app.comments;
            } else {
                ret.comments = app.comments;
            }
        }
        if (app.posting) {
            ret.mergedFrom.push(app.posting);
        }
    }
    return ret;
}
