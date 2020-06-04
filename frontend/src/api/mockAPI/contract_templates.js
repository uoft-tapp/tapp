import {
    getAttributesCheckMessage,
    findAllById,
    MockAPIController,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { Session } from "./sessions";

export class ContractTemplate extends MockAPIController {
    constructor(data) {
        super(data);
        this.ownData = this.data.contract_templates;
    }
    validateNew(template, session = null) {
        // The name and file are required
        const message = getAttributesCheckMessage(template, this.ownData, {
            template_name: { required: true },
            template_file: { required: true },
        });
        if (message) {
            throw new Error(message);
        }
        // If we're inserting to a session, the name must be unique
        if (session) {
            const message = getAttributesCheckMessage(
                template,
                this.findAllBySession(session),
                {
                    template_name: { required: true, unique: true },
                }
            );
            if (message) {
                throw new Error(message);
            }
        }
    }
    findAllBySession(session) {
        const matchingSession = new Session(this.data).find(session);
        return findAllById(
            this.data.contract_templates_by_session[matchingSession.id] || [],
            this.ownData
        );
    }
    upsertBySession(obj, session) {
        const matchingSession = new Session(this.data).find(session);
        // If this is not an upsert, validate the paramters. Otherwise, don't validate.
        if (!this.find(obj)) {
            this.validateNew(obj, matchingSession);
        }
        const newTemplate = this.upsert(obj);
        // Make sure there is an array for to store the contract_templates by session,
        // and the push to this array before returning the new object
        this.data.contract_templates_by_session[matchingSession.id] =
            this.data.contract_templates_by_session[matchingSession.id] || [];
        this.data.contract_templates_by_session[matchingSession.id].push(
            newTemplate.id
        );
        return newTemplate;
    }
}

export const templatesRoutes = {
    get: {
        "/available_contract_templates": documentCallback({
            func: (data) => [...data.available_contract_templates],
            summary:
                "Get all available contract templates (these are literal files on the server).",
            returns: wrappedPropTypes.arrayOf(
                docApiPropTypes.contractTemplateMinimal
            ),
        }),
        "/sessions/:session_id/contract_templates": documentCallback({
            func: (data, params) =>
                new ContractTemplate(data).findAllBySession(params.session_id),
            summary: "Get contract templates associated with this session.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.contractTemplate),
        }),
    },
    post: {
        "/sessions/:session_id/contract_templates": documentCallback({
            func: (data, params, body) => {
                return new ContractTemplate(data).upsertBySession(
                    body,
                    params.session_id
                );
            },
            summary:
                "Associate a position template with a session; this method upserts",
            posts: docApiPropTypes.contractTemplate,
            returns: docApiPropTypes.contractTemplate,
        }),
    },
};
