var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var handlebars = require("express-handlebars").create({ defaultLayout: "main" });
var mysql = require('mysql');

//include database connection instead of incluidng from ./dbcon.js
var pool = mysql.createPool({

  host: 'classmysql.engr.oregonstate.edu',
  user: 'cs290_shahzads',
  password: '2451',
  database: 'cs290_shahzads'
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//app.set('view engine', 'ejs');

app.set('port', 7861);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

//query strings
const getAllQuery = 'SELECT * FROM workouts';
const getAllQueryfromID = 'SELECT * FROM `workouts` WHERE id=?';
const insertQuery = 'INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `unit`) VALUES (?, ?, ?, ?, ?)';
const deleteQuery = 'DELETE FROM `workouts` WHERE id = ?';
const updateQuery = 'UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, unit=? WHERE id=?'


//reset the table completely
app.get('/reset-table', function (req, res, next) {                  
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function (err) {
    var createString = "CREATE TABLE workouts(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "reps INT," +
      "weight INT," +
      "date DATE," +
      "unit VARCHAR(255))";
    pool.query(createString, function (err) {
      res.render('workOutTable', context);
    })
  });
});


app.get('/', function (req, res, next) {
  var context = {};
  pool.query(getAllQuery, function (err, rows, fields) {          
    if (err) {                                                                
      next(err);
      return;
    }
    var data = [];                               
    for (var i in rows) {
      
      data.push( {
        'name': rows[i].name,
        'reps': rows[i].reps,
        'weight': rows[i].weight,
        'date': rows[i].date,
        'id': rows[i].id,
        'unit':rows[i].unit
      });
                         
    }
    context.results = data;
    res.render('workOutTable', context);               
  })
});

app.post('/', function (req, res, next) {
  var context = {};
  //var {excercise, reps, weight, date} = req.body;
  pool.query(insertQuery,
    [req.query.exercise,               
    req.query.reps,
    req.query.weight,
    req.query.date,
    req.query.unit],
    function (err, result) {
      if (err) {
        next(err);
        return;
      }
      context.data = result.insertId;
      res.send(JSON.stringify(context));
    
    });
  
});

app.delete('/', function (req, res, next) {
  //delete with associated ID of the table line
  pool.query(deleteQuery,   
    [req.query.id],
    function (err, result) {
      if (err) {
        next(err);
        return;
      }
    });
});

//update the workout table withough going to another page
app.get('/updateWorkOutTable', function (req, res, next) {
  var context = {};
  pool.query(getAllQueryfromID,   
    [req.query.id],
    function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }

      //add all parametes again to send
      var data = [];
      for (var i in rows) {                           
        data.push( {
          'name': rows[i].name,
          'reps': rows[i].reps,
          'weight': rows[i].weight,
          'date': rows[i].date,
          'unit': rows[i].unit,
          'id': rows[i].id
        })
      }
      //Send this object to the updateTable page send the units and excersie name
      context.results = data[0], data[1], data[2];                     
      res.render('updateWorkOutTable', context);
    });
});

app.get('/updateReturn', function (req, res, next) {
  var context = {};

  pool.query(getAllQueryfromID, 
    [req.query.id],
    function (err, result) {
      if (err) {
        next(err);
        return;
      }

        //send update query to table
        pool.query(updateQuery,  
          [req.query.exercise,
          req.query.reps,
          req.query.weight,
          req.query.date,
          req.query.unit,
          req.query.id],
          function (err, result) {
            if (err) {
              next(err);
              return;
            }

            pool.query(getAllQuery, function (err, rows, fields) {
              if (err) {
                next(err);
                return;
              }
              var param = [];

              for (var i in rows) {
                param.push( {
                  'name': rows[i].name,     
                  'reps': rows[i].reps,
                  'weight': rows[i].weight,
                  'date': rows[i].date,
                  'id': rows[i].id,
                  'unit':rows[i].unit
                })
                } 
                
              context.results = param;
              res.render('workOutTable', context);      
            });
          });
      
    });
});

app.use(function (req, res) {                 //Standard error handling
  res.status(404);
  res.render("404");
});

app.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
