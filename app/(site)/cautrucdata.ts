export interface IProduct {
    _id: string;
    brand: {name:string};
    brand_id: { _id: string; name: string };
    name: string;
    description: string;
    price: number;
    sale_price: number;
    status: number,default: 0;
    quantity: number;
    views: number;
    sex: string;
    case_diameter: number;
    style: string;
    features: string;
    water_resistance: string;
    thickness: number;
    color: string;
    machine_type: string;
    strap_material: string;
    case_material: string;
    sold: number;
    categories: { name: string }[];
    main_image?: { image: string; alt: string };
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
}

export interface IBrand {
    _id: number;
    name: string;
    image: string;
    alt: string;
    description: string;
    brand_status: number;
    productCount: number;
    created_at: string;
    updated_at: string;
}

export interface ICart {
    _id: string;
    product_id: string;
    so_luong: number;
    price: number;
    sale_price: number;
    name: string;
    main_image: { image: string; alt: string };
    brand:{name:string};
    quantity:number
}

export interface ICategory {
    _id: string;
    name: string;
    image?: string | null;
    alt?: string | null;
    category_status?: 0 | 1;
    created_at?: Date;
    updated_at?: Date;
}

export interface INews {
    _id: string;
    category: { _id: string; name: string };
    title: string;
    content: string;
    image?: string | null;
    news_status?: 0 | 1;
    views?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICateNews {
    _id: string;
    name: string;
    status: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface IOrder {
  _id: string;
  user_id: string | IUser;
  orderCode: string;
  voucher_id?: string | IVoucher;
  address_id?:IAddress;
  payment_method_id: { name: string };
  note?: string | null;
  shipping_fee?: number;
  total_amount: number;
  discount_amount?: number;
  order_status?: "pending" | "processing" | "shipping" | "delivered" | "returned" | "cancelled";
  payment_status?: "unpaid" | "paid" | "refunding" | "refunded" | "failed";
  details?: IOrderDetail[];
  created_at?: Date;
  updated_at?: Date;
}

export interface IOrderDetail {
    _id: string;
    order_id: string;
    product_id: {
        _id: string;
        name: string;
        price: number;
        sale_price: number;
        status: number;
        main_image: { image: string; alt: string };
      };
    quantity: number;
    price: number;
}

export interface IProductCategory {
    _id: string;
    product_id: string;
    category_id: string;
}

export interface IReview {
    _id: string;
    order_detail_id: string;
    rating: number;
    comment?: string | null;
    created_at?: Date;
    user:ReviewUser;
}

export interface ReviewUser {
    _id: string;
    username: string;
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
    // password_hash: string;
    email: string;
    account_status: 0 | 1;
    role: 0 | 1 | 2; // 0: User, 1: Admin, 2: Super Admin
    avatar?: string | null;
    fullName: string;
    addresses: IAddress[];
    created_at?: Date;
    updated_at?: Date;
}

export interface IVoucher {
    _id: string;
    voucher_name: string;
    voucher_code: string;
    start_date: Date;
    end_date: Date;
    discount_type: string;
    discount_value: number;
    minimum_order_value?: number;
    max_discount?: number | null;
    used?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface IWishList {
    _id: string;
    product_id: string;
    user_id: string;
    created_at?: Date;
    updated_at?: Date;
    product: IProduct;
}

export interface IAddress {
  _id: string;
  user_id: string;
  receiver_name: string;
  phone: number;
  address: string;
  is_default?: boolean;
  created_at?: Date;
  updated_at: Date;
}

export interface IPaymentMethod {
  _id?: string;
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
  icon_url?: string | null;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface SearchResult {
  name: string;
  type: string;
  link: string;
}

export interface OrderApiResponse {
  list: IOrder[];
  total: number;
}


export interface RecentOrderDisplay {
  customerName: string;
  orderId: string;
  paymentMethod: string;
  totalAmount: string;
  status: IOrder['order_status'];
  paymentStatus?: IOrder['payment_status'];
  created_at: string;
}

export interface RevenueItem {
  name: string;
  value: number;
}

export interface ProductSummary {
  _id: string;
  name: string;
  main_image: { image: string; alt: string };
  quantity: number;
  sold: number;
  created_at: string;
  updated_at: string;
}

export interface ProductApiResponse {
  list: IProduct[];
  total: number;
}