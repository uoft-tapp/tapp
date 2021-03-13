/*
 * A collection of utility functions for comparing imported data and producing diffs.
 */

import {
    Session,
    Position,
    Instructor,
    Assignment,
    ContractTemplate,
    MinimalPosition,
    MinimalInstructor,
    MinimalAssignment,
    Utorid,
    Applicant,
    MinimalApplicant,
    MinimalDdah,
    Ddah,
    Duty,
} from "../api/defs/types";
import {
    prepareMinimal,
    prepareFull,
    matchByUtoridOrName,
} from "./import-export";

/**
 * Type of a diff between an object and existing objects
 * obtained by finding the differences between minimal representations.
 *
 * @interface DiffSpec
 * @template T - type of minimal representation (e.g., MinimalInstructor)
 * @template U - type of full representation (e.g. Instructor)
 */
export interface DiffSpec<T, U> {
    status: "new" | "duplicate" | "modified";
    changes: Partial<Record<keyof T, string>>;
    obj: U | Omit<U, "id">;
}

/**
 * Compute the difference between a supplied array of objects and the existing objects
 * of that type. Results are supplied as an array of DiffSpec objects.
 */
export const diffImport = {
    instructorsListFromField: function (
        list: Utorid[] | string,
        context: { instructors: Instructor[] }
    ): Instructor[] {
        const instructors = context.instructors;
        if (Array.isArray(list)) {
            return list.map((utorid) => {
                const match = instructors.find((x) => x.utorid === utorid);
                if (!match) {
                    throw new Error(
                        `Cannot find instructor with UTORid ${utorid}`
                    );
                }
                return match;
            });
        }
        list = list.split(";").map((x) => x.trim());

        return list.map((name) => matchByUtoridOrName(name, instructors));
    },
    instructor: function (
        instructor: MinimalInstructor,
        context: { instructors: Instructor[] }
    ): DiffSpec<MinimalInstructor, Instructor> {
        const existingInstructors = context.instructors;
        const ret: DiffSpec<MinimalInstructor, Instructor> = {
            status: "new",
            changes: {},
            obj: null as any, // Set to any temporarily to keep typescript from complaining
        };
        // Check to see if there is a matching instructor in the existing list
        const matchingInstructor = existingInstructors.find(
            (x) => x.utorid === instructor.utorid
        );

        if (matchingInstructor) {
            ret.status = "duplicate";
            const minimal = prepareMinimal.instructor(matchingInstructor);
            for (const _prop in minimal) {
                const prop = _prop as keyof MinimalInstructor;
                const oldVal = minimal[prop];
                const newVal = instructor[prop];
                if (!isSame(oldVal, newVal)) {
                    ret.status = "modified";
                    ret.changes[prop] = `"${oldVal}" → "${newVal}"`;
                }
            }
            ret.obj = prepareFull.instructor(instructor, {
                id: matchingInstructor.id,
            });
        } else {
            ret.obj = prepareFull.instructor(instructor, {});
        }

        return ret;
    },
    instructors: function (
        importedInstructors: MinimalInstructor[],
        context: { instructors: Instructor[] }
    ): DiffSpec<MinimalInstructor, Instructor>[] {
        return importedInstructors.map((instructor) =>
            diffImport.instructor(instructor, context)
        );
    },
    position: function (
        position: MinimalPosition,
        context: {
            positions: Position[];
            instructors: Instructor[];
            contractTemplates: ContractTemplate[];
        }
    ): DiffSpec<MinimalPosition, Position> {
        const instructors = context.instructors;
        const contractTemplates = context.contractTemplates;
        const existingPositions = context.positions;
        const ret: DiffSpec<MinimalPosition, Position> = {
            status: "new",
            changes: {},
            obj: null as any, // Set to any temporarily to keep typescript from complaining
        };
        // Check to see if there is a matching instructor in the existing list
        const matchingPosition = existingPositions.find(
            (x) => x.position_code === position.position_code
        );

        if (matchingPosition) {
            ret.status = "duplicate";
            const minimal = prepareMinimal.position(matchingPosition);
            for (const _prop in minimal) {
                const prop = _prop as keyof MinimalPosition;
                const oldVal = minimal[prop];
                const newVal = position[prop];
                if (!isSame(oldVal, newVal)) {
                    ret.status = "modified";
                    ret.changes[prop] = `"${oldVal}" → "${newVal}"`;
                    // Format dates and instructor lists differently
                    if (prop === "start_date" || prop === "end_date") {
                        ret.changes[prop] = `"${("" + oldVal).slice(
                            0,
                            10
                        )}" → "${("" + newVal).slice(0, 10)}"`;
                    }
                    if (prop === "instructors") {
                        const oldInstructors = diffImport.instructorsListFromField(
                            oldVal as any[],
                            { instructors }
                        );
                        const newInstructors = diffImport.instructorsListFromField(
                            newVal as any[],
                            { instructors }
                        );
                        ret.changes[prop] = `${oldInstructors
                            .map((x) => `${x.last_name}, ${x.first_name}`)
                            .join("; ")} → ${newInstructors
                            .map((x) => `${x.last_name}, ${x.first_name}`)
                            .join("; ")}`;
                    }
                }
            }
            ret.obj = prepareFull.position(position, {
                id: matchingPosition.id,
                instructors,
                contractTemplates,
            });
        } else {
            ret.obj = prepareFull.position(position, {
                instructors,
                contractTemplates,
            });
        }

        return ret;
    },
    positions: function (
        importedPositions: MinimalPosition[],
        context: {
            positions: Position[];
            instructors: Instructor[];
            contractTemplates: ContractTemplate[];
        }
    ): DiffSpec<MinimalPosition, Position>[] {
        return importedPositions.map((position) =>
            diffImport.position(position, context)
        );
    },
    assignments: function (
        importedAssignments: MinimalAssignment[],
        context: {
            assignments: Assignment[];
            positions: Position[];
            applicants: Applicant[];
            session: Session;
        }
    ): DiffSpec<MinimalAssignment, Assignment>[] {
        return importedAssignments.map((assignment) =>
            diffImport.assignment(assignment, context)
        );
    },
    assignment: function (
        assignment: MinimalAssignment,
        context: {
            assignments: Assignment[];
            positions: Position[];
            applicants: Applicant[];
            session: Session;
        }
    ): DiffSpec<MinimalAssignment, Assignment> {
        const existingAssignments = context.assignments;
        const positions = context.positions;
        const applicants = context.applicants;
        const session = context.session;
        const ret: DiffSpec<MinimalAssignment, Assignment> = {
            status: "new",
            changes: {},
            obj: null as any, // Set to any temporarily to keep typescript from complaining
        };
        // Check to see if there is a matching instructor in the existing list
        const assignmentHash = hashAssignment(assignment);
        const matchingAssignment = existingAssignments.find(
            (x) => hashAssignment(x) === assignmentHash
        );

        if (matchingAssignment) {
            ret.status = "duplicate";
            const minimal = prepareMinimal.assignment(
                matchingAssignment,
                session
            );
            // A MinimalAssignment has fields `position_code` and `utorid` which an
            // Assignment does not. However, since a match must have the same position
            // code and UTORid, we will never detect a change in these fields. Thus,
            // they can be safely ignored.
            for (const _prop in minimal) {
                const prop = _prop as keyof MinimalAssignment;
                const oldVal = minimal[prop];
                const newVal = assignment[prop];
                if (!isSame(oldVal, newVal)) {
                    ret.status = "modified";
                    ret.changes[prop] = `"${oldVal}" → "${newVal}"`;
                    // Format dates and instructor lists differently
                    if (prop === "start_date" || prop === "end_date") {
                        ret.changes[prop] = `"${("" + oldVal).slice(
                            0,
                            10
                        )}" → "${("" + newVal).slice(0, 10)}"`;
                    }
                    // If the `.hours` are null, it means that they are derived
                    // from the wage chunks. However, it would be confusing to see
                    // a message like "55 -> undefined" in the modification list,
                    // so we recompute the hours from the wage chunks to display a better
                    // message.
                    if (
                        prop === "hours" &&
                        newVal == null &&
                        Array.isArray(assignment.wage_chunks)
                    ) {
                        let hours = 0;
                        for (const chunk of assignment.wage_chunks) {
                            hours += chunk.hours;
                        }
                        if (oldVal === hours) {
                            ret.changes[prop] = `${hours} (wage chunk change)`;
                        } else {
                            ret.changes[
                                prop
                            ] = `${oldVal} → ${hours} (wage chunk change)`;
                        }
                    }
                    if (prop === "wage_chunks") {
                        ret.changes[prop] = `"${JSON.stringify(
                            oldVal
                        )}" → "${JSON.stringify(newVal)}"`;
                    }
                }
            }
            ret.obj = prepareFull.assignment(assignment, {
                id: matchingAssignment.id,
                session,
                positions,
                applicants,
            });
        } else {
            ret.obj = prepareFull.assignment(assignment, {
                session,
                positions,
                applicants,
            });
        }

        return ret;
    },
    applicants: function (
        importedApplicants: MinimalApplicant[],
        context: { applicants: Applicant[] }
    ): DiffSpec<MinimalApplicant, Applicant>[] {
        return importedApplicants.map((applicant) =>
            diffImport.applicant(applicant, context)
        );
    },
    applicant: function (
        applicant: MinimalApplicant,
        context: { applicants: Applicant[] }
    ): DiffSpec<MinimalApplicant, Applicant> {
        const existingApplicants = context.applicants;
        const ret: DiffSpec<MinimalApplicant, Applicant> = {
            status: "new",
            changes: {},
            obj: null as any, // Set to any temporarily to keep typescript from complaining
        };
        // Check to see if there is a matching instructor in the existing list
        const matchingApplicant = existingApplicants.find(
            (x) => x.utorid === applicant.utorid
        );

        if (matchingApplicant) {
            ret.status = "duplicate";
            const minimal = prepareMinimal.applicant(matchingApplicant);
            for (const _prop in minimal) {
                const prop = _prop as keyof MinimalApplicant;
                const oldVal = minimal[prop];
                const newVal = applicant[prop];
                if (!isSame(oldVal, newVal)) {
                    ret.status = "modified";
                    ret.changes[prop] = `"${oldVal}" → "${newVal}"`;
                }
            }
            ret.obj = prepareFull.applicant(applicant, {
                id: matchingApplicant.id,
            });
        } else {
            ret.obj = prepareFull.applicant(applicant, {});
        }

        return ret;
    },
    ddahs: function (
        importedDdahs: MinimalDdah[],
        context: { ddahs: Ddah[]; assignments: Assignment[] }
    ): DiffSpec<MinimalDdah, Ddah>[] {
        return importedDdahs.map((ddah) => diffImport.ddah(ddah, context));
    },
    ddah: function (
        ddah: MinimalDdah,
        context: { ddahs: Ddah[]; assignments: Assignment[] }
    ): DiffSpec<MinimalDdah, Ddah> {
        const existingDdahs = context.ddahs;
        const ret: DiffSpec<MinimalDdah, Ddah> = {
            status: "new",
            changes: {},
            obj: null as any, // Set to any temporarily to keep typescript from complaining
        };
        const assignments = context.assignments;

        // Check to see if there is a matching instructor in the existing list
        const matchingDdah = existingDdahs.find(
            (x) =>
                x.assignment.position.position_code === ddah.position_code &&
                x.assignment.applicant.utorid === ddah.applicant
        );

        if (matchingDdah) {
            ret.status = "duplicate";
            const minimal = prepareMinimal.ddah(matchingDdah);
            for (const _prop in minimal) {
                const prop = _prop as keyof MinimalDdah;
                const oldVal = minimal[prop];
                const newVal = ddah[prop];
                if (!isSame(oldVal, newVal)) {
                    ret.status = "modified";
                    if (prop === "duties") {
                        // Duty diffs need to be handled specially since it's an array of objects
                        ret.changes[prop] = `"${ddahDutiesToString(
                            oldVal as any
                        )}" → "${ddahDutiesToString(newVal as any)}"`;
                    } else {
                        ret.changes[prop] = `"${oldVal}" → "${newVal}"`;
                    }
                }
            }
            ret.obj = prepareFull.ddah(ddah, {
                id: matchingDdah.id,
                assignments,
            });
        } else {
            ret.obj = prepareFull.ddah(ddah, { assignments });
        }

        return ret;
    },
};

