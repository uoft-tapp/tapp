/**
 * Validates `data` based on the specified `schema`. At the moment this
 * function only checks that every key specified by `schema.requiredKeys` is
 * non-null.
 *
 * @export
 * @param {*} data
 * @param {*} schema
 */
export function validate(data, schema) {
    const { requiredKeys, keys } = schema;
    for (const item of data) {
        for (const key of requiredKeys) {
            if (item[key] == null) {
                throw new Error(
                    `Item "${JSON.stringify(
                        item
                    )}" missing required property "${key}"`
                );
            }
        }
        for (const key of keys) {
            if (item[key] == undefined) {
                item[key] = null;
            }
        }
    }
}
