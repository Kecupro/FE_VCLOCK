export interface IProduct {
  _id: string;
  brand_id: IBrand;
  brand?: IBrand; 
  name: string;
  description: string;
  price: number;
  sale_price: number;
  status: number;
  quantity: number;
  views: number;
  sex: string;
  case_diameter: number;
  style: string;
  features: string;
  water_resistance: number;
  thickness: number;
  color: string;
  machine_type: string;
  strap_material: string;
  case_material: string;
  sold: number;
  categories: ICategory[];
  main_image: IHinh | string;
  images: IHinh[];
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface IHinh {
  _id: string;
  is_main: boolean;
  image: string;
  alt: string;
  created_at: string;
  updated_at: string;
}

export interface IBrand {
  _id: string;
  name: string;
  image: string;
  alt: string;
  description: string;
  brand_status: number;
  productCount?: number;
  created_at: string;
  updated_at: string;
}

export interface ICart {
  _id: string;
  product_id: IProduct;
  so_luong: number;
  price: number;
  sale_price: number;
  name: string;
  main_image: IHinh | string;
  brand: IBrand;
  quantity: number;
}

export interface ICategory {
  _id: string;
  name: string;
  image: string | null;
  alt: string | null;
  category_status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface INews {
  _id: string;
  categorynews_id: ICateNews;
  category?: ICateNews; 
  title: string;
  content: string;
  image: string | null;
  news_status: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ICateNews {
  _id: string;
  name: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface IOrder {
  _id: string;
  orderCode?: string;
  user_id: IUser;
  voucher_id: IVoucher | null;
  address_id: IAddress;
  payment_method_id: IPaymentMethod;
  details: {
    product_id: {
      name: string;
      main_image: IHinh | string;
    };
  }[];
  note: string | null;
  shipping_fee: number | null;
  total_amount: number | null;
  discount_amount: number | null;
  order_status: 'choXuLy' | 'dangXuLy' | 'dangGiaoHang' | 'daGiaoHang' | 'daHuy' | 'hoanTra' | 'hoanThanh';
  payment_status: 'chuaThanhToan' | 'thanhToan' | 'choHoanTien' | 'hoanTien';
  created_at: string;
  updated_at: string;

}

export interface IOrderDetail {
  _id: string;
  order_id: string;
  product_id: IProduct;
  quantity: number;
  price: number;
}

export interface IProductCategory {
  _id: string;
  product_id: IProduct;
  category_id: ICategory;
}

export interface IReview {
  _id: string;
  user_id: ReviewUser;
  order_detail_id: IOrderDetail;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface IStats {
  _id: string;
  totalReviews: number;
  averageRating: number;
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  account_status: 0 | 1;
  role: 0 | 1 | 2;
  avatar: string | null;
  fullName: string;
  addresses: IAddress[];
  created_at: string;
  updated_at: string;
}

export interface IVoucher {
  _id: string;
  voucher_name: string;
  voucher_code: string;
  start_date: Date;
  end_date: Date;
  discount_type: string;
  discount_value: number;
  minimum_order_value: number;
  max_discount: number;
  target_audience?: string;
  used?: boolean;
  created_at: string;
  updated_at: string;
}

export interface IWishList {
  _id: string;
  product_id: IProduct;
  product: IProduct;
  user_id: IUser;
  created_at: string;
  updated_at: string;
}

export interface IAddress {
  _id: string;
  user_id: string;
  receiver_name: string;
  phone: number;
  address: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPaymentMethod {
  _id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  icon_url: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  name: string;
  type: string;
  link: string;
}

export interface OrderApiResponse {
  list: IOrder[];
  total: number;
  products: IProduct[];
  totalCount: number;
}

export interface RecentOrderDisplay {
  customerName: string;
  orderId: string;
  paymentMethod: string;
  totalAmount: string;
  status: IOrder['order_status'];
  paymentStatus: IOrder['payment_status'];
  created_at: string; 
}

export interface RevenueItem {
  name: string;
  value: number;
}

export interface ProductApiResponse {
  list: IProduct[];
}

export interface ProductSummary {
  _id: string;
  name: string;
  main_image: IHinh | string;
  quantity: number;
  sold: number;
  created_at: string;
  updated_at: string;
}

export interface AdminData {
  _id: string;
  username: string;
  email: string;
  role: string | number;
  fullName: string;
  avatar: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EditData extends AdminData {
  password?: string;
}

export interface ApiResponse {
  success: boolean;
  user?: {
    userId?: string;
    id?: string;
    _id?: string;
    username?: string;
    email?: string;
    role?: string | number;
    fullName?: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  message?: string;
}

export interface UpdateResponse {
  success: boolean;
  message: string;
  user?: AdminData;
}

export interface UserRoleInfo {
  id: number;
  name: string;
  displayName: string;
  permissions: string[];
}

export interface CurrentUser {
  userId: string;
  username: string;
  role: number;
}

export interface APIResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: IUser[];
  list?: IUser[];
  users?: IUser[];
  total?: number;
  totalUsers?: number;
  count?: number;
  metadata?: {
    roles?: Array<{ value: number; label: string }>;
    statuses?: Array<{ value: number; label: string }>;
  };
  debug?: {
    appliedFilters?: Record<string, unknown>;
    filterConditions?: unknown;
    queryExecuted?: unknown;
  };
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}
