/**
 * Thread manager module
 * Handles token distribution and thread coordination with proper synchronization
 */

class ThreadManager {
    constructor(tokens) {
        this.tokens = [...tokens];
        this.currentIndex = 0;
        this.lock = false;
        this.totalTokens = this.tokens.length;
        this.completedTokens = new Set();
    }

    async getNextToken() {
        
        while (this.lock) {
            await this.sleep(1);
        }

        this.lock = true;

        try {
            
            if (this.currentIndex >= this.totalTokens) {
                return null;
            }

            const index = this.currentIndex;
            const token = this.tokens[index];
            
            this.currentIndex++;

            return {
                token: token,
                index: index
            };
        } finally {
            
            this.lock = false;
        }
    }

    markTokenCompleted(index) {
        this.completedTokens.add(index);
    }

    getProgress() {
        return {
            current: this.completedTokens.size,
            total: this.totalTokens,
            percentage: this.totalTokens > 0 ? Math.floor((this.completedTokens.size / this.totalTokens) * 100) : 0
        };
    }

    hasMoreTokens() {
        return this.currentIndex < this.totalTokens;
    }

    getRemainingCount() {
        return Math.max(0, this.totalTokens - this.currentIndex);
    }

    getCompletedCount() {
        return this.completedTokens.size;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    validateCompletion() {
        const expectedCompleted = this.totalTokens;
        const actualCompleted = this.completedTokens.size;
        
        if (actualCompleted !== expectedCompleted) {
            console.warn(`Warning: Expected ${expectedCompleted} completed tokens, but got ${actualCompleted}`);
            return false;
        }
        
        return true;
    }

    getStatistics() {
        return {
            total: this.totalTokens,
            processed: this.currentIndex,
            completed: this.completedTokens.size,
            remaining: this.getRemainingCount(),
            percentage: this.getProgress().percentage
        };
    }
}

module.exports = ThreadManager;
