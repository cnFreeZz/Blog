var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

// 生成表模型 user模型类
module.exports = mongoose.model('User', usersSchema);
