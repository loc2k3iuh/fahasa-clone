export interface OrderDetail {
    order_id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    phone_number: string;
    city: string;
    district: string;
    ward: string;
    address: string;
    shipping_method: string;
    payment_method: string;
    discount_code: string;
    note: string;
    status: string;
    order_date: string;
    order_details: OrderDetail[];
    vouchers: any;
}

export interface OrderResponse {
    code: number;
    message: string;
    result: {
        content: Order[];
        empty: boolean;
        first: boolean;
        last: boolean;
        number: number;
        numberOfElements: number;
        pageable: {
            offset: number;
            pageNumber: number;
            pageSize: number;
            paged: boolean;
            sort: {
                sorted: boolean;
                unsorted: boolean;
                empty: boolean;
            };
        };
        size: number;
        totalElements: number;
        totalPages: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
    };
}

export interface Response {
    code: number;
    message: string;
    result: any;
}

export interface OrderStatus {
    orderIds: number[];
    status: string;
}

export interface OrderFilter {
    order_id: number | null;
    status: string[] | null;
    full_name: string | null;
    phone_number: string | null;
    product_name: string | null;
    shipping_method: string[] | null;
    start_date: string | null;
    end_date: string | null;
}