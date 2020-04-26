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


async function ShowData()
{
 
    try {
       let _data= await pool.query("select * from products limit 10  offset 10");
       console.table(JSON.parse(JSON.stringify(_data)));

       rl.question('Please enter the id of the product you would like to buy? ', (productid) => {
           let _productid=productid;
           if(!isNaN(_productid))
           {

          function   showQuantity(productid)
            {
                rl.question(' how many units of the product you would like to buy ?',  async(quantity) => {

                    if(!isNaN(quantity))
                    {
                        /// proceed further
    
                        let _data=await pool.query(`select stock_quantity ,price from products where item_id=${productid}`)
                         
                        if(_data)
                        {
                            // products exists proceed further
                       
    
                             if(Number(JSON.parse(JSON.stringify(_data[0].stock_quantity)))<=quantity)
                             {
    
                                      /// Quantity greater proceed further
                                      console.log("Sorry Insufficient quantity ! Please Enter Again");
                                      showQuantity(productid);
                                      
    
                             }

                             else{
                          
                                 /// order success here
                                let _newquantity=Number(JSON.parse(JSON.stringify(_data[0].stock_quantity)))-quantity
                                 
                                let _totalcost=JSON.parse(JSON.stringify(_data[0].price));
                                let _numbercost=Number(_totalcost.split("$")[1]);
                                let _totalpurchase=_numbercost*quantity;
                                // Part of assignment 3 updating total prurchase column
                                let __data=await pool.query(`update products set stock_quantity=${_newquantity}, product_sales_column=product_sales_column+${_totalpurchase} where item_id=${productid}`)


                                console.log(`Your Purchase SuccessFull ,your final due amount is $${_totalpurchase}`);
                                ShowData();
                            
                            }
    
                        }
    
                        else{
                            console.log("Sorry this product id doesnot exists");
                            ShowData();
                        }
    
                         //console.log(JSON.parse(JSON.stringify(_data[0].stock_quantity)));
    
    
                    }
                    else{
                        console.log("Please enter correct quantity");
                        showQuantity(productid);
                    }
                
     
                
               
              
               });
            }
           
            showQuantity(productid);
           

           }

           else{
               console.log("Sorry That product Id Does not exists");
               ShowData();
           }
       
           
      
      
      });
   
        
    } catch (error) {
        console.log(error);
    }
 

}

ShowData();