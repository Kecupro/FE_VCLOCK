import { IVoucher } from "../cautrucdata";

export enum VoucherStatus {
  UPCOMING = 2,
  EXPIRED = 1,
  ACTIVE = 0,
}

export enum UserSegment {
  NEW_USER = 'new_user',
  LOYAL_USER = 'loyal_user', 
  ALL_USERS = 'all_users'
}

export interface VoucherRule {
  newUserOnly?: boolean;
  minOrders?: number;
  maxOrders?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: 'new_user_only' | 'min_orders' | 'max_orders' | 'not_active' | 'expired';
  segment?: UserSegment;
}

// Config map for voucher eligibility rules
export const VOUCHER_RULES: Record<string, VoucherRule> = {
  // Example rules - customize based on your voucher codes
  'NEW10': { newUserOnly: true },
  'NEW20': { newUserOnly: true },
  'LOYAL20': { minOrders: 2 },
  'LOYAL30': { minOrders: 2 },
  'VIP50': { minOrders: 5 },
  'FREESHIP': {}, // Available for all users
  'SALE10': {}, // Available for all users
  'SALE20': {}, // Available for all users
};

export function getUserSegment(orderCount: number): UserSegment {
  if (orderCount === 0) return UserSegment.NEW_USER;
  if (orderCount >= 2) return UserSegment.LOYAL_USER;
  return UserSegment.ALL_USERS;
}

export function checkEligibility(
  voucher: IVoucher, 
  userOrderCount: number = 0,
  now: Date = new Date()
): EligibilityResult {
  const status = calcStatus(voucher, now);
  
  // Check if voucher is active
  if (status !== VoucherStatus.ACTIVE) {
    return {
      eligible: false,
      reason: status === VoucherStatus.EXPIRED ? 'expired' : 'not_active'
    };
  }

  const rule = VOUCHER_RULES[voucher.voucher_code] || {};
  const segment = getUserSegment(userOrderCount);

  // Check new user only rule
  if (rule.newUserOnly && userOrderCount > 0) {
    return {
      eligible: false,
      reason: 'new_user_only',
      segment
    };
  }

  // Check minimum orders rule
  if (rule.minOrders && userOrderCount < rule.minOrders) {
    return {
      eligible: false,
      reason: 'min_orders',
      segment
    };
  }

  // Check maximum orders rule
  if (rule.maxOrders && userOrderCount > rule.maxOrders) {
    return {
      eligible: false,
      reason: 'max_orders',
      segment
    };
  }

  return {
    eligible: true,
    segment
  };
}

export function getEligibilityMessage(reason?: string, minOrders?: number): string {
  switch (reason) {
    case 'new_user_only':
      return 'Chỉ dành cho khách hàng mới';
    case 'min_orders':
      return `Cần ít nhất ${minOrders} đơn hàng`;
    case 'max_orders':
      return 'Đã vượt quá số đơn hàng cho phép';
    case 'not_active':
      return 'Voucher chưa bắt đầu';
    case 'expired':
      return 'Voucher đã hết hạn';
    default:
      return '';
  }
}

export function calcStatus(voucher: Pick<IVoucher, "start_date" | "end_date">, now: Date = new Date()): VoucherStatus {
  const startDate = new Date(voucher.start_date as unknown as string);
  const endDate = new Date(voucher.end_date as unknown as string);
  if (now < startDate) return VoucherStatus.UPCOMING;
  if (now > endDate) return VoucherStatus.EXPIRED;
  return VoucherStatus.ACTIVE;
}

export function calcDiscount(voucher: IVoucher, cartTotal: number): number {
  const minimumOrderValue = voucher.minimum_order_value || 0;
  if (cartTotal < minimumOrderValue) return 0;

  if (voucher.discount_type === "percentage") {
    const rawDiscount = (cartTotal * voucher.discount_value) / 100;
    const maxDiscount = voucher.max_discount || Infinity;
    return Math.min(rawDiscount, maxDiscount);
  }

  return Math.min(voucher.discount_value, cartTotal);
}

export function isExpired(voucher: IVoucher, now: Date = new Date()): boolean {
  return calcStatus(voucher, now) === VoucherStatus.EXPIRED;
}

export function isApplicable(voucher: IVoucher, cartTotal: number): boolean {
  const minimumOrderValue = voucher.minimum_order_value || 0;
  return cartTotal >= minimumOrderValue && calcStatus(voucher) === VoucherStatus.ACTIVE;
}


