import mongoose from 'mongoose';

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
    setupProfile:{
        type: Boolean,
        default: false
    },
    picture:{
        type: String,
    },
});

// userSchema.pre('save', async function(next){
//     const salt = await genSalt();
//     this.password = await hash(this.password, salt);
//     next();
// });

const User = mongoose.model('User', userSchema);
export default User;