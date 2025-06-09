const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
//const helmet = require('helmet');

const MongoStore = require('connect-mongo');  // Correct import
const User=require('./models/user')

const DB_URL = 'mongodb://localhost:27017/dsa-platform'; // Database URL
// process.env.DB_URL
mongoose.connect(DB_URL);
mongoose.set('strictPopulate', false);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
// Session store using MongoDB
// const store = new MongoStore({
//   mongoUrl: DB_URL, // Corrected option name
//   secret: 'thisshouldbeabettersecret',
//   touchAfter: 24 * 60 * 60,
// });
const store = MongoStore.create({
    mongoUrl: DB_URL, // ✅ Correct usage
    crypto: { secret: 'thisshouldbeabettersecret' },
    touchAfter: 24 * 60 * 60,
  });
  

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
   store,
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const Question = require('./models/questions');
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  
  next();
});

const { isloggedin } = require('./middleware');



app.get('/', (req, res) => {
  res.render('home');
});

app.get('/register', async (req, res) => {
  res.render('users/register');
});

app.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    //console.log(registeredUser);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Stream!');
      res.redirect('/dsa');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
});

app.get('/login', (req, res) => {
  res.render('users/login');
});

app.post('/login', passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/login'
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/dsa';
  // console.log(req.user);
  delete req.session.returnTo; // Clear after using
  res.redirect(redirectUrl);
});

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/dsa');
  });
});


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/dsa',isloggedin, async (req, res) => {
  const question = await Question.find();
  res.render('dsa/index', { question });
});
app.get('/dsa/:category',isloggedin, async (req, res) => {
    const { category } = req.params;

    try {
        // Fetch all questions for that category
        const question = await Question.find({ category });

        // Render the 'category' view, passing the 'questions' array
        res.render('dsa/category', { question});
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});

app.get('/dsa/:category/:id', isloggedin, async (req, res) => {
  const { id } = req.params;

  try {
      const question = await Question.findById(id);
      if (!question) return res.status(404).send('Question not found');

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).send("User not found");

      const userSubmission = user.submissions.find(sub => sub.questionId.equals(id));
        const storedCode = userSubmission ? userSubmission.storedCode : '';
       // console.log(user)
        res.render('dsa/dubofid1', { question, storedCode, user, result: null });

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching the question.");
  }
});



app.post('/dsa/:category/:id', isloggedin, async (req, res) => {
  const { id } = req.params;

  try {
      const question = await Question.findById(id);
      if (!question) {
          return res.status(404).send('Question not found');
      }

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).send("User not found");

      const { code } = req.body;

      // Find existing submission for this question
      const existingSubmission = user.submissions.find(sub => sub.questionId.equals(id));
      // const scode = code.replace(/^only hint-\d+: /, "").replace(/^only solution: /, "");
      const scode = code
  .replace(/^only hint-\d+: /, "")  // Remove the hint prefix
  .replace(/^only solution: /, "")  // Remove the solution prefix
  .replace(/\/\/ Write your solution here\.\.\./g, "");  // Remove the placeholder comment

      if (existingSubmission) {
          existingSubmission.storedCode = scode;
      
          existingSubmission.submittedAt = new Date();
      } else {
          user.submissions.push({
              questionId: id,
              storedCode: scode,
            
              submittedAt: new Date()
          });
      }

      // ✅ Save user to MongoDB
      await user.save();
      const result = await model.generateContent(`
        If the provided code is in C++, give a hint related to the code: 
        ${code}. 
        If the code is not in C++, tell the user to enter C++ code.
      `);
      
      // const result = await model.generateContent(`if the code is in cpp the give hint to the code ${code}`);
      //console.log(result)
      // ✅ Preload stored code in the editor
      const userSubmission = user.submissions.find(sub => sub.questionId.equals(id));

      res.render('dsa/dubofid1', { 
          question, 
          result,
          storedCode: userSubmission ? userSubmission.storedCode : '',  // Load previous code if exists
         // submissionCount: userSubmission ? userSubmission.count : 0  // ✅ Pass count to frontend
      });

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while saving the submission.");
  }
});

// Error handling middleware (optional)
// app.use((err, req, res, next) => {
//   const { statusCode = 500 } = err;
//   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
//   res.status(statusCode).render('error', { err });
// });

app.listen(3000, () => {
  console.log('Serving on port 3000');
});
