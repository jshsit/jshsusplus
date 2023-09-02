var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dateutil = require('date-utils');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session); 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var request = require('request');
const mysql = require('mysql');
var app = express();
function isEmpty(value){
  if ( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
      return true
  } else return false
};


var options ={                                              
  host: 'localhost',
  port: 3306,
  user:'root',
  password:'Hello00!',
  database:'plma',
  schema: {
		tableName: 'iam_sessions'
	}
};

var sessionStore = new MySQLStore(options);  
app.use(session({                                        
  secret:"Hello00!",
  resave:false,
  saveUninitialized:true,
  store: sessionStore                                         
}))
function randomString () {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  const stringLength = 6
  let randomstring = ''
  for (let i = 0; i < stringLength; i++) {
    const rnum = Math.floor(Math.random() * chars.length)
    randomstring += chars.substring(rnum, rnum + 1)
  }
  return randomstring
}


const connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Hello00!',
  database:'plma',
  multipleStatements: true
});
const jshs_connection = mysql.createConnection({
  host:'121.254.168.67',
  user:'jshsus',
  password:'jshsdb123!',
  database:'dbjshsus',
  multipleStatements: true
});
console.log(crypto.createHash('sha512').update("dsu3303862!@").digest('base64'));

connection.connect();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/login', [check('id').isInt()], function(req, res){
  console.log(req.session.isLogined)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('error', {message: '비정상적인 값을 입력했습니다.', error: {status: 500}})

  }
  connection.query("SELECT * FROM iam WHERE stuid=?", [req.query.id],function (error, results, fields) {
    if (error) {
      console.log(error);
      return res.status(500).json({ errors: error.code })

    } 
    console.log(results)
    if(results.length < 1) {
      res.statusCode = 302;
      res.setHeader('Location', 'https://iam.jshsus.kr?service=' + req.query.service + '&msg=' + encodeURI("아이디 또는 비밀번호가 맞지 않습니다.") );                            
      res.end();
      return;
    } else {
      var passwordHash = crypto.createHash('sha512').update(req.query.password).digest('base64');
    if(results[0].password == passwordHash) { 
      req.session.uid = results[0].stuid;   
      req.session.name = results[0].name;      
      delete req.session.isVerified;   
      req.session.isLogined = true; 

      req.session.save(function(){  
        if(req.query.service == "plma") {
          if(results[0].plma == 0 ) {
            res.statusCode = 302;
            res.setHeader('Location', 'https://jshsus.kr' );                            
            res.end();
            return;
          }
          res.statusCode = 302;
          res.setHeader('Location', 'http://points.jshsus.kr/iam_callback?id=' + results[0].plma + '&token=Hello00!' );                            
          res.end();
        } else if(req.query.service == "jshsus") {
          res.statusCode = 302;
          res.setHeader('Location',  'https://jshsus.kr/contents/login/iam_callback.php?student_id=' + results[0].jshsus + '&token=Hello00!');
          res.end();
        } else if(req.query.service == "cms") {
          res.statusCode = 302;
          res.setHeader('Location',  'https://jshsus.kr/cms/index.php?&act=procMemberLogin&user_id=cms' + results[0].cms_id + '&password=Rycgar123!&mid=index&success_return_url=https://jshsus.kr/cms');
          res.end();
        }
        res.end();
      });
      
    }
    else {
      if(req.query.service) {
        res.statusCode = 302;
        res.setHeader('Location', 'https://iam.jshsus.kr?service=' + req.query.service + '&msg=' + encodeURI("아이디 또는 비밀번호가 맞지 않습니다.") );                            
        res.end();
      } else {
        res.statusCode = 302;
        res.setHeader('Location', 'https://iam.jshsus.kr?msg=' + encodeURI("아이디 또는 비밀번호가 맞지 않습니다.") );                            
        res.end();
      }
    }
    }
    

  });
});
app.get('/add_account', [check('stuid').isInt()], function(req, res){
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  var password_hash = crypto.createHash('sha512').update(req.query.password).digest('base64');
  connection.query("SELECT * FROM verify WHERE stuid = ? AND code =?", [req.query.stuid, req.query.code],function (error, results, fields) {
    if (error) {
      console.log(error);
      return res.status(500).json({ errors: error.code })
    }
    if(results.length) {
      connection.query("SELECT * FROM jshsus WHERE name = ?", [results[0].name],function (error, results, fields) {
        if (error) {
          console.log(error);
          return res.status(500).json({ errors: error.code })
        }
        if(results.length > 0) {
          connection.query("INSERT INTO iam (stuid, name, grade, class, num, password, plma, jshsus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [req.query.stuid, req.query.name, req.query.stuid/1000, req.query.stuid/100-(req.query.stuid/1000)*10, req.query.stuid%100, password_hash, 0, results[0].code],function (error, results, fields) {
            if (error) {
              console.log(error);
              return res.status(500).json({ errors: error.code })
            }
            
            res.statusCode = 302;
            res.setHeader('Location', 'https://jshsus.kr' );                            
            res.end();
            
          });
        } else {
          const options = {
            uri:'https://jshsus.kr/contents/login/signupProcess.php',
            method: 'POST',
            form: {
                name: req.query.name,
                nickname: req.query.nickname,
                gisu: req.query.gisu,
                grade:req.query.stuid/1000, 
                class:req.query.stuid/100-(req.query.stuid/1000)*10,
                number:req.query.stuid%100,
                gender:req.query.gender,
                key_code:req.query.code,
                password:req.query.password
    
    
            }
          }
          
          request.post(options, function (error, response, body) {
            connection.query("INSERT INTO iam (stuid, name, grade, class, num, password, plma, jshsus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [req.query.stuid, req.query.name, req.query.stuid/1000, req.query.stuid/100-(req.query.stuid/1000)*10, req.query.stuid%100, password_hash, 0, results[0].code],function (error, results, fields) {
              if (error) {
                console.log(error);
                return res.status(500).json({ errors: error.code })
              }
              
              res.statusCode = 302;
              res.setHeader('Location', 'https://jshsus.kr' );                            
              res.end();
              
            });
          });
        }
        

        

      });
    } else {
      res.statusCode = 302;
      res.setHeader('Location', 'https://iam.jshsus.kr/reg?msg=' + encodeURI("해당 인증코드의 학적을 찾을 수 없습니다.") );                            
      res.end();
    }
    
  });
  
  
  
});

app.get('/logout',  function(req, res){

  delete req.session.uid;
  delete req.session.isLogined;
  delete req.session.name;
  delete req.session.job;

  req.session.save(function(){
    if(req.query.service == "plma") {
      res.statusCode = 302;
      res.setHeader('Location', 'http://points.jshsus.kr/iam_callback?id=' + results[0].plma + '&token=Hello00!' );                            
      res.end();
    } else if(req.query.service == "jshsus") {
      res.statusCode = 302;
      res.setHeader('Location',  'https://jshsus.kr/cms/index.php?mid=index&act=dispMemberLogout');
      res.end();
    } else if(req.query.service == "cms") {
      res.statusCode = 302;
      res.setHeader('Location',  'https://jshsus.kr/contents/login/logout.php');
      res.end();
    } else {
      res.end();
    }
    
  });
  
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
