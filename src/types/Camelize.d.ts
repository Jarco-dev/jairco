type ToCamelCase<T extends string> = T extends `${infer A}_${infer B}`
    ? `${A}${Camelize<Capitalize<B>>}`
    : T;
export type Camelize<T extends string> = ToCamelCase<Lowercase<T>>;
