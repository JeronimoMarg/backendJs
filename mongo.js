const mongoose = require('mongoose')

if (process.argv.length < 4) {
  console.log('give username and password as argument')
  process.exit(1)
}

const db_password = process.argv[3]
const db_username = process.argv[2]

const url = `mongodb+srv://${db_username}:${db_password}@clustermongodb.dma5z.mongodb.net/noteApp?retryWrites=true&w=majority&appName=ClusterMongoDB`

mongoose.set('strictQuery',false)

mongoose.connect(url)

//The schema tells Mongoose how the note objects are to be stored in the database.
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'Nota4',
  important: false,
})

note.save().then(result => {
  console.log('note saved!', result)
  //mongoose.connection.close()
})

Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })