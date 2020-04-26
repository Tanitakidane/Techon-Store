let mysql = require('mysql');
var util = require('util');
const readline = require('readline');
const config=require("./config");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


  


var pool = mysql.createPool({
    connectionLimit : 20,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host: config.databasehost,
    por:config.databaseport,
    //host: "127.0.0.1",
    user: config.databaseuser,
    password: config.databasepassword,
    database : config.database,
})






pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('Database connection was closed.',new Date())

        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
           console.log('Database has too many connections.',new Date())
        }
        if (err.code === 'ECONNREFUSED') {
           console.log('Database connection was refused.',new Date())
        }
    }
    if (connection) connection.release()
   
    return
})
pool.query = util.promisify(pool.query) // Magic happens here.

function supervisor()
{
    rl.question('Select the Options 1-View Product Sales by Department 2-Create New Department ', async(answer) => {
        // TODO: Log the answer in a database
       if(!isNaN(answer))
       {
           //proceed further

    if(Number(answer)==1)
    {
        // Showing the products by join

        let _data=await pool.query("select  d.* ,p.product_sales_column ,d.over_head_costs-p.product_sales_column as total_profit from departments d ,products p  where d.department_name=p.department_name limit 50");
        console.log("Executed");
        console.table(JSON.parse(JSON.stringify(_data)));
        supervisor();

    }

  else{
      // Adding a new department


      function departmentName()
      {

        rl.question('Please enter the department name ', (department_name) => {
            // TODO: Log the answer in a database
          if(isNaN(department_name))
          {
              // proceed further 
              overHEadCosts(department_name)

          }

          else{
              console.log("Department Name Should Be Alphabets");
              departmentName()
          }
          
          
          });


      }

      function overHEadCosts(department_name)
      {
        rl.question('Please entert the overhead costs? ', async(cost) => {
            // TODO: Log the answer in a database
           
    if(!isNaN(cost))
    {
// proceed further
 let _data=await pool.query(`insert into departments(department_name,over_head_costs) values('${department_name}',${cost})`);

 console.log("Department Inserted Thanks !!");

 supervisor();

    }

    else{
      console.log("Please input correct data");
      overHEadCosts(department_name);


    }

          });


      }
      departmentName();

  }


       }

       else{

         console.log("Please input correct option");
         supervisor();

       }
     
      });
}
supervisor();