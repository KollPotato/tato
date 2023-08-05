interface Array<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonNullable<T>[];
}

interface ReadonlyArray<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): NonNullable<T>[];
}