/**
 * Discord Token Checker - Professional Edition v2.0.0
 * A modular, thread-safe Discord token validation system
 * Author: Krex Developments
 */

const readline = require("readline");
const chalk = require("chalk");

// Import all modules
const { CONFIG } = require("./modules/config");
const Statistics = require("./modules/statistics");
const Utils = require("./modules/utils");
const SecureApiClient = require("./modules/secureApiClient");
const ThreadManager = require("./modules/threadManager");
const TokenChecker = require("./modules/tokenChecker");
const FileManager = require("./modules/fileManager");
const ProgressDisplay = require("./modules/progressDisplay");

class TokenCheckerApp {
    constructor() {
        this.fileManager = new FileManager();
        this.statistics = new Statistics();
        
        this.apiClient = new SecureApiClient();
        
        this.tokenChecker = new TokenChecker(this.apiClient, this.statistics);
        this.threadManager = null;
        this.progressDisplay = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(chalk.green.bold("[SECURITY] Enhanced security mode enabled"));
    }

    async initialize() {
        try {
            Utils.showBanner();
            
            const tokenData = this.fileManager.loadTokens();
            if (tokenData.tokens.length === 0) {
                throw new Error("No tokens found in tokens.txt. Please add some tokens and try again.");
            }

            this.threadManager = new ThreadManager(tokenData.tokens);
            this.progressDisplay = new ProgressDisplay(this.statistics, this.threadManager);

            this.fileManager.ensureValidFile();

            return tokenData;
        } catch (error) {
            console.error(Utils.format.krex(Utils.format.error(error.message)));
            this.cleanup();
            process.exit(1);
        }
    }

    async promptThreadCount() {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow('Thread Count? (1-100): '), (answer) => {
                const threads = parseInt(answer);
                if (isNaN(threads) || threads < 1 || threads > 100) {
                    console.log(chalk.red('Invalid choice, using (1)...'));
                    resolve(1);
                } else {
                    resolve(threads);
                }
            });
        });
    }

    async processTokens(threadCount) {
        const effectiveThreadCount = Math.min(threadCount, this.threadManager.totalTokens);
        
        this.progressDisplay.startProgressDisplay();

        try {
            
            const workers = Array.from({ length: effectiveThreadCount }, (_, threadIndex) => 
                this.createWorker(threadIndex)
            );

            await Promise.all(workers);

            this.threadManager.validateCompletion();

        } catch (error) {
            console.error(Utils.format.krex(Utils.format.error(`Processing error: ${error.message}`)));
        } finally {
            this.progressDisplay.stopProgressDisplay();
        }

        return effectiveThreadCount;
    }

    async createWorker(threadIndex) {
        while (this.threadManager.hasMoreTokens()) {
            const tokenData = await this.threadManager.getNextToken();
            
            if (!tokenData) {
                break;
            }

            try {
                const result = await this.tokenChecker.checkToken(tokenData.token, tokenData.index);
                
                this.threadManager.markTokenCompleted(tokenData.index);
                await this.statistics.incrementChecked();

                if (this.threadManager.hasMoreTokens()) {
                    await Utils.sleep(CONFIG.requestDelay / Math.min(threadIndex + 1, 3));
                }

            } catch (error) {
                console.error(`Worker ${threadIndex} error processing token ${tokenData.index}:`, error.message);
                this.threadManager.markTokenCompleted(tokenData.index);
                await this.statistics.incrementErrors();
            }
        }
    }

    displayResults(tokenData, threadCount) {
        this.progressDisplay.displayFinalStatistics(threadCount);
        
        if (tokenData.duplicatesRemoved > 0) {
            console.log(Utils.format.krex(Utils.format.warning(`Note: ${tokenData.duplicatesRemoved} duplicate tokens were automatically removed`)));
        }

        console.log(Utils.format.krex(Utils.format.info("Valid tokens have been saved to 'valid.txt'")));
    }

    cleanup() {
        if (this.progressDisplay) {
            this.progressDisplay.stopProgressDisplay();
        }
    }
    
    async waitForUserInput() {
        return new Promise((resolve) => {
            this.rl.question(chalk.green('\nPress Enter to exit...'), () => {
                resolve();
            });
        });
    }

    async run() {
        try {
            
            const tokenData = await this.initialize();
            
            const threadCount = await this.promptThreadCount();
            
            this.progressDisplay.displayStartInfo(tokenData.tokens.length, threadCount, tokenData.duplicatesRemoved);
            
            const effectiveThreadCount = await this.processTokens(threadCount);
            
            this.displayResults(tokenData, effectiveThreadCount);
            
            await this.waitForUserInput();
            
        } catch (error) {
            console.error(Utils.format.krex(Utils.format.error(`Application error: ${error.message}`)));
            await this.waitForUserInput();
        } finally {
            if (this.rl) {
                this.rl.close();
            }
            process.exit(0);
        }
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    if (global.appInstance && global.appInstance.rl) {
        global.appInstance.rl.close();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    if (global.appInstance && global.appInstance.rl) {
        global.appInstance.rl.close();
    }
    process.exit(0);
});

(async () => {
    const app = new TokenCheckerApp();
    global.appInstance = app;
    await app.run();
})();
