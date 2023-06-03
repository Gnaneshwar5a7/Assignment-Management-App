const mongoose = require('mongoose');
const { model } = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('./user');
const question = require('./question');
const branch = require('./branch');
const answer = require('./answers');

mongoose.set('strictQuery', true);

var branches = [];
function getBranchDetails(req, res) {
    branch.find(function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            branches = docs;
            var subject = []
            var branch = []
            docs.forEach(element => {
                if (branch.indexOf(element.branch == -1)) {
                    branch.push(element.branch);
                }
                element.subjects.forEach(i => {
                    if (subject.indexOf(i) == -1) {
                        subject.push(i);
                    }
                });
            });
            subject.sort();
            branch.sort();
            res.render("index", { data: docs, subject: subject });
        }
    });
}

function insert(req, res) {
    const newUser = new user();
    newUser.username = req.body.username;


    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    newUser.password = hash;

    newUser.email = req.body.email;
    newUser.name = req.body.fullname;
    newUser.branch = req.body.branch;
    if (req.body.userType == 'Faculty') {
        newUser.subject = req.body.subject;
    }
    newUser.userType = req.body.userType;

    newUser.save(function (err, result) {

        if (err) {

            console.log(err);
        }
        else {
            res.redirect("/");
        }

    })
}

function login(req, res) {
    var sess = req.session;
    user.findOne({ username: req.body.username }, function (err, docs) {
        if (err) {
            console.log(err)
        }
        else {
            if (docs.username == req.body.username) {
                bcrypt.compare(req.body.password, docs.password, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    if (data) {
                        console.log(docs.username+" LOGIN")
                        if (docs.userType === "Faculty") {
                            sess.userId = docs.id;
                            sess.username = docs.username;
                            req.session.fullname = docs.fullname;
                            req.session.subject = docs.subject;
                            req.session.branch = docs.branch;
                            req.session.login = true;
                            res.redirect('/Faculty')
                        }
                        else {
                            var subjects = []
                            branches.forEach(i => {
                                if (i.branch == docs.branch) {
                                    subjects = i.subjects
                                }
                            })
                            req.session.subjects = subjects;
                            req.session.userId = docs.id;
                            req.session.username = docs.username;
                            req.session.fullname = docs.fullname;
                            req.session.option = docs.branch;
                            req.session.login = true;
                            res.redirect('/Student');
                        }
                    }
                    else {
                        res.send("invalid password");
                    }

                });
            }
            else {
                res.send("invalid username or password")
            }
        }
    })
}


function serveFaculty(req, res) {
    if (req.session.login==undefined || req.session.login == false) {
        res.send("<script>alert('Session no longer exists')</script>")
    }
    question.find({ subject: req.session.subject }, function (err, questions) {
        if (err) {
            console.log(err);
        }
        else {
            answer.find({ subject: req.session.subject }, function (err, answerDocs) {
                if (err) {
                    console.log(err);
                }
                else {
                    req.session.questions = []
                    req.session.usersubmitions = []
                    for (var j = 0; j < questions.length; j++) {
                        var question = questions[j].question
                        req.session.questions.push(question);
                        var x = [];
                        for (var i = 0; i < answerDocs.length; i++) {
                            if (answerDocs[i].question == question) {
                                var doc = {}
                                doc.username = answerDocs[i].username;
                                doc.answer = answerDocs[i].answer;
                                doc.question = answerDocs[i].question;
                                x.push(doc);
                            }
                        }
                        if (req.session.usersubmitions.indexOf(x) == -1) {
                            req.session.usersubmitions.push(x);
                        }
                    }
                    var data = { username: req.session.username, option: req.session.subject, questions: req.session.questions, usersubmitions: req.session.usersubmitions }
                    res.render("faculty", data);
                }
            })
        }
    })
}

