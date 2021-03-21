import uuid from "uuid-random";
import { apiError } from "./errors";
import { apiInteractionStart, apiInteractionEnd } from "./status";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { HasPayload } from "../reducers/utils";
import { RootState } from "../../rootReducer";

/**
 * Turn an array of items into a hash of items indexed
 * by the value of `indexBy`
 *
 */
export function arrayToHash<T extends { id: number }>(l: T[]) {
    if (!Array.isArray(l)) {
        return l;
    }
    const ret: { [key: number]: T } = {};
    for (const d of l) {
        ret[d.id] = d;
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
 */
export function actionFactory<T>(type: string) {
    return (payload: T): HasPayload<T> => ({
        type,
        payload,
    });
}

/**
 * Split an object into two objects. One with only properties listed in
 * `props` and the other with all remaining properties.
 *
 * @param {*} obj - object to be split
 * @param {*} [props=[]] - list of properties to split out
 * @returns list of two objects. The first contains all properties not listed in `props`. The second contains all properties listed in `props`
 */
export function splitObjByProps<
    T extends object,
    Props extends [...(keyof T)[]]
>(obj: T, props: Props): [Omit<T, Props[number]>, Pick<T, Props[number]>] {
    const preserved: Partial<T> = {},
        removed: Partial<T> = {};
    for (const prop of props) {
        if (Object.hasOwnProperty.call(obj, prop)) {
            removed[prop] = obj[prop];
        }
    }
    for (const prop in obj) {
        if (!Object.hasOwnProperty.call(removed, prop)) {
            preserved[prop] = obj[prop];
        }
    }
    return [preserved, removed] as any;
}

export type HasId = { id: number };
export type HasSubIdField<M extends string> = { [key in M]: HasId };
export type HasSubIdFieldArray<M extends string> = { [key in M]: HasId[] };

/**
 * Test whether `obj[key].id` exists.
 *
 * @template M
 * @param {*} obj
 * @param {M} key
 * @returns {obj is HasSubIdField<M>}
 */
export function hasSubIdField<M extends string>(
    obj: any,
    key: M
): obj is HasSubIdField<M> {
    if ("id" in obj[key]) {
        return true;
    }
    return false;
}

/**
 * Test whether `obj[key]` is an array of objects with `id` fields.
 *
 * @template M
 * @param {*} obj
 * @param {M} key
 * @returns {obj is HasSubIdFieldArray<M>}
 */
function hasSubIdFieldArray<M extends string>(
    obj: any,
    key: M
): obj is HasSubIdFieldArray<M> {
    if (
        Array.isArray(obj[key]) &&
        (obj[key].length === 0 || "id" in obj[key][0])
    ) {
        return true;
    }
    return false;
}

/**
 * Create a function that takes an `obj` object. It effectively does
 * `obj[outPropName] = obj[inPropName].id; delete obj[inPropName]` but
 * is non-destructive.
 *
 * ```typescript
 * let orig = { foo: { id: 4 } }
 * let renamed = flattenIdFactory<{ foo: { id: number } }, "foo", "foo_id">(
 *    "foo",
 *    "foo_id"
 * )({ foo: { id: 4 } });
 * // `renamed` now has a `foo_id` property.
 * renamed.foo_id === 4
 * ```
 *
 * @returns
 */
export function flattenIdFactory<
    T extends HasSubIdField<InProp> | HasSubIdFieldArray<InProp>,
    InProp extends keyof T & string,
    OutProp extends string
>(inPropName: InProp, outPropName: OutProp) {
    return function (
        obj: T
    ): T extends HasSubIdField<InProp>
        ? Omit<T, InProp> & { [key in OutProp]: number }
        : Omit<T, InProp> & { [key in OutProp]: number[] } {
        // if the `inPropName` field doesn't exist, don't change anything
        // and don't error!
        if (obj[inPropName] == null) {
            return obj as any;
        }
        const [ret, filtered]: [any, Pick<T, InProp>] = splitObjByProps(obj, [
            inPropName,
        ]);

        if (hasSubIdField(filtered, inPropName)) {
            ret[outPropName] = filtered[inPropName].id;
        } else if (hasSubIdFieldArray(filtered, inPropName)) {
            ret[outPropName] = filtered[inPropName].map((x) => x.id);
        }

        return ret;
    };
}

interface DispatcherParams<RetType, ArgType extends unknown[]> {
    name: string;
    description: string;
    onErrorDispatch: (e: Error) => Action;
    dispatcher: (
        ...args: ArgType
    ) => ThunkAction<RetType | Promise<RetType>, RootState, void, Action>;
}

/**
 * Create a dispatcher that validates `payload` according to the specified
 * `propTypes`. If validation fails, a warning will be printed to the console
 * and execution of the dispatcher will stop. This function also wraps the
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
 * @param {?(function|boolean)} obj.onErrorDispatch Function that returns an action to be executed on error, or boolean `true` to auto-generate an error action
 * @returns {function} A redux-thunk action
 */
export function validatedApiDispatcher<RetType, ArgType extends unknown[]>({
    dispatcher,
    name,
    description,
    onErrorDispatch,
}: DispatcherParams<RetType, ArgType>) {
    return (...args: ArgType) => {
        // we return a new dispatcher that performs some validation
        // and then dispatches as usual
        return async (dispatch: ThunkDispatch<RootState, void, Action>) => {
            // Declare the start of an API interaction. Generate a `statusId`
            // so that we can specify which API interaction is ending (since multiple
            // ones may be going at the same time).
            const statusId = uuid();
            dispatch(apiInteractionStart(statusId, description));
            try {
                // We need to await so that promise errors get thrown
                // as real errors
                return await dispatch(dispatcher(...args));
            } catch (e) {
                console.warn("API Error", e);
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
