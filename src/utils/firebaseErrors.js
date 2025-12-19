// src/utils/firebaseErrors.js
// Firebase認証エラーをユーザーフレンドリーな日本語メッセージに変換

/**
 * Firebaseエラーコードをユーザー向けメッセージに変換
 * @param {Error} error - Firebaseエラーオブジェクト
 * @returns {string} ユーザー向けエラーメッセージ
 */
export function getFirebaseErrorMessage(error) {
    // Firebase error.code から判定
    const code = error?.code || '';

    const errorMessages = {
        // 登録関連
        'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/weak-password': 'パスワードは6文字以上で入力してください',
        'auth/operation-not-allowed': 'この認証方法は現在利用できません',

        // ログイン関連
        'auth/user-not-found': 'アカウントが見つかりません',
        'auth/wrong-password': 'パスワードが正しくありません',
        'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
        'auth/user-disabled': 'このアカウントは無効化されています',
        'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってからお試しください',

        // ネットワーク関連
        'auth/network-request-failed': 'ネットワークエラーが発生しました。接続を確認してください',

        // その他
        'auth/popup-closed-by-user': 'ログインがキャンセルされました',
        'auth/cancelled-popup-request': 'ログインがキャンセルされました',
        'auth/internal-error': 'システムエラーが発生しました。しばらくしてからお試しください',
    };

    return errorMessages[code] || error?.message || '予期せぬエラーが発生しました';
}
