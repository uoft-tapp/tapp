import {
    find,
    getAttributesCheckMessage,
    getUnusedId,
    findAllById
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const templatesRoutes = {
    get: {
        "/available_contract_templates": documentCallback({
            func: data => [...data.available_contract_templates],
            summary:
                "Get all available contract templates (these are literal files on the server).",
            returns: wrappedPropTypes.arrayOf(
                docApiPropTypes.contractTemplateMinimal
            )
        }),
        "/sessions/:session_id/contract_templates": documentCallback({
            func: (data, params) =>
                findAllById(
                    data.contract_templates_by_session[params.session_id],
                    data.contract_templates
                ),
            summary: "Get contract templates associated with this session.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.contractTemplate)
        })
    },
    post: {
        "/sessions/:session_id/contract_templates": documentCallback({
            func: (data, params, body) => {
                const { session_id } = params;
                // Get the appropriate array; if it doesn't exist, initilize it
                // to an empty array
                const contract_templates = findAllById(
                    data.contract_templates_by_session[session_id],
                    data.contract_templates
                );
                const matchingTemplate = find(body, contract_templates);
                if (matchingTemplate) {
                    return Object.assign(matchingTemplate, body);
                }
                const message = getAttributesCheckMessage(
                    body,
                    contract_templates,
                    {
                        template_name: { required: true },
                        template_file: { required: true }
                    }
                );
                if (message) {
                    throw new Error(message);
                }
                // create new template
                const newId = getUnusedId(data.contract_templates);
                const newTemplate = {
                    id: newId,
                    template_name: body.template_name,
                    template_file: body.template_file
                };
                data.contract_templates.push(newTemplate);
                // make sure the list of contract templates by session is updated
                data.contract_templates_by_session[session_id] =
                    data.contract_templates_by_session[session_id] || [];
                data.contract_templates_by_session[session_id].push(newId);
                return newTemplate;
            },
            summary: "Associate a position template with a session",
            posts: docApiPropTypes.contractTemplate,
            returns: docApiPropTypes.contractTemplate
        })
    }
};
