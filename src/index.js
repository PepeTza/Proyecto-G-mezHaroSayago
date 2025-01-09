
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './swagger.js'

/* Importacion de schemas */
import { User } from './user.js'
import { Joke } from './joke.js'

const app = express()
dotenv.config()

const port = 3005
app.use(cors({ origin: '*' })) //cors
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(port, function() {
    connectDB()
    console.log(`Api corriendo en http://localhost:${port} !`)
})

/* Inicio del servidor node */

app.get('/', (req, res) => {
    console.log('Mi primer endponit')
    res.status(200).send('Hola mundo, mi primera API!')
});

/* GET : Extraer chistes randoms de las apis */

/**
 * @swagger
 * /joke/:
 *   get:
 *     summary: Extraer chistes randoms de las apis
 *     description: Obtiene un chiste aleatorio de Chuck Norris, Dad jokes o de la base de datos.
 *     parameters:
 *       - in: query
 *         name: joke
 *         schema:
 *           type: string
 *         required: true
 *         description: Tipo de chiste a obtener ("Chuck", "Dad" o "Propio")
 *     responses:
 *       200:
 *         description: Chiste obtenido exitosamente
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Debe de enviar un parametro: "Chuck", "Dad" o "Propio"
 */

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
/**
 * @swagger
 * /joke/:
 *   post:
 *     summary: Crear un nuevo chiste en la BD
 *     description: Crea un nuevo chiste en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               score:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chiste creado exitosamente
 *       404:
 *         description: Error al intentar guardar el chiste
 */

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
            name,
            author: !author ? 'Se perdió en el Ávila como Led' : author,
            score: score,
            category
        })
        
        await newJoke.save()

        res.status(200).json({
            mensaje: 'Chiste creado exitosamente',
            chiste: {
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
/**
 * @swagger
 * /joke/{id}:
 *   put:
 *     summary: Actualizar un chiste ya existente en la BD
 *     description: Actualiza un chiste existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del chiste a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               score:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chiste actualizado exitosamente
 *       404:
 *         description: No existe el chiste con ese id, intente con otro
 */

app.put('/joke/:_id', async(req, res) => {
    try {
        const { _id } = req.params
        console.log(_id)
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

        const joke = await Joke.findOneAndUpdate({_id}, {$set: req.body}, {new: false})
        console.log(joke)
        res.status(200).json({
            mensaje: 'Chiste actualizado exitosamente',
            chiste: {
                id: joke._id,
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

/* GET: Buscar chiste por ID */
/**
 * @swagger
 * /joke/{_id}:
 *   get:
 *     summary: Obtener un chiste por ID
 *     description: Obtiene un chiste específico de la base de datos usando su ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del chiste a obtener
 *     responses:
 *       200:
 *         description: Chiste obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 author:
 *                   type: string
 *                 score:
 *                   type: number
 *                 category:
 *                   type: string
 *       404:
 *         description: No se encontró el chiste
 */

app.get('/joke/:_id', async (req, res) => {
    try {
        const { _id } = req.params
        const joke = await Joke.findOne({_id})
        if(joke) {
            res.status(200).send(joke)
        } else {
            res.status(404).send('No se encontro el chiste')
        }
    } catch (error) {
        console.error(error)
        res.status(404).send('No se encontro el chiste')
    }
})




app.get('/contar/', async (req, res) => {
   
    try{
        
        const chistes = await Joke.find()
        let categoria = ""

        if(req.query.category){

            if(req.query.category == "Dad") categoria = "Dad joke"
            else if(req.query.category == "Humor") categoria = "Humor Negro"
            else categoria = req.query.category
        }
        if(categoria == "Dad joke" || categoria == "Humor Negro" || categoria == "Chistoso" || categoria == "Malo"){

            const chistesFiltrados = chistes.filter((chiste) => chiste.category === categoria);
            if(chistesFiltrados[0]){

                res.status(200).send({

                    success: true,
                    message: `Se encontraron ${chistesFiltrados.length} en la categoria: ${categoria}.`,
                    outcome: chistesFiltrados
                })
            }
            res.status(400).send({

                success: false,
                message: `Error: No se encontro ningun chiste en la categoria: ${categoria}.`,
                outcome: []
            })
        }
        else if(categoria !== ""){

            res.status(400).send({
                success: false,
                message: "La categoria debe ser Dad, Humor, Chistoso o Malo",
                outcome: []
            })
        }
        
        if(chistes[0]){

            res.status(200).send({

                success: true,
                message: `Se encontraron ${chistes.length} en la categoria: Todos.`,
                outcome: chistes
            })
        }
        res.status(400).send({

            success: false,
            message: `Error: No se encontro ningun chiste en la categoria: Todos.`,
            outcome: []
        })
        

    }catch(err){

        res.status(400).send({

            success: false,
            message: "Error inesperado.",
            outcome: []
        })
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