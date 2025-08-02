/**
 * Progress display module
 * Handles real-time progress updates and display formatting
 */

const Utils = require("./utils");

class ProgressDisplay {
    constructor(statistics, threadManager) {
        this.statistics = statistics;
        this.threadManager = threadManager;
        this.progressInterval = null;
        this.isDisplaying = false;
    }

    startProgressDisplay() {
        if (this.progressInterval) {
            this.stopProgressDisplay();
        }

        this.isDisplaying = true;
        this.progressInterval = setInterval(() => {
            this.updateProgress();
        }, 1000);
    }

    stopProgressDisplay() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        this.isDisplaying = false;
        Utils.clearLine();
    }

    updateProgress() {
        if (!this.isDisplaying) return;

        const stats = this.statistics.getStats();
        const threadStats = this.threadManager.getStatistics();
        const duration = this.statistics.getDuration();

        const tokensPerSecond = duration.total > 0 ? ((stats.checked / (duration.total / 1000)).toFixed(2)) : 0;

        const progressMsg = [
            `Progress: ${threadStats.completed}/${threadStats.total} (${threadStats.percentage}%)`,
            `Valid: ${stats.valid}`,
            `Invalid: ${stats.invalid}`,
            `Errors: ${stats.errors}`,
            `Rate: ${tokensPerSecond}/s`,
            `Time: ${duration.minutes}m ${duration.seconds}s`
        ].join(" - ");

        Utils.clearLine();
        process.stdout.write(Utils.format.krex(progressMsg + "\r"));
    }

    displayFinalStatistics(threadCount) {
        this.stopProgressDisplay();

        const stats = this.statistics.getStats();
        const duration = this.statistics.getDuration();
        const threadStats = this.threadManager.getStatistics();

        console.log(Utils.format.krex("\n" + "=".repeat(80)));
        console.log(Utils.format.krex("CHECK COMPLETED! Final Statistics:"));
        console.log(Utils.format.krex("=".repeat(80)));
        console.log(Utils.format.krex(`• Total tokens processed: ${threadStats.completed}/${threadStats.total}`));
        console.log(Utils.format.krex(`• Valid tokens: ${stats.valid}`));
        console.log(Utils.format.krex(`• Invalid tokens: ${stats.invalid}`));
        console.log(Utils.format.krex(`• Nitro accounts: ${stats.nitro}`));
        console.log(Utils.format.krex(`• Total boosts: ${stats.boosts}`));
        console.log(Utils.format.krex(`• Payment methods found: ${stats.payments}`));
        console.log(Utils.format.krex(`• Errors encountered: ${stats.errors}`));
        console.log(Utils.format.krex(`• Rate limited: ${stats.rateLimited}`));
        console.log(Utils.format.krex(`• Processing time: ${duration.minutes}m ${duration.seconds}s`));
        console.log(Utils.format.krex(`• Threads used: ${threadCount}`));
        console.log(Utils.format.krex(`• Average rate: ${(stats.checked / (duration.total / 1000)).toFixed(2)} tokens/second`));
        
        const expectedTotal = threadStats.total;
        const actualProcessed = stats.valid + stats.invalid + stats.errors;
        console.log(Utils.format.krex(`• Processing accuracy: ${actualProcessed}/${expectedTotal} (${((actualProcessed/expectedTotal)*100).toFixed(1)}%)`));
        
        console.log(Utils.format.krex("=".repeat(80)));

        if (!this.threadManager.validateCompletion()) {
            console.log(Utils.format.warning("Warning: Token processing completion validation failed!"));
        }
    }

    displayStartInfo(totalTokens, threadCount, duplicatesRemoved) {
        console.log(Utils.format.krex(`Loaded ${totalTokens} unique tokens`));
        if (duplicatesRemoved > 0) {
            console.log(Utils.format.krex(`Removed ${duplicatesRemoved} duplicate tokens`));
        }
        console.log(Utils.format.krex(`Starting check with ${threadCount} threads...`));
        console.log(Utils.format.krex("=".repeat(80)));
    }

    displayError(message) {
        Utils.clearLine();
        console.log(Utils.format.krex(Utils.format.error(message)));
    }

    displayWarning(message) {
        Utils.clearLine();
        console.log(Utils.format.krex(Utils.format.warning(message)));
    }

    displayInfo(message) {
        Utils.clearLine();
        console.log(Utils.format.krex(Utils.format.info(message)));
    }
}

module.exports = ProgressDisplay;
