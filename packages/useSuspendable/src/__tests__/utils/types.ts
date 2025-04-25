export type Unsuspend<T> = (p0: T) => Promise<void>;

export type Suspend<T> = () => Promise<Unsuspend<T>>;
