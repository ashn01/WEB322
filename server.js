// personally use
const chalk = require('chalk');
const ERROR = chalk.bold.red;
const WARN = chalk.yellow;
const SUCCESS = chalk.green;
const CALL = chalk.blue;
//
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
var data = require(__dirname+"/data-server.js");
var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

// a6
const dataServiceComments = require(__dirname+"/data-service-comments.js");

// a6 end

// a7
const clientSessions = require("client-sessions");
const dataServiceAuth = require(__dirname+"/data-service-auth.js");
// a7 end

app.use(express.static('public'));

// body parser work... & hbs
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.engine(".hbs",exphbs({
  extname:".hbs",
  defaultLayout:'layout',
  helpers:{
    equal:function(lvalue,rvalue,options)
    {
      if(arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if(lvalue!=rvalue){
        return options.inverse(this);
      }else {
        return options.fn(this);
      }
    }, // test
    list:function(context, options)
    {
      var ret = "<ul>";
      for(i=0;i<context.length;i++)
        ret += "<li>" + options.fn(context[i]) + "</li>";
      return ret + "</ul>";
    }
  }
}));

app.set("view engine",".hbs");
/*
* This will ensure that the bodyParser middleware will work correctly. Also, this will allow the .hbs
* extensions to be properly handled, add the custom Handlebars helper: equal and set the global
* default layout to our layout.hbs file
*/

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "week10example_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
 res.locals.session = req.session;
 next();
});

// middleware function
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/about",(req,res)=>{
  console.log(CALL("Call function getAllComments(  )"));
  dataServiceComments.getAllComments().then((data)=>{
      console.log(WARN(data));
      console.log(SUCCESS("Success : Function getAllComments(  )"));
      res.render("about",{data:data});
  }).catch((e)=>{
      res.render("about");
  });
});

app.post("/about/addComment",(req,res)=>{
  console.log(CALL("Call function addComment( "+req.body+" )"));
  dataServiceComments.addComment(req.body).then(()=>{
      console.log(SUCCESS("Success : Function addComment( "+req.body+" )"));
      console.log("redirecting == > /about < ==");
      res.redirect("/about");
  }).catch((e)=>{
      console.log(ERROR(e));
      console.log("redirecting == > /about < ==");
      res.redirect("/about");
  });
});

app.post("/about/addReply",(req,res)=>{
  console.log(CALL("Call function addReply( "+req.body+" )"));
  dataServiceComments.addReply(req.body).then(()=>{
        console.log(SUCCESS("Success : Function addReply( "+req.body+" )"));
        console.log("redirecting == > /about < ==");
        res.redirect("/about");
  }).catch((e)=>{
          console.log(ERROR(e));
          console.log("redirecting == > /about < ==");
          res.redirect("/about");
  });
});

app.get("/employees",ensureLogin,(req,res)=>{
  //var obj = JSON.parse(req.query);
  //console.log(Object.keys(req.query));
  var keyValue = Object.keys(req.query); // get Key Value e.g. status, department....
  //console.log(keyValue[0]);
  switch(keyValue[0])
  {
    case "status" :
      console.log(CALL("Call function getEmployeesByStatus( "+req.query.status+" )"));
      data.getEmployeesByStatus(req.query.status).then((data)=>{
        //res.json(obj);
        res.render("employeeList", { data: data, title: "Employees" });
        console.log(SUCCESS("Success : Function getEmployeesByStatus( "+req.query.status+" )"));
      }).catch((err)=>{
        //res.json("{message:"+err+"}");
        res.render("employeeList", { data: {}, title: "Employees" });
        console.log(ERROR("Failure : Function getEmployeesByStatus( "+req.query.status+" ) Because => " +err+ " <="));
      });
      break;
    case "department" :
    console.log(CALL("Call function getEmployeesByDepartment( "+req.query.department+" )"));
    data.getEmployeesByDepartment(req.query.department).then((data)=>{
        //res.json(obj);
        res.render("employeeList", { data: data, title: "Employees" });
        console.log(SUCCESS("Success : Function getEmployeesByDepartment( "+req.query.department+" )"));
      }).catch((err)=>{
        //res.json("{message:"+err+"}");
        res.render("employeeList", { data: {}, title: "Employees" });
        console.log(ERROR("Failure : Function getEmployeesByDepartment( "+req.query.department+" ) Because => " +err+ " <="));
      });
      break;
    case "manager" :
    console.log(CALL("Call function getEmployeesByManager( "+req.query.manager+" )"));
    data.getEmployeesByManager(req.query.manager).then((data)=>{
        //res.json(obj);
        res.render("employeeList", { data: data, title: "Employees" });
        console.log(SUCCESS("Success : Function getEmployeesByManager( "+req.query.manager+" )"));
      }).catch((err)=>{
        //res.json("{message:"+err+"}");
        res.render("employeeList", { data: {}, title: "Employees" });
        console.log(ERROR("Failure : Function getEmployeesByManager( "+req.query.manager+" ) Because => " +err+ " <="));
      });
      break;
    default :
    console.log(CALL("Call function getAllEmployees( )"));
    data.getAllEmployees().then((data)=>{
        //res.json(obj);
        res.render("employeeList", { data: data, title: "Employees" });
        console.log(SUCCESS("Success : Function getAllEmployees( )"));
      }).catch((err)=>{
        //res.json("{message:"+err+"}");
        res.render("employeeList", { data: {}, title: "Employees" });
        console.log(ERROR("Failure : Function getAllEmployees( ) Because => " +err+ " <="));
      });
  }
});

