let questions = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let studentName = "";
let timeLeft = 60;
let timer;


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

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "block";

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

        showQuestion();
        startTimer();

    } catch (error) {

        alert("Internet connection required to load questions.");

        console.log(error);

        location.reload();
    }
}


// SHOW QUESTION
function showQuestion() {

    selectedAnswer = null;

    let q = questions[currentQuestion];

    document.getElementById("questionNumber").innerText =
        `Question ${currentQuestion + 1} / ${questions.length}`;

    document.getElementById("question").innerHTML =
        decodeHTML(q.question);

    let progress =
        ((currentQuestion) / questions.length) * 100;

    document.getElementById("progressBar").style.width =
        progress + "%";


    let answers = [
        ...q.incorrect_answers,
        q.correct_answer
    ];

    answers.sort(() => Math.random() - 0.5);

    let optionsHTML = "";

    answers.forEach((answer, index) => {

        optionsHTML += `
            <div class="option"
                 onclick="selectAnswer(this, ${index})"
                 data-answer="${encodeURIComponent(answer)}">
                ${decodeHTML(answer)}
            </div>
        `;
    });

    document.getElementById("options").innerHTML =
        optionsHTML;
}


// SELECT ANSWER
function selectAnswer(element, index) {

    document.querySelectorAll(".option").forEach(option => {
        option.classList.remove("selected");
    });

    element.classList.add("selected");

    selectedAnswer =
        decodeURIComponent(element.dataset.answer);
}


// NEXT QUESTION
function nextQuestion() {

    if (selectedAnswer === null) {
        alert("Please select an answer");
        return;
    }

    let correctAnswer =
        questions[currentQuestion].correct_answer;

    if (selectedAnswer === correctAnswer) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {

        showQuestion();

    } else {

        finishQuiz();
    }
}


// TIMER
function startTimer() {

    timer = setInterval(function() {

        timeLeft--;

        document.getElementById("timer").innerText =
            timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            finishQuiz();
        }

    }, 1000);
}


// FINISH QUIZ
function finishQuiz() {

    clearInterval(timer);

    document.getElementById("quizScreen").style.display =
        "none";

    document.getElementById("resultScreen").style.display =
        "block";

    let percentage =
        Math.round((score / questions.length) * 100);

    document.getElementById("resultName").innerText =
        "Student: " + studentName;

    document.getElementById("resultScore").innerText =
        `Score: ${score} / ${questions.length}`;

    document.getElementById("resultPercentage").innerText =
        `${percentage}%`;

    let message = "";

    if (percentage >= 80) {
        message = "Excellent performance!";
    } else if (percentage >= 60) {
        message = "Good job!";
    } else if (percentage >= 40) {
        message = "Keep practicing!";
    } else {
        message = "You can improve with more practice.";
    }

    document.getElementById("resultMessage").innerText =
        message;
}


// DECODE ONLINE QUESTIONS
function decodeHTML(text) {

    let textarea =
        document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;
}