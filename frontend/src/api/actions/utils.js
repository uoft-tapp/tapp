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

export const onActiveSessionChangeActions = [];

/**
 * Registers an action to be called whenever activeSession changes.
 * If the action is a function, it should expect no arguments. It may
 * be a redux-thunk.
 *
 * @export
 * @param {(function|object)} dispatcher
 */
export function runOnActiveSessionChange(action) {
    // if we passed in a regular object, encapsulate it
    // in a function.
    if (!(action instanceof Function)) {
        action = () => action;
    }
    onActiveSessionChangeActions.push(action);
}
