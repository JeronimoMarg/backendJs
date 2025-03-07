require('dotenv').config()
const Note = require('./models/note')

const express = require('express')
const app = express()
app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

//---------------------------------------------------------------------------------------------//

//Pagina de bienvenida?
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
//Obtener todas las notas
app.get('/api/notes', (request, response) => {
  Note.find({}).then(n => {
    response.json(n)
  })
})

//Obtener una nota especifica (id)
app.get('/api/notes/:id', (request, response, next) => {
    const id = request.params.id
    Note.findById(id).then(note => {
      if(note){
        response.json(note)
      }else{
        response.status(404).send({error: 'note not found'})
      }
    }).catch(error => next(error))
})

//Borrar una nota por id
app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    Note.findByIdAndDelete(id).then(() => {
      //En este caso no distingo entre encontrada y no para no informar si existia en base de datos
      response.status(204).end()
    }).catch(error => {
      console.log(error)
      response.status(500).send({error: "Server error"})
    })
})

/* //Funcion antigua para generar IDs de objetos
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}
*/

//Crear una nueva nota
app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ error: 'content missing'})
  }

  const note = new Note({
    content: body.content,
    important: body.important || false
  })

  note.save().then(result => {
    console.log('note saved!', result)
    response.json(result)
  })
})

//Update de la nota
app.put('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body
  if(!body.content){
      return response.status(400).json({
          error: 'content missing'
      })
  }
  const note = {
      content: body.content,
      important: body.important || false
  }

  Note.findByIdAndUpdate(id, note, {new:true}).then(updated => {
    response.json(updated)
  }).catch(error => next(error))
  
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})