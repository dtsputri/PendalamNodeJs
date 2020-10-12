import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import hbs from 'hbs'
import path from 'path'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import fs from 'fs'

//const database = require('./database')
import { initDatabase, initTable, insertProduct, getProduct } from './database.js'

const __dirname = path.resolve()

const app = express()
const db = initDatabase()
initTable(db)

app.set('views', __dirname + '/layouts')
app.set('view engine', 'html')
app.engine('html', hbs.__express)

app.use(fileUpload())


app.use(morgan('combined'))

app.use(bodyParser.urlencoded())
//membuat file statis agar bisa di akses 
app.use('/assets', express.static(__dirname + '/assets'))
app.use('/files', express.static(__dirname + '/files'))

app.get('/', (req, res, next) => {
  res.send({ success: true })
})

//product list
app.get('/product', async (req, res, next) => {

  let products
  try {
    products = await getProduct(db)
  } catch (error) {
    return next(error)
  }

  res.render('product', { products })
})

//  GET method
app.get('/add-product', (req, res, next) => {
  res.send(req.query)
})

// POST method
app.post('/add-product', (req, res, next) => {
  console.log('Request', req.body)
  console.log('File', req.files)
  // get file name
  const fileName = Date.now() + req.files.photo.name

  // write file photo
  fs.writeFile(path.join(__dirname, '/files/', fileName), req.files.photo.data, (err) => {
    if (err) {
      console.error(err)
      return
    }

    // insert product ke query 
    insertProduct(db, req.body.name, parseInt(req.body.price), `/files/${fileName}`)
    
    // redirect kembali ke halaman awal 
    res.redirect('/product')
  })
})

app.use((err, req, res, next) => {
  res.send(err.message)
})

// use port variable biasa
// app.listen(7000,()=>{
//     console.log("app listen on port 7000")
// })
//use port environment variable
var port = process.env.PORT;
var host  = process.env.HOST;

app.listen(port, host, () => {
  console.log(`App listen on port ${host}:${port}`)
})