app.get("/employee/:empNum",ensureLogin,(req,res)=>{

  // initialize an empty object to store the values
  let viewData = {};

console.log(CALL("Call function getEmployeesByNum( "+req.params.empNum+" )"));
  data.getEmployeesByNum(req.params.empNum).then((data)=>{
    console.log(chalk.yellow(data));
    viewData.data = data; //store employee data in the "viewData" object as "data"

    }).catch((err)=>{
    viewData.data = null; // set employee to null if there was an error
  }).then(data.getDepartments).then((data)=>{
    viewData.departments = data; // store department data in the "viewData" object as "departments"

    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
      if (viewData.departments[i].departmentId == viewData.data.department) {
        viewData.departments[i].selected = true;
      }
    }
  }).catch(()=>{
    viewData.departments=[]; // set departments to empty if there was an error
  }).then(()=>{
    if(viewData.data == null){ // if no employee - return an error
      res.status(404).send("Employee Not Found");
      console.log(ERROR("Failure : Function getEmployeesByNum( "+req.params.empNum+" ) Because => " +err+ " <="));
    }else{
      res.render("employee", { viewData: viewData }); // render the "employee" view
      console.log(SUCCESS("Success : Function getEmployeesByNum( "+req.params.empNum+" )"));
      console.log(chalk.cyan(viewData));
    }
  });
});

app.post("/employee/update",ensureLogin,(req,res)=>{
  data.updateEmployee(req.body).then(()=>{
    console.log(SUCCESS("Success : Function updateEmployee( "+req.body+" )"));
    console.log("redirecting == > /employees < ==");
    res.redirect("/employees");
  }).catch((error)=>{
    console.log(ERROR(error));
  });
});

app.get("/employees/add",ensureLogin,(req,res)=>
{
  console.log(CALL("Call function getDepartments( )"));
  data.getDepartments().then((departments)=>{
    console.log(SUCCESS("Success : Function getDepartments( )"));
    res.render("addEmployee",{departments:departments});
  }).catch((error)=>{
    console.log(ERROR(error));
    res.render("addEmployee",{departments:[]});
  });

});

app.post("/employees/add",ensureLogin,(req,res)=>{
  data.addEmployee(req.body).then(()=>{
    console.log(SUCCESS("Success : Function addEmployee( "+req.body+" )"));
    console.log("redirecting == > /employees < ==");
    res.redirect("/employees");
  }).catch((err)=>{
    console.log(ERROR(err));
  });
});

app.get("/employee/delete/:empNum",ensureLogin,(req,res)=>{
  data.deleteEmployeeByNum(req.params.empNum).then(()=>{
    console.log(SUCCESS("Success : Function deleteEmployeeByNum( "+req.params.empNum+" )"));
    console.log("redirecting == > /employees < ==");
    res.redirect("/employees");
  }).catch((err)=>{
    console.log(ERROR(err));
    res.status(500).send("Unable to Remove Employee / Employee not found");
  });
});


app.get("/managers",ensureLogin,(req,res)=>{
console.log(CALL("Call function getManagers( )"));
  data.getManagers().then((data)=>{
    //res.json(obj);
    res.render("employeeList", { data: data, title: "Employees(Managers)" });
    console.log(SUCCESS("Success : Function getManagers( )"));
  }).catch((err)=>{
    //res.json("{message:"+err+"}");
    res.render("employeeList", { data: {}, title:"Employees (Managers)" });
    console.log(ERROR("Failure : Function getManagers( ) Because => " +err+ " <="));
  });
});

