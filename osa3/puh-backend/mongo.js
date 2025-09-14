import mongoose from 'mongoose'

// Tarkistetaan komentorivin parametrit
if (process.argv.length < 3) {
  console.log('Anna MongoDB-salasana komentoriviparametrina')
  process.exit(1)
}

const password = process.argv[2]

// 💡 Korvaa <db_password> salasanalla tässä rivissä!
const url =
  `mongodb+srv://riku:${password}@puhlue.a5euszm.mongodb.net/phonebook?retryWrites=true&w=majority&appName=puhlue`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Skeema ja malli
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// --- Jos annettu vain salasana → listaa kaikki ---
if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((p) => console.log(`${p.name} ${p.number}`))
    mongoose.connection.close()
  })
}
// --- Jos annettu nimi ja numero → lisää uusi ---
else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({ name, number })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
// --- Muut määrät → virheilmoitus ---
else {
  console.log('Käyttö:')
  console.log('  node mongo.js <salasana>            # listaa kaikki')
  console.log('  node mongo.js <salasana> Nimi Numero # lisää uuden')
  mongoose.connection.close()
}
