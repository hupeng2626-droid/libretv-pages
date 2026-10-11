// 认证配置文件 - 从 config/master-config.js 同步
// 修复说明：原版在全局重复声明 generatePasswordHash 导致无限递归、哈希永远无法生成，
// 登录必然失败。本版本所有实现均在 IIFE 作用域内，不再覆盖全局函数。
(function () {
    'use strict';

    // 本地哈希实现（Web Crypto，HTTPS 环境下始终可用）
    async function computeHash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 获取（必要时计算）主配置中的密码哈希
    async function ensureHash() {
        const mc = window.MASTER_CONFIG;
        if (!mc || !mc.auth || !mc.auth.password) {
            console.error('❌ 主配置未加载或未设置密码');
            return null;
        }
        if (!mc.auth.passwordHash) {
            try {
                mc.auth.passwordHash = await computeHash(mc.auth.password);
                console.log('🔐 密码哈希已生成');
            } catch (error) {
                console.error('❌ 生成密码哈希失败:', error);
                return null;
            }
        }
        return mc.auth.passwordHash;
    }

    // 页面加载后尽快计算哈希并标记配置就绪
    (async function init() {
        let attempts = 0;
        while (!window.MASTER_CONFIG && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        try {
            await ensureHash();
        } catch (error) {
            console.error('❌ 认证配置初始化失败:', error);
        } finally {
            if (!window.MASTER_CONFIG_READY) {
                window.MASTER_CONFIG_READY = true;
                if (window.MASTER_CONFIG) {
                    window.dispatchEvent(new CustomEvent('masterConfigReady', {
                        detail: { config: window.MASTER_CONFIG }
                    }));
                }
            }
        }
    })();

    // AUTH_CONFIG：与主配置保持同步的只读视图（保持向后兼容）
    const AUTH_CONFIG = new Proxy({}, {
        get(target, prop) {
            const mc = window.MASTER_CONFIG;
            if (!mc) return undefined;
            switch (prop) {
                case 'enabled': return mc.auth.enabled;
                case 'username': return mc.auth.username;
                case 'password': return mc.auth.password;
                case 'passwordHash': return mc.auth.passwordHash;
                case 'sessionDuration': return mc.auth.sessionDuration;
                case 'localStorageKey': return 'authSession';
                case 'loginTitle': return (mc.ui && mc.ui.loginTitle) || 'LibreTV 访问验证';
                case 'loginPrompt': return (mc.ui && mc.ui.loginPrompt) || '请输入访问密码';
                case 'maxLoginAttempts': return mc.auth.maxLoginAttempts;
                case 'lockoutDuration': return mc.auth.lockoutDuration;
                default: return mc.auth[prop];
            }
        }
    });
    window.AUTH_CONFIG = AUTH_CONFIG;

    // 供 password.js / proxy-auth.js 调用
    window.getPasswordHash = ensureHash;
})();
