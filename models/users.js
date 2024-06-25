const { Schema, default: mongoose } = require("mongoose");

const UserSchema = new Schema({
    email: String,
    created_at: {type: Date, default: Date.now},
    password: String,
    username: String,
    isactive: {type: Boolean, default: true},
    id: {
        type: Number,
        unique: true
    }
})

UserSchema.pre('save', function (next) {
    if(!this.id) {
        this.id = this._id.getTimestamp().getTime();
    }
    next();
})

const User = mongoose.model("User", UserSchema);

module.exports = User;