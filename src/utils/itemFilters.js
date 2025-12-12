/**
 * 商品フィルター＆ソートユーティリティ
 * Homepageの表示ロジックを柔軟にするための関数群
 */

/**
 * ソート関数
 * @param {Array} items - 商品配列
 * @param {string} sortBy - ソート種別 ('newest' | 'price_low' | 'price_high' | 'popular')
 * @returns {Array} ソート済み商品配列
 */
export const sortItems = (items, sortBy) => {
  const sorted = [...items];
  
  switch(sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'popular':
      // 今後: view_count や like_count でソート
      return sorted;
    
    case 'newest':
    default:
      // created_at が新しい順（既にAPIがそうなっている前提）
      return sorted;
  }
};

/**
 * カテゴリでフィルター
 * @param {Array} items - 商品配列
 * @param {string} category - カテゴリ名
 * @returns {Array} フィルター済み商品配列
 */
export const filterByCategory = (items, category) => {
  if (!category || category === 'all') {
    return items;
  }
  return items.filter(item => item.category === category);
};

/**
 * 価格帯でフィルター
 * @param {Array} items - 商品配列
 * @param {number} minPrice - 最小価格
 * @param {number} maxPrice - 最大価格
 * @returns {Array} フィルター済み商品配列
 */
export const filterByPriceRange = (items, minPrice, maxPrice) => {
  return items.filter(item => {
    const price = item.price || 0;
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * キーワードでフィルター（簡易検索）
 * @param {Array} items - 商品配列
 * @param {string} keyword - 検索キーワード
 * @returns {Array} フィルター済み商品配列
 */
export const filterByKeyword = (items, keyword) => {
  if (!keyword || keyword.trim() === '') {
    return items;
  }
  
  const lowerKeyword = keyword.toLowerCase();
  return items.filter(item => {
    return (
      item.name?.toLowerCase().includes(lowerKeyword) ||
      item.description?.toLowerCase().includes(lowerKeyword) ||
      item.category?.toLowerCase().includes(lowerKeyword)
    );
  });
};

/**
 * カテゴリごとにグループ化
 * @param {Array} items - 商品配列
 * @param {Array} categories - カテゴリ一覧
 * @returns {Object} カテゴリをキーとした商品のオブジェクト
 */
export const groupByCategory = (items, categories) => {
  const grouped = {};
  
  categories.forEach(cat => {
    grouped[cat] = items.filter(item => item.category === cat);
  });
  
  return grouped;
};

/**
 * ランダムに商品を取得
 * @param {Array} items - 商品配列
 * @param {number} count - 取得数
 * @returns {Array} ランダムな商品配列
 */
export const getRandomItems = (items, count) => {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * 新着商品を取得（created_at基準）
 * @param {Array} items - 商品配列
 * @param {number} count - 取得数
 * @returns {Array} 新着商品配列
 */
export const getNewestItems = (items, count) => {
  // created_atで降順ソート（新しい順）
  const sorted = [...items].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });
  
  return sorted.slice(0, count);
};

/**
 * 複合フィルター適用
 * @param {Array} items - 商品配列
 * @param {Object} filters - フィルター条件
 * @param {string} filters.category - カテゴリ
 * @param {string} filters.keyword - キーワード
 * @param {number} filters.minPrice - 最小価格
 * @param {number} filters.maxPrice - 最大価格
 * @param {string} filters.sortBy - ソート種別
 * @returns {Array} フィルター＆ソート済み商品配列
 */
export const applyFilters = (items, filters = {}) => {
  let result = [...items];
  
  // カテゴリフィルター
  if (filters.category) {
    result = filterByCategory(result, filters.category);
  }
  
  // キーワードフィルター
  if (filters.keyword) {
    result = filterByKeyword(result, filters.keyword);
  }
  
  // 価格帯フィルター
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    result = filterByPriceRange(result, filters.minPrice, filters.maxPrice);
  }
  
  // ソート
  if (filters.sortBy) {
    result = sortItems(result, filters.sortBy);
  }
  
  return result;
};