app.get("/departments",ensureLogin,(req,res)=>{
console.log(CALL("Call function getDepartments( )"));
    data.getDepartments().then((data)=>{
      //res.json(obj);
      res.render("departmentList", { data: data, title:"Departments" });
      console.log(SUCCESS("Success : Function getDepartments( )"));
    }).catch((err)=>{
      //res.json("{message:"+err+"}");
      res.render("departmentList", { data: {}, title:"Departments" });
      console.log(ERROR("Failure : Function getDepartments( ) Because => " +err+ " <="));
    });
});

app.get("/departments/add",ensureLogin,(req,res)=>{
    res.render("addDepartment");
});

app.post("/departments/add",ensureLogin,(req,res)=>{
  data.addDepartment(req.body).then(()=>{
    console.log(SUCCESS("Success : Function addDepartment( "+req.body+" )"));
    console.log("redirecting == > /departments < ==");
    res.redirect("/departments");
  }).catch((err)=>{
    console.log(ERROR(err));
  });
});

app.post("/department/update",ensureLogin,(req,res)=>{
  data.updateDepartment(req.body).then(()=>{
    console.log(SUCCESS("Success : Function updateDepartment( "+req.body+" )"));
    console.log("redirecting == > /departments < ==");
    res.redirect("/departments");
  }).catch((error)=>{
    console.log(ERROR(error));
  });
});

app.get("/department/:departmentId",ensureLogin,(req,res)=>{
console.log(CALL("Call function getDepartmentById( "+req.params.departmentId+" )"));
  data.getDepartmentById(req.params.departmentId).then((data)=>{
    res.render("department",{data:data});
    console.log(SUCCESS("Success : Function getDepartmentById( "+req.params.departmentId+" )"));
  }).catch((err)=>{
    res.status(404).send("Department Not Found");
    console.log(ERROR("Failure : Function getDepartmentById( "+req.params.departmentId+" ) Because => " +err+ " <="));
  });
});

// a7
app.get("/login",(req,res)=>{
  res.render("login");
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.post("/register",(req,res)=>{
  console.log(CALL("Call function registerUser( "+req.body+" )"));
  dataServiceAuth.registerUser(req.body).then(()=>{
    console.log(SUCCESS("Success : Function registerUser( "+req.body+" )"));
    res.render("register",{successMessage:"User created"});
  }).catch((err)=>{
    console.log(ERROR("Failure : Function registerUser( "+req.body+" ) Because => " + err+" <="));
    res.render("register",{errorMessage:err,user:req.body.user});
  });
});

app.post("/login",(req,res)=>{
  console.log(CALL("Call function checkUser( "+req.body+" )"));
  dataServiceAuth.checkUser(req.body).then(()=>{
    console.log(SUCCESS("Success : Function CheckUser( "+req.body+" )"));
    req.session.user = {
      username:req.body.user
    };
    console.log("redirecting == > /employees < ==");
    res.redirect("/employees");
  }).catch((err)=>{
    console.log(ERROR("Failure : Function CheckUser( "+req.body+" ) Because => " + err+" <="));
    res.render("login",{errorMessage:err,user:req.body.user});
  });
});

app.get("/logout",(req,res)=>{
  req.session.reset();
  console.log("redirecting == > / < ==");
  res.redirect("/");
});
// a7

app.post("/api/updatePassword",(req,res)=>{
  dataServiceAuth.checkUser({user:req.body.user,password:req.body.currentPassword})
  .then(()=>{
    dataServiceAuth.updatePassword(req.body)
    .then((suc)=>{
      res.send({successMessage:"Password changed successfully for user:"+req.body.user});
    })
    .catch((err)=>{
      res.send({errorMessage:err});
    });
  })
  .catch((err)=>{
    res.send({errorMessage:err});
  });
});


 // wrong request.
app.use((req,res)=>{
  res.status(404).send("Page Not Found");
});


data.initialize().then(()=>{
  dataServiceComments.initialize();
}).then(()=>{
  dataServiceAuth.initialize();
}).then(()=>{
app.listen(HTTP_PORT,()=>{
  console.log(SUCCESS("Express http server listening on " + HTTP_PORT));
})}).catch(function(e)
{
  console.log(ERROR("Unable to start dataService => " + e+" <="));
});
