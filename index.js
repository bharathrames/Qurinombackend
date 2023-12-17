const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;
app.use(cors());

mongoose.connect('mongodb+srv://bharath91505:bharath123@cluster1.sjccidx.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

const cardSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Card = mongoose.model('Card', cardSchema);

app.use(bodyParser.json());


app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(200).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});


app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      
      const user = await User.findOne({ username });
  
      if (!user) {
        res.status(404).send('User not found');
        return;
      }
  
      
      const match = await bcrypt.compare(password, user.password);
  
      if (match) {
        res.status(200).send('Login successful. Redirect to dashboard');
      } else {
        res.status(401).send('Incorrect password');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error finding user');
    }
  });
  
  app.post('/create-card', async (req, res) => {
    try {
      const { title, description } = req.body;
  
      const newCard = new Card({
        title,
        description,
      });
  
      await newCard.save();
  
      res.status(200).send('Card created successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating card');
    }
  });
  
  
  app.get('/cards', async (req, res) => {
    try {
      const cards = await Card.find();
      res.json(cards);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching cards');
    }
  });

  app.put('/update-card/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    try {
      const updatedCard = await Card.findByIdAndUpdate(id, { title, description }, { new: true });
      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
 
  app.delete('/delete-card/:id', async (req, res) => {
    try {
      const cardId = req.params.id;
      await Card.findByIdAndDelete(cardId);
      res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
