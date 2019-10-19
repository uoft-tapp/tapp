/**
 * Tools for generating documentation
 */

import PropTypes from "prop-types";

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
        console.warn("Attempting to compute swagger values for non-wrapped object", pt)
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

export { wrappedPropTypes, wrappedPropTypesToSwagger };
