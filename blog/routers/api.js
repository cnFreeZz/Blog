var express = require('express');
var router = express.Router();               //路由模块
var User = require('../models/User');    //数据表模型
var Content = require('../models/Content')

// 统一返回格式
var responseData;

router.use((req, res, next) => {
  responseData = {
    code: 0,
    message: ''
  }
  next();
});

//注册处理逻辑，接收注册页面的post的req.body请求
router.post('/user/register', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var repassword = req.body.repassword;

  if (username == '') {
    responseData.code = 1;
    responseData.message = "用户名不能为空";
    res.json(responseData);  // 直接返回包装后的json数据，下同
    return;
  }

  if (password == '') {
    responseData.code = 2;
    responseData.message = "密码不能为空";
    res.json(responseData);//json格式返回给前端
    return;
  }

  if (password != repassword) {
    responseData.code = 3;
    responseData.message = "两次输入的密码不一致";
    res.json(responseData);
    return;
  }

  // 数据库查询避免重复
  User.findOne({
    username: username
  }).then((userInfo) => {
    if (userInfo) {
      responseData.code = 4;
      responseData.message = "用户名已被注册";
      res.json(responseData);
      return;
    }

    // 保存注册信息到到数据库，这里操作的是抽象模型
    var user = new User({
      username: username,
      password: password
    });
    return user.save();
  }).then((newUserInfo) => {
    responseData.message = "注册成功";
    res.json(responseData);
  });
});

//登录
router.post('/user/login', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username == '' || password == '') {
    responseData.code = 1;
    responseData.message = "用户名或密码不能为空";
    res.json(responseData);
    return;
  }

  // 查询数据库是否有用户
  User.findOne({
    username: username,
    password: password
  }).then((userInfo) => {
    if (!userInfo) {
      responseData.code = 2;
      responseData.message = "用户名或密码错误";
      res.json(responseData);
      return;
    }
    // 用户名密码正确
    responseData.message = "登录成功";
    responseData.userInfo = {
      _id: userInfo._id,
      username: userInfo.username
    };
    //设置cookies 存入userInfo
    req.cookies.set('userInfo', JSON.stringify({
      _id: userInfo._id,
      username: userInfo.username
    }));
    res.json(responseData);
    return;
  })
});

// logout
router.get('/user/logout', (req, res) => {
  req.cookies.set('userInfo', null);
  res.json(responseData);
});

// 评论提交
router.post('/comment/post', (req, res) => {
  // 内容的ID
  // console.log(req.body);
  var contentId = req.body.contentid || '';
  var postData = {
    username: req.userInfo.username,
    postTime: new Date(),
    content: req.body.content
  }

  //查询当前这篇文章的信息
   Content.findOne({
       _id: contentId
   }).then((content) => {
       content.comments.push(postData);
       console.log(content, 'con')
       return content.save( (err) => {
        err ? console.log(err) : '';
       });
   }).then( (newContent) => {
       responseData.message = '评论成功'
       responseData.data = newContent;
       res.json(responseData);
   }, () => {
     console.log('err')
   });
});

// 获取制指定文章评论
router.get('/comment', (req, res) => {
  var contentId = req.query.contentid || '';

  Content.findOne({
    _id: contentId
  }).then((content) => {
    responseData.data = content.comments;
    res.json(responseData);
  });
});

module.exports = router;
