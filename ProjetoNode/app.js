const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./db/conn');
const User = require('./models/User');
const Post = require('./models/Post');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// View engine
app.engine('handlebars', exphbs.create({ defaultLayout: 'main' }).engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session & flash
app.use(session({
  secret: 'secret_studio_beleza',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.userSession = req.session.user || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/posts', postRoutes);

app.get('/', (req, res) => {
  res.redirect('/posts');
});

// Sync database and start server
db.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}).catch(err => console.log(err));