function serveSubject(req, res) {
    answer.find(function (err, answerDocs) {
        if (err) {
            console.log(err);
        }
        else {
            question.find(function (err, questionDocs) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (req.session.login==undefined ||req.session.login == false) {
                        res.send("<script>alert('Session no longer exists')</script>")
                    }
                    req.session.subject = req.query.subject;
                    req.session.questions = []
                    for (var i = 0; i < questionDocs.length; i++) {
                        if (questionDocs[i].subject == req.session.subject) {
                            if (req.session.questions.indexOf(questionDocs[i].question) == -1) {
                                req.session.questions.push(questionDocs[i].question);
                            }
                        }
                    }
                    req.session.answers = []
                    req.session.submitions = []
                    req.session.pending = []
                    for (var i = 0; i < answerDocs.length; i++) {
                        if (answerDocs[i].subject == req.session.subject && answerDocs[i].username == req.session.username) {
                            if (req.session.submitions.indexOf(answerDocs[i].question) == -1) {
                                req.session.submitions.push(answerDocs[i].question);
                            }
                            if (req.session.answers.indexOf(answerDocs[i].answer) == -1) {
                                req.session.answers.push(answerDocs[i].answer);
                            }
                        }
                    }
                    req.session.questions.forEach(element => {
                        if (req.session.submitions.indexOf(element) == -1) {
                            req.session.pending.push(element)
                        }
                    });
                    res.render('subject', req.session);
                }
            })
        }
    })

}

function submitAnswer(req, res) {
    const newAnswer = new answer();
    newAnswer.username = req.session.username;
    newAnswer.subject = req.session.subject;
    newAnswer.question = req.body.question;
    newAnswer.answer = req.body.answer;
    newAnswer.save(function (err, result) {
        if (err) {

            console.log(err);
        }
        else {

            res.redirect('/Subject?subject=' + req.session.subject);
        }
    })
}

function addQuestion(req, res) {
    const newQuestion = new question();
    if (req.session.login==undefined ||req.session.login === false) {
        res.send("<script>alert('Session no longer exists')</script>");
    }
    newQuestion.subject = req.session.subject;
    newQuestion.question = req.body.question;
    newQuestion.save(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            req.session.question = newQuestion.question;
            res.redirect('/Faculty');
        }
    })

}

function editQuestion(req, res) {
    if (req.session.login==undefined ||req.session.login === false) {
        res.send("<script>alert('Session no longer exists')</script>");
    }
    question.findOneAndUpdate({ question: req.body.oldquestion, subject: req.body.subject }, { question: req.body.question_ }, function (err, result) {
        if (err) {
            console.log(err);
        }
    });
    answer.updateMany({ question: req.body.oldquestion, subject: req.body.subject }, { question: req.body.question_ }, function (err, result) {
        if (err) {
            console.log(err);
        }
    })
    res.redirect('/Faculty');
}



function deleteQuestion(req, res) {
    if (req.session.login==undefined ||req.session.login === false) {
        res.send("<script>alert('Session no longer exists')</script>");
    }
    question.findOneAndRemove({ question: req.body.question_del, subject: req.body.subject }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            ;
        }
    })
    answer.deleteMany({ question: req.body.question_del, subject: req.body.subject }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            ;
        }
    });
    res.redirect('/Faculty')

}

// function getQuestions(sess, s) {
//     question.find({ subject: s }, function (err, docs) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             for (var i = 0; i < docs.length; i++) {
//                 if (questions.indexOf(docs[i].question) == -1) {
//                     questions.push(docs[i].question)
//                 }

//             }

//             questionDocs = docs;
//             sess.questions = questions;
//         }
//     })
//     return;
// }

// function getAllQuestions() {
//     question.find(function (err, docs) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             for (var i = 0; i < docs.length; i++) {
//                 if (questionDocs.indexOf(docs[i]) == -1) {
//                     questionDocs.push(docs[i])
//                 }
//             }
//         }
//     })
// }

// function getAllAnswers() {
//     answer.find(function (err, docs) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             for (var i = 0; i < docs.length; i++) {

//                 if (answerDocs.indexOf(docs[i]) == -1) {
//                     answerDocs.push(docs[i])
//                 }
//             }
//         }
//     })

// }
module.exports = { insert, login, submitAnswer, serveSubject, serveFaculty,addQuestion, editQuestion, deleteQuestion, getBranchDetails, branches };