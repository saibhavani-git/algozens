require('dotenv').config();

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

const DB_URL =
  process.env.DB_URL ||
  process.env.MONGODB_URI ||
  (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/dsa-platform');

if (!DB_URL) {
  throw new Error(
    'Missing DB_URL. Add your MongoDB Atlas connection string in Vercel → Settings → Environment Variables, then redeploy.'
  );
}

mongoose.connect(DB_URL);
mongoose.set('strictPopulate', false);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Database connected');
  try {
    await ensureFacts();
  } catch (err) {
    console.error('Could not seed Did you know facts:', err);
  }
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

const fs = require('fs');


const promptPath = path.join(__dirname, 'ai', 'gemini-instructions.md');
const promptText = fs.readFileSync(promptPath, 'utf-8');

app.use(session(sessionConfig));
app.use(flash());
app.use(express.json());
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
  res.locals.didYouKnow = req.session.didYouKnow || null;
  if (req.session.didYouKnow) {
    delete req.session.didYouKnow;
  }
  next();
});

const { isloggedin } = require('./middleware');
const {
  APPROACHES,
  APPROACH_LABELS,
  emptyApproaches,
  progressFromApproaches,
  codesFromApproaches,
  parseCoachResponse,
  applyApproachMark,
  pendingQuiz,
  complexityMatches,
  gradeComplexity,
  summarizeUserProgress
} = require('./utils/coach');
const Fact = require('./models/fact');
const { FACTS } = require('./utils/facts');



const DSA_CATEGORIES = [
  { slug: 'arrays', name: 'Arrays', icon: 'fas fa-grip', blurb: 'Store and scan values in contiguous memory.' },
  { slug: 'linked-list', name: 'Linked List', icon: 'fas fa-link', blurb: 'Nodes connected by pointers — reverse, merge, detect cycles.' },
  { slug: 'searching', name: 'Searching', icon: 'fas fa-magnifying-glass', blurb: 'Find a target with binary search and its variants.' },
  { slug: 'sorting', name: 'Sorting', icon: 'fas fa-arrow-down-short-wide', blurb: 'Arrange elements with classic divide-and-conquer sorts.' },
  { slug: 'dynamic-programming', name: 'Dynamic Programming', icon: 'fas fa-layer-group', blurb: 'Break problems into overlapping subproblems.' },
  { slug: 'graphs', name: 'Graphs', icon: 'fas fa-share-nodes', blurb: 'Traversal, cycles, islands, and shortest paths.' },
  { slug: 'other', name: 'Other', icon: 'fas fa-ellipsis', blurb: 'Strings, stacks, and problems that sit between topics.' }
];

async function attachLoginFact(req) {
  const count = await Fact.countDocuments();
  if (count === 0) return;
  const fact = await Fact.findOne().skip(Math.floor(Math.random() * count));
  if (fact) req.session.didYouKnow = { title: fact.title, body: fact.body };
}

async function ensureFacts() {
  const count = await Fact.countDocuments();
  if (count === 0) {
    await Fact.insertMany(FACTS);
    console.log(`Seeded ${FACTS.length} Did you know facts`);
  }
}

app.get('/', async (req, res) => {
  const questionCount = await Question.countDocuments();
  res.render('home', { questionCount, topicCount: DSA_CATEGORIES.length });
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
    req.login(registeredUser, async err => {
      if (err) return next(err);
      try {
        await attachLoginFact(req);
      } catch (factErr) {
        console.error('Did-you-know fact error:', factErr);
      }
      req.flash('success', 'Welcome to Algozens!');
      req.session.save(() => res.redirect('/dsa'));
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
}), async (req, res) => {
  try {
    await attachLoginFact(req);
  } catch (err) {
    console.error('Did-you-know fact error:', err);
  }
  req.flash('success', 'Welcome back!');
  const redirectUrl = req.session.returnTo || '/dsa';
  delete req.session.returnTo;
  req.session.save(() => res.redirect(redirectUrl));
});

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/');
  });
});


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCW8QkxPYNlDYYWToOCgz-23Fe17Ze_jpc");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/dsa', isloggedin, async (req, res) => {
  const [counts, questions, user] = await Promise.all([
    Question.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Question.find().select('title category'),
    User.findById(req.user._id)
  ]);
  const stats = summarizeUserProgress(user, questions, DSA_CATEGORIES);
  const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));
  const solvedMap = Object.fromEntries(stats.categories.map(c => [c.slug, c.solved]));
  const categories = DSA_CATEGORIES.map(cat => ({
    ...cat,
    count: countMap[cat.slug] || 0,
    solved: solvedMap[cat.slug] || 0
  }));
  res.render('dsa/index', {
    categories,
    solvedCount: stats.solvedCount,
    totalQuestions: stats.totalQuestions,
    inProgress: stats.inProgress
  });
});

