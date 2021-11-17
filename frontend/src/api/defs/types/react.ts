/**
 * Return the props for a given React Component's types. E.g.
 * ```
 * function Cell({info}: {info: string}) { return info };
 *
 * type CellProps = PropsForElement<typeof Cell>;
 * ```
 */
export type PropsForElement<T> = T extends React.ComponentType<infer Props>
    ? Props extends object
        ? Props
        : never
    : never;
