import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Token document
export interface IToken extends Document {
    assertPopulated: string;
    clearModifiedPaths: string;

    token_type: string;
    expires_in: number;
    expires_at: number;
    access_token: string;
    refresh_token: string;
    user: mongoose.Types.ObjectId;
    created_at: Date;
}

// Define the Token schema
const TokenSchema: Schema = new Schema(
    {
        token_type: { type: String, default: "Bearer" },
        expires_in: { type: Number, required: true },
        expires_at: { type: Number, required: true },
        access_token: { type: String, required: true },
        refresh_token: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        created_at: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

// Create and export the Token model
const PathaoToken = mongoose.model<IToken>("PathaoToken", TokenSchema);

export default PathaoToken;
