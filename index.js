const axios = require("axios");
const fs = require("fs");
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const readline = require("readline");

const CONFIG = {
    retryLimit: 3,
    requestDelay: 1500,
    timeout: 5000,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    saveValid: true,
    maxConcurrent: 1
};

const THREAD_STATE = {
    currentIndex: 0,
    lock: false
};

const BADGES = {
    DISCORD_STAFF: 1n << 0n,           // 1
    PARTNER: 1n << 1n,                 // 2
    HYPESQUAD_EVENTS: 1n << 2n,        // 4
    BUG_HUNTER_1: 1n << 3n,           // 8
    BRAVERY: 1n << 6n,                // 64
    BRILLIANCE: 1n << 7n,             // 128
    BALANCE: 1n << 8n,                // 256
    EARLY_SUPPORTER: 1n << 9n,        // 512
    BUG_HUNTER_2: 1n << 14n,          // 16384
    VERIFIED_BOT_DEV: 1n << 17n,      // 131072
    MOD_PROGRAM_ALUMNI: 1n << 18n,    // 262144
    ACTIVE_DEVELOPER: 1n << 22n,      // 4194304
    QUEST_COMPLETED: 1n << 35n         // Changed to correct bit position (34359738368)
};

const getBadges = (flags, publicFlagsExt) => {
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

    return badges.length ? badges.join(", ") : "Yok";
};

const getNitroBadge = (premiumType) => {
    switch(premiumType) {
        case 1: return "Nitro Classic";
        case 2: return "Nitro";
        case 3: return "Nitro Basic";
        default: return null;
    }
};

const getNitroTier = (premiumSince) => {
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
};

const getBoostBadge = (premiumSince) => {
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
};

const getNitroRemaining = (subscriptions) => {
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
};

const STATS = {
    checked: 0,
    valid: 0,
    invalid: 0,
    nitro: 0,
    boosts: 0,
    payments: 0,
    startTime: Date.now()
};

const api = axios.create({
    timeout: CONFIG.timeout,
    headers: {
        "User-Agent": CONFIG.userAgent,
        "X-Super-Properties": Buffer.from(JSON.stringify({
            os: "Windows",
            browser: "Chrome",
            device: "",
            system_locale: "en-US",
            browser_user_agent: CONFIG.userAgent,
            browser_version: "120.0.0.0",
            os_version: "10",
            referrer: "",
            referring_domain: "",
            referrer_current: "",
            referring_domain_current: "",
            release_channel: "stable",
            client_build_number: 123456,
            client_event_source: null
        })).toString("base64")
    }
});

const tokens = [...new Set(fs.readFileSync("tokens.txt", "utf8").split("\n").map(t => t.trim()).filter(Boolean))];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const format = {
    progress: (current, total) => chalk.blue(`[${current.toString().padStart(total.toString().length, '0')}/${total}]`),
    success: (text) => chalk.green.bold(text),
    error: (text) => chalk.red.bold(text),
    warning: (text) => chalk.yellow.bold(text),
    info: (text) => chalk.cyan.bold(text),
    highlight: (text) => chalk.magenta.bold(text),
    krex: (text) => chalk.blue.bold(`[Krex Developments] ${text}`)
};

const showBanner = () => {
    console.log(chalk.blue.bold(`
                                ██╗  ██╗██████╗ ███████╗██╗  ██╗
                                ██║ ██╔╝██╔══██╗██╔════╝╚██╗██╔╝
                                █████╔╝ ██████╔╝█████╗   ╚███╔╝ 
                                ██╔═██╗ ██╔══██╗██╔══╝   ██╔██╗ 
                                ██║  ██╗██║  ██║███████╗██╔╝ ██╗
                                ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`));
    console.log(chalk.blue.bold(`                                   Development Token Checker v1.0.0\n`));
};

