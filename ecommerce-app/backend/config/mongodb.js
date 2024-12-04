import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    });

    // Loại bỏ dấu '/' trong chuỗi kết nối
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'e-commerce',
    });
};

export default connectDB;