app.get('/profile', isloggedin, async (req, res) => {
  const [questions, user] = await Promise.all([
    Question.find().select('title category'),
    User.findById(req.user._id)
  ]);
  const stats = summarizeUserProgress(user, questions, DSA_CATEGORIES);
  res.render('users/profile', { stats, approachLabels: APPROACH_LABELS });
});

app.get('/dsa/:category', isloggedin, async (req, res) => {
    const { category } = req.params;
    const meta = DSA_CATEGORIES.find(c => c.slug === category);
    if (!meta) {
        req.flash('error', 'That topic does not exist.');
        return res.redirect('/dsa');
    }
    try {
        const cuser = await User.findById(req.user._id);
        const question = await Question.find({ category });
        const totalq = question.length;
        const idsInCategory = new Set(question.map(q => q._id.toString()));
        const solvedq = cuser.catQ.filter(id => idsInCategory.has(id.toString())).length;
        const progressByQuestion = {};
        question.forEach(q => {
            const sub = cuser.submissions.find(s => s.questionId && s.questionId.equals(q._id));
            progressByQuestion[q._id.toString()] = progressFromApproaches(sub && sub.approaches);
        });
        res.render('dsa/category', {
            question,
            totalq,
            solvedq,
            set: cuser.catQ.map(id => id.toString()),
            category,
            categoryLabel: meta.name,
            progressByQuestion,
            approachLabels: APPROACH_LABELS
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

app.post('/check', isloggedin, async (req, res) => {
  const { qid, status } = req.body;
  const cuser = await User.findById(req.user._id);
  if (status) {
    if (!cuser.catQ.map(id => id.toString()).includes(qid)) {
      cuser.catQ.push(qid);
      await cuser.save();
    }
  } else {
    cuser.catQ.pull(qid);
    await cuser.save();
  }
  const Q = await Question.findById(qid);
  const cattotal = await Question.find({ category: Q.category });
  const catIds = new Set(cattotal.map(q => q._id.toString()));
  const sol = cuser.catQ.filter(id => catIds.has(id.toString())).length;
  res.send({ sol, solvedq: cattotal.length, set: cuser.catQ });
});

app.get('/dsa/:category/:id/approach/:kind', isloggedin, async (req, res) => {
  const { id, kind } = req.params;
  if (!APPROACHES.includes(kind)) {
    return res.status(400).json({ error: 'Unknown approach' });
  }
  const user = await User.findById(req.user._id);
  const submission = user.submissions.find(sub => sub.questionId && sub.questionId.equals(id));
  const approaches = codesFromApproaches(submission && submission.approaches);
  const progress = progressFromApproaches(submission && submission.approaches);
  if (!progress[kind]) {
    return res.status(404).json({ error: 'This approach is not saved yet.' });
  }
  res.json({
    kind,
    label: APPROACH_LABELS[kind],
    code: approaches[kind] || '',
    done: true
  });
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
        const progress = progressFromApproaches(userSubmission && userSubmission.approaches);
        const approachCodes = codesFromApproaches(userSubmission && userSubmission.approaches);
        res.render('dsa/dubofid1', {
          question,
          storedCode,
          user,
          hintText: null,
          progress,
          approachCodes,
          approachLabels: APPROACH_LABELS,
          classifiedApproach: null,
          quiz: pendingQuiz(userSubmission && userSubmission.approaches),
          quizResult: null
        });

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
      const scode = String(code || '')
        .replace(/^only hint-\d+: /, "")
        .replace(/^only solution: /, "")
        .replace(/\/\/ Write your solution here\.\.\./g, "");

      let existingSubmission = user.submissions.find(sub => sub.questionId.equals(id));
      if (existingSubmission) {
          existingSubmission.storedCode = scode;
          existingSubmission.submittedAt = new Date();
          if (!existingSubmission.approaches) {
              existingSubmission.approaches = emptyApproaches();
          }
      } else {
          user.submissions.push({
              questionId: id,
              storedCode: scode,
              submittedAt: new Date(),
              approaches: emptyApproaches()
          });
          existingSubmission = user.submissions[user.submissions.length - 1];
      }

      let progress = progressFromApproaches(existingSubmission.approaches);
      const remaining = APPROACHES.filter(key => !progress[key]).map(key => APPROACH_LABELS[key]);
      const coachPrompt = `${promptText}

Problem title: ${question.title}
Category: ${question.category}
Description: ${question.description}
Input format: ${question.inputFormat}
Output format: ${question.outputFormat}
Sample tests: ${JSON.stringify(question.testCases || [])}

Already completed approaches: ${APPROACHES.filter(key => progress[key]).map(key => APPROACH_LABELS[key]).join(', ') || 'none'}
Still needed: ${remaining.join(', ') || 'none — question is complete'}

User code:
\`\`\`javascript
${scode || '(no code yet)'}
\`\`\`

If this code is correct, classify it, then ask for the NEXT step on the ladder only:
- brute → ask for better
- better → ask for optimized (never ask for brute after better)
- optimized → they will take a complexity quiz in the UI

Always include a tiny example in hint (a short input and what should happen). No full solution code.

Return JSON only in this exact shape:
{"status":"correct","classification":"optimized","hint":"student-facing message with a small example","timeComplexity":"O(n)","spaceComplexity":"O(1)","complexityExplanation":"why those bounds hold"}
classification must be brute, better, optimized, or null.`;

      let hintText = 'Could not generate a hint right now. Try again in a moment.';
      let coach = null;
      try {
          let raw = '';
          try {
              const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: coachPrompt }] }],
                generationConfig: { responseMimeType: 'application/json' }
              });
              raw = result.response.text();
          } catch (jsonModeError) {
              const result = await model.generateContent(coachPrompt);
              raw = result.response.text();
          }
          coach = parseCoachResponse(raw);
          hintText = coach.message;

          if (coach.status === 'correct' && coach.approach) {
              try {
                  const marked = applyApproachMark(existingSubmission.approaches, coach.approach, scode, {
                      timeComplexity: coach.timeComplexity,
                      spaceComplexity: coach.spaceComplexity,
                      complexityExplanation: coach.complexityExplanation
                  });
                  existingSubmission.approaches = marked;
                  existingSubmission.markModified('approaches');
                  user.markModified('submissions');
                  progress = progressFromApproaches(marked);
                  const qid = question._id.toString();
                  if (progress.complete && !user.catQ.map(id => id.toString()).includes(qid)) {
                      user.catQ.push(qid);
                      user.total = user.catQ.length;
                  }
              } catch (markError) {
                  console.error('Failed to save approach mark:', markError);
                  progress = progressFromApproaches(applyApproachMark(existingSubmission.approaches, coach.approach, scode));
              }
          }
      } catch (aiError) {
          console.error('Gemini hint error:', aiError);
      }

      await user.save();
      const userSubmission = user.submissions.find(sub => sub.questionId.equals(id));
      if (coach && coach.approach) {
          progress = progressFromApproaches({
              brute: { done: progress.brute || coach.approach === 'brute' },
              better: { done: progress.better || coach.approach === 'better' },
              optimized: { done: progress.optimized || coach.approach === 'optimized' }
          });
      }

      res.render('dsa/dubofid1', {
          question,
          hintText,
          storedCode: userSubmission ? userSubmission.storedCode : '',
          progress,
          approachCodes: codesFromApproaches(userSubmission && userSubmission.approaches),
          approachLabels: APPROACH_LABELS,
          classifiedApproach: coach && coach.approach ? coach.approach : null,
          quiz: pendingQuiz(userSubmission && userSubmission.approaches, coach && coach.approach),
          quizResult: null
      });

  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while saving the submission.");
  }
});

