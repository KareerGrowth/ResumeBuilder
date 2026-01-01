import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discounts: [{
        discountCode: { type: String, required: true },
        discountPercentage: { type: Number, required: true }
    }]
}, { timestamps: true });

const Discount = mongoose.model("Discount", DiscountSchema);
export default Discount;
