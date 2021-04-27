import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import {
    getAttributesCheckMessage,
    findAllById,
    sum,
    splitDateRangeAtNewYear,
    MockAPIController,
    wageChunkArrayToStartAndEndDates,
    formatInstructorsContact,
    wageChunkArrayToPayPeriodDescription,
    errorUnlessRole,
} from "./utils";
import { Session } from "./sessions";
import { Position } from "./positions";
import { WageChunk } from "./wage_chunks";
import { Applicant } from "./applicants";
import { Instructor } from "./instructors";

export class Assignment extends MockAPIController {
    constructor(data) {
        super(data, data.assignments);
    }
    validateNew(assignment) {
        // No uniqueness required, so pass in an empty array ([]) to the verifier
        const message = getAttributesCheckMessage(assignment, [], {
            position_id: { required: true },
            applicant_id: { required: true },
        });
        if (message) {
            throw new Error(message);
        }
    }
    findAllBySession(session) {
        const matchingSession = new Session(this.data).rawFind(session);
        return findAllById(
            this.data.assignments_by_session[matchingSession.id] || [],
            this.ownData
            // Call "find" again to make sure every item gets packaged appropriately
        ).map((x) => new Assignment(this.data).find(x));
    }
    getPosition(assignment) {
        return new Position(this.data).find({
            id: assignment.position_id,
        });
    }
    getApplicant(assignment) {
        return new Applicant(this.data).find({
            id: assignment.applicant_id,
        });
    }
    /**
     * Grabs a bunch of data from the wage chunks related to an assignment
     *
     * @param {string} assignment
     * @returnType {{hours: number, wage_chunks: object[]}}
     */
    getWageChunkInfo(assignment) {
        const wageChunks = new WageChunk(this.data).findAllByAssignment(
            assignment
        );
        const hours = sum(...wageChunks.map((x) => x.hours));
        return { hours, wageChunks };
    }
    /**
     * Grab the active offer for an assignment
     *
     * @param {number} matchingAssignment.id
     * @param {object} this.data
     * @returns {({}|null)} - an offer object or `undefined`
     */
    getActiveOffer(assignment) {
        return new ActiveOffer(this.data).findByAssignment(assignment);
    }
    /**
     * Pieces together all the details of an assignment from the mockAPI data
     *
     * @param {object} matchingAssignment - an assignment
     * @returns
     */
    find(assignment) {
        const matchingAssignment = this.rawFind(assignment);
        if (!matchingAssignment) {
            return matchingAssignment;
        }
        const ret = { ...matchingAssignment };
        // compute the hours from wage chunks
        const { hours } = this.getWageChunkInfo(matchingAssignment);
        ret.hours = hours;
        // compute offer_status
        const activeOffer = this.getActiveOffer(matchingAssignment);
        if (activeOffer) {
            ret.active_offer_status = activeOffer.status;
            ret.active_offer_url_token = activeOffer.url_token;
        }
        // Add position start and end dates if they are not defined
        const position = this.getPosition(matchingAssignment);
        if (!matchingAssignment.start_date) {
            ret.start_date = position.start_date;
        }
        if (!matchingAssignment.end_date) {
            ret.end_date = position.end_date;
        }

        return ret;
    }
    upsert(assignment) {
        // Call `find` to make sure the `hours` field is computed
        const upsertedAssignment = this.find(super.upsert(assignment));

        // Make sure the assignment is in the assignments_by_session list
        const session_id = new Position(this.data).findAssociatedSession(
            upsertedAssignment.position_id
        );
        if (session_id) {
            this.data.assignments_by_session[session_id].push(
                upsertedAssignment.id
            );
        }

        // If `hours` is passed into the assignment, we need to modify the wage chunks
        // associated with the assignment (but only if the hours differ).
        if (
            assignment.hours == null ||
            +upsertedAssignment.hours === +assignment.hours
        ) {
            return upsertedAssignment;
        }

        let wageChunks = new WageChunk(this.data).findAllByAssignment(
            upsertedAssignment
        );
        // If there are no wage chunks, we need to create some
        if (wageChunks.length === 0) {
            const dateRanges = splitDateRangeAtNewYear(
                upsertedAssignment.start_date,
                upsertedAssignment.end_date
            );
            // create the wage chunks with zero hours, because it will be updated soon
            for (const range of dateRanges) {
                new WageChunk(this.data).upsertByAssignment(
                    {
                        hours: 0,
                        start_date: range.start_date,
                        end_date: range.end_date,
                    },
                    upsertedAssignment
                );
            }
        }

        // Now we are guaranteed to have wage chunks, so set them to the correct number
        // of hours
        wageChunks = new WageChunk(this.data).findAllByAssignment(
            upsertedAssignment
        );
        const delta =
            +assignment.hours - +(this.find(upsertedAssignment).hours || 0);
        const perChunkDelta = delta / wageChunks.length;
        for (const chunk of wageChunks) {
            new WageChunk(this.data).upsert({
                ...chunk,
                hours: (chunk.hours || 0) + perChunkDelta,
            });
        }

        // Find the assignment again, to make sure all computed fields are properly computed
        return this.find(upsertedAssignment);
    }
    /**
     * Returns the list of all assignments for positions that are (a) for the
     * specified session, and (b) taught by the specified instructor.
     *
     * @param {*} session
     * @param {*} instructor
     * @returns
     * @memberof Assignment
     */
    findAllBySessionAndInstructor(session, instructor) {
        session = new Session(this.data).find(session);
        instructor = new Instructor(this.data).find(instructor);
        const instructorPositions = new Position(this.data).getForInstructor(
            instructor
        );
        const assignments = this.findAllBySession(session);
        const positionIds = instructorPositions.map((position) => position.id);

        // Only return assignments for positions that the instructor is instructing
        return assignments.filter((assignment) =>
            positionIds.includes(assignment.position_id)
        );
    }
}

