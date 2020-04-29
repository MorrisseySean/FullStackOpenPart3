require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");

let persons = [
  {
    name: "Arto Hellas",
    number: "21-21-121212",
    id: 1,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 2,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 3,
  },
];

app.use(express.json());
morgan.token("newPerson", function (req, res) {
  return "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :newPerson"
  )
);

app.use(cors());

app.use(express.static("build"));

app.get("/api/persons", (req, res) => {
  /* Find all persons on the database */
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/info", (req, res) => {
  const total = persons.length;
  const date = new Date();
  res.send(`<p>Phonebook has info for ${total} people.</p><p>${date}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      error: "No Body",
      req: req.headers,
    });
  }
  let error = "";
  if (!body.name || !body.number) {
    error = "The name or number is missing.\n";
  } else {
    const person = persons.find((person) => person.name === body.name);
    if (person) {
      error = "Name must be unique.";
    }
  }
  if (error != "") {
    return res.status(400).json({
      error,
    });
  }

  /* Create new Person object */
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  /* Save to database */
  person.save().then((response) => {
    res.json(person);
  });

  /* Log data */
  morgan.token("newPerson", function (req, res) {
    return JSON.stringify(person);
  });
});

app.put("/api/persons/:id", (req, res) => {
  /* Create new Person object */
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  /* Update on the database */
  Person.findByIdAndUpdate(req.params.id, person).then((response) => {
    person.id = req.params.id;
    res.json(person);
  });

  /* Log data */
  morgan.token("newPerson", function (req, res) {
    return JSON.stringify(person);
  });
});

app.delete("/api/persons/:id", (req, res) => {
  /* Remove person with id from database */
  Person.findByIdAndRemove(req.params.id).then((result) => {
    res.status(204).end();
  });
  // const id = Number(req.params.id);
  // persons = persons.filter((person) => person.id != id);
});

const errorHandler = (err, request, response, next) => {
  console.error(err.message);

  if (err.name === "CastError") {
    return response.status(400).send({ error: "Malformed id" });
  }
  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function generateId() {
  return Math.floor(Math.random() * (5000 - 1)) + 1;
}
