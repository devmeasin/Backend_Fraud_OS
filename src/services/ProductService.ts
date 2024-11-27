import { Product, IProduct } from "../models/productModel";

export class ProductService {
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        return await Product.create(productData);
    }

    async getAllProducts(cid: string, filters: any): Promise<IProduct[]> {
        const query: any = { companyId: cid };

        if (filters.search) {
            query.name = { $regex: filters.search, $options: "i" }; // Case-insensitive search
        }

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) {
                query.price.$gte = parseFloat(filters.minPrice);
            }
            if (filters.maxPrice) {
                query.price.$lte = parseFloat(filters.maxPrice);
            }
        }

        const sort: { [key: string]: 1 | -1 } = {};
        if (filters.sortBy) {
            sort[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;
        }

        return await Product.find(query).sort(sort);
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await Product.findById(id);
    }

    async getProductBySlug(slug: string): Promise<IProduct | null> {
        return await Product.findOne({ slug });
    }

    async updateProduct(
        id: string,
        companyId: string,
        updateData: Partial<IProduct>,
    ): Promise<IProduct | null> {
        return await Product.findOneAndUpdate(
            { _id: id, companyId },
            { $set: updateData },
            { new: true, runValidators: true },
        );
    }

    async deleteProduct(
        id: string,
        companyId: string,
    ): Promise<IProduct | null> {
        return await Product.findOneAndDelete({ _id: id, companyId });
    }
}
