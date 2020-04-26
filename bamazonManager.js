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



function ManageRoles()
{


    rl.question('Please Select the  id of the Task to be performed   1 -View Products for Sale \ 2 -View Low Inventory \ 3- Add to Inventory\ 4- Add New Product ', async(answer) => {
        // TODO: Log the answer in a database
        if(isNaN(answer)  )
        {
           
            console.log("Please input correct id ");
            ManageRoles();
        }
        else if(Number(answer)>4){
            console.log("Please input correct id ");
            ManageRoles()
        }

        else{
               // proceeding further

               if(Number(answer)==1)
               {
                       // Have to show all the products for sale
                       let _data= await pool.query("select * from products limit 10  offset 10");
                    console.table(JSON.parse(JSON.stringify(_data)));
                    ManageRoles();
               }

               else if(Number(answer)==2)
               {
                    // showing products whose inventory is less than 5
                    // Have to show all the products for sale
                    let _data= await pool.query(`select * from products where stock_quantity <5 limit 10  offset 10 `);
                    console.table(JSON.parse(JSON.stringify(_data)));
                    ManageRoles()
               }
               else if(Number(answer)==3)
               {
                   // have to add quantity to the products

                  async function askId()
                   {
                    let _data= await pool.query("select * from products limit 10  offset 10 ");
                    console.table(JSON.parse(JSON.stringify(_data)));

                    rl.question(' Please select the id of the product  you want to increase quantity shown above? ', (id) => {

                        if(!isNaN(id))
                        {
                            // proceed further
                         async  function askQuantity()
                           {
                            rl.question('How much quantity you want to add? ', async(quantity) => {
                              
                                if(!isNaN(quantity))
                                {
                                   // proceed further
                                 
                                 let __data=await pool.query(`update products set stock_quantity=stock_quantity+${quantity} where item_id=${id}`);
                                 console.log("Quantity Successfully added");
                                 let _data= await pool.query("select * from products limit 10  offset 10");
                                  console.table(JSON.parse(JSON.stringify(_data)));
                                  ManageRoles();
        
                                }
        
                                else{
                                    console.log("Please select the correct quantity");
                                    askQuantity()
        
                                }
                              
                            
                              });
                           }
                           askQuantity();

                        }

                        else{
                            console.log("Please select the correct id");
                            askId();

                        }
                      
                       
                      });

                      

                   }
                   askId();

                  

               }

               else if(Number(answer)==4)
               {

                 
                 /// add products different function should be created ;


                 function productName()
                 {
                    rl.question('What is the name of your product? ', (answer) => {
                        // TODO: Log the answer in a database
                        if(isNaN(Number(answer)))
                        {
                            // proceed further

                            departmentName(answer);
                        }

                        else{
                            console.log("Please input correct Alphabetical name");
                            productName()
                        }
                      
                       
                      });

                 }
 
                 function departmentName(productname)
                 {
                    rl.question('Please input department name? ', (departmentName) => {
                        // TODO: Log the answer in a database
                        if(isNaN(Number(departmentName)))
                        {
                            // proceed further

                            price(productname,departmentName)

                            
                        }

                        else{
                            console.log("Please input correct Alphabetical departmentname");
                            departmentName();
                        }
                      
                       
                      });
                 }


                 function price(productname,departmentName)
                 {
                    rl.question('What is the product price ? ', (price) => {
                        // TODO: Log the answer in a database
                      if(!price.includes("$"))
                      {
                          price="$"+price;
                          
                      }

                      stock_quantity(productname,departmentName,price);
                      
                       
                      });
                 }
 


                 function stock_quantity(productname,departmentName,price)
                 {
                    rl.question('How much stock of the product ? ', async (stock_quantity) => {
                        // TODO: Log the answer in a database
                      if(!isNaN(stock_quantity))
                      {

                                  /// final settlement here

                                //  console.log(productname,departmentName,price,stock_quantity);

                                //query here

                                let _result=await pool.query(`insert into products(product_name,department_name,price,stock_quantity) values('${productname}','${departmentName}','${price}',${stock_quantity})`)

                                console.log("Product Inserted Thanks");

                                ManageRoles();
                      }
                      else{
                          console.log("Please enter correct stock ");
                          stock_quantity()
                      }
                      
                       
                      });
                 }
 

                 console.log("Please answer the following questions to add products");

                 productName()
 

               }


        }
      
  
      });






}
ManageRoles();