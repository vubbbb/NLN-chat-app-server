import mongoose from 'mongoose';
import { genSalt, hash } from 'bcrypt';

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [, "Email is required"],
        unique: true
    },
    nickname:{
        type: String,
        required: [, "Nickname is required"],
        unique: true
    },
});

// userSchema.pre('save', async function(next){
//     const salt = await genSalt();
//     this.password = await hash(this.password, salt);
//     next();
// });

const User = mongoose.model('User', userSchema);
export default User;