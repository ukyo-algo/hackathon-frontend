/**
 * Frontend Configuration
 * 定数とグローバル設定を集約するファイル
 */

// ========== API設定 ==========
// 末尾スラッシュを自動削除（ダブルスラッシュ問題の防止）
const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
export const API_ENDPOINTS = {
  // アイテム関連
  ITEMS: '/api/v1/items',
  ITEM_DETAIL: (itemId) => `/api/v1/items/${itemId}`,
  ITEMS_CREATE: '/api/v1/items',

  // 検索関連
  SEARCH: '/api/v1/search/items',

  // ユーザー関連
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_REFRESH: '/api/v1/auth/refresh',

  // ペルソナ関連
  PERSONAS: '/api/v1/personas',
  PERSONA_SWITCH: '/api/v1/personas/switch',

  // ガチャ関連
  GACHA_DRAW: '/api/v1/gacha/draw',

  // コメント関連
  COMMENTS: (itemId) => `/api/v1/items/${itemId}/comments`,

  // レコメンド/報酬
  RECOMMEND: '/api/v1/recommend',
  REWARD_SEEING_RECOMMEND: '/api/v1/rewards/claim/seeing_recommend',
};

// ========== UI設定 (el;ma ダークモード) ==========
export const COLORS = {
  PRIMARY: '#00ff88',       // ネオングリーン
  PRIMARY_DARK: '#00cc6a',
  SECONDARY: '#ff00ff',     // マゼンタ
  ACCENT: '#00ffff',        // シアン
  BACKGROUND: '#0d1117',    // 深い黒
  BACKGROUND_ALT: '#161b22',
  PAPER: '#1c2128',
  TEXT_PRIMARY: '#e6edf3',
  TEXT_SECONDARY: '#8b949e',
  TEXT_TERTIARY: '#6e7681',
  BORDER: '#30363d',
  SUCCESS: '#00ff88',
  ERROR: '#ff6b6b',
  WARNING: '#ffcc00',
  PRICE: '#00ff88',
};

export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 960,
  LG: 1280,
  XL: 1920,
};

// ========== カテゴリ設定 ==========
export const CATEGORIES = [
  '家電・スマホ・カメラ',
  '靴',
  'ファッション',
  'PC周辺機器'
];

// ========== ソート設定 ==========
export const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'price_low', label: '価格が安い順' },
  { value: 'price_high', label: '価格が高い順' }
];

// ========== ページネーション設定 ==========
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  ITEMS_PER_ROW: 4, // ホームページでカテゴリあたりの表示件数
};

// ========== メッセージ設定 ==========
export const MESSAGES = {
  ERROR: {
    ITEMS_LOAD_FAILED: '商品の読み込みに失敗しました。',
    SEARCH_FAILED: '検索に失敗しました。もう一度お試しください。',
    API_ERROR: 'APIエラーが発生しました。',
    NETWORK_ERROR: 'ネットワークエラーが発生しました。',
    ITEM_NOT_FOUND: '商品が見つかりません。',
    AUTH_FAILED: '認証に失敗しました。',
  },
  SUCCESS: {
    PURCHASE_SUCCESS: '購入が完了しました。',
    COMMENT_POSTED: 'コメントを投稿しました。',
    ITEM_CREATED: '商品を出品しました。',
  },
  VALIDATION: {
    REQUIRED_FIELD: '必須項目です。',
    INVALID_EMAIL: '有効なメールアドレスを入力してください。',
    PASSWORD_TOO_SHORT: 'パスワードは8文字以上である必要があります。',
  },
  EMPTY_STATE: {
    NO_ITEMS: '商品がありません',
    NO_SEARCH_RESULTS: 'お探しの商品は見つかりませんでした。別のキーワードで検索してみてください。',
    NO_COMMENTS: 'コメントはまだありません',
  }
};

// ========== ナビゲーション設定 ==========
export const NAV_CATEGORIES = ['おすすめ', 'ファッション', '家電', '靴', 'ゲーム'];

// ========== Sidebar設定 ==========
export const SIDEBAR = {
  WIDTH: 350,
  HEADER_HEIGHT: 64,
};


// ========== その他の定数 ==========
export const PLACEHOLDER_IMAGE = '/placeholder.png';
export const DEFAULT_AVATAR_IMAGE = '/default-avatar.png';

