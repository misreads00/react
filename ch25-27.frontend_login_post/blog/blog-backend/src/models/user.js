import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
});

UserSchema.methods.setPassword = async function(password) {
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result; //true/false 
}; 

//serialize : 응답할 데이터에서 hasedPassword필드 응답안되도록 JSON변환 후 제거 
UserSchema.methods.serialize = function() {
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
  };


UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        //첫번째 파라미터에는 토큰안에 넣고싶은 데이터를 
        //두번째 파라미터에는 JWT 암호를 
        {
            _id: this.id,
            username: this.username,
        },
        process.env.JWT_SECRET, 
        {
            expiresIn: '7d',//7일유효 
        },
    );
    return token;
};

UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};


const User = mongoose.model('User', UserSchema);
export default User;