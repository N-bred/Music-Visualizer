import * as T from 'three';

export default class CustomScene extends T.Scene {
    public numberOfFrequencies: number;
    constructor(numberOfFrequencies: number) {
        super();
        this.numberOfFrequencies = numberOfFrequencies;
    }

    setup() {

    }

    animate(fft: Uint8Array<ArrayBufferLike>) {

    }
}