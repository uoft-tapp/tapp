import {
    getAttributesCheckMessage,
    deleteInArray,
    MockAPIController
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export class Instructor extends MockAPIController {
    constructor(data) {
        super(data, data.instructors);
    }
    validateNew(instructor) {
        const message = getAttributesCheckMessage(instructor, this.ownData, {
            utorid: { required: true, unique: true },
            first_name: { required: true },
            last_name: { required: true }
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
}

export const instructorsRoutes = {
    get: {
        "/instructors": documentCallback({
            func: data => new Instructor(data).findAll(),
            summary: "Get a list of all instructors",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.instructor)
        })
    },
    post: {
        "/instructors": documentCallback({
            func: (data, params, body) => {
                return new Instructor(data).upsert(body);
            },
            summary: "Upsert an instructor",
            posts: docApiPropTypes.instructor,
            returns: docApiPropTypes.instructor
        }),
        "/instructors/delete": documentCallback({
            func: (data, params, body) => {
                return new Instructor(data).delete(body);
            },
            summary: "Delete an instructor (removes from all positions)",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.instructor
        })
    }
};
