import {
    getAttributesCheckMessage,
    deleteInArray,
    MockAPIController,
    errorUnlessRole,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { User } from "./active_user";
import { Position } from "./positions";

export class Instructor extends MockAPIController {
    constructor(data) {
        super(data, data.instructors);
    }
    validateNew(instructor) {
        const message = getAttributesCheckMessage(instructor, this.ownData, {
            utorid: { required: true, unique: true },
            first_name: { required: true },
            last_name: { required: true },
        });
        if (message) {
            throw new Error(message);
        }
    }
    delete(instructor) {
        const matchingInstructor = this.find(instructor);
        if (!matchingInstructor) {
            throw new Error(
                `Cannot find instructor matching ${JSON.stringify(instructor)}`
            );
        }
        super.delete(matchingInstructor);
        // After an instructor is deleted, they should be removed from all courses

        // remove this instructor from any positions
        for (const position of this.data.positions) {
            if (
                (position.instructor_ids || []).includes(matchingInstructor.id)
            ) {
                deleteInArray(matchingInstructor.id, position.instructor_ids);
            }
        }
        return matchingInstructor;
    }
    /**
     * Returns the instructor object corresponding to the active user,
     * or null if the active user doesn't correspond to an instructor.
     *
     * @returns {Instructor | null}
     * @memberof Instructor
     */
    getFromActiveUser() {
        const activeUser = new User(this.data).getActiveUser();
        const activeInstructor = new Instructor(this.data)
            .findAll()
            .find((instructor) => instructor.utorid === activeUser.utorid);
        return activeInstructor;
    }
}

export const instructorsRoutes = {
    get: {
        "/instructors": documentCallback({
            func: (data, params) => {
                if (params.role === "admin") {
                    return new Instructor(data).findAll();
                }
                if (params.role === "instructor") {
                    const activeInstructor = new Instructor(
                        data
                    ).getFromActiveUser();
                    if (!activeInstructor) {
                        return [];
                    }
                    const instructorPositions = new Position(
                        data
                    ).getForInstructor(activeInstructor);
                    const instructorIdsSet = new Set();
                    for (const position of instructorPositions) {
                        for (const id of position.instructor_ids) {
                            instructorIdsSet.add(id);
                        }
                    }

                    return new Instructor(data)
                        .findAll()
                        .filter((instructor) =>
                            instructorIdsSet.has(instructor.id)
                        );
                }
                // Always error if we've made it to this point
                errorUnlessRole(params, "");
            },
            summary: "Get a list of all instructors",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.instructor),
        }),
    },
    post: {
        "/instructors": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new Instructor(data).upsert(body);
            },
            summary: "Upsert an instructor",
            posts: docApiPropTypes.instructor,
            returns: docApiPropTypes.instructor,
        }),
        "/instructors/delete": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new Instructor(data).delete(body);
            },
            summary: "Delete an instructor (removes from all positions)",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.instructor,
        }),
    },
};
