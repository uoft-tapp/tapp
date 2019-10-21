import { find, getAttributesCheckMessage, getUnusedId } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const templatesRoutes = {
    get: {
        "/available_position_templates": documentCallback({
            func: data => [...data.available_position_templates],
            summary:
                "Get all available position templates (these are literal files on the server).",
            returns: wrappedPropTypes.arrayOf(
                docApiPropTypes.offerTemplateMinimal
            )
        }),
        "/sessions/:session_id/position_templates": documentCallback({
            func: (data, params) => [
                ...(data.position_templates_by_session[params.session_id] || [])
            ],
            summary: "Get position templates associated with this session.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.offerTemplate)
        })
    },
    post: {
        "/sessions/:session_id/add_position_template": (data, params, body) => {
            const { session_id } = params;
            // Get the appropriate array; if it doesn't exist, initilize it
            // to an empty array
            const position_templates = (data.position_templates_by_session[
                session_id
            ] = data.position_templates_by_session[session_id] || []);
            const matchingTemplate = find(body, position_templates);
            if (matchingTemplate) {
                return Object.assign(matchingTemplate, body);
            }
            const message = getAttributesCheckMessage(
                body,
                position_templates,
                {
                    position_type: { required: true },
                    offer_template: { required: true }
                }
            );
            if (message) {
                throw new Error(message);
            }
            // create new template
            const newId = getUnusedId(position_templates);
            const newTemplate = {
                id: newId,
                position_type: body.position_type,
                offer_template: body.offer_template
            };
            position_templates.push(newTemplate);
            return position_templates;
        }
    }
};
