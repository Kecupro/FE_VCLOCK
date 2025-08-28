import { IVoucher } from "../cautrucdata";

export enum VoucherStatus {
  UPCOMING = 2,
  EXPIRED = 1,
  ACTIVE = 0,
}

export enum CustomerType {
  NEW_CUSTOMER = 'new_customer',
  LOYAL_CUSTOMER = 'loyal_customer',
  VIP_CUSTOMER = 'vip_customer',
  ALL = 'all'
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: 'not_active' | 'expired' | 'target_audience_mismatch';
  customerType?: CustomerType;
}

// Xác định loại khách hàng chỉ dựa trên số đơn hàng và ngày tạo tài khoản
export function getCustomerType(
  orderCount: number = 0, 
  createdAt?: string | Date
): CustomerType {
  // Xác định theo số đơn hàng
  if (orderCount >= 5) {
    return CustomerType.VIP_CUSTOMER;
  } else if (orderCount >= 2) {
    return CustomerType.LOYAL_CUSTOMER;
  } else {
    // Kiểm tra ngày tạo tài khoản
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Nếu tạo tài khoản trong 30 ngày gần đây = new customer
      if (daysSinceCreation <= 30) {
        return CustomerType.NEW_CUSTOMER;
      }
    }
    // Mặc định là new customer nếu không có thông tin ngày tạo
    return CustomerType.NEW_CUSTOMER;
  }
}

// Kiểm tra voucher có phù hợp với loại khách hàng không
export function checkEligibility(
  voucher: IVoucher, 
  userOrderCount: number = 0,
  now: Date = new Date(),
  userCreatedAt?: string | Date
): EligibilityResult {
  const status = calcStatus(voucher, now);
  
  // Check if voucher is active
  if (status !== VoucherStatus.ACTIVE) {
    return {
      eligible: false,
      reason: status === VoucherStatus.EXPIRED ? 'expired' : 'not_active'
    };
  }

  // Xác định loại khách hàng của user
  const customerType = getCustomerType(userOrderCount, userCreatedAt);
  
  // Kiểm tra target_audience
  const voucherTarget = voucher.target_audience || 'all';
  
  if (voucherTarget !== 'all' && voucherTarget !== customerType) {
    return {
      eligible: false,
      reason: 'target_audience_mismatch',
      customerType
    };
  }
  
  return {
    eligible: true,
    customerType
  };
}

export function getEligibilityMessage(reason?: string, customerType?: CustomerType): string {
  switch (reason) {
    case 'target_audience_mismatch':
      const customerLabels = {
        [CustomerType.NEW_CUSTOMER]: 'Khách hàng mới',
        [CustomerType.LOYAL_CUSTOMER]: 'Khách hàng thân thiết',
        [CustomerType.VIP_CUSTOMER]: 'Khách hàng VIP',
        [CustomerType.ALL]: 'Tất cả'
      };
      return `Voucher này chỉ dành cho ${customerLabels[customerType || CustomerType.NEW_CUSTOMER]}`;
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