/**
 * Format a list of duties as a single string (for print a diff)
 *
 * @param {{hours: number, description: string}[]} duties
 * @returns {string}
 */
export function ddahDutiesToString(duties: Duty[]): string {
    if (duties.length > 0 && duties[0].order != null) {
        // If we a duties list with an order specified, sort the duties first.
        // Otherwise, we assume they're in the right order.
        duties = [...duties].sort((a, b) => a.order - b.order);
    }
    return duties
        .map(({ hours, description }) => `${hours}h - ${description}`)
        .join("; ");
}

/**
 * Distinguish between a MinimalAssignment and an Assignment
 *
 * @param {(MinimalAssignment | Assignment)} assignment
 * @returns {assignment is  MinimalAssignment}
 */
function isMinimalAssignment(
    assignment: MinimalAssignment | Assignment
): assignment is MinimalAssignment {
    // `Assignment` has a `.position` attribute, but not a `.position_code`
    if ((assignment as MinimalAssignment).position_code) {
        return true;
    }
    return false;
}

/**
 * Create a hash of an assignment/minimal assignment based on the position_code
 * and the applicant's UTORid.
 *
 * @param {(MinimalAssignment | Assignment)} assignment
 * @returns {string}
 */
function hashAssignment(assignment: MinimalAssignment | Assignment): string {
    let position_code, applicant_utorid;
    if (isMinimalAssignment(assignment)) {
        position_code = assignment.position_code;
        applicant_utorid = assignment.utorid;
    } else {
        position_code = assignment.position.position_code;
        applicant_utorid = assignment.applicant.utorid;
    }
    return `${position_code}/${applicant_utorid}`;
}

