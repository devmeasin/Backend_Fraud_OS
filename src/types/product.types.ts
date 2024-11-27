export interface ProductQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface Product {
    _id: string;
    name: string;
    price: number;
    description?: string;
    category: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductDto {
    name: string;
    slug: string;
    price: number;
    description?: string;
    category: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
