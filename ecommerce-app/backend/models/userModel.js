import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    resetPasswordToken: { type: String, default: null },  // Thêm trường token để lưu trữ token reset mật khẩu
    resetPasswordExpire: { type: Date, default: null },   // Thêm trường expire để lưu trữ thời gian hết hạn token
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
