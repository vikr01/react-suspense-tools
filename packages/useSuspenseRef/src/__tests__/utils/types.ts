export type GetRef<T> = () => T;

export type Rerender = () => void;

export type Unsuspend = () => Promise<void>;

export type Suspend = () => Promise<Unsuspend>;

export type ResetError = () => Promise<void>;

export type ForceError = () => Promise<ResetError>;
