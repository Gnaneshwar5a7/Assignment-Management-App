const mongoose = require('mongoose');
require('dotenv').config();
const db = require('./models/db');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require("express-validator");
const { check, validationResult } = require('express-validator')
var session = require('express-session');
const question = require('./models/question');

const app = express();
const PORT = 8080;

mongoose.set('strictQuery', false);
// mongoose.connect("mongodb://127.0.0.1:27017/user");
mongoose.connect(process.env.MongoDB_CONNECT_URI);


app.set('view engine', 'pug');
app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'Star boyoyo44',
    resave: false,
    saveUninitialized: true
    // cookie: { maxAge: 60000 }
}))

app.get('/', function (req, res) {
    db.getAllAnswers();
    db.getAllQuestions();
    req.session.login = false;
    db.getBranchDetails(req, res);
});

app.post('/SignUp',
    check('username').not().isEmpty().isAlpha().isLength({ min: 5 }).withMessage('User name must be 5 characters'),
    check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Password name must be 6 characters'),
    check('cpassword').custom((value, { req }) => (value === req.body.password)).withMessage("Confirm password not match with your password"),
    check('email').not().isEmpty().isEmail().normalizeEmail().withMessage("Enetr proper email"),
    check('subject').not().isEmpty().isAlpha().withMessage('Invalid Subject'),
    check('branch').not().isEmpty().isAlpha().withMessage('Invalid Branch'),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            db.insert(req, res);
        }
    });

app.post('/Login', function (req, res) {
    db.login(req, res);
})

app.get('/Student', function (req, res) {
    if (req.session.login == false) {
        res.send("<script>alert('Session no longer exists')</script>")
    }
    req.session.questions = db.questions
    res.render("student", { username: req.session.username, id: req.session.id, x: req.session.branch, questions: req.session.questions, subjects: req.session.subjects });
})

app.get('/Subject', function (req, res) {
    console.log("Subject");
    console.log(req.session)
    if (req.session.login == false) {
        res.send("<script>alert('Session no longer exists')</script>")
    }
    req.session.subject = req.query.subject;
    req.session.questions = []
    for (var i = 0; i < req.session.questionDocs.length; i++) {
        if (req.session.questionDocs[i].subject == req.session.subject) {
            if (req.session.questions.indexOf(req.session.questionDocs[i].question) == -1) {
                req.session.questions.push(req.session.questionDocs[i].question);
            }
        }
    }
    req.session.answers = []
    req.session.submitions = []
    req.session.pending = []
    for (var i = 0; i <req.session.answerDocs.length; i++) {
        if (req.session.answerDocs[i].subject == req.session.subject && req.session.answerDocs[i].username == req.session.username) {
            if (req.session.submitions.indexOf(req.session.answerDocs[i].question) == -1) {
                req.session.submitions.push(req.session.answerDocs[i].question);
            }
            if (req.session.answers.indexOf(req.session.answerDocs[i].answer) == -1) {
                req.session.answers.push(req.session.answerDocs[i].answer);
            }
        }
    }
    req.session.questions.forEach(element => {
        if (req.session.submitions.indexOf(element) == -1) {
            req.session.pending.push(element)
        }
    });
    res.render('subject', req.session);
})



app.post('/Subject', function (req, res) {
    if (req.session.login == false) {
        res.send("<script>alert('Session no longer exists')</script>")
    }
    req.session.subject = req.body.subject;
    res.redirect('/Subject?subject=' + req.session.subject)
})

app.post('/answer', function (req, res) {
    db.submitAnswer(req, res);
})

app.get('/Faculty', function (req, res) {
    if (req.session.login == false) {
        res.send("<script>alert('Session no longer exists')</script>")
    }
    console.log(req.session.questions);
    req.session.questions = db.questions;
    req.session.usersubmitions = []
    for (var j = 0; j < req.session.questions.length; j++) {
        var x = [];
        for (var i = 0; i < req.session.answerDocs.length; i++) {
            if (req.session.answerDocs[i].question == req.session.questions[j] && req.session.answerDocs[i].subject==req.session.subject) {
                var doc = {}
                doc.username = req.session.answerDocs[i].username;
                doc.answer = req.session.answerDocs[i].answer;
                doc.question = req.session.answerDocs[i].question;
                if (x.indexOf(doc) == -1) {
                    x.push(doc);
                }
            }
        }
        if (req.session.usersubmitions.indexOf(x) == -1) {
            req.session.usersubmitions.push(x);
        }
    }
    console.log(req.session)
    var data = { username: req.session.username, x: req.session.subject, questions: req.session.questions, usersubmitions: req.session.usersubmitions }
    res.render("faculty", data);
})

app.post('/AddQuestion', function (req, res) {
    db.addQuestion(req, res);
})
app.post('/EditQuestion', function (req, res) {
    db.editQuestion(req, res);
})
app.post('/DeleteQuestion', function (req, res) {
    db.deleteQuestion(req, res);
})

app.get('/logout', function (req, res) {
    sess = req.session;
    sess.destroy();
  db.questionDocs = [];
   db.answerDocs = [];
   db.questions=[];

    sess.login = false;
    res.redirect('/')
})
app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Successfully Running,and App is listening on port http://localhost:" + PORT)
    }
    else {
        console.log("Error occurred, server can't start", error);
    }
}
);