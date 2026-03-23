const express = require('express')
const dotenv = require('dotenv').config()

const app = express()
port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`Server Running at Port ${process.env.PORT}`)
})