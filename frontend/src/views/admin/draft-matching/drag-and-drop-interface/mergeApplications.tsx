import { Application } from "../../../../api/defs/types";

/**
 * Take an array of 1 or more applications and return a single "merged" application.
 * @param applications
 */

export function mergeApplications(
    applications: Application[] | undefined
): Application | undefined {
    if (!applications) {
        return undefined;
    }
    if (applications.length === 0) {
        return undefined;
    }
    if (applications.length === 1) {
        return applications[0];
    }
    // We have two or more applications.
    const ret = { ...applications[0] };
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
    }
    return ret;
}
