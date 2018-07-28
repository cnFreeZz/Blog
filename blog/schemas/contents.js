var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  // 分类  关联字段
  category: {
    //类型
    type: mongoose.Schema.Types.ObjectId,
    //引用
    ref: 'Category'
  },
  // 标题
  title: String,
  // 用户
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 时间
  addTime: {
    type: Date,
    default: new Date()
  },
  // 浏览量
  views: {
    type: Number,
    default: 0
  },
  // 简介
  description: {
    type: String,
    default: ''
  },
  // 内容
  content: {
    type: String,
    default: ''
  },
  // 评论
  comments: {
    type: Array,
    default: []
  }
}, {
  usePushEach: true
});
