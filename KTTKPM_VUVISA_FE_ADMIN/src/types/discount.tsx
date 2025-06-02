export interface Discount {
    id: number;
    discountName: string;
    discountPercentage: number | null;
    discountAmount: number | null;
    startDate: Date;
    endDate: Date;
}
  
export interface DiscountDTO {
    discountName: string; 
    discountPercentage: number | null; 
    discountAmount: number | null; 
    startDate: Date; 
    endDate: Date; 
    productIds: number[]; 
}

export interface discountCreateDTO {
    discount_name: string, // Đổi từ discountName thành discount_name
    discount_percentage: number | null,
    discount_amount: number | null,
    start_date: Date,
    end_date: Date,
    product_ids: number[],
  };