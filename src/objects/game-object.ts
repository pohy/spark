import { Tags } from '../tags';

export interface GameObject {
    update(delta: number): void;
    readonly tags: Tags[];
    readonly uuid: string;
}
