import { find, getAttributesCheckMessage, getUnusedId } from "./utils";

export const templatesRoutes = {
    get: {
        "/available_position_templates": data => [
            ...data.available_position_templates
        ],
        "/sessions/:session_id/position_templates": (data, params) => [
            ...(data.position_templates_by_session[params.session_id] || [])
        ]
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
