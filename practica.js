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
app.get('/info', (request, response) => {
    Person.countDocuments().then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    }).catch(error => {
        response.status(500).send({error: "server error"})
    })
})

//Obtener todas las personas
app.get('/api/persons', (request, response) => {
    Person
    .find({})
    .then(personas => response.json(personas))
})

//Obtener una persona en especifico por id
app.get('/api/persons/:id', (request, response) => {
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
    .catch(error => {
        response.status(500).send({error: "server error"})
    })
})

//Eliminar una persona segun id
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person
    .findByIdAndDelete(id)
    .then(() =>{
        response.status(204).end()
    })
    .catch(error => {
        console.log(error)
        response.status(500).send({error: "server error"})
    })
})

//Crear una persona
app.post('/api/persons', (request, response) => {
    const body = request.body   //obtiene el json del body
    if(!body.name){
        return response.status(400).json({error: 'name missing'})
    }else if(!body.number){
        return response.status(400).json({error: 'number missing'})
    }

    const persona = new Person({
        name: body.name,
        number: body.number
    })

    persona
    .save()
    .then(resultado => {
        response.json(resultado)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send({error: "server error"})
    })
})

//Actualizar persona segun id
app.put('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const body = request.body
    if(!body.name){
        return response.status(400).json({error: 'name missing'})
    }else if(!body.number){
        return response.status(400).json({error: 'number missing'})
    }

    const persona = {
        name: body.name,
        number: body.number
    }

    Person
    .findByIdAndUpdate(id, persona, {new:true})
    .then(resultado => {
        response.json(resultado)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send({error: "server error"})
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
