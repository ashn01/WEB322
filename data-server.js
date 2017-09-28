// personally use
const chalk = require('chalk');
//

const Sequelize = require("sequelize");

var sequelize = new Sequelize('dnrkv5tdijg6h','wkgmcqambrdazt','70e91aeb7ccff4a1a342338c4d61860e87de63acb353bb06065a18a20608e207',{
  host:'ec2-23-21-158-253.compute-1.amazonaws.com',
  dialect:'postgres',
  port:5432,
  dialectOptions:{
    ssl:true
  }
});

var Employee = sequelize.define('Employee',{
  employeeNum:{
    type:Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  firstName:Sequelize.STRING,
  last_name:Sequelize.STRING,
  email:Sequelize.STRING,
  SSN:Sequelize.STRING,
  addressStreet:Sequelize.STRING,
  addressCity:Sequelize.STRING,
  addressState:Sequelize.STRING,
  addressPostal:Sequelize.STRING,
  maritalStatus:Sequelize.STRING,
  isManager:Sequelize.BOOLEAN,
  employeeManagerNum:Sequelize.INTEGER,
  status:Sequelize.STRING,
  department:Sequelize.INTEGER,
  hireDate:Sequelize.STRING
});

var Department = sequelize.define('Department',{
  departmentId:{
    type:Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  departmentName:Sequelize.STRING
});

module.exports.initialize = function()
{
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function(){
          resolve("Operation was a succeess");
      }).catch(function(error){
        reject("Unable to sync the database");
      });
    });
}

module.exports.getAllEmployees = function()
{
  return new Promise(function (resolve, reject) {
    Employee.findAll().then(function(employee){
      resolve(employee);
    }).catch(function(error){
      console.log(error);
      reject("No result returned");
    });
});

}

module.exports.getEmployeesByDepartment = function(departmentP)
{
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where:{
        department:departmentP
      }
    }).then(function(employee){
      resolve(employee);
    }).catch(function(error){
      reject("No result returned");
    });
});

}
module.exports.getEmployeesByStatus = function(statusP)
{
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where:{
        status:statusP
      }
    }).then(function(employee){
      resolve(employee);
    }).catch(function(error){
      reject("No result returned");
    });
});

}

module.exports.getEmployeesByManager = function(manager)
{
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where:{
        employeeManagerNum:manager
      }
    }).then(function(employee){
      resolve(employee);
    }).catch(function(error){
      reject("No result returned");
    });
});

}

module.exports.getEmployeesByNum = function(num)
{
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where:{
        employeeNum:num
      }
    }).then(function(employee){
      resolve(employee[0]);
    }).catch(function(error){
      reject("No result returned");
    });
});

}

module.exports.getManagers = function()
{
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where:{
        isManager:true
      }
    }).then(function(employee){
      resolve(employee);
    }).catch(function(error){
      reject("No result returned");
    });
});

}

module.exports.getDepartments = function()
{
  return new Promise(function (resolve, reject) {
    Department.findAll().then(function(department){
      resolve(department);
    }).catch(function(error){
      reject("No result returned");
    });
});

}

module.exports.addEmployee = function(data)
{
  return new Promise(function (resolve, reject) {
    data.isManager = (data.isManager) ? true : false;
    for(var obj in data)
    {
      if(data[obj] == "")
      {
        data[obj] = null;
      }
    }

    Employee.create(
      {
        firstName:data.firstName,
        last_name:data.last_name,
        email:data.email,
        SSN:data.SSN,
        addressStreet:data.addressStreet,
        addressCity:data.addressCity,
        addressState:data.addressState,
        addressPostal:data.addressPostal,
        maritalStatus:data.maritalStatus,
        isManager:data.isManager,
        employeeManagerNum:data.employeeManagerNum,
        status:data.status,
        department:data.department,
        hireDate:data.hireDate
      }
    ).then(function(employee)
  {
    resolve(employee);
  }).catch(function(error){
    console.log(error);
    reject("Unable to create employee");
  });

});

}

module.exports.updateEmployee = function(employeeData)
{
  return new Promise(function (resolve, reject) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(var obj in employeeData)
    {
      if(employeeData[obj] == "")
      {
        employeeData[obj] = null;
      }
    }
    Employee.update({
      firstName:employeeData.firstName,
      last_name:employeeData.last_name,
      email:employeeData.email,
      SSN:employeeData.SSN,
      addressStreet:employeeData.addressStreet,
      addressCity:employeeData.addressCity,
      addressState:employeeData.addressState,
      addressPostal:employeeData.addressPostal,
      maritalStatus:employeeData.maritalStatus,
      isManager:employeeData.isManager,
      employeeManagerNum:employeeData.employeeManagerNum,
      status:employeeData.status,
      department:employeeData.department,
      hireDate:employeeData.hireDate
    },
  {
    where:{employeeNum:employeeData.employeeNum}
  }).then(()=>{
    resolve("Operation was a success");
  }).catch((error)=>{
    reject("Unable to create employee");
  });
});
}

module.exports.addDepartment = function(departmentData)
{
  return new Promise(function (resolve, reject)
{
  for(var obj in departmentData)
    if(departmentData[obj] == "")
      departmentData[obj] = null;

  Department.create({
    departmentId:departmentData.departmentId,
    departmentName:departmentData.departmentName
  }).then(()=>{
    resolve("Operation was a success");
  }).catch(()=>{
    reject("unable to create department");
  });
});
}

module.exports.updateDepartment = function(departmentData)
{
  return new Promise(function(resolve,reject)
{
  for(var obj in departmentData)
    if(departmentData[obj] == "")
      departmentData[obj] = null;

      Department.update({
        departmentName:departmentData.departmentName
      },{
        where:{departmentId:departmentData.departmentId}
      }).then(()=>{
        resolve("Operation was a success");
      }).catch(()=>{
        reject("unable to update department");
      });
});
}

module.exports.getDepartmentById = function(Id)
{
  return new Promise(function(resolve,reject)
{
  Department.findAll({
    where:{
      departmentId:Id
    }
  }).then((department)=>{
    //console.log(department);
    resolve(department[0]);
  }).catch(()=>{
    reject("No result returned");
  });
});
}

module.exports.deleteEmployeeByNum = function(empNum)
{
  return new Promise(function(resolve,reject)
{
  Employee.destroy({
    where:{employeeNum:empNum}
  }).then(()=>{
    resolve("Employee is deleted ( "+empNum+" )");
  }).catch((error)=>{
    reject(error);
  });
});
}
