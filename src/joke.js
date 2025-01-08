import mongoose from 'mongoose'
const Schema = mongoose.Schema

const JokeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: false
    },
    score: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },

})

const Joke = mongoose.model('Joke', JokeSchema)
export { Joke }