const saveValidToken = (token) => {
    if (CONFIG.saveValid) {
        fs.appendFileSync("valid.txt", `${token}\n`, "utf8");
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const clearLine = () => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
};

const formatCreationDate = (timestamp) => {
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
};

const PAYMENT_TYPES = {
    1: "Credit Card",
    2: "PayPal",
    3: "Paysafecard",
    4: "YouTube",
    8: "Operator",
    9: "Server Subscription",
    13: "Apple Store"
};

async function checkToken(token, index) {
    let attempts = 0;
    
    while (attempts < CONFIG.retryLimit) {
        try {

            if (!token || token.length < 50) {
                clearLine();
                process.stdout.write(format.krex(`${format.progress(index + 1, tokens.length)} ${format.error("Invalid Length")}: ${token}\n`));
                STATS.invalid++;
                return;
            }

            const userRes = await api.get("https://discord.com/api/v9/users/@me", {
                headers: { 
                    Authorization: token
                }
            });

            const user = userRes.data;
            
            // Get detailed profile data from the new API endpoint
            const profileData = await api.get(`https://discord.com/api/v9/users/${user.id}/profile?with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`, {
                headers: { Authorization: token }
            }).catch(() => ({ data: { user: { public_flags_ext: 0 }, badges: [] } }));

            // Extract relevant information from profile data
            const nitroType = user.premium_type || 0;
            const nitroBadge = getNitroBadge(nitroType);
            
            // Get premium info
            const premiumSince = profileData.data.premium_since || user.premium_since;
            
            // Get boost badge from the profile data
            let boostBadge = "None";
            if (profileData.data.badges) {
                const boostBadgeData = profileData.data.badges.find(badge => badge.id.startsWith('guild_booster_'));
                if (boostBadgeData) {
                    boostBadge = boostBadgeData.description;
                }
            }

            // Debug log the badge data
            // console.log("Profile data badges:", JSON.stringify(profileData.data.badges, null, 2));

            // Get premium badge directly from the profile data
            let nitroTier = "None";
            if (profileData.data.badges && profileData.data.badges.length > 0) {
                // First, try to find a premium badge
                const premiumBadgeData = profileData.data.badges.find(badge => 
                    badge.id.startsWith('premium_tenure_') || 
                    (badge.description && badge.description.includes("months:"))
                );

                if (premiumBadgeData) {
                    // Try to extract the tier directly from the description
                    const tierMatch = premiumBadgeData.description.match(/(\d+)\s*months?:\s*(\w+)/i);
                    if (tierMatch) {
                        const months = tierMatch[1];
                        const tier = tierMatch[2];
                        nitroTier = `${tier} (${months} Months)`;
                    } else {
                        // If we can't extract the specific format, use the full description
                        nitroTier = premiumBadgeData.description;
                        
                        // Try to clean up the description if it contains an "Earned" prefix
                        if (nitroTier.includes("Earned")) {
                            nitroTier = nitroTier.replace(/Earned.*?\.\s*/i, '');
                        }
                    }
                }
                
                // If we still don't have a tier but user has Nitro
                if (nitroTier === "None" && nitroType > 0 && premiumSince) {
                    // Fall back to calculation based on premium_since
                    nitroTier = getNitroTier(premiumSince);
                }
            }

            // Format badges from profile data
            let badgesList = "None";
            if (profileData.data.badges && profileData.data.badges.length > 0) {
                badgesList = profileData.data.badges
                    .filter(badge => !badge.id.startsWith('guild_booster_') && !badge.id.startsWith('premium_tenure_'))
                    .map(badge => badge.description)
                    .join(", ");
            }
            
            const phoneVerified = user.phone ? "Verified" : "Not Verified";

            const [guildBoosts, subscriptionsRes, paymentsRes] = await Promise.all([
                api.get("https://discord.com/api/v9/users/@me/guilds/premium/subscription-slots", {
                    headers: { Authorization: token }
                }).catch(() => ({ data: [] })),
                api.get("https://discord.com/api/v9/users/@me/billing/subscriptions", {
                    headers: { Authorization: token }
                }),
                api.get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
                    headers: { Authorization: token }
                })
            ]);

            const activeBoosts = guildBoosts.data.filter(slot => slot.premium_guild_subscription).length;
            const totalBoosts = guildBoosts.data.length;
            const availableBoosts = totalBoosts - activeBoosts;

            const paymentMethods = paymentsRes.data.map(p => {
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
            }).join(", ") || "Blank";

            const nitroRemaining = getNitroRemaining(subscriptionsRes.data);
    
const output = [
    `${format.krex(format.progress(index + 1, tokens.length))}`,
    format.krex(`${format.info(format.highlight("VALID TOKEN"))}`),
    format.krex(`${format.info("User:")} ${user.username}#${user.discriminator} (${user.id})`),
    format.krex(`${format.info("Email:")} ${user.email} [${user.verified ? "Verified" : "Unverified"}]`),
    format.krex(`${format.info("Phone:")} ${user.phone || "None"} [${phoneVerified}]`),
    format.krex(`${format.info("Nitro Type:")} ${nitroBadge || "None"}`),
    format.krex(`${format.info("Nitro Tier:")} ${nitroTier}`),
    format.krex(`${format.info("Boost Badge:")} ${boostBadge || "None"}`),
    format.krex(`${format.info("Badges:")} ${badgesList}`),
    format.krex(`${format.info("Remaining Nitro Time:")} ${nitroRemaining || "None"}`),
    format.krex(`${format.info("Boost:")} ${activeBoosts} used, ${availableBoosts} available, ${totalBoosts} total`),
    format.krex(`${format.info("Payments:")} ${paymentMethods}`),
    format.krex(`${format.info("Created At:")} ${formatCreationDate(new Date(user.id / 4194304 + 1420070400000))}`),
    format.krex(`${format.info("Token:")} ${token}`),
    chalk.gray("=".repeat(80))
].join("\n");

            STATS.valid++;
            if (nitroType > 0) STATS.nitro++;
            if (totalBoosts > 0) STATS.boosts += totalBoosts;
            if (paymentsRes.data.length > 0) STATS.payments += paymentsRes.data.length;

            saveValidToken(token);
            clearLine();
            console.log(output);
            return;

        } catch (error) {
            if (error.response) {

                if (error.response.status === 429) {
                    const retryAfter = parseInt(error.response.data.retry_after || 5) * 1000;
                    await sleep(retryAfter);
                    attempts++;
                    continue;
                }
                
                if (error.response.status === 401 || error.response.status === 403) {
                    clearLine();
                    process.stdout.write(format.krex(`${format.progress(index + 1, tokens.length)} ${format.error("INVALID TOKEN")}: ${token}\n`));
                    STATS.invalid++;
                    return;
                }
            }

            attempts++;
            await sleep(CONFIG.requestDelay);
        }
    }
}