app.post('/dsa/:category/:id/complexity', isloggedin, async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findById(id);
    if (!question) return res.status(404).send('Question not found');

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found');

    const existingSubmission = user.submissions.find(sub => sub.questionId.equals(id));
    const graded = gradeComplexity(
      existingSubmission && existingSubmission.approaches,
      req.body.approach,
      req.body.time,
      req.body.space
    );

    let quizResult = null;
    if (graded.ok && existingSubmission) {
      existingSubmission.approaches = graded.approaches;
      existingSubmission.markModified('approaches');
      user.markModified('submissions');
      await user.save();
      quizResult = graded.quizResult;
    }

    const userSubmission = user.submissions.find(sub => sub.questionId.equals(id));
    const progress = progressFromApproaches(userSubmission && userSubmission.approaches);
    res.render('dsa/dubofid1', {
      question,
      storedCode: userSubmission ? userSubmission.storedCode : '',
      user,
      hintText: quizResult
        ? (quizResult.correct
          ? 'Complexity locked for this approach. Keep climbing the ladder if anything is still open.'
          : 'Approach is still saved. Try the Big-O again using the explanation below.')
        : (graded.error || 'Submit time and space for an accepted approach.'),
      progress,
      approachCodes: codesFromApproaches(userSubmission && userSubmission.approaches),
      approachLabels: APPROACH_LABELS,
      classifiedApproach: quizResult ? quizResult.approach : null,
      quiz: pendingQuiz(userSubmission && userSubmission.approaches, req.body.approach),
      quizResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while checking complexity.');
  }
});

// Error handling middleware (optional)
// app.use((err, req, res, next) => {
//   const { statusCode = 500 } = err;
//   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
//   res.status(statusCode).render('error', { err });
// });

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Serving on port ${port}`);
  });
}
