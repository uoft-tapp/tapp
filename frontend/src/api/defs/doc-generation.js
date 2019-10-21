/**
 * Tools for generating documentation
 */

import PropTypes from "prop-types";
import RouteParser from "route-parser";
import { generatePropTypes } from "./prop-types";

class CallAtom {
    constructor(prop, args) {
        this.name = prop;
        this.args = args;
    }
    toString() {
        if (this.args == null) {
            return "" + this.name;
        }
        return "" + this.name + "(" + this.args.join(", ") + ")";
    }
}
function createCallChain(chain = [], prop, args) {
    return chain.concat([new CallAtom(prop, args)]);
}
/**
 * A proxy to wrap `PropTypes` so that the call chain can be recorded.
 * For example, `PropTypes.bool.isRequired` would have the added method `.callChain`
 * which would return an array of `CallAtom` objects consisting of `bool` and `isRequired`.
 * This can be used to generate documentation from existing proptype definitions.
 *
 * @param {*} obj
 * @param {*} [callChain=[]]
 * @returns
 */
function propTypesProxy(obj, callChain = []) {
    const handler = {
        get(obj, prop, receiver) {
            if (prop === "callChain") {
                return callChain;
            } else if (prop === "toJSON") {
                return () => callChain;
            }
            const ret = Reflect.get(obj, prop, receiver);
            if (ret instanceof Object) {
                return propTypesProxy(ret, createCallChain(callChain, prop));
            }
            return ret;
        },
        apply(obj, thisArg, args) {
            const lastProp = callChain.pop() || { name: "<root>" };
            const ret = Reflect.apply(obj, thisArg, args);
            if (ret instanceof Object) {
                return propTypesProxy(
                    ret,
                    createCallChain(callChain, lastProp.name, args)
                );
            }
            return ret;
        },
        ownKeys(obj) {
            return [...Reflect.ownKeys(obj), "callChain", "toJSON"];
        }
    };

    return new Proxy(obj, handler);
}
const wrappedPropTypes = propTypesProxy(PropTypes);
/**
 * PropType defintions for the API that have been wrapped in
 * a proxy so they can be convereted into documentation.
 */
const docApiPropTypes = generatePropTypes(wrappedPropTypes);

const PROPTYPES_TO_SWAGGER_TYPES = {
    string: "string",
    number: "number",
    bool: "boolean",
    object: "object",
    array: "array",
    any: {}
};

function wrappedPropTypesToSwagger(pt) {
    const ret = {};
    if (!pt.callChain) {
        console.warn(
            "Attempting to compute swagger values for non-wrapped object",
            pt
        );
    } else {
        // We are a proxied PropTypes object
        //
        // PropTypes calls can be at most two long with the second argument
        // being `.isRequired`
        const [type, isRequired] = pt.callChain;
        const requiredList = [];
        if (isRequired) {
            ret["required"] = true;
        }
        if (type.args) {
            // in this case, we were a PropTypes function called with some arguments
            switch (type.name) {
                case "shape":
                    // in this case we're passing in an object with properties to be validated
                    ret["type"] = "object";
                    ret["properties"] = {};
                    for (const [key, val] of Object.entries(type.args[0])) {
                        const swaggerVal = wrappedPropTypesToSwagger(val);
                        if (swaggerVal["required"]) {
                            // Required properties in swagger must be listed up-front (i.e., as a list
                            // of property names, not as an attribute of an individual property),
                            // so hoist them.
                            requiredList.push(key);
                            delete swaggerVal["required"];
                        }
                        ret["properties"][key] = swaggerVal;
                    }
                    if (requiredList.length > 0) {
                        ret["required"] = requiredList;
                    }
                    break;
                case "arrayOf":
                    ret["type"] = "array";
                    ret["items"] = wrappedPropTypesToSwagger(type.args[0]);
                    break;
                case "oneOf":
                    // XXX assuming `oneOf` is only used for strings
                    ret["type"] = "string";
                    ret["enum"] = type.args[0];
                    break;
                case "oneOfType":
                    ret["oneOf"] = type.args[0].map(wrappedPropTypesToSwagger);
                    break;
                default:
                    break;
            }
        } else {
            if (PROPTYPES_TO_SWAGGER_TYPES[type.name]) {
                // in this case, we're a basic swagger type
                ret["type"] = PROPTYPES_TO_SWAGGER_TYPES[type.name];
            }
        }
    }

    return ret;
}

