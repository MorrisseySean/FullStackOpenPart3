require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

let persons = [
  {
    name: 'Arto Hellas',
    number: '21-21-121212',
    id: 1,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 2,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 3,
  },
]

app.use(express.json())
morgan.token('newPerson', function () {
  return ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :newPerson'
  )
)

app.use(cors())

app.use(express.static('build'))

app.get('/api/persons', (_req, res, next) => {
  /* Find all persons on the database */
  Person.find({})
    .then((result) => {
      res.json(result)
    })
    .catch((err) => next(err))
})

app.get('/api/info', (_req, res, next) => {
  Person.countDocuments()
    .then((response) => {
      const date = new Date()
      res.send(
        `<p>Phonebook has info for ${response} people.</p><p>${date}</p>`
      )
    })
    .catch((err) => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  // const id = Number(req.params.id);
  // const person = persons.find((person) => person.id === id);
  // if (person) {
  //  res.json(person);
  //} else {
  //  res.status(404).end();
  //}
  Person.findById(req.params.id)
    .then((response) => {
      res.json(response)
    })
    .catch((err) => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body) {
    return res.status(400).json({
      error: 'No Body',
      req: req.headers,
    })
  }
  let error = ''
  if (!body.name || !body.number) {
    error = 'The name or number is missing.\n'
  } else {
    const person = persons.find((person) => person.name === body.name)
    if (person) {
      error = 'Name must be unique.'
    }
  }
  if (error != '') {
    return res.status(400).json({
      error,
    })
  }

  /* Create new Person object */
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  /* Save to database */
  person
    .save()
    .then(() => {
      res.json(person)
    })
    .catch((err) => next(err))

  /* Log data */
  morgan.token('newPerson', function () {
    return JSON.stringify(person)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  /* Create new Person object */
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }

  /* Update on the database */
  Person.findByIdAndUpdate(req.params.id, person)
    .then(() => {
      person.id = req.params.id
      res.json(person)
    })
    .catch((err) => next(err))

  /* Log data */
  morgan.token('newPerson', function () {
    return JSON.stringify(person)
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  /* Remove person with id from database */
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((err) => next(err))
  // const id = Number(req.params.id);
  // persons = persons.filter((person) => person.id != id);
})

const errorHandler = (err, _req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'Malformed id' })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
