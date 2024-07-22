require('dotenv').config();

const express= require('express');
const expressLayout= require('express-ejs-layouts');
const path= require('path')

const app=express();
const PORT= 5000 || process.env.PORT;

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

app.use('/', require('./server/routes/main'))

app.listen(PORT, ()=>{
    console.log(`App listening on port ${PORT}`);
})