/**
 * Wrap `payload` in a standard API response formatted
 * for openapi
 *
 * @param {object} payload
 * @returns {object}
 */
function wrapInStandardApiResponseForSwagger(payload = { type: "object" }) {
    return {
        type: "object",
        properties: {
            status: {
                type: "string",
                enum: ["success", "error"]
            },
            message: { type: "string" },
            payload
        },
        required: ["status"]
    };
}

/**
 * Take a path template in `"route-parser"`
 * form, e.g. `/sessions/:session_id`, and encode it for
 * consumption by swagger, e.g., `/sessions/{session_id}`.
 *
 * @param {string} url
 * @returns {string}
 */
function urlTemplateToSwagger(url) {
    // get the template variables
    // using a trick: have the RoutePasers
    // parse it's own template, giving us
    // a list of variables in the process
    const parsed = RouteParser(url);
    const templateVars = Object.keys(parsed.match(parsed.spec));
    const subs = {};
    for (const templateVar of templateVars) {
        subs[templateVar] = "{" + templateVar + "}";
    }
    return { url: decodeURI(parsed.reverse(subs)), templateVars };
}

/**
 * Convert the `docs` attribute from a callback that
 * has been documented with `documentCallback` into an openapi
 * object.
 *
 * @param {object} docs
 * @param {string[]} [templateVars=[]] - list of template variables in the route
 * @returns {object} - openapi object
 */
function documentedCallbackToSwagger(docs, templateVars = []) {
    const ret = { responses: { default: {} } };
    if (!docs) {
        return ret;
    }
    ret.summary = docs.summary;
    // If there are templateVars, they should become `paramters`
    if (templateVars.length > 0) {
        ret.parameters = templateVars.map(x => ({
            name: x,
            in: "path",
            description: x,
            required: true
        }));
    }
    if (docs.returns) {
        ret.responses.default = {
            content: {
                "application/json": {
                    schema: wrapInStandardApiResponseForSwagger(
                        wrappedPropTypesToSwagger(docs.returns)
                    )
                }
            }
        };
    }

    return ret;
}

/**
 * Turn mockAPI routes into swagger-ui JSON object
 *
 * @param {{getRoutes: object, postRoutes: object}} [mockAPI={}]
 * @returns {object} - openapi configuration
 */
function mockApiRoutesAsSwaggerPaths(mockAPI = {}) {
    const { getRoutes = {}, postRoutes = {} } = mockAPI;
    const ret = {};
    for (const [path, val] of Object.entries(getRoutes)) {
        const { url: templatePath, templateVars } = urlTemplateToSwagger(path);
        if (val.docs && val.docs.exclude) {
            continue;
        }
        ret[templatePath] = Object.assign(ret[templatePath] || {}, {
            get: documentedCallbackToSwagger(val.docs, templateVars)
        });
    }
    for (const [path, val] of Object.entries(postRoutes)) {
        const { url: templatePath, templateVars } = urlTemplateToSwagger(path);
        if (val.docs && val.docs.exclude) {
            continue;
        }
        ret[templatePath] = Object.assign(ret[templatePath] || {}, {
            post: documentedCallbackToSwagger(val.docs, templateVars)
        });
    }

    return ret;
}

/**
 * Document a function with attributes for autogenerating openapi
 * specifications from.
 *
 * @param {*} { func, exclude = false, ...attrs }
 * @returns
 */
function documentCallback({ func, exclude = false, ...attrs }) {
    // create a wrapped function that we can stuff attributes onto
    const ret = (...args) => func(...args);
    ret.docs = {
        exclude,
        ...attrs
    };
    return ret;
}

export {
    wrappedPropTypes,
    wrappedPropTypesToSwagger,
    urlTemplateToSwagger,
    mockApiRoutesAsSwaggerPaths,
    documentCallback,
    docApiPropTypes
};
