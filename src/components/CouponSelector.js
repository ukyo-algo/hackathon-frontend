// src/components/CouponSelector.js
/**
 * 共通クーポン選択コンポーネント
 * ガチャページ・購入ページで使用
 */

import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Chip } from '@mui/material';

/**
 * クーポン有効期限をフォーマット
 */
export const formatCouponExpiry = (expiresAt) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `残り${hours}時間`;
    return `残り${minutes}分`;
};

/**
 * クーポン選択ドロップダウン
 */
const CouponSelector = ({
    coupons = [],
    selectedCouponId = '',
    onSelect,
    couponType = 'gacha', // 'gacha' | 'shipping'
    disabled = false,
}) => {
    if (coupons.length === 0) return null;

    const title = couponType === 'gacha' ? '🎟️ ガチャ割引クーポン' : '🎟️ 送料割引クーポン';
    const labelPrefix = couponType === 'gacha' ? '' : '送料';

    return (
        <Box sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
            borderRadius: 2,
            border: '1px solid rgba(255, 193, 7, 0.3)',
        }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#ff9800', fontWeight: 'bold' }}>
                {title}
            </Typography>
            <FormControl fullWidth size="small">
                <Select
                    value={selectedCouponId}
                    onChange={(e) => onSelect(e.target.value)}
                    displayEmpty
                    disabled={disabled}
                    sx={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                    <MenuItem value="">
                        <em>クーポンを使用しない</em>
                    </MenuItem>
                    {coupons.map(coupon => (
                        <MenuItem key={coupon.id} value={coupon.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <Chip
                                    label={`${labelPrefix}${coupon.discount_percent}%OFF`}
                                    size="small"
                                    sx={{ backgroundColor: '#ffc107', color: '#000' }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {formatCouponExpiry(coupon.expires_at)}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default CouponSelector;
