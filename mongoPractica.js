const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const db_password = process.argv[3]
const db_username = process.argv[2]

const url = `mongodb+srv://${db_username}:${db_password}@clustermongodb.dma5z.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=ClusterMongoDB`

mongoose.set('strictQuery',false)

mongoose.connect(url)

//The schema tells Mongoose how the note objects are to be stored in the database.
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

name_argv = process.argv[4]
number_argv = process.argv[5]

if (name_argv && number_argv){
    //Se guarda una nueva persona segun parametros
    const pers = new Person({ 
        name: name_argv,
        number: number_argv
    })
    pers.save().then(result => {
      console.log('person saved!', result)
      mongoose.connection.close()
    })
}else{
    //Se muestran las personas en el phonebook
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(p => {
          console.log(p)
        })
        mongoose.connection.close()
      })
}