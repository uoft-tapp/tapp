import FuzzySet from "fuzzyset";

/**
 * Find a suitable match in the `people` array for `name`. `name` can
 * be a utorid or a string `"Last, First"` or a string `"First Last"`.
 * If no suitable match is found, an error is thrown.
 *
 * @export
 * @param {string} name
 * @param {{utorid: string, first_name: string, last_name: string}[]} people
 * @returns
 */
export function matchByUtoridOrName(name, people) {
    let match = people.find((x) => x.utorid === name);
    if (match) {
        // We found an exact match by UTORid
        return match;
    }

    const nameHash = {};
    for (const person of people) {
        // We want to be able to match no matter the order in which the names are specified.
        nameHash[`${person.last_name}, ${person.first_name}`] = person;
        nameHash[`${person.first_name} ${person.last_name}`] = person;
    }

    const fuzzySet = FuzzySet(Object.keys(nameHash));
    match = fuzzySet.get(name, null, 0.7);
    if (match) {
        let matchedKey = match;
        if (Array.isArray(match)) {
            // If we get an array as a result, it will be of the form [[<%match>, <value matched>]]
            matchedKey = match[0][1];
        }
        return nameHash[matchedKey];
    }

    throw new Error(`Could not find a match for "${name}"`);
}
