/**
 * Token checker module
 * Main logic for checking individual tokens
 */

const fs = require("fs");
const chalk = require("chalk");
const Utils = require("./utils");
const { CONFIG } = require("./config");

class TokenChecker {
    constructor(apiClient, statistics) {
        this.apiClient = apiClient;
        this.statistics = statistics;
    }

    async checkToken(token, index) {
        try {
            
            if (!Utils.isValidToken(token)) {
                await this.handleInvalidToken(token, index, "Invalid Length");
                return { success: false, reason: "invalid_length" };
            }

            const userData = await this.apiClient.getAllUserData(token);
            
            const result = await this.processUserData(userData, token, index);
            
            this.saveValidToken(token);
            
            await this.updateStatistics(result);
            
            this.displayValidToken(result, index);
            
            return { success: true, data: result };

        } catch (error) {
            return await this.handleTokenError(error, token, index);
        }
    }

    async processUserData(userData, token, index) {
        const { user, profile, boosts, subscriptions, payments } = userData;

        const nitroType = user.premium_type || 0;
        const nitroBadge = Utils.getNitroBadge(nitroType);
        const premiumSince = profile.premium_since || user.premium_since;
        
        let badgesList = "None";
        let boostBadge = "None";
        let nitroTier = "None";

        if (profile.badges && profile.badges.length > 0) {

            const boostBadgeData = profile.badges.find(badge => badge.id.startsWith('guild_booster_'));
            if (boostBadgeData) {
                boostBadge = boostBadgeData.description;
            }

            const premiumBadgeData = profile.badges.find(badge => 
                badge.id.startsWith('premium_tenure_') || 
                (badge.description && badge.description.includes("months:"))
            );

            if (premiumBadgeData) {
                const tierMatch = premiumBadgeData.description.match(/(\d+)\s*months?:\s*(\w+)/i);
                if (tierMatch) {
                    nitroTier = `${tierMatch[2]} (${tierMatch[1]} Months)`;
                } else {
                    nitroTier = premiumBadgeData.description.replace(/Earned.*?\.\s*/i, '');
                }
            }
            
            if (nitroTier === "None" && nitroType > 0 && premiumSince) {
                nitroTier = Utils.getNitroTier(premiumSince);
            }

            badgesList = profile.badges
                .filter(badge => !badge.id.startsWith('guild_booster_') && !badge.id.startsWith('premium_tenure_'))
                .map(badge => badge.description)
                .join(", ") || "None";
        }

        const activeBoosts = boosts.filter(slot => slot.premium_guild_subscription).length;
        const totalBoosts = boosts.length;
        const availableBoosts = totalBoosts - activeBoosts;

        const paymentMethods = Utils.formatPaymentMethods(payments);

        const nitroRemaining = Utils.getNitroRemaining(subscriptions);

        const phoneVerified = user.phone ? "Verified" : "Not Verified";

        const creationDate = Utils.formatCreationDate(new Date(user.id / 4194304 + 1420070400000));

        return {
            user,
            username: `${user.username}#${user.discriminator}`,
            email: user.email,
            emailVerified: user.verified,
            phone: user.phone || "None",
            phoneVerified,
            nitroType: nitroBadge || "None",
            nitroTier,
            boostBadge,
            badges: badgesList,
            nitroRemaining: nitroRemaining || "None",
            boosts: {
                active: activeBoosts,
                available: availableBoosts,
                total: totalBoosts
            },
            payments: paymentMethods,
            createdAt: creationDate,
            token,
            hasNitro: nitroType > 0,
            hasBoosts: totalBoosts > 0,
            hasPayments: payments.length > 0
        };
    }

    async updateStatistics(result) {
        await this.statistics.incrementValid();
        
        if (result.hasNitro) {
            await this.statistics.incrementNitro();
        }
        
        if (result.hasBoosts) {
            await this.statistics.addBoosts(result.boosts.total);
        }
        
        if (result.hasPayments) {
            await this.statistics.addPayments(result.payments.split(',').length);
        }
    }

    displayValidToken(result, index) {
        Utils.clearLine();
        
        const output = [
            `${Utils.format.krex(Utils.format.progress(index + 1, this.statistics.getStats().checked + 1))}`,
            Utils.format.krex(`${Utils.format.info(Utils.format.highlight("VALID TOKEN"))}`),
            Utils.format.krex(`${Utils.format.info("User:")} ${result.username} (${result.user.id})`),
            Utils.format.krex(`${Utils.format.info("Email:")} ${result.email} [${result.emailVerified ? "Verified" : "Unverified"}]`),
            Utils.format.krex(`${Utils.format.info("Phone:")} ${result.phone} [${result.phoneVerified}]`),
            Utils.format.krex(`${Utils.format.info("Nitro Type:")} ${result.nitroType}`),
            Utils.format.krex(`${Utils.format.info("Nitro Tier:")} ${result.nitroTier}`),
            Utils.format.krex(`${Utils.format.info("Boost Badge:")} ${result.boostBadge}`),
            Utils.format.krex(`${Utils.format.info("Badges:")} ${result.badges}`),
            Utils.format.krex(`${Utils.format.info("Remaining Nitro Time:")} ${result.nitroRemaining}`),
            Utils.format.krex(`${Utils.format.info("Boost:")} ${result.boosts.active} used, ${result.boosts.available} available, ${result.boosts.total} total`),
            Utils.format.krex(`${Utils.format.info("Payments:")} ${result.payments}`),
            Utils.format.krex(`${Utils.format.info("Created At:")} ${result.createdAt}`),
            Utils.format.krex(`${Utils.format.info("Token:")} ${result.token}`),
            chalk.gray("=".repeat(80))
        ].join("\n");

        console.log(output);
    }

    async handleInvalidToken(token, index, reason) {
        Utils.clearLine();
        process.stdout.write(Utils.format.krex(`${Utils.format.progress(index + 1, index + 1)} ${Utils.format.error(`INVALID TOKEN (${reason})`)}: ${token}\n`));
        await this.statistics.incrementInvalid();
    }

    async handleTokenError(error, token, index) {
        if (error.message.startsWith('INVALID_TOKEN:')) {
            await this.handleInvalidToken(token, index, "Unauthorized");
            return { success: false, reason: "unauthorized" };
        }

        Utils.clearLine();
        process.stdout.write(Utils.format.krex(`${Utils.format.progress(index + 1, index + 1)} ${Utils.format.error("ERROR")}: ${error.message || "Unknown error"}\n`));
        await this.statistics.incrementErrors();
        return { success: false, reason: "error", error: error.message };
    }

    saveValidToken(token) {
        if (CONFIG.saveValid) {
            try {
                fs.appendFileSync("valid.txt", `${token}\n`, "utf8");
            } catch (error) {
                console.error("Failed to save valid token:", error.message);
            }
        }
    }
}

module.exports = TokenChecker;
