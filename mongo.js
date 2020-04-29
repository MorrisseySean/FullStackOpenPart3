const mongoose = require("mongoose");

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

/* Check if there's a password provided */
if (!password) {
  console.log("Please provide a password.");
  process.exit(1);
}

/* Connect to database */
const url = `mongodb+srv://wolfbrand:${password}@cluster0-ibecy.mongodb.net/phonebook?retryWrites=true&w=majority`;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* Create Schema */
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema);

if (!name && !number) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
    process.exit(1);
  });
} else if (name && number) {
  const person = new Person({
    name,
    number,
  });
  person.save().then((response) => {
    console.log(`Added ${name} with number ${number} to phonebook.`);
    mongoose.connection.close();
  });
} else {
  console.log("Please provide a name and a number.");
  process.exit(1);
}
