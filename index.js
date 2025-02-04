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
    SUPPORTS_COMMANDS: 1n << 23n,      // 8388608
    USES_AUTOMOD: 1n << 24n           // 16777216
};

const getBadges = (flags) => {
    const userFlags = BigInt(flags || 0);
    const badges = [];

    if (userFlags & BADGES.DISCORD_STAFF) badges.push("Discord Çalışanı");
    if (userFlags & BADGES.PARTNER) badges.push("Partner");
    if (userFlags & BADGES.HYPESQUAD_EVENTS) badges.push("HypeSquad Events");
    if (userFlags & BADGES.BUG_HUNTER_1) badges.push("Bug Avcısı 1");
    if (userFlags & BADGES.BRAVERY) badges.push("HypeSquad Bravery");
    if (userFlags & BADGES.BRILLIANCE) badges.push("HypeSquad Brilliance");
    if (userFlags & BADGES.BALANCE) badges.push("HypeSquad Balance");
    if (userFlags & BADGES.EARLY_SUPPORTER) badges.push("Erken Destekçi");
    if (userFlags & BADGES.BUG_HUNTER_2) badges.push("Bug Avcısı 2");
    if (userFlags & BADGES.VERIFIED_BOT_DEV) badges.push("Onaylı Bot Geliştirici");
    if (userFlags & BADGES.MOD_PROGRAM_ALUMNI) badges.push("Moderatör Programı Mezunu");
    if (userFlags & BADGES.ACTIVE_DEVELOPER) badges.push("Aktif Geliştirici");
    if (userFlags & BADGES.SUPPORTS_COMMANDS) badges.push("Komut Destekli");
    if (userFlags & BADGES.USES_AUTOMOD) badges.push("AutoMod Kullanıyor");

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

const getBoostBadge = (premiumSince) => {
    if (!premiumSince) return null;
    const months = Math.floor((Date.now() - new Date(premiumSince).getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months >= 24) return "2 Yıllık Booster";
    if (months >= 18) return "1.5 Yıllık Booster";
    if (months >= 15) return "1 Yıl 3 Aylık Booster";
    if (months >= 12) return "1 Yıllık Booster";
    if (months >= 9) return "9 Aylık Booster";
    if (months >= 6) return "6 Aylık Booster";
    if (months >= 3) return "3 Aylık Booster";
    if (months >= 2) return "2 Aylık Booster";
    return "1 Aylık Booster";
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
    highlight: (text) => chalk.magenta.bold(text)
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

async function checkToken(token, index) {
    let attempts = 0;
    
    while (attempts < CONFIG.retryLimit) {
        try {

            if (!token || token.length < 50) {
                clearLine();
                process.stdout.write(`${format.progress(index + 1, tokens.length)} ${format.error("GEÇERSİZ UZUNLUK")}: ${token}\n`);
                STATS.invalid++;
                return;
            }

            const userRes = await api.get("https://discord.com/api/v9/users/@me", {
                headers: { 
                    Authorization: token
                }
            });

            const user = userRes.data;
            const nitroType = user.premium_type || 0;
            const nitroBadge = getNitroBadge(nitroType);
            const boostBadge = getBoostBadge(user.premium_since);
            const badges = getBadges(user.public_flags);

            const [subscriptionsRes, paymentsRes] = await Promise.all([
                api.get("https://discord.com/api/v9/users/@me/billing/subscriptions", {
                    headers: { Authorization: token }
                }),
                api.get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
                    headers: { Authorization: token }
                })
            ]);

            const boosts = subscriptionsRes.data
                .filter(sub => sub.plan_id === "511651885459963904")
                .length;
            
            const paymentMethods = paymentsRes.data
                .map(p => `${p.type} (${p.invalid ? 'Geçersiz' : 'Geçerli'})`)
                .join(", ") || "Yok";

            const output = [
                `${format.progress(index + 1, tokens.length)} ${format.highlight("GEÇERLİ TOKEN")}`,
                `${format.info("Kullanıcı:")} ${user.username}#${user.discriminator} (${user.id})`,
                `${format.info("E-posta:")} ${user.email} [${user.verified ? "Doğrulanmış" : "Doğrulanmamış"}]`,
                `${format.info("Nitro:")} ${nitroBadge || "Yok"} ${boostBadge ? `| ${format.info("Boost Rozeti:")} ${boostBadge}` : ""} | ${format.info("Rozetler:")} ${badges}`,
                `${format.info("Boost:")} ${boosts} | ${format.info("Ödemeler:")} ${paymentMethods}`,
                `${format.info("Oluşturulma:")} ${formatCreationDate(new Date(user.id / 4194304 + 1420070400000))}`,
                `${format.info("Token:")} ${token}`,
                chalk.gray("=".repeat(80))
            ].join("\n");

            STATS.valid++;
            if (nitroType > 0) STATS.nitro++;
            if (boosts > 0) STATS.boosts += boosts;
            if (paymentMethods !== "Yok") STATS.payments++;

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
                    process.stdout.write(`${format.progress(index + 1, tokens.length)} ${format.error("GEÇERSİZ TOKEN")}: ${token}\n`);
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
        rl.question(chalk.yellow('Kaç thread kullanmak istersiniz? (1-100): '), (answer) => {
            const threads = parseInt(answer);
            if (isNaN(threads) || threads < 1 || threads > 100) {
                console.log(chalk.red('Geçersiz değer, varsayılan (1) kullanılıyor...'));
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
    const threadCount = await promptThreadCount();
    console.log(format.info(`${tokens.length} token kontrolü ${threadCount} thread ile başlatılıyor...`));
    
    await Promise.all([...Array(threadCount)].map(async () => {
        while (THREAD_STATE.currentIndex < tokens.length) {
            const index = await getNextIndex();
            if (index < tokens.length) {
                await checkToken(tokens[index], index);
                STATS.checked++;
                await sleep(CONFIG.requestDelay / threadCount);
            }
        }
    }));

    const duration = Date.now() - STATS.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);

    console.log(chalk.green("\nKontrol tamamlandı! İstatistikler:"));
    console.log(chalk.cyan(`• Geçerli token: ${STATS.valid}`));
    console.log(chalk.cyan(`• Nitro hesapları: ${STATS.nitro}`));
    console.log(chalk.cyan(`• Toplam boost: ${STATS.boosts}`));
    console.log(chalk.cyan(`• Bulunan ödeme yöntemleri: ${STATS.payments}`));
    console.log(chalk.yellow(`• Süre: ${minutes}d ${seconds}s`));
    console.log(chalk.yellow(`• Kullanılan thread: ${threadCount}`));
    
    rl.close();
    process.exit(0);
})();