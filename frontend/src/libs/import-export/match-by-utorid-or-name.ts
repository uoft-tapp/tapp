import FuzzySet from "fuzzyset";

interface Person {
    utorid: string;
    first_name: string;
    last_name: string | null;
}

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
export function matchByUtoridOrName<T extends Person>(
    name: string,
    people: T[]
): T {
    let match = people.find((x) => x.utorid === name);
    if (match) {
        // We found an exact match by UTORid
        return match;
    }

    const nameHash: Record<string, T> = {};
    for (const person of people) {
        // We want to be able to match no matter the order in which the names are specified.
        nameHash[`${person.last_name}, ${person.first_name}`] = person;
        nameHash[`${person.first_name} ${person.last_name}`] = person;
    }

    const fuzzySet = FuzzySet(Object.keys(nameHash));
    let fuzzyMatch: [number, string][] | string = (fuzzySet.get as any)(
        name,
        null,
        0.7
    );
    if (fuzzyMatch) {
        // If we get an array as a result, it will be of the form [[<%match>, <value matched>]]
        let matchedKey = Array.isArray(fuzzyMatch)
            ? fuzzyMatch[0][1]
            : fuzzyMatch;
        return nameHash[matchedKey];
    }

    throw new Error(`Could not find a match for "${name}"`);
}
