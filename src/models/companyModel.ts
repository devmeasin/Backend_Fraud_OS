import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for Company
export interface ICompany extends Document {
    _id: mongoose.Types.ObjectId;
    name: string; // Company name
    website?: string; // Optional website
    logo?: string; // Optional company logo
    owner: Types.ObjectId; // Reference to the user who owns the company
    users: {
        userId: Types.ObjectId; // Reference to User
        role: "owner" | "admin" | "employee" | "manager"; // Ensure this matches the schema enum
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Define the Company schema
const companySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true, trim: true },
        website: { type: String, trim: true },
        logo: { type: String }, // Can store logo URL
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        users: {
            type: [
                {
                    userId: { type: Schema.Types.ObjectId, ref: "User" },
                    role: {
                        type: String,
                        enum: ["owner", "admin", "employee", "manager"],
                        default: "owner",
                    },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    },
);

// Export the Company model
export const Company = mongoose.model<ICompany>("Company", companySchema);
