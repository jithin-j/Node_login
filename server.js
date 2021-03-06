var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ksdfjackl;jsdkl;jx;lsdcggnfymc864gt86tmfuj677,l5duyjhn6'

mongoose.connect('mongodb+srv://test:test@cluster0.zikby.mongodb.net/signup_data?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
var app = express();
app.set('view engine', 'ejs');

//app.use('/', express.static(path.join(__dirname, 'static')))

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', function(req,res){
  res.sendFile(__dirname + '/login.html');
});
app.get('/change-password', function(req,res){
  res.sendFile(__dirname + '/change-password.html');
});
app.use(express.json());

app.post('/api/change-password', async (req, res) => {
  const { token, newpassword: plainTextPassword } = req.body
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}
  try{
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    const password = await bcrypt.hash(plainTextPassword, 10)
    await User.updateOne(
      {_id},
      {
        $set: { password }
      }
      )
      res.json({ status: 'ok' })
  } catch(error){
    console.log(error)
    res.json({ status: 'error', error: ';))' })
  }
})

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
  console.log(req.body);

  
  const {username, password: plainTextPassword } = req.body
  if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

  const password = await bcrypt.hash(plainTextPassword, 10)

  try {
      const response = await User.create({
        username,
        password
      })
      console.log('User created successfully! ', response)
  } catch(error) {
      if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
  }
  
  res.json({ status: 'ok'})
})
app.listen(3000);