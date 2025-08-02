/**
 * File manager module
 * Handles reading tokens and managing output files
 */

const fs = require("fs");
const path = require("path");

class FileManager {
    constructor() {
        this.tokenFile = "tokens.txt";
        this.validFile = "valid.txt";
    }

    loadTokens() {
        try {
            if (!fs.existsSync(this.tokenFile)) {
                throw new Error(`Token file '${this.tokenFile}' not found`);
            }

            const content = fs.readFileSync(this.tokenFile, "utf8");
            const tokens = content
                .split("\n")
                .map(token => token.trim())
                .filter(token => token.length > 0);

            const uniqueTokens = [...new Set(tokens)];

            return {
                tokens: uniqueTokens,
                total: uniqueTokens.length,
                duplicatesRemoved: tokens.length - uniqueTokens.length
            };
        } catch (error) {
            throw new Error(`Failed to load tokens: ${error.message}`);
        }
    }

    ensureValidFile() {
        try {
            if (!fs.existsSync(this.validFile)) {
                fs.writeFileSync(this.validFile, "", "utf8");
            }
        } catch (error) {
            console.warn(`Warning: Could not create valid tokens file: ${error.message}`);
        }
    }

    saveValidToken(token) {
        try {
            fs.appendFileSync(this.validFile, `${token}\n`, "utf8");
        } catch (error) {
            console.error(`Failed to save valid token: ${error.message}`);
        }
    }

    getValidTokensCount() {
        try {
            if (!fs.existsSync(this.validFile)) {
                return 0;
            }
            const content = fs.readFileSync(this.validFile, "utf8");
            return content.trim().split("\n").filter(line => line.trim().length > 0).length;
        } catch (error) {
            return 0;
        }
    }

    backupValidFile() {
        try {
            if (fs.existsSync(this.validFile)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                const backupFile = `valid_backup_${timestamp}.txt`;
                fs.copyFileSync(this.validFile, backupFile);
                return backupFile;
            }
        } catch (error) {
            console.warn(`Warning: Could not backup valid tokens file: ${error.message}`);
        }
        return null;
    }

    clearValidFile() {
        try {
            fs.writeFileSync(this.validFile, "", "utf8");
        } catch (error) {
            console.warn(`Warning: Could not clear valid tokens file: ${error.message}`);
        }
    }

    getFileStats() {
        const stats = {
            tokenFile: {
                exists: fs.existsSync(this.tokenFile),
                size: 0
            },
            validFile: {
                exists: fs.existsSync(this.validFile),
                size: 0,
                count: 0
            }
        };

        try {
            if (stats.tokenFile.exists) {
                stats.tokenFile.size = fs.statSync(this.tokenFile).size;
            }
            if (stats.validFile.exists) {
                stats.validFile.size = fs.statSync(this.validFile).size;
                stats.validFile.count = this.getValidTokensCount();
            }
        } catch (error) {
            console.warn(`Warning: Could not get file stats: ${error.message}`);
        }

        return stats;
    }
}

module.exports = FileManager;
