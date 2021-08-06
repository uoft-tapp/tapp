import { formatDate } from "./utils";
import type { Ddah } from "../api/defs/types";
/**
 * Determine if there are issues with `ddah` and
 * return a human-readable string specifying the issues
 *
 * @param {Ddah} ddah
 * @returns
 */
export function ddahIssues(ddah: Ddah) {
    if (ddah.total_hours !== ddah.assignment.hours) {
        return `Hours Mismatch (${ddah.total_hours} vs. ${ddah.assignment.hours})`;
    }
    return null;
}

/**
 * Compute a readable status for a DDAH object.
 *
 * @export
 * @param {Pick<Ddah, "status">} ddah
 * @returns
 */
export function getReadableStatus(ddah: Pick<Ddah, "status">) {
    switch (ddah.status) {
        case "accepted":
            return "Accepted";
        case "emailed":
            return "Pending";
        default:
            return "Unsent";
    }
}

/**
 * Compute the date of the most recent activity for a DDAH object.
 *
 * @export
 * @param {Ddah} ddah
 * @returns
 */
export function getRecentActivityDate(ddah: Ddah) {
    const recentActivityDate = (Math.max.apply as (...values: any[]) => number)(
        null,
        [
            ddah.accepted_date,
            ddah.approved_date,
            ddah.emailed_date,
            ddah.revised_date,
        ]
            .filter((date) => date)
            .map((date) => new Date(date || 0))
    );
    if (recentActivityDate <= 0) {
        return null;
    }
    return formatDate(new Date(recentActivityDate).toISOString());
}

/**
 * Duty descriptions come in the form `<category>:<description>`. This
 * function breaks a `fullDesc` up into it's two parts
 *
 * @param {string} fullDesc
 * @returns
 */
export function splitDutyDescription(fullDesc: string) {
    const colonPos = fullDesc.indexOf(":");
    if (colonPos < 0) {
        return { category: "other", description: fullDesc };
    }
    const category = fullDesc.slice(0, colonPos);
    const description = fullDesc.slice(colonPos + 1);
    return { category, description };
}
