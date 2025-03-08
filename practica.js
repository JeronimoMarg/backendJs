require('dotenv').config()
const Person = require('./models/person')

const express = require('express')
const app = express()
app.use(express.json())

app.use(express.static('dist'))

const morgan = require('morgan')
const note = require('./models/note')
//Se crea el token "body" para poder acceder al body del request en forma de string
morgan.token('body', (req) => JSON.stringify(req.body))
//Con ese token + los tokens de la configuracion tiny se arma la string de log
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//---------------------------------------------------------------------------------------------//

//Pagina de bienvenida
app.get('/info', (request, response, next) => {
    Person
    .countDocuments()
    .then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

//Obtener todas las personas
app.get('/api/persons', (request, response, next) => {
    Person
    .find({})
    .then(personas => response.json(personas))
    .catch(error => next(error))
})

//Obtener una persona en especifico por id
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Person
    .findById(id)
    .then(per => {
        if(per){
            response.json(per)
        }else{
            response.status(404).send({error: 'persona no encontrada'})
        }
    })
    .catch(error => next(error))
})

//Eliminar una persona segun id
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Person
    .findByIdAndDelete(id)
    .then(() =>{
        response.status(204).end()
    })
    .catch(error => next(error))
})

//Crear una persona
app.post('/api/persons', (request, response, next) => {
    const body = request.body   //obtiene el json del body
    const persona = new Person({
        name: body.name,
        number: body.number
    })

    persona
    .save()
    .then(resultado => {
        response.json(resultado)
    })
    .catch(error => next(error))
})

//Actualizar persona segun id
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body
    const persona = {
        name: body.name,
        number: body.number
    }

    Person
    .findByIdAndUpdate(id, persona, {new:true})
    .then(resultado => {
        if (resultado) {
            response.json(resultado)
        } else {
            response.status(404).send({ error: 'persona no encontrada' })
        }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if(error.name === 'CastError'){
        return response.status(400).send({error:'malformatted id'})
    }
    else if(error.name === 'ValidationError'){
        //console.log(error.errors)   //loggear todos los errores
        if (error.errors.name && error.errors.name.kind === 'required') {
            return response.status(400).send({error: 'name missing'});
        }
        if (error.errors.number && error.errors.number.kind === 'required') {
            return response.status(400).send({error: 'number missing'});
        }
        if (error.errors.name && error.errors.name.kind === 'minlength') {
            return response.status(400).send({error: 'name too short, min 3 letters'});
        }
        if (error.errors.number && error.errors.number.kind === 'user defined'){
            return response.status(400).send({error: 'number in incorrect format'});
        }
        return response.status(400).send({error: 'name/number not valid'});
    }
    else{
        return response.status(500).send({error:'server error'})
    }
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
