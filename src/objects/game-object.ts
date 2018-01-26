import { Tags } from '../tags';

export interface GameObject {
    update(delta: number): void;
}

export interface Taggable {
    readonly tags: Tags[];
}

export interface UUID {
    readonly uuid: string;
}
