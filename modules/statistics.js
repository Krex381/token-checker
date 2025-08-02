/**
 * Statistics tracking module
 * Handles all statistics and progress tracking
 */

class Statistics {
    constructor() {
        this.stats = {
            checked: 0,
            valid: 0,
            invalid: 0,
            nitro: 0,
            boosts: 0,
            payments: 0,
            startTime: Date.now(),
            errors: 0,
            rateLimited: 0
        };
        this.lock = false;
    }

    async incrementChecked() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.checked++;
        this.lock = false;
    }

    async incrementValid() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.valid++;
        this.lock = false;
    }

    async incrementInvalid() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.invalid++;
        this.lock = false;
    }

    async incrementNitro() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.nitro++;
        this.lock = false;
    }

    async addBoosts(count) {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.boosts += count;
        this.lock = false;
    }

    async addPayments(count) {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.payments += count;
        this.lock = false;
    }

    async incrementErrors() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.errors++;
        this.lock = false;
    }

    async incrementRateLimited() {
        while (this.lock) {
            await this.sleep(1);
        }
        this.lock = true;
        this.stats.rateLimited++;
        this.lock = false;
    }

    getStats() {
        return { ...this.stats };
    }

    getDuration() {
        const duration = Date.now() - this.stats.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        return { minutes, seconds, total: duration };
    }

    getProgress(total) {
        return {
            percentage: total > 0 ? Math.floor((this.stats.checked / total) * 100) : 0,
            current: this.stats.checked,
            total: total
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Statistics;
