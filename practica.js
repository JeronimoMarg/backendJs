const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

//Se crea el token "body" para poder acceder al body del request en forma de string
morgan.token('body', (req) => JSON.stringify(req.body))
//Con ese token + los tokens de la configuracion tiny se arma la string de log
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = 
[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    logger(request, response)
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const persona = persons.find(p => p.id===id)
    if(persona){
        response.json(persona)
    }else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const persona = persons.find(p => p.id===id)
    if (persona){
        response.status(204).end()
        persons = persons.filter(p => p.id !== id)
    }else{
        //Quizas es error de seguridad poner 404 en vez de 204 para una persona que no existe
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body   //obtiene el json del body
    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    }else if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const persona = {
        id: String(Math.floor(Math.random() * 1000)),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(persona)

    response.json(persona)

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})