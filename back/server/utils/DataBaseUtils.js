import mongoose from "mongoose";

import config from '../../etc/config.json';

import '../models/User';

const User = mongoose.model('User');

export function setUpConnection() {
    mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);
}

export function allUsers(role, id, name) {
    switch (role) {
        case 0:
            return User.find().select('name');
            break;
        case 1:
            return User.find({ $or: [{ 'curatorID': id }, { '_id': id }] }).select('name');
            break;
        case 2:
            return User.find().select('name').where('_id').equals(id);
            break;
    }
}

export function Curators(role, id, name) {
    switch (role) {
        case 0:
            return User.find().where('role', 1).select('name');
            break;
        case 1:
            return User.find({ $or: [{ 'curatorID': id }, { '_id': id }] }).where('role', 1).select('name');
            break;
        case 2:
            return User.find().select('name').where('_id').equals(id).where('role', 1);
            break;
    }
}

export function getUser(id) {
    return User.findById(id);
}

export function findByName(name) {
    return User.findOne({ 'name': name });
}

export function updateUser(data, role) {
    if (role == 0) {
        return User.update({ _id: data._id }, { $set: { name: data.name, password: data.password, role: data.role, curatorID: data.curatorID } });
    }
    else
        return User.update({ _id: data._id }, { $set: { name: data.name, password: data.password } });
}

export function usersCount() {
    return User.count({});
}

export function createUser(data, reg, count) {
    var user;
    if (!reg)
        user = new User({
            name: data.name,
            password: data.password,
            role: data.role,
            curatorID: data.curatorID
        });
    else
        user = new User({
            name: data.name,
            password: data.password,
            role: 2
        });
    if (count == 0)
        user.role = 0;
    return user.save();

}

export function deleteUser(id) {
    return User.findById(id).remove();
}

