// src/utils/functionCallHandlers.js
/**
 * LLM Function Call の結果をUIに反映するハンドラー集
 */

/**
 * ページ遷移を実行
 * @param {string} path - 遷移先パス
 * @param {number} delay - 遷移までの待機時間（ms）
 */
export const navigateWithDelay = (path, delay = 500) => {
    if (path) {
        setTimeout(() => {
            window.location.href = path;
        }, delay);
    }
};

/**
 * 出品フォームにデータを直接入力するイベントを発火
 * @param {object} data - { description, name, category }
 */
export const dispatchListingUpdate = (data) => {
    window.dispatchEvent(new CustomEvent('ai-update-listing', {
        detail: data
    }));
};

/**
 * Function Call ハンドラーのマッピング
 * 各アクションに対応する処理を返す
 */
export const createFunctionCallHandlers = ({ setMessages, refreshUser }) => ({
    navigate: (result) => {
        navigateWithDelay(result.path);
    },

    search_items: (result) => {
        if (result.query) {
            navigateWithDelay(`/search?q=${encodeURIComponent(result.query)}`);
        }
    },

    get_item_details: (result) => {
        if (result.item?.item_id) {
            navigateWithDelay(`/items/${result.item.item_id}`);
        }
    },

    draw_gacha: (result) => {
        if (result.result) {
            const gachaResult = result.result;
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `🎉 ${gachaResult.is_new ? '【NEW】' : ''}${gachaResult.name} (★${gachaResult.rarity}) をゲット！`,
                type: 'gacha_result',
                gachaData: gachaResult
            }]);
            if (refreshUser) refreshUser();
        }
    },

    check_balance: (result) => {
        if (refreshUser) refreshUser();
    },

    like_item: (result) => {
        if (result.status === 'liked') {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '❤️ いいねしました！',
                type: 'action_result'
            }]);
        }
    },

    start_listing: (result) => {
        if (result.prefill) {
            const params = new URLSearchParams();
            if (result.prefill.name) params.set('name', result.prefill.name);
            if (result.prefill.price) params.set('price', result.prefill.price);
            if (result.prefill.category) params.set('category', result.prefill.category);
            if (result.prefill.description) params.set('description', result.prefill.description);
            navigateWithDelay(`/items/create?${params.toString()}`);
        }
    },

    suggest_price: () => {
        // 価格提案はAIの返答に含まれるので特別な処理不要
    },

    get_recommendations: () => {
        navigateWithDelay('/?category=recommended');
    },

    generate_description: (result) => {
        if (window.location.pathname === '/items/create') {
            dispatchListingUpdate({
                description: result.description || null,
                name: result.name || null,
                category: result.category || null,
            });
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '📝 説明を入力しました！内容を確認してください。',
                type: 'action_result'
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `📝 商品説明を生成しました:\n\n${result.description || result.prompt}`,
                type: 'action_result'
            }]);
        }
    },

    analyze_listing_image: (result) => {
        // 出品ページで画像解析をトリガー
        if (window.location.pathname === '/items/create') {
            window.dispatchEvent(new CustomEvent('ai-analyze-image'));
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '📸 画像を解析中です...',
                type: 'action_result'
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '📸 出品ページに移動して画像をアップロードしてください。',
                type: 'action_result'
            }]);
        }
    },
});

/**
 * Function Callの結果を処理するメイン関数
 * @param {Array} functionCalls - Function Call の配列
 * @param {object} handlers - createFunctionCallHandlers で作成したハンドラー
 */
export const processFunctionCalls = (functionCalls, handlers) => {
    for (const fc of functionCalls) {
        const { name, result } = fc;
        console.log(`[Function Call] ${name}:`, result);

        const action = result?.action;
        const handler = handlers[action];

        if (handler) {
            handler(result);
        } else {
            console.log('Unknown function action:', action);
        }
    }
};
