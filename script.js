let questions = [];

let currentQuestion = 0;

let score = 0;

let selectedAnswer = null;

let studentName = "";

let timeLeft = 30;

let timer;

let userAnswers = [];

let reviewQuestions = [];


// START QUIZ
async function startQuiz() {

    studentName =
        document.getElementById("studentName").value.trim();

    if (studentName === "") {
        alert("Please enter your name");
        return;
    }

    let category =
        document.getElementById("category").value;

    let difficulty =
        document.getElementById("difficulty").value;

    let amount =
        document.getElementById("amount").value;

    let url =
        `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;

    if (difficulty !== "") {
        url += `&difficulty=${difficulty}`;
    }

    document.getElementById("startScreen").style.display =
        "none";

    document.getElementById("quizScreen").style.display =
        "block";

    document.getElementById("question").innerText =
        "Loading questions...";

    try {

        const response = await fetch(url);

        const data = await response.json();

        if (data.response_code !== 0) {

            alert("Not enough questions available.");

            location.reload();

            return;
        }

        questions = data.results;

        userAnswers =
            new Array(questions.length).fill(null);

        reviewQuestions =
            new Array(questions.length).fill(false);

        showQuestion();

        startTimer();

    } catch (error) {

        alert("Internet connection required.");

        console.log(error);

        location.reload();
    }
}


// SHOW QUESTION
function showQuestion() {

    selectedAnswer =
        userAnswers[currentQuestion];

    let q =
        questions[currentQuestion];


    document.getElementById("questionNumber").innerText =
        `Question ${currentQuestion + 1} / ${questions.length}`;


    document.getElementById("question").innerHTML =
        decodeHTML(q.question);


    let progress =
        (currentQuestion / questions.length) * 100;

    document.getElementById("progressBar").style.width =
        progress + "%";


    let answers = [
        ...q.incorrect_answers,
        q.correct_answer
    ];


    answers.sort(() => Math.random() - 0.5);


    let optionsHTML = "";


    answers.forEach(answer => {

        let selectedClass =
            selectedAnswer === answer
                ? "selected"
                : "";


        optionsHTML += `

            <div
                class="option ${selectedClass}"
                onclick="selectAnswer(this)"
                data-answer="${encodeURIComponent(answer)}"
            >

                ${decodeHTML(answer)}

            </div>

        `;
    });


    document.getElementById("options").innerHTML =
        optionsHTML;


    if (reviewQuestions[currentQuestion]) {

        document.getElementById("reviewStatus").innerText =
            "🚩 Marked for Review";

    } else {

        document.getElementById("reviewStatus").innerText =
            "";
    }


    startQuestionTimer();
}


// SELECT ANSWER
function selectAnswer(element) {

    document.querySelectorAll(".option")
        .forEach(option => {

            option.classList.remove("selected");

        });


    element.classList.add("selected");


    selectedAnswer =
        decodeURIComponent(element.dataset.answer);


    userAnswers[currentQuestion] =
        selectedAnswer;
}


// SAVE AND NEXT
function saveNext() {

    if (selectedAnswer !== null) {

        userAnswers[currentQuestion] =
            selectedAnswer;
    }


    if (currentQuestion === questions.length - 1) {

        finishQuiz();

        return;
    }


    currentQuestion++;

    showQuestion();
}


// MARK FOR REVIEW
function markReview() {

    reviewQuestions[currentQuestion] = true;

    document.getElementById("reviewStatus").innerText =
        "🚩 Marked for Review";

}


// TIMER
function startQuestionTimer() {

    clearInterval(timer);

    timeLeft = 30;

    document.getElementById("timer").innerText =
        timeLeft;


    timer = setInterval(function() {

        timeLeft--;

        document.getElementById("timer").innerText =
            timeLeft;


        if (timeLeft <= 0) {

            clearInterval(timer);

            // Automatically move to next question

            if (currentQuestion === questions.length - 1) {

                finishQuiz();

            } else {

                currentQuestion++;

                showQuestion();

            }
        }

    }, 1000);
}


// FINISH QUIZ
function finishQuiz() {

    clearInterval(timer);


    score = 0;

    let wrong = 0;

    let unanswered = 0;


    questions.forEach((question, index) => {

        let answer =
            userAnswers[index];


        if (answer === null) {

            unanswered++;

        } else if (answer === question.correct_answer) {

            score++;

        } else {

            wrong++;
        }

    });


    let percentage =
        Math.round(
            (score / questions.length) * 100
        );


    document.getElementById("quizScreen").style.display =
        "none";


    document.getElementById("resultScreen").style.display =
        "block";


    document.getElementById("resultName").innerText =
        "Student: " + studentName;


    document.getElementById("totalQuestions").innerText =
        questions.length;


    document.getElementById("correctAnswers").innerText =
        score;


    document.getElementById("wrongAnswers").innerText =
        wrong;


    document.getElementById("unanswered").innerText =
        unanswered;


    document.getElementById("resultPercentage").innerText =
        percentage + "%";


    showAnswerReview();
}


// SHOW ANSWERS
function showAnswerReview() {

    let html = "";


    questions.forEach((question, index) => {

        let userAnswer =
            userAnswers[index];


        let correctAnswer =
            question.correct_answer;


        let questionText =
            decodeHTML(question.question);


        let correctText =
            decodeHTML(correctAnswer);


        let userText =
            userAnswer === null
                ? "Not Answered"
                : decodeHTML(userAnswer);


        if (userAnswer === null) {

            html += `

                <div class="reviewCard unansweredCard">

                    <div class="reviewQuestion">
                        Q${index + 1}. ${questionText}
                    </div>

                    <p>
                        Your Answer:
                        <span class="wrongText">
                            Not Answered
                        </span>
                    </p>

                    <p>
                        Correct Answer:
                        <span class="correctAnswer">
                            ${correctText}
                        </span>
                    </p>

                </div>

            `;

        } else if (userAnswer === correctAnswer) {

            html += `

                <div class="reviewCard correctCard">

                    <div class="reviewQuestion">
                        Q${index + 1}. ${questionText}
                    </div>

                    <p>
                        Your Answer:
                        <span class="correctText">
                            ${userText} ✓
                        </span>
                    </p>

                </div>

            `;

        } else {

            html += `

                <div class="reviewCard wrongCard">

                    <div class="reviewQuestion">
                        Q${index + 1}. ${questionText}
                    </div>

                    <p>
                        Your Answer:
                        <span class="wrongText">
                            ${userText} ✗
                        </span>
                    </p>

                    <p>
                        Correct Answer:
                        <span class="correctAnswer">
                            ${correctText} ✓
                        </span>
                    </p>

                </div>

            `;
        }

    });


    document.getElementById("answerReview").innerHTML =
        html;
}


// DECODE HTML
function decodeHTML(text) {

    let textarea =
        document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;
}
