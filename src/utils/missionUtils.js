// src/utils/missionUtils.js
/**
 * ミッション関連の共通ユーティリティ
 */

// ミッションID → APIエンドポイントのマッピング
export const MISSION_ENDPOINTS = {
    'daily_login': '/mission/daily-login/claim',
    'daily_coupon': '/mission/daily-coupon/claim',
    'first_listing': '/mission/first-listing/claim',
    'first_purchase': '/mission/first-purchase/claim',
    'login_streak_3': '/mission/login-streak/claim',
    'weekly_likes': '/mission/weekly-likes/claim',
};

// ミッションID → アイコンのマッピング
export const MISSION_ICONS = {
    'daily_login': '📅',
    'daily_coupon': '🎫',
    'first_listing': '📦',
    'first_purchase': '🛒',
    'login_streak_3': '🔥',
    'weekly_likes': '❤️',
};

// ミッションリセットタイプ → バッジ情報
export const MISSION_RESET_BADGES = {
    'daily': { label: '毎日', color: '#4caf50' },
    'weekly': { label: '毎週', color: '#2196f3' },
    'once': { label: '一回限り', color: '#ff9800' },
};

/**
 * ミッションアイコンを取得
 */
export const getMissionIcon = (missionId) => MISSION_ICONS[missionId] || '🎯';

/**
 * リセットバッジ情報を取得
 */
export const getResetBadge = (reset) => MISSION_RESET_BADGES[reset] || { label: '', color: '#999' };

/**
 * クーポン有効期限をフォーマット
 */
export const formatCouponExpiry = (expiresAt) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `残り${hours}時間${minutes > 0 ? minutes + '分' : ''}`;
    return `残り${minutes}分`;
};

/**
 * ミッション報酬のclaimを実行
 */
export const claimMission = async (api, missionId) => {
    const endpoint = MISSION_ENDPOINTS[missionId];
    if (!endpoint) throw new Error('Unknown mission ID');
    return api.post(endpoint);
};
