/**
 * Configuration module for Discord Token Checker
 * Contains all application settings and constants
 */

const CONFIG = {
    retryLimit: 2,
    requestDelay: 800,
    timeout: 8000,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    saveValid: true,
    maxConcurrent: 100,
    minTokenLength: 50,
    useSecureClient: true,
    randomizeRequests: true,
    humanLikeTiming: false,
    fingerprintEvasion: true,
    maxRequestsPerMinute: 60,
    jitterRange: [100, 300],
    sessionRotationInterval: 1800000,
    fastMode: true,
    parallelRequests: true,
    connectionPooling: true,
    minDelayBetweenRequests: 200
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
    QUEST_COMPLETED: 1n << 35n,       // Changed to correct bit position (34359738368)
    ORB_PROFILE_BADGE: 1n << 36n      // Orb Profile Badge (68719476736)
};

const PROFILE_BADGES = {
    ORB_PROFILE_BADGE: {
        id: "orb_profile_badge",
        description: "Collected the Orb Profile Badge",
        icon: "83d8a1eb09a8d64e59233eec5d4d5c2d"
    }
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

const API_ENDPOINTS = {
    USER_INFO: "https://discord.com/api/v9/users/@me",
    USER_PROFILE: (userId) => `https://discord.com/api/v9/users/${userId}/profile?with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`,
    GUILD_BOOSTS: "https://discord.com/api/v9/users/@me/guilds/premium/subscription-slots",
    SUBSCRIPTIONS: "https://discord.com/api/v9/users/@me/billing/subscriptions",
    PAYMENT_SOURCES: "https://discord.com/api/v9/users/@me/billing/payment-sources"
};

module.exports = {
    CONFIG,
    BADGES,
    PROFILE_BADGES,
    PAYMENT_TYPES,
    API_ENDPOINTS
};
