import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


const userSchema = new mongoose.Schema(
    {
        userName:{
            type:String,
            required:true,
            unique: true,
            lowercase:true,
            trim:true,
            index: true,
        },
        email:{
            type:String,
            required:true,
            unique: true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,     //cloudnary service link
            required:true,
        },
        coverImg:{
            type:String,
        },
        watchHistory:[  {
            type: Schema.Types.ObjectId,
            ref: "video"
        }   ],
        password:{
            type:String, //numbers, charecter not store in mongo {data-leak}
            required:[true, 'password is required'],
        },
        refreshToken:{
            type:String,
        }
    }, {timestamps:true}
)

userSchema.pre("save", async function(next){ //next = middeware done || mongoose can continue
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
}) //dont use arrow function (it doesnt have *THIS* reference)

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
     //password is funcn param, this.password is encrypted pass
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){  //uses in fututre
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)