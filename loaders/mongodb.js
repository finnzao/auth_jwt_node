const mongoose = require("mongoose");
require('dotenv').config();
const dbUser= process.env.DB_USER;
const dbPassword= process.env.DB_PASS;

async function startDB(){
    await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.a2gbct4.mongodb.net/test`);
}

module.exports=startDB;