var express = require('express');
var router = express.Router();
const mysql = require('mysql');
/* GET home page. */
const connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Hello00!',
  database:'plma',
  multipleStatements: true
});

connection.connect();
router.get('/reg', function(req, res, next) { 
  if(req.session.isLogined) {
    res.statusCode = 302;
    res.setHeader('Location', 'https://jshsus.kr' );                            
    res.end();
    return;
  }
  res.render('reg', {return_msg:req.query.msg});
});


router.get('/changepassword', function(req, res, next) {
  console.log(req.session.isLogined)
  if(!req.session.isLogined) {
    res.statusCode = 302;
    res.setHeader('Location', 'https://jshsus.kr' );                            
    res.end();
    return;
  }
  res.render('changepassword', {return_msg:req.query.msg});
});
router.get('/', function(req, res, next) {
  console.log(req.session.isLogined)
  if(req.session.isLogined) {
    
    connection.query('SELECT * FROM iam WHERE stuid = ?', [req.session.uid],  function (error, results, fields) {
      if (error) {
        console.log(error);
      } 
      if(!results[0]) { 
        res.statusCode = 403;
        res.end();
        return;
      }
      if(req.query.service == "plma") {
        if(results[0].plma == 0 ) {
          res.statusCode = 302;
          res.setHeader('Location', 'https://jshsus.kr' );                            
          res.end();
          return;
        }
        res.statusCode = 302;
        res.setHeader('Location',  'http://points.jshsus.kr/iam_callback?id=' + results[0].plma + '&token=Hello00!');
        return res.end();
      } else if(req.query.service == "jshsus") {
        res.statusCode = 302;
        res.setHeader('Location',  'https://jshsus.kr/contents/login/iam_callback.php?student_id=' + results[0].jshsus + '&token=Hello00!');
        return res.end();
      } else if(req.query.service == "cms") {
        res.statusCode = 302;
        res.setHeader('Location',  'https://jshsus.kr/cms/index.php?&act=procMemberLogin&user_id=cms' + results[0].jshsus + '&password=Rycgar123!&mid=index&success_return_url=https://jshsus.kr/cms');
          res.end();
      } else {
        res.statusCode = 302;
        res.setHeader('Location',  'https://jshsus.kr');
        return res.end();
      } 
        
      
    });
    
    
  } else {
    if(req.query.service) {
      res.render('index', {service:req.query.service, return_msg:req.query.msg})
    } else {
      res.statusCode = 302;
      res.setHeader('Location',  'https://jshsus.kr');
      return res.end();
    }
    
  }
  
  

});

router.get('/console', function(req, res, next) {
  console.log(req.session.isLogined)
  if(req.session.isLogined) {
    
    connection.query('SELECT * FROM user WHERE stuid = ?', [req.session.uid],  function (error, results, fields) {
      if (error) {
        console.log(error);
      } 
      if(!results[0]) { 
        res.statusCode = 403;
        res.end(); 
        return;
      }
      res.render('console', {user_data:results, page:'home'})
 
        
      
    });
    
    
  } else {

    res.render('njblogin')
    
  }  
  
  

});

router.get('/console/tamhwal', function(req, res, next) {
  console.log(req.session.isLogined)
  if(req.session.isLogined) {
    
    connection.query('SELECT * FROM user WHERE stuid = ?', [req.session.uid],  function (error, results, fields) {
      if (error) {
        console.log(error);
      } 
      if(!results[0]) { 
        res.statusCode = 403;
        res.end(); 
        return;
      }
      res.render('console', {user_data:results, page:'tamhwal'})
 
        
      
    }); 
    
    
  } else {

    res.render('njblogin')
    
  }  
  
  

});

module.exports = router;
