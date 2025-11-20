import { ANIMATION } from '../config.js';

export class LoadingDisplay {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.startTime = Date.now();
        this.duration = ANIMATION.loadingDuration;
        this.progress = 0;
    }

    update() {
        if (this.progress >= 1) return this.progress;

        const elapsed = Date.now() - this.startTime;
        this.progress = Math.min(elapsed / this.duration, 1);

        const percentage = Math.floor(this.progress * 100);
        this.element.textContent = `${percentage}%`;

        return this.progress;
    }

    isComplete() {
        return this.progress >= 1;
    }

    getProgress() {
        return this.progress;
    }
}
