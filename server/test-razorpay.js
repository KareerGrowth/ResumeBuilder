
import Razorpay from 'razorpay';
import 'dotenv/config';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function testOrder() {
    try {
        const options = {
            amount: 100, // 1 rupee
            currency: "INR",
            receipt: "test_receipt"
        };
        console.log("Attempting to create order with keys:", process.env.RAZORPAY_KEY_ID);
        const order = await razorpay.orders.create(options);
        console.log("Order created successfully:", order);
    } catch (error) {
        console.error("Razorpay Test Error:", error);
    }
}

testOrder();
