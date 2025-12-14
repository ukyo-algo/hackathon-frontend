/**
 * Frontend Configuration
 * 定数とグローバル設定を集約するファイル
 */

// ========== API設定 ==========
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
};

// ========== UI設定 ==========
export const COLORS = {
  PRIMARY: '#ff0099',
  PRIMARY_DARK: '#e60080',
  BACKGROUND: '#f5f5f5',
  TEXT_PRIMARY: '#333',
  TEXT_SECONDARY: '#666',
  TEXT_TERTIARY: '#999',
  BORDER: '#e0e0e0',
  SUCCESS: '#2e7d32',
  ERROR: '#d32f2f',
  WARNING: '#f57c00',
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

// ========== 配送パネル設定 ==========
export const SHIPMENT_PANEL = {
  // 取得件数（各枠の最大表示数）
  LIMIT_SELLER_PENDING: 5,
  LIMIT_BUYER_TRANSIT: 5,
  LIMIT_RECENT_SHIPPED: 5,
  LIMIT_RECENT_COMPLETED: 5,
  // レイアウト設定
  GRID_COLUMNS: 2,
  GRID_GAP: 16,
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
  LABELS: ['注文済み', '発送済み', '配達中', '配達済み'],
  STATUS_INDEX: {
    pending_shipment: 0,
    in_transit: 2,
    completed: 3,
  },
  ACTIVE_COLOR: '#1976d2',
  INACTIVE_COLOR: '#ccc',
  TEXT_ACTIVE: '#1976d2',
  TEXT_INACTIVE: '#999',
  DOT_SIZE: 12,
  DOT_SIZE_COMPACT: 10,
  BAR_INACTIVE: '#ddd',
};