/**
 * Compare two objects and determine if they are the same. In this check,
 * `null`, `undefined`, and `""` are counted as the same as each other (but
 * they are distinct from `0`). This is used for detecting diffs from spreadsheets
 * where `null` and `""` can't be distinguished.
 *
 * @param {*} obj1
 * @param {*} obj2
 * @returns {boolean}
 */
function isSame(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== typeof obj2) {
        return false;
    }

    if (typeof obj1 === "number") {
        return (isNaN(obj1) && isNaN(obj2)) || obj1 === obj2;
    }

    // At this point, the only falsy values are `null`, `undefined`, and `""`
    // (because we've ruled out `0`). We want to treat all these values as the same.
    if (!obj1 && !obj2) {
        return true;
    }

    // If one of the objects is falsy and the other one isn't,
    // they can't be equal. After this check, neither object is falsy.
    if ((!obj1 && obj2) || (obj1 && !obj2)) {
        return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        // We will compare sorted versions of the arrays. We make a copy
        // so we don't mutate with the `.sort()` method.
        obj1 = [...obj1].sort();
        obj2 = [...obj2].sort();
        for (let i = 0; i < obj1.length; i++) {
            if (!isSame(obj1[i], obj2[i])) {
                return false;
            }
        }
        // If we made it here, all entries of `obj1` and `obj2` are the same.
        return true;
    }

    // By this point, both `obj1` and `obj2` must be objects with properties (we ruled out `null`)
    if (typeof obj1 === "object") {
        const keys1 = Object.keys(obj1).sort();
        const keys2 = Object.keys(obj2).sort();
        if (!isSame(keys1, keys2)) {
            return false;
        }
        return keys1.every((key) => isSame(obj1[key], obj2[key]));
    }

    return false;
}

/**
 * Extract a list of all objects that have changed from a diff.
 * These will be suitable for upserting.
 *
 * @export
 * @template T
 * @template U
 * @param {DiffSpec<T, U>[]} diffed
 * @returns {(U[] | Omit<U, "id">[])}
 */
export function getChanged<T, U>(
    diffed: DiffSpec<T, U>[]
): U[] | Omit<U, "id">[] {
    return diffed
        .filter((item) => item.status === "new" || item.status === "modified")
        .map((item) => item.obj);
}
