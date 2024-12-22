import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()
dotenv.config()

const port = 3005
app.use(cors({ origin: '*' })) //cors
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))

app.listen(port, function() {
    console.log(`Api corriendo en http://localhost:${port} !`)
})

app.get('/', (req, res) =>{
    console.log('Mi primer endponit')
    res.status(200).send('Hola mundo, mi primera API!')
})