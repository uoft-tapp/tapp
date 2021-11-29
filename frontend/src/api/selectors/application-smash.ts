import { createSelector } from "reselect";
import {
    applicantsSelector,
    positionsSelector,
    postingsSelector,
} from "../actions";
import type {
    Applicant,
    Application,
    InstructorPreference,
    Position,
    Posting,
    RawApplication,
    RawInstructorPreference,
} from "../defs/types";
import { arrayToMapByAttr, filterNull, filterNullFields } from "./utils";
import { rawSelector } from "./raw-selectors";

/**
 * Link `Application`s with `Applicant`, `Posting`, and `Position` data.
 * The `InstructorPreferences` are not linked.
 *
 * @param {RawApplication[]} rawApplications
 * @param {Applicant[]} applicants
 * @param {Posting[]} postings
 * @param {Position[]} positions
 * @returns {Application[]}
 */
function linkApplicationsWithData(
    rawApplications: RawApplication[],
    applicants: Applicant[],
    postings: Posting[],
    positions: Position[]
): Application[] {
    if (rawApplications.length === 0) {
        return [];
    }

    const applicantsById = arrayToMapByAttr(applicants, "id");
    const postingsById = arrayToMapByAttr(postings, "id");
    const positionsById = arrayToMapByAttr(positions, "id");

    // Change `applicant_id` to the corresponding `applicant` object
    // and similarly, change each `position_id` in each entry of
    // `position_preferences` to corresponding `position` object.
    const ret = rawApplications.map(
        ({
            posting_id,
            applicant_id,
            position_preferences: rawPositionPreferences,
            ...rest
        }) => {
            const position_preferences = filterNull(
                rawPositionPreferences.map(
                    ({ position_id, preference_level }) => ({
                        position: positionsById.get(position_id),
                        preference_level,
                    })
                ),
                "position"
            );

            return {
                ...rest,
                applicant: applicantsById.get(applicant_id),
                posting:
                    posting_id == null
                        ? null
                        : postingsById.get(posting_id) || null,
                position_preferences,
                instructor_preferences: [],
            };
        }
    );
    return filterNull(ret, "applicant");
}

function smashApplicationsAndInstructorPreferences(
    baseApplications: Application[],
    rawInstructorPreferences: RawInstructorPreference[],
    positions: Position[]
): {
    applications: Application[];
    instructorPreferences: InstructorPreference[];
} {
    // Create a copy of each application so we can mutate the contents.
    const applications = baseApplications.map((application) => ({
        ...application,
    }));
    const positionsById = arrayToMapByAttr(positions, "id");
    const applicationsById = arrayToMapByAttr(applications, "id");

    // Create instructor preferences that reference the applications
    const instructorPreferences: InstructorPreference[] = filterNullFields(
        rawInstructorPreferences.map(
            ({ position_id, application_id, ...rest }) => ({
                ...rest,
                position: positionsById.get(position_id),
                application: applicationsById.get(application_id),
            })
        ),
        ["position", "application"]
    );

    // Link the applications to the instructor preferences
    for (const application of applications) {
        application.instructor_preferences = instructorPreferences.filter(
            (pref) => pref.application.id === application.id
        );
    }

    return { applications, instructorPreferences };
}

const applicationsAndInstructorPreferencesSelector = createSelector(
    [
        rawSelector.applications,
        rawSelector.instructorPreferences,
        // FIXME: There are circular dependencies in the imports which means that the
        // imported selectors are initially `undefined`. When all imports finish, they become
        // defined. Since these selectors aren't run until all imports have finished we're
        // safe to call these function without checking if they're undefined. We wrap them
        // in an anonymous function to keep reselect from complaining, but really
        // the circular dependencies should be removed by splitting out the selectors into
        // their own files.
        (x: any) => positionsSelector(x),
        (x: any) => applicantsSelector(x),
        (x: any) => postingsSelector(x),
    ],
    (
        rawApplications,
        rawInstructorPreferences,
        positions,
        applicants,
        postings
    ) => {
        const applications = linkApplicationsWithData(
            rawApplications,
            applicants,
            postings,
            positions
        );
        const ret = smashApplicationsAndInstructorPreferences(
            applications,
            rawInstructorPreferences,
            positions
        );
        return ret;
    }
);

export const applicationsSelector = createSelector(
    [applicationsAndInstructorPreferencesSelector],
    (applicationsAndInstructorPreferences) =>
        applicationsAndInstructorPreferences.applications
);

export const instructorPreferencesSelector = createSelector(
    [applicationsAndInstructorPreferencesSelector],
    (applicationsAndInstructorPreferences) =>
        applicationsAndInstructorPreferences.instructorPreferences
);
