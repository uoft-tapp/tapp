import {
    getAttributesCheckMessage,
    findAllById,
    MockAPIController,
    bytesToBase64,
    errorUnlessRole,
    base64decode,
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
    upload({ file_contents, file_name }) {
        if (file_name in this.data.contract_templates_by_filename) {
            throw new Error(
                `Template with filename '${file_name}' already exists.`
            );
        }
        this.data.contract_templates_by_filename[file_name] = file_contents;
        this.data.available_contract_templates.push({
            template_file: file_name,
        });
    }
    getTemplateHtml(template) {
        template = new ContractTemplate(this.data).find(template);
        if (
            !(
                template.template_file in
                this.data.contract_templates_by_filename
            )
        ) {
            throw new Error(
                `Could not find Html for template ${template.template_file}`
            );
        }
        return this.data.contract_templates_by_filename[template.template_file];
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
        // If this is not an upsert, validate the parameters. Otherwise, don't validate.
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
        "/contract_templates/:template_id/view": documentCallback({
            func: (data, params) =>
                new ContractTemplate(data).getTemplateHtml(params.template_id),
            summary:
                "Get a preview of the contact template (i.e., the actual HTML).",
            returns: wrappedPropTypes.string,
        }),
        "/contract_templates/:template_id/download": documentCallback({
            func: (data, params) => {
                const { template_id } = params;
                const template = new ContractTemplate(data);
                const templateContent = template.getTemplateHtml(template_id);

                // We're directly sending binary data, so we need to encode the template
                // as UTF-8 (rather than native Javascript UTF-16)
                const encodedContent = new TextEncoder().encode(
                    templateContent
                );
                return {
                    file_name: template.find(template_id).template_file,
                    mime_type: "text/html",
                    content: bytesToBase64(encodedContent),
                };
            },
            summary:
                "Download the raw HTML template associated with the contract-template. No substitutions are made to this file. The `content` filed is encoded in Base64 and may be a binary file (e.g., a zip file).",
            returns: wrappedPropTypes.shape({
                file_name: wrappedPropTypes.string,
                mime_type: wrappedPropTypes.string,
                content: wrappedPropTypes.string,
            }),
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
        "/contract_templates/upload": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                const { file_name, content } = body;
                const file_contents = base64decode(content);
                new ContractTemplate(data).upload({ file_contents, file_name });
                return [...data.available_contract_templates];
            },
            summary:
                "Upload a base64-encoded contract template. (The contract template should be utf-8 encoded HTML).",
            posts: wrappedPropTypes.shape({
                file_name: wrappedPropTypes.string,
                content: wrappedPropTypes.string,
            }),
            returns: wrappedPropTypes.arrayOf(
                docApiPropTypes.contractTemplateMinimal
            ),
        }),
        "/contract_templates/delete": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Delete a contract template",
            posts: docApiPropTypes.contractTemplate,
            returns: docApiPropTypes.contractTemplate,
        }),
        "/contract_templates": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Update a contract template",
            posts: docApiPropTypes.contractTemplate,
            returns: docApiPropTypes.contractTemplate,
        }),
    },
};
