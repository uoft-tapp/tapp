type NotNull<T> = T extends undefined | null ? never : T;
type NotNullField<T, K extends keyof T> = {
    [Prop in keyof T]: Prop extends K ? NotNull<T[Prop]> : T[Prop];
};

/**
 * Removes any items where `item[attr] == null`.
 */
export function filterNull<T, K extends keyof T>(
    data: T[],
    attr: K
): NotNullField<T, K>[] {
    return data.filter((x) => x[attr] != null) as NotNullField<T, K>[];
}

/**
 * Removes any items where `item[attr] == null`.
 */
export function filterNullFields<T, K extends keyof T>(
    data: T[],
    attrs: K[]
): NotNullField<T, K>[] {
    return data.filter((x) =>
        attrs.every((attr) => x[attr] != null)
    ) as NotNullField<T, K>[];
}

/**
 * Removes any items where `item[attr] == null`.
 */
export function arrayToMapByAttr<T, K extends keyof T>(data: T[], key: K) {
    const ret: Map<T[K], T> = new Map();
    for (const item of data) {
        ret.set(item[key], item);
    }
    return ret;
}