const promptThreadCount = () => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('Thread Count? (1-100): '), (answer) => {
            const threads = parseInt(answer);
            if (isNaN(threads) || threads < 1 || threads > 100) {
                console.log(chalk.red('Invalid Choice, using (1)...'));
                resolve(1);
            } else {
                resolve(threads);
            }
        });
    });
};

const getNextIndex = async () => {
    while (THREAD_STATE.lock) {
        await sleep(10);
    }
    THREAD_STATE.lock = true;
    const index = THREAD_STATE.currentIndex++;
    THREAD_STATE.lock = false;
    return index;
};

(async () => {
    showBanner();
    const threadCount = await promptThreadCount();
    
    // Make sure we don't use more threads than tokens
    const effectiveThreadCount = Math.min(threadCount, tokens.length);
    
    console.log(format.krex(`${tokens.length} checking tokens ${effectiveThreadCount} thread count...`));
    
    if (tokens.length === 0) {
        console.log(format.krex(`${format.error("No tokens found")} in tokens.txt. Please add some tokens and try again.`));
        rl.close();
        process.exit(0);
        return;
    }
    
    // Set up progress display
    let progressInterval = setInterval(() => {
        clearLine();
        process.stdout.write(format.krex(`Progress: ${STATS.checked}/${tokens.length} (${Math.floor(STATS.checked/tokens.length*100)}%) - Valid: ${STATS.valid}, Invalid: ${STATS.invalid}\r`));
    }, 1000);
    
    try {
        await Promise.all([...Array(effectiveThreadCount)].map(async (_, threadIndex) => {
            while (THREAD_STATE.currentIndex < tokens.length) {
                const index = await getNextIndex();
                if (index < tokens.length) {
                    try {
                        await checkToken(tokens[index], index);
                    } catch (error) {
                        console.error(`Thread ${threadIndex} error:`, error.message);
                    }
                    STATS.checked++;
                    await sleep(CONFIG.requestDelay / effectiveThreadCount);
                }
            }
        }));
    } catch (error) {
        console.error("An error occurred:", error.message);
    } finally {
        clearInterval(progressInterval);
    }

    const duration = Date.now() - STATS.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);

    console.log(chalk.blue.bold("\n[Krex Developments] Check completed! Statistics:"));
    console.log(format.krex(`• Valid tokens: ${STATS.valid}`));
    console.log(format.krex(`• Nitro accounts: ${STATS.nitro}`));
    console.log(format.krex(`• Total boosts: ${STATS.boosts}`));
    console.log(format.krex(`• Found payment methods: ${STATS.payments}`));
    console.log(format.krex(`• Duration: ${minutes}m ${seconds}s`));
    console.log(format.krex(`• Threads used: ${effectiveThreadCount}`));
    
    rl.close();
    process.exit(0);
})();