class ActiveOffer extends MockAPIController {
    constructor(data) {
        super(data, data.offers);
    }
    findByAssignment(assignment) {
        const matchingAssignment = this._ensureAssignment(assignment);

        // As a hack, a `_noActiveOffer` flag is added to an assignment
        // if the active offer should be ignore.
        if (matchingAssignment && matchingAssignment._noActiveOffer) {
            return null;
        }

        // offers are never deleted, only added to the table, so
        // picking the last one is the same as picking the "newest"
        const offers = findAllById(
            [matchingAssignment.id],
            this.data.offers,
            "assignment_id"
        );
        const activeOffer = offers[offers.length - 1];
        return activeOffer || null;
    }
    findAllByAssignment(assignment) {
        const matchingAssignment = this._ensureAssignment(assignment);

        // As a hack, a `_noActiveOffer` flag is added to an assignment
        // if the active offer should be ignore.
        if (matchingAssignment && matchingAssignment._noActiveOffer) {
            return null;
        }

        // offers are never deleted, only added to the table, so
        // picking the last one is the same as picking the "newest"
        const offers = findAllById(
            [matchingAssignment.id],
            this.data.offers,
            "assignment_id"
        );
        return offers;
    }
    _ensureAssignment(assignment) {
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
        return matchingAssignment;
    }
    getAssignment(offer) {
        return new Assignment(this.data).find({
            id: offer.assignment_id,
        });
    }
    find(query) {
        // This is where the magic happens. We create all the data needed for the offer here.
        const baseOffer = this.rawFind(query);
        const assignment = this.getAssignment(baseOffer);
        const { hours, wageChunks } = new Assignment(
            this.data
        ).getWageChunkInfo(assignment);
        const position = new Assignment(this.data).getPosition(assignment);
        const applicant = new Assignment(this.data).getApplicant(assignment);
        const instructors = new Position(this.data).getInstructors(position);
        const contractTemplate = new Position(this.data).getContractTemplate(
            position
        );

        const { start_date, end_date } = wageChunkArrayToStartAndEndDates(
            wageChunks
        );

        const offer = {
            accepted_date: null,
            rejected_date: null,
            withdrawn_date: null,
            signature: "",
            nag_count: 0,
            // All mutable fields should come before `baseOffer` is destructured.
            // Fields that come after are computed and cannot be directly set.
            ...baseOffer,
            contract_template: contractTemplate.template_file,
            contract_override_pdf: assignment.contract_override_pdf,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            email: applicant.email,
            position_code: position.position_code,
            position_title: position.position_title,
            position_start_date: start_date,
            position_end_date: end_date,
            first_time_ta: null,
            instructor_contact_desc: formatInstructorsContact(instructors),
            pay_period_desc: wageChunkArrayToPayPeriodDescription(wageChunks),
            hours,
            ta_coordinator_name: "Dr. Coordinator",
            ta_coordinator_email: "coordinator@utoronto.ca",
            url_token: "mock_api_offer_url_token",
        };

        return offer;
    }
    withdrawByAssignment(assignment) {
        const offer = this.findByAssignment(this._ensureAssignment(assignment));
        return this.find(
            this.upsert({
                ...offer,
                status: "withdrawn",
                withdrawn_date: new Date().toISOString(),
            })
        );
    }
    rejectByAssignment(assignment) {
        const offer = this.findByAssignment(this._ensureAssignment(assignment));
        return this.find(
            this.upsert({
                ...offer,
                status: "rejected",
                rejected_date: new Date().toISOString(),
            })
        );
    }
    acceptByAssignment(assignment) {
        const offer = this.findByAssignment(this._ensureAssignment(assignment));
        return this.find(
            this.upsert({
                ...offer,
                status: "accepted",
                accepted_date: new Date().toISOString(),
            })
        );
    }
    emailByAssignment(assignment) {
        const offer = this.findByAssignment(this._ensureAssignment(assignment));
        return this.find(
            this.upsert({
                ...offer,
                status: "pending",
                emailed_date: new Date().toISOString(),
            })
        );
    }
    nagByAssignment(assignment) {
        const offer = this.findByAssignment(this._ensureAssignment(assignment));
        if (!offer.emailed_date) {
            throw new Error(
                `The active offer for assignment with id=${assignment.id} has not been emailed yet, so a nag email cannot be sent`
            );
        }
        return this.find(
            this.upsert({
                ...offer,
                nag_count: (offer.nag_count || 0) + 1,
            })
        );
    }
    getHistoryByAssignment(assignment) {
        const offers = this.findAllByAssignment(
            this._ensureAssignment(assignment)
        );
        if (offers.length === 0) {
            throw new Error(
                `There is no offer history for assignment with id=${assignment.id}.`
            );
        }
        // Note: allocating memory inside of the sort callback is frowned upon, but this is just a mock API
        offers.sort(function (a, b) {
            return new Date(b.emailed_date) - new Date(a.emailed_date);
        });
        return offers;
    }
    createByAssignment(assignment) {
        const matchingAssignment = this._ensureAssignment(assignment);
        const offer = this.findByAssignment(matchingAssignment);
        if (
            offer &&
            ["pending", "accepted", "rejected", "provisional"].includes(
                offer.status
            )
        ) {
            throw new Error(
                `An offer already exists for assignment=${JSON.stringify(
                    assignment
                )}`
            );
        }

        // As a hack, sometimes a `_noActiveOffer` flag is set. Make sure to unset this flag
        // before creating an offer.
        new Assignment(this.data).upsert({
            ...matchingAssignment,
            _noActiveOffer: false,
        });
        return this.upsert(
            this.find(
                this.create({
                    assignment_id: matchingAssignment.id,
                    status: "provisional",
                })
            )
        );
    }
}

