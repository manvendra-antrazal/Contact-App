import mysql from "mysql2/promise";

// mysql server connection 
export async function getConnection() {
    const Connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "0000",
        database: "contact_app",
    });
    console.log("Mysql Database Connection Completed");
    return Connection;
}


