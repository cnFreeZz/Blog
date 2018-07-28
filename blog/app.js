var express = require('express');                  // http框架
var swig = require('swig');                           // 模板引擎
var mongoose = require('mongoose');         // 数据库引擎
var bodyParser = require('body-parser');    // 数据处理中间件
var Cookies = require('cookies');                // 记录登录状态
var app = express();                                    //调用express
var User = require('./models/User');          // 数据表模型

// 公共资源地址，静态文件托管
app.use('/public', express.static(__dirname + '/public'));

// 初始化模板引擎
app.engine('html', swig.renderFile);
//模板文件存放的目录，第一个参数必须是views
app.set('views', './views');
//注册模板引擎，第一个参数不可变，第二个参数和初始化时候一致
app.set('view engine', 'html');
swig.setDefaults({cache: false});

// 数据返回中间件包装,处理post传来的数据 req.body
app.use(bodyParser.urlencoded({extended: true}));

//获取设置cookies
app.use((req, res, next) => {
  req.cookies = new Cookies(req, res);
//解析登录用户的cookie信息
  req.userInfo = {}
  if  (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'));
      // 获取当前登录用户类型,是不是管理员
      User.findById(req.userInfo._id).then((userInfo) => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next();
      })
    } catch (e) {
      next();
    }
  } else {
      next();
  }
});

// 调用相应路由api处理
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));
app.use('/bg',require('./routers/main'));


// 连接数据库并启动服务器
mongoose.connect('mongodb://localhost:27017/blog', (err) => {
  if  (err) {
    console.log("数据库连接失败 /(ㄒoㄒ)/~~");
  } else {
    console.log("数据库连接成功 O(∩_∩)O~~");
    app.listen(8082);
    console.log('is run in 8082');
  }
});


//动态 -> 处理业务逻辑，加载模板，解析模板 -> 返回数据给用户