import uuid from "uuid-random";
import PropTypes from "prop-types";
import { apiError } from "./errors";
import { apiInteractionStart, apiInteractionEnd } from "./status";

/**
 * Turn an array of items into a hash of items indexed
 * by the value of `indexBy`
 *
 * @export
 * @param {array} l
 * @param {string} [indexBy="id"]
 * @returns {object[]}
 */
export function arrayToHash(l, indexBy = "id") {
    if (!Array.isArray(l)) {
        return l;
    }
    const ret = {};
    for (const d of l) {
        ret[d[indexBy]] = d;
    }
    return ret;
}

/**
 * Creates an action function that returns an object of the form
 * ```
 *    {
 *        type: TYPE,
 *        payload: payload
 *    }
 * ```
 * This factory function can be used if your action is of this standard form.
 *
 * @export
 * @param {string} type
 * @returns {function(object): {type: string, payload: object}}
 */
export function actionFactory(type) {
    return payload => ({
        type,
        payload
    });
}

/**
 * Split an object into two objects. One with only properties listed in
 * `props` and the other with all remaining properties.
 *
 * @param {*} obj - object to be split
 * @param {*} [props=[]] - list of properties to split out
 * @returns {[object, object]} list of two objects. The first contains all properties not listed in `props`. The second contains all properties listed in `props`
 */
export function splitObjByProps(obj, props = []) {
    const ret = {},
        filtered = {};
    for (const prop of props) {
        if (Object.hasOwnProperty.call(obj, prop)) {
            filtered[prop] = obj[prop];
        }
    }
    for (const prop in obj) {
        if (!Object.hasOwnProperty.call(filtered, prop)) {
            ret[prop] = obj[prop];
        }
    }
    return [ret, filtered];
}

/**
 * Create a function that takes an `obj` object. It effectively does
 * `obj[outPropName] = obj[inPropName].id; delete obj[inPropName]` but
 * is non-destructive.
 *
 * @export
 * @param {string} inPropName
 * @param {string} outPropName
 * @param {boolean} [isArrayOfIds=false]
 * @returns
 */
export function flattenIdFactory(
    inPropName,
    outPropName,
    isArrayOfIds = false
) {
    return function(obj) {
        // if the `inPropName` field doesn't exist, don't change anything
        // and don't error!
        if (obj[inPropName] == null) {
            return obj;
        }
        const [ret, filtered] = splitObjByProps(obj, [inPropName]);
        if (isArrayOfIds) {
            ret[outPropName] = filtered[inPropName].map(x => x.id);
        } else {
            ret[outPropName] = filtered[inPropName].id;
        }
        return ret;
    };
}
/**
 * Create a dispatcher that validates `payload` accoring to the specified
 * `propTypes`. If validation fails, a warning will be printed to the console
 * and exectution of the dispatcher will stop. This function also wraps the
 * dispatch in `apiInteractionStart` and `apiInteractionEnd` actions.
 *
 * If the action only accepts one argument, then `propTypes` should be a single
 * `PropTypes` object (e.g., `{id: PropTypes.any.isRequired}`). If the action
 * accepts multiple arguments, `propTypes` should be an array (of length the number
 * of accepted arguments) of `PropTypes` objects.
 *
 * @export
 * @param {object} obj An object with information to create an action
 * @param {function} obj.dispatcher The action that will be dispatched after validation passes
 * @param {string} obj.name The name of the action
 * @param {string} obj.description A description of what the action does
 * @param {?(PropTypes|PropTypes[])} obj.propTypes A PropTypes object or an array of PropTypes objects
 * @param {?(function|boolean)} obj.onErrorDispatch Function that returns an action to be executed on error, or boolean `true` to autogenerate an error action
 * @returns {function} A redux-thunk action
 */
export function validatedApiDispatcher({
    dispatcher,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    propTypes,
    name,
    description,
    onErrorDispatch
}) {
    return (...args) => {
        // we return a new dispatcher that performs some validation
        // and then dispatches as usual
        return async dispatch => {
            // validate `args`. `args` is an array containing the arguments.
            // if propTypes is an array, it lists the propTypes for every argument,
            // otherwise there is just one argument.

            let wasPropTypesError = false;
            // This function performs the actual PropType check with extra arguments that
            // will make the warnings in the console more descriptive
            function propTypeCheck(propTypes, arg) {
                PropTypes.checkPropTypes(
                    propTypes,
                    arg || {},
                    "api action argument",
                    name,
                    () => {
                        wasPropTypesError = true;
                    }
                );
            }
            if (Array.isArray(propTypes)) {
                if (propTypes.length !== args.length) {
                    wasPropTypesError = true;
                } else {
                    for (let i = 0; i < propTypes.length; i++) {
                        propTypeCheck(propTypes[i], args[i]);
                    }
                }
            } else if (propTypes) {
                propTypeCheck(propTypes, args[0]);
            }
            if (wasPropTypesError) {
                dispatch(
                    apiError(
                        `Invalid arguments to ${name} while attempting action "${description}"`
                    )
                );
                return;
            }

            // Declare the start of an API interaction. Generate a `statusId`
            // so that we can specify which API interaction is ending (since multiple
            // ones may be going at the same time).
            const statusId = uuid();
            dispatch(apiInteractionStart(statusId, description));
            try {
                // We need to await so that promise errors get thrown
                // as real errors
                await dispatch(dispatcher(...args));
            } catch (e) {
                if (onErrorDispatch) {
                    if (onErrorDispatch instanceof Function) {
                        dispatch(onErrorDispatch(e));
                    } else {
                        dispatch(
                            apiError(
                                `Error encountered during "${description}"`
                            )
                        );
                    }
                } else {
                    throw e;
                }
            } finally {
                // Always declare the API interaction done, even
                // if there was an error somewhere along the way.
                dispatch(apiInteractionEnd(statusId));
            }
        };
    };
}
