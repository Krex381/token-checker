/**
 * Utility functions module
 * Contains helper functions for formatting, date handling, and other utilities
 */

const chalk = require("chalk");
const { BADGES, PAYMENT_TYPES } = require("./config");

class Utils {
    static format = {
        progress: (current, total) => chalk.blue(`[${current.toString().padStart(total.toString().length, '0')}/${total}]`),
        success: (text) => chalk.green.bold(text),
        error: (text) => chalk.red.bold(text),
        warning: (text) => chalk.yellow.bold(text),
        info: (text) => chalk.cyan.bold(text),
        highlight: (text) => chalk.magenta.bold(text),
        krex: (text) => chalk.blue.bold(`[Krex Developments] ${text}`)
    };

    static showBanner() {
        console.log(chalk.blue.bold(`
                                ██╗  ██╗██████╗ ███████╗██╗  ██╗
                                ██║ ██╔╝██╔══██╗██╔════╝╚██╗██╔╝
                                █████╔╝ ██████╔╝█████╗   ╚███╔╝ 
                                ██╔═██╗ ██╔══██╗██╔══╝   ██╔██╗ 
                                ██║  ██╗██║  ██║███████╗██╔╝ ██╗
                                ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`));
        console.log(chalk.blue.bold(`                                   Professional Token Checker v2.0.0\n`));
    }

    static getBadges(flags, publicFlagsExt) {
        const userFlags = BigInt(flags || 0) | BigInt(publicFlagsExt || 0);
        const badges = [];

        if (userFlags & BADGES.DISCORD_STAFF) badges.push("Discord Staff");
        if (userFlags & BADGES.PARTNER) badges.push("Partner");
        if (userFlags & BADGES.HYPESQUAD_EVENTS) badges.push("HypeSquad Events");
        if (userFlags & BADGES.BUG_HUNTER_1) badges.push("Bug Hunter 1");
        if (userFlags & BADGES.BRAVERY) badges.push("HypeSquad Bravery");
        if (userFlags & BADGES.BRILLIANCE) badges.push("HypeSquad Brilliance");
        if (userFlags & BADGES.BALANCE) badges.push("HypeSquad Balance");
        if (userFlags & BADGES.EARLY_SUPPORTER) badges.push("Early Supporter");
        if (userFlags & BADGES.BUG_HUNTER_2) badges.push("Bug Hunter 2");
        if (userFlags & BADGES.VERIFIED_BOT_DEV) badges.push("Verified Bot Developer");
        if (userFlags & BADGES.MOD_PROGRAM_ALUMNI) badges.push("Moderator Program Alumni");
        if (userFlags & BADGES.ACTIVE_DEVELOPER) badges.push("Active Developer");
        if (userFlags & BADGES.QUEST_COMPLETED) badges.push("Quest Completed");
        if (userFlags & BADGES.ORB_PROFILE_BADGE) badges.push("Orb Profile Badge");

        return badges.length ? badges.join(", ") : "None";
    }

    static getNitroBadge(premiumType) {
        switch(premiumType) {
            case 1: return "Nitro Classic";
            case 2: return "Nitro";
            case 3: return "Nitro Basic";
            default: return null;
        }
    }

    static getNitroTier(premiumSince) {
        if (!premiumSince) return null;
        const months = Math.floor((Date.now() - new Date(premiumSince).getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        if (months >= 72) return "Opal (72+ Months)";
        if (months >= 60) return "Ruby (60 Months)";
        if (months >= 36) return "Emerald (36 Months)";
        if (months >= 24) return "Diamond (24 Months)";
        if (months >= 12) return "Platinum (12 Months)";
        if (months >= 6) return "Gold (6 Months)";
        if (months >= 3) return "Silver (3 Months)";
        return "Bronze (1 Month)";
    }

    static getBoostBadge(premiumSince) {
        if (!premiumSince) return null;
        const months = Math.floor((Date.now() - new Date(premiumSince).getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        if (months >= 24) return "2 Year Booster";
        if (months >= 18) return "1.5 Year Booster";
        if (months >= 15) return "1 Year 3 Month Booster";
        if (months >= 12) return "1 Year Booster";
        if (months >= 9) return "9 Month Booster";
        if (months >= 6) return "6 Month Booster";
        if (months >= 3) return "3 Month Booster";
        if (months >= 2) return "2 Month Booster";
        return "1 Month Booster";
    }

    static getNitroRemaining(subscriptions) {
        if (!subscriptions || !subscriptions.length) return null;
        
        const nitroSub = subscriptions.find(sub => 
            sub.type === 2 || // Discord Nitro
            sub.type === 1 || // Classic
            sub.type === 3    // Basic
        );

        if (!nitroSub) return null;

        try {
            let endDate;
            if (nitroSub.trial_ends_at) {
                endDate = new Date(nitroSub.trial_ends_at);
                const now = new Date();
                const diff = endDate - now;

                if (diff <= 0) return "Nitro Trial has ended";

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                return `Trial: ${days} Day ${hours} Hour ${minutes} Minute`;
            }

            endDate = new Date(nitroSub.current_period_end || nitroSub.ends_at);
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) return "Ended";

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return `${days} Day ${hours} Hour ${minutes} Minute`;
        } catch (error) {
            return "Ended";
        }
    }

    static formatCreationDate(timestamp) {
        const created = new Date(timestamp);
        const now = new Date();
        const diff = now - created;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        const fullDate = created.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let age = '';
        if (weeks > 0) age = `${weeks}w `;
        if (days % 7 > 0) age += `${days % 7}d `;
        if (hours % 24 > 0) age += `${hours % 24}h `;
        if (minutes % 60 > 0) age += `${minutes % 60}m `;
        if (seconds % 60 > 0) age += `${seconds % 60}s`;

        return `${fullDate} (${age.trim()} ago)`;
    }

    static formatPaymentMethods(paymentSources) {
        return paymentSources.map(p => {
            let details = "";
            if (p.type === 1) {
                details = `${p.brand.toUpperCase()} *${p.last_4}`;
                if (p.expires_month && p.expires_year) {
                    details += ` (${p.expires_month}/${p.expires_year})`;
                }
                if (p.billing_address?.country) {
                    details += ` - ${p.billing_address.country}`;
                }
            } else {
                details = PAYMENT_TYPES[p.type] || `Unknown (${p.type})`;
            }
            
            const status = p.invalid ? 'Invalid' : p.deleted_at ? 'Deleted' : 'Valid';
            return `${details} [${status}]`;
        }).join(", ") || "None";
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static clearLine() {
        const readline = require("readline");
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
    }

    static isValidToken(token) {
        return token && typeof token === 'string' && token.trim().length >= 50;
    }

    static sanitizeToken(token) {
        return token ? token.trim() : '';
    }
}

module.exports = Utils;
