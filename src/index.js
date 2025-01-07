import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

/* Importacion de schemas */
import { User } from './user.js'
import { Joke } from './joke.js'

const app = express()
dotenv.config()

const port = 3005
app.use(cors({ origin: '*' })) //cors
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))

app.listen(port, function() {
    connectDB()
    console.log(`Api corriendo en http://localhost:${port} !`)
})

/* Inicio del servidor node */
app.get('/', (req, res) => {
    console.log('Mi primer endponit')
    res.status(200).send('Hola mundo, mi primera API!')
})

/* GET 1: Extraer chistes randoms de las apis */
app.get('/joke/', async (req, res) => {
    const { joke } = req.query

    if (joke === 'Chuck'){
        const radomJoke = await fetch("https://api.chucknorris.io/jokes/random")
        const response = await radomJoke.json()
        
        res.status(200).send(String(response.value))

        return
    }

    if (joke === 'Dad'){
        const radomJoke = await fetch("https://icanhazdadjoke.com/", 
            { headers: { Accept: 'application/json' } 
        })

        const response = await radomJoke.json()
        
        res.status(200).send(String(response.joke))

        return
    }

    if(joke === 'Propio') {
        const joke = await Joke.find()
        
        if(joke.length) {
            const jokeRandom = Math.floor(Math.random(joke.length))
            
            res.status(200).send(String(joke[jokeRandom].name))
        } else {
            res.status(200).send('Aun no hay chistes, cree uno!')
        }

        return
    } 

    res.status(404).send('Debe de enviar un parametro: "Chuck", "Dad" o "Propio"')
})

/* POST: Crear un nuevo chiste en la BD */
app.post('/joke/', async(req, res) => {
    try {
        const {
            name,
            author,
            score,
            category
        } = req.body

        if(Number(score) > 10 | Number(score) < 0) {
            res.status(404).send('El puntaje debe ser entre 0 y 10')
            return
        }

        if(
            category !== 'Dad joke' &&
            category !== 'Humor Negro' &&
            category !== 'Chistoso' &&
            category !== 'Malo'
        ) {
            res.status(404).send('La categoria debe ser Dad joke, Humor Negro, Chistoso o Malo')
            return
        }
       
        const newJoke = new Joke({
            id: Math.floor(Math.random()*1000),
            name,
            author: !author ? 'Se perdió en el Ávila como Led' : author,
            score: score,
            category
        })
                
        await newJoke.save()
    
        res.status(200).json({
            mensaje: 'Chiste creado exitosamente',
            chiste: {
                id: Math.floor(Math.random()*1000),
                name,
                author: !author ? 'Se perdió en el Ávila como Led' : author,
                score: score,
                category
            }
        })    
    } catch (error) {
        console.error(error)
        res.status(404).send('Ocurrio un error al intentar guardar el chiste')
    }
})

/* PUT: Actualizar un chiste ya existente en la BD */
app.put('/joke/:id', async(req, res) => {
    try {
        const { id } = req.params

        const {
            name,
            author,
            score,
            category
        } = req.body

        if(Number(score) > 10 | Number(score) < 0) {
            res.status(404).send('El puntaje debe ser entre 0 y 10')
            return
        }

        if(
            category !== 'Dad joke' &&
            category !== 'Humor Negro' &&
            category !== 'Chistoso' &&
            category !== 'Malo'
        ) {
            res.status(404).send('La categoria debe ser Dad joke, Humor Negro, Chistoso o Malo')
            return
        }

        const joke = await Joke.findOneAndUpdate({id}, {$set: req.body}, {new: false})
        
        res.status(200).json({
            mensaje: 'Chiste actualizado exitosamente',
            chiste: {
                id: joke.id,
                name,
                author,
                score,
                category
            }
        })    
    } catch (error) {
        console.error(error)
        res.status(404).send('No existe el chiste con ese id, intente con otro')
    }
})


app.get('/usuarios', async (req, res) => {
    try{
        var usuarios = await User.find().exec()

        res.status(200).send({
            success: true,
            message: "Se encontraron los usuarios exitosamente",
            outcome: [usuarios]    
        })
    }catch(err){
        res.status(400).send({
            success: false,
            message: "Error al intentar obtener los usuraios, intentelo nuevamente",
            outcome: []
        })
    }
})

app.post('/', async (req, res) => {

    try{
        var data = req.body
        var newUser = new User(data)
        console.log(newUser)
        await newUser.save()
        res.status(200).send({

            success: true,
            message: "Se registro el usuario",
            outcome: []
        })
    }catch(err){

        res.status(400).send({

            success: false,
            message: "Error al intentar crear el usuario, por favor intente nuevamente.",
            outcome: []
        })
    }
})

const connectDB = () => {

    const {
        MONGO_USERNAME,
        MONGO_PASSWORD,
        MONGO_HOSTNAME,
        MONGO_PORT,
        MONGO_DB
    } = process.env

    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`

    mongoose.connect(url).then( function() {
        console.log('MongoDB is connected')
    }).catch( function(err) {
        console.log(err)
    })
}