// Debugモードフラグ（開発時に便利）
export const DEBUG = process.env.NODE_ENV === 'development';

// レコメンドのフロント側クールダウン（分）
export const RECOMMEND_COOLDOWN_MINUTES = Number(process.env.REACT_APP_RECOMMEND_COOLDOWN_MINUTES || 60);

// ========== テーマ設定 ==========
export const THEME_CONFIG = {
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  FONT_SIZE: {
    XS: '0.75rem',
    SM: '0.875rem',
    MD: '1rem',
    LG: '1.25rem',
    XL: '1.5rem',
    XXL: '2rem',
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 16,
  },
};


// ========== カードUI設定 ==========
export const CARD = {
  WIDTH: 200,
  IMAGE_HEIGHT: 150,
  RADIUS: 8,
  BORDER: '#ccc',
  OVERLAY_BG: 'rgba(0,0,0,0.5)',
};

// ========== 進捗ステップ設定 ==========
export const PROGRESS_STEPS = {
  LABELS: ['注文済み', '発送済み', '受け取り完了'],
  STATUS_INDEX: {
    pending_shipment: 0,
    in_transit: 1,
    completed: 2,
  },
  ACTIVE_COLOR: '#1976d2',
  INACTIVE_COLOR: '#ccc',
  TEXT_ACTIVE: '#1976d2',
  TEXT_INACTIVE: '#999',
  DOT_SIZE: 12,
  DOT_SIZE_COMPACT: 10,
  BAR_INACTIVE: '#ddd',
};

// ========== ペルソナ/ゲームシステム設定 ==========

// レアリティの色定義
export const RARITY_COLORS = {
  1: '#9E9E9E',  // ノーマル - Grey
  2: '#2196F3',  // レア - Blue
  3: '#FF5722',  // スーパーレア - Orange
  4: '#9C27B0',  // ウルトラレア - Purple
  5: '#FFD700',  // チャンピョン - Gold
};

// レアリティ名定義
export const RARITY_NAMES = {
  1: 'ノーマル',
  2: 'レア',
  3: 'スーパーレア',
  4: 'ウルトラレア',
  5: 'チャンピョン',
};

// レベルアップコスト（レアリティ別、Lv1→2から Lv9→10まで）
export const LEVEL_UP_COSTS = {
  1: [5, 10, 15, 20, 30, 40, 50, 60, 70],      // ノーマル
  2: [10, 20, 30, 40, 60, 80, 100, 120, 140],  // レア
  3: [15, 30, 45, 60, 90, 120, 150, 180, 210], // スーパーレア
  4: [20, 40, 60, 80, 120, 160, 200, 240, 280],// ウルトラレア
  5: [30, 60, 90, 120, 180, 240, 300, 360, 420],// チャンピョン
};

// スキル定義（バックエンドと同期）
export const SKILL_DEFINITIONS = {
  1: { skill_type: "gacha_duplicate_fragments", base_value: 1, max_value: 5 },
  2: { skill_type: "gacha_duplicate_fragments", base_value: 2, max_value: 8 },
  3: { skill_type: "purchase_bonus_percent", base_value: 1, max_value: 5 },
  4: { skill_type: "gacha_duplicate_fragments", base_value: 3, max_value: 12 },
  5: { skill_type: "daily_shipping_coupon", discount_percent: 5, base_hours: 3, max_hours: 12 },
  6: { skill_type: "purchase_bonus_percent", base_value: 3, max_value: 10 },
  7: { skill_type: "quest_reward_bonus", base_value: 10, max_value: 50 },
  8: { skill_type: "levelup_cost_reduction", base_value: 2, max_value: 10 },
  9: { skill_type: "levelup_cost_reduction", base_value: 5, max_value: 20 },
  10: { skill_type: "quest_cooldown_reduction", base_value: 5, max_value: 25 },
  11: { skill_type: "levelup_cost_reduction", base_value: 3, max_value: 15 },
  12: { skill_type: "daily_gacha_discount", base_value: 10, max_value: 30 },
  13: { skill_type: "quest_reward_bonus", base_value: 5, max_value: 30 },
  14: { skill_type: "purchase_bonus_percent", base_value: 1, max_value: 5 },
  15: { skill_type: "quest_cooldown_reduction", base_value: 3, max_value: 15 },
  16: { skill_type: "daily_shipping_coupon", discount_percent: 10, base_hours: 6, max_hours: 24 },
  17: { skill_type: "purchase_bonus_percent", base_value: 5, max_value: 15 },
  18: { skill_type: "daily_shipping_coupon", discount_percent: 15, base_hours: 6, max_hours: 24 },
  19: { skill_type: "gacha_duplicate_fragments", base_value: 2, max_value: 8 },
  20: { skill_type: "gacha_duplicate_fragments", base_value: 5, max_value: 20 },
};

