import { Tags } from '../common/tags';

export interface GameObject {
    update(delta: number): void;
    readonly tags: Tags[];
    readonly uuid: string;
}