export const assignmentsRoutes = {
    get: {
        "/sessions/:session_id/assignments": documentCallback({
            func: (data, params) => {
                if (params.role === "admin") {
                    return new Assignment(data).findAllBySession(
                        params.session_id
                    );
                }
                if (params.role === "instructor") {
                    const activeInstructor = new Instructor(
                        data
                    ).getFromActiveUser();
                    if (!activeInstructor) {
                        return [];
                    }
                    return new Assignment(data).findAllBySessionAndInstructor(
                        params.session_id,
                        activeInstructor
                    );
                }
                errorUnlessRole(params, "");
            },
            summary: "Get assignments associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.assignment),
        }),
        "/assignments/:assignment_id": documentCallback({
            func: (data, params) =>
                new Assignment(data).find(params.assignment_id),
            summary: "Get an assignment",
            returns: docApiPropTypes.assignment,
        }),
        "/assignments/:assignment_id/active_offer": documentCallback({
            func: (data, params) =>
                new Assignment(data).getActiveOffer(params.assignment_id),
            summary: "Get the active offer associated with an assignment",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/wage_chunks": documentCallback({
            func: (data, params) =>
                new Assignment(data).getWageChunkInfo(params.assignment_id)
                    .wageChunks,
            summary: "Get the wage_chunks associated with an assignment",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk),
        }),
        "/assignments/:assignment_id/active_offer/history": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).getHistoryByAssignment(
                    params.assignment_id
                );
            },
            summary: "Fetches all offers that have previously been emailed.",
            returns: docApiPropTypes.offer,
        }),
    },
    post: {
        "/assignments": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                const existingAssignment = new Assignment(data).find(body);
                if (existingAssignment) {
                    const activeOffer = new Assignment(data).getActiveOffer(
                        existingAssignment
                    );
                    if (!activeOffer) {
                        return new Assignment(data).upsert(body);
                    }
                    if (
                        ["withdrawn", "provisional"].includes(
                            activeOffer.status
                        )
                    ) {
                        // In this case, we can upsert the assignment, but we remove any active offer
                        // in the process
                        return new Assignment(data).upsert({
                            ...body,
                            _noActiveOffer: true,
                        });
                    }
                    throw new Error(
                        `Cannot update an assignment that has an active offer with status '${activeOffer.status}'`
                    );
                }
                return new Assignment(data).upsert(body);
            },
            posts: docApiPropTypes.assignment,
            summary: "Upsert an assignment",
            returns: docApiPropTypes.assignment,
        }),
        "/assignments/:assignment_id/wage_chunks": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new WageChunk(data).setAllByAssignment(
                    body,
                    params.assignment_id
                );
            },
            summary:
                "Sets the wage chunks of an assignment to the specified list. The contents of the list are upserted. Omitted wage chunks are deleted.",
            posts: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk),
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.wageChunk),
        }),
        "/assignments/:assignment_id/active_offer/withdraw": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).withdrawByAssignment(
                    params.assignment_id
                );
            },
            summary: "Withdraws the active offer for the specified assignment",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/active_offer/reject": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).rejectByAssignment(
                    params.assignment_id
                );
            },
            summary: "Rejects the active offer for the specified assignment",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/active_offer/accept": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).acceptByAssignment(
                    params.assignment_id
                );
            },
            summary: "Accepts the active offer for the specified assignment",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/active_offer/create": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).createByAssignment(
                    params.assignment_id
                );
            },
            summary:
                "Creates an offer for the specified assignment, provided there are no active offers for this assignment.",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/active_offer/email": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).emailByAssignment(
                    params.assignment_id
                );
            },
            summary: "Emails the active offer for the specified assignment",
            returns: docApiPropTypes.offer,
        }),
        "/assignments/:assignment_id/active_offer/nag": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                return new ActiveOffer(data).nagByAssignment(
                    params.assignment_id
                );
            },
            summary:
                "Sends a nag email for the active offer for the specified assignment which has already been emailed once",
            returns: docApiPropTypes.offer,
        }),
    },
};
