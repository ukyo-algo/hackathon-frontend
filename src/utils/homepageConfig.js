/**
 * Homepage表示セクション定義
 * 表示方式を柔軟に切り替えるための設定
 */

/**
 * セクションタイプ定義
 */
export const SECTION_TYPES = {
  CATEGORY: 'category',           // カテゴリ別表示
  NEWEST: 'newest',               // 新着商品
  POPULAR: 'popular',             // 人気商品
  RECOMMENDED: 'recommended',     // LLMおすすめ（今後実装）
  RANDOM: 'random',               // ランダムピックアップ
  PRICE_RANGE: 'price_range',     // 価格帯別
};

/**
 * Homepage表示セクション設定
 * この配列を編集することで表示内容を柔軟に変更可能
 */
export const HOMEPAGE_SECTIONS = [
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    config: {
      title: '🎉 新しい出会いを見つけよう',
      subtitle: 'あなたの「欲しい」がここにある',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  },
  {
    id: 'newest',
    type: SECTION_TYPES.NEWEST,
    enabled: true,
    title: '🆕 新着商品',
    config: {
      count: 4,
      showSeeAll: true,
    }
  },
  {
    id: 'category-sections',
    type: SECTION_TYPES.CATEGORY,
    enabled: true,
    title: null, // カテゴリ名が動的に設定される
    config: {
      itemsPerCategory: 4,
      showSeeAll: true,
    }
  },
  // 今後追加可能なセクション例
  // {
  //   id: 'recommended',
  //   type: SECTION_TYPES.RECOMMENDED,
  //   enabled: false, // 実装後にtrueに
  //   title: '✨ あなたへのおすすめ',
  //   config: {
  //     count: 4,
  //     userId: null, // 動的に設定
  //   }
  // },
  // {
  //   id: 'bargain',
  //   type: SECTION_TYPES.PRICE_RANGE,
  //   enabled: false,
  //   title: '💰 お買い得商品',
  //   config: {
  //     maxPrice: 5000,
  //     count: 4,
  //   }
  // },
];

/**
 * セクションが有効かチェック
 * @param {string} sectionId - セクションID
 * @returns {boolean}
 */
export const isSectionEnabled = (sectionId) => {
  const section = HOMEPAGE_SECTIONS.find(s => s.id === sectionId);
  return section ? section.enabled : false;
};

/**
 * 有効なセクションのみ取得
 * @returns {Array}
 */
export const getEnabledSections = () => {
  return HOMEPAGE_SECTIONS.filter(s => s.enabled);
};

/**
 * セクション設定を取得
 * @param {string} sectionId - セクションID
 * @returns {Object|null}
 */
export const getSectionConfig = (sectionId) => {
  const section = HOMEPAGE_SECTIONS.find(s => s.id === sectionId);
  return section || null;
};
