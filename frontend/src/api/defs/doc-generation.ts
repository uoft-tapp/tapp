/**
 * Tools for generating documentation
 */

import PropTypes from "prop-types";
import RouteParser from "route-parser";
import { generatePropTypes } from "./prop-types";
import { UserRole } from "./types";

class CallAtom {
    name: string;
    args?: any[];

    constructor(prop: string, args?: any[]) {
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
function createCallChain(chain: CallAtom[] = [], prop: string, args?: any[]) {
    return chain.concat([new CallAtom(prop, args)]);
}
/**
 * A proxy to wrap `PropTypes` so that the call chain can be recorded.
 * For example, `PropTypes.bool.isRequired` would have the added method `.callChain`
 * which would return an array of `CallAtom` objects consisting of `bool` and `isRequired`.
 * This can be used to generate documentation from existing proptype definitions.
 *
 * @param {*} innerObj
 * @param {*} [callChain=[]]
 * @returns
 */
function propTypesProxy<T extends object | Function>(
    innerObj: T,
    callChain: CallAtom[] = []
) {
    const handler: ProxyHandler<T> = {
        get(obj, prop: string, receiver) {
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
            const ret = Reflect.apply(obj as any, thisArg, args);
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
        },
    };

    return new Proxy(innerObj, handler);
}
const wrappedPropTypes = propTypesProxy(PropTypes);
/**
 * PropType definitions for the API that have been wrapped in
 * a proxy so they can be converted into documentation.
 */
const docApiPropTypes = generatePropTypes(wrappedPropTypes);

const PROPTYPES_TO_SWAGGER_TYPES = {
    string: "string",
    number: "number",
    bool: "boolean",
    object: "object",
    array: "array",
    any: {},
};

function wrappedPropTypesToSwagger(pt: any) {
    const ret: Record<string, any> = {};
    if (!pt.callChain) {
        // eslint-disable-next-line
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
            if (type.name in PROPTYPES_TO_SWAGGER_TYPES) {
                // in this case, we're a basic swagger type
                ret["type"] =
                    PROPTYPES_TO_SWAGGER_TYPES[
                        type.name as keyof typeof PROPTYPES_TO_SWAGGER_TYPES
                    ];
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
                enum: ["success", "error"],
            },
            message: { type: "string" },
            payload,
        },
        required: ["status"],
    };
}

/**
 * Take a path template in `"route-parser"`
 * form, e.g. `/sessions/:session_id`, and encode it for
 * consumption by swagger, e.g., `/sessions/{session_id}`.
 *
 * @param url
 * @returns
 */
function urlTemplateToSwagger(url: string) {
    // get the template variables
    // using a trick: have the RouteParsers
    // parse it's own template, giving us
    // a list of variables in the process
    const parsed = new RouteParser(url);
    const templateVars = Object.keys(parsed.match((parsed as any).spec));
    const subs: Record<string, string> = {};
    for (const templateVar of templateVars) {
        subs[templateVar] = "{" + templateVar + "}";
    }
    return { url: decodeURI(parsed.reverse(subs) || ""), templateVars };
}

interface SwaggerDoc {
    summary: string;
    parameters: {
        name: string;
        in: string;
        description: string;
        required: boolean;
    }[];
    responses: {
        default: {
            content: { "application/json": { schema: any } };
        };
    };
    requestBody: { content: { "application/json": { schema: any } } };
    tags: string[];
}

/**
 * Convert the `docs` attribute from a callback that
 * has been documented with `documentCallback` into an openapi
 * object.
 *
 * @param docs
 * @param [templateVars=[]] - list of template variables in the route
 * @returns openapi object
 */
function documentedCallbackToSwagger(
    docs: DocumentCallbackArgs,
    templateVars: string[] = []
) {
    const ret: SwaggerDoc = { responses: { default: {} } } as SwaggerDoc;
    if (!docs) {
        return ret;
    }
    // Routes are all prefixed. `admin` can access all routes.
    // other routes are restricted depending on the list specified in `roles`.
    const prefixRoles = ["admin", ...(docs.roles || [])];
    ret.summary =
        `(prefixes: ${prefixRoles.map((x) => "/" + x).join(", ")}) ` +
        docs.summary;
    // If there are templateVars, they should become `parameters`
    if (templateVars.length > 0) {
        ret.parameters = templateVars.map((x) => ({
            name: x,
            in: "path",
            description: x,
            required: true,
        }));
    }
    // `docs.returns` holds information about what the route will return
    if (docs.returns) {
        ret.responses.default = {
            content: {
                "application/json": {
                    schema: wrapInStandardApiResponseForSwagger(
                        wrappedPropTypesToSwagger(docs.returns) as any
                    ),
                },
            },
        };
    }
    // `docs.posts` holds information about what you can put in the
    // requestBody
    if (docs.posts) {
        ret.requestBody = {
            content: {
                "application/json": {
                    schema: wrappedPropTypesToSwagger(docs.posts),
                },
            },
        };
    }

    return ret;
}

/**
 * Turn mockAPI routes into swagger-ui JSON object
 *
 * @param [mockAPI={}]
 * @returns openapi configuration
 */
function mockApiRoutesAsSwaggerPaths(
    mockAPI: {
        getRoutes?: Record<string, ReturnType<typeof documentCallback>>;
        postRoutes?: Record<string, ReturnType<typeof documentCallback>>;
    } = {}
) {
    const { getRoutes = {}, postRoutes = {} } = mockAPI;
    const ret: Record<string, Record<"get" | "post", SwaggerDoc>> = {} as any;
    for (const [path, val] of Object.entries(getRoutes)) {
        const { url: templatePath, templateVars } = urlTemplateToSwagger(path);
        if (val.docs && val.docs.exclude) {
            continue;
        }
        ret[templatePath] = Object.assign(ret[templatePath] || {}, {
            get: documentedCallbackToSwagger(
                val.docs as DocumentCallbackArgs,
                templateVars
            ),
        });
    }
    for (const [path, val] of Object.entries(postRoutes)) {
        const { url: templatePath, templateVars } = urlTemplateToSwagger(path);
        if (val.docs && val.docs.exclude) {
            continue;
        }
        ret[templatePath] = Object.assign(ret[templatePath] || {}, {
            post: documentedCallbackToSwagger(
                val.docs as DocumentCallbackArgs,
                templateVars
            ),
        });
    }

    // The initial segment of each route is a "tag"; get a unique
    // list of each of these tags and then for annotating the routes
    const tags = Array.from(
        new Set(
            Object.keys(ret)
                .map((x) => x.split("/")[1])
                .filter((x) => x)
        )
    );
    // If a route contains one of the "tags", then it should be annotated
    // accordingly (with each relevant tag)
    for (const [path, info] of Object.entries(ret)) {
        const applicableTags = tags.filter((x) => path.includes(x));
        if (info.get && applicableTags.length > 0) {
            info.get.tags = applicableTags;
        }
        if (info.post && applicableTags.length > 0) {
            info.post.tags = applicableTags;
        }
    }

    // Alphabetize the routes so they display in a sensible order.
    const sortedRet: Record<string, any> = {};
    for (const path of Object.keys(ret).sort()) {
        sortedRet[path] = ret[path];
    }

    return sortedRet;
}

export interface RouteParams {
    role: "admin" | "instructor" | "ta";
    [key: string]: string;
}

interface DocumentCallbackArgs {
    func: Function;
    summary: string;
    posts?: any;
    returns?: any;
    roles?: UserRole[];
    exclude?: boolean;
}

/**
 * Document a function with attributes for auto-generating openapi
 * specifications from.
 *
 * @param {*} { func, exclude = false, ...attrs }
 * @returns
 */
function documentCallback({
    func,
    exclude = false,
    ...attrs
}: DocumentCallbackArgs) {
    // create a wrapped function that we can stuff attributes onto
    const ret = <T>(...args: [T, ...any]) => func(...args);
    ret.docs = {
        exclude,
        ...attrs,
    };
    return ret;
}

export {
    wrappedPropTypes,
    wrappedPropTypesToSwagger,
    urlTemplateToSwagger,
    mockApiRoutesAsSwaggerPaths,
    documentCallback,
    docApiPropTypes,
};
