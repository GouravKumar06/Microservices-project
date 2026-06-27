const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
            "Password must contain uppercase, lowercase, number and special character."
        ]
    }
},{timestamps:true})

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await argon2.hash(this.password);
});


userSchema.methods.comparePassword = async function(password){
    try{
        return argon2.verify(this.password,password)
    }catch(error){
        throw error
    }
}

userSchema.index({ username: 'text', email:'text' })


module.exports = mongoose.model('User',userSchema)