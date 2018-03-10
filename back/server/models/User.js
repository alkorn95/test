import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name      : { type: String, unique:true, dropDups:true },
    password  : { type: String },
    role      : { type: Number },//0-admin 1-manager 2-user
    curatorID : { type: String }
});

mongoose.model('User', UserSchema);
