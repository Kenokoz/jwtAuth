require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use('/auth', authRoutes);

const start = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://user:user@cluster0.cskco.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    );
    app.listen(PORT, () => {
      console.log(`Server is started on PORT = ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