// スキル値計算ヘルパー関数
export const calculateSkillValue = (personaId, currentLevel) => {
  const def = SKILL_DEFINITIONS[personaId];
  if (!def) return 0;

  if (def.discount_percent !== undefined) {
    // クーポン系：時間が変動
    const baseHours = def.base_hours || 0;
    const maxHours = def.max_hours || 0;
    if (currentLevel <= 1) return baseHours;
    if (currentLevel >= 10) return maxHours;
    return Math.round(baseHours + (maxHours - baseHours) * (currentLevel - 1) / 9);
  }

  const baseVal = def.base_value || 0;
  const maxVal = def.max_value || 0;
  if (currentLevel <= 1) return baseVal;
  if (currentLevel >= 10) return maxVal;
  return Math.round(baseVal + (maxVal - baseVal) * (currentLevel - 1) / 9);
};

// スキルテキスト生成ヘルパー
export const getSkillEffectText = (personaId, level) => {
  const def = SKILL_DEFINITIONS[personaId];
  if (!def) return '???';

  const value = calculateSkillValue(personaId, level);
  const skillType = def.skill_type;

  switch (skillType) {
    case 'gacha_duplicate_fragments':
      return `ガチャ被り時に記憶のかけら+${value}個`;
    case 'levelup_cost_reduction':
      return `レベルアップ必要かけら-${value}%減少`;
    case 'quest_reward_bonus':
      return `クエスト報酬+${value}ボーナス`;
    case 'quest_cooldown_reduction':
      return `クエストクールダウン-${value}分短縮`;
    case 'purchase_bonus_percent':
      return `購入時+${value}%ポイント`;
    case 'daily_shipping_coupon':
      return `デイリー送料${def.discount_percent}%OFFクーポン発行(${value}時間有効)`;
    case 'daily_gacha_discount':
      return `デイリーガチャ${value}%OFFクーポン発行`;
    default:
      return '???';
  }
};

// レベルアップコスト取得ヘルパー
export const getLevelUpCost = (rarity, currentLevel) => {
  if (currentLevel >= 10) return 0;
  const costs = LEVEL_UP_COSTS[rarity] || LEVEL_UP_COSTS[1];
  return costs[currentLevel - 1] || 0;
};


// ========== サブスクリプション設定 ==========
export const SUBSCRIPTION = {
  PRICE_PER_MONTH: 500,
  OPTIONS: [
    { months: 1, price: 500, label: '1ヶ月' },
    { months: 3, price: 1400, label: '3ヶ月', badge: 'お得！' },
    { months: 12, price: 5000, label: '12ヶ月', badge: '超お得！' },
  ],
  COLORS: {
    ACTIVE: '#ffd700',
    INACTIVE: '#888',
    BUTTON_BG: '#ffa500',
    BUTTON_HOVER: '#ff8c00',
  },
};

// ========== 購入オプション設定 ==========
export const PURCHASE_OPTIONS = {
  GACHA: [
    { amount: 100, price: 120 },
    { amount: 500, price: 550 },
    { amount: 1000, price: 1000 },
    { amount: 5000, price: 4800, featured: true },
  ],
  FRAGMENTS: [
    { amount: 10, price: 120 },
    { amount: 50, price: 550 },
    { amount: 100, price: 1000 },
    { amount: 500, price: 4800, featured: true },
  ],
};

// ========== チャットウィジェット設定 ==========
export const CHAT_WIDGET = {
  MIN_WIDTH: 280,
  MIN_HEIGHT: 300,
  DEFAULT_WIDTH: 360,
  DEFAULT_HEIGHT: 500,
  HEADER_HEIGHT: 120,
};
