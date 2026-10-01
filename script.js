// =====================================================
// ONLINE QUIZ SYSTEM
// =====================================================


// ================= GLOBAL VARIABLES =================

let questions = [];

let currentQuestion = 0;

let studentName = "";

let userAnswers = [];

let reviewQuestions = [];

let timer;

let timeLeft = 30;


// ================= START QUIZ =================

async function startQuiz() {

    studentName =
        document
            .getElementById("studentName")
            .value
            .trim();


    if (studentName === "") {

        alert("Please enter your name");

        return;
    }


    let category =
        document
            .getElementById("category")
            .value;


    let difficulty =
        document
            .getElementById("difficulty")
            .value;


    let amount =
        document
            .getElementById("amount")
            .value;


    // API URL

    let url =
        `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple`;


    if (difficulty !== "") {

        url +=
            `&difficulty=${difficulty}`;
    }


    // Hide start screen

    document
        .getElementById("startScreen")
        .style.display = "none";


    // Show quiz

    document
        .getElementById("quizScreen")
        .style.display = "block";


    document
        .getElementById("question")
        .innerText =
        "Loading questions...";


    try {

        const response =
            await fetch(url);


        const data =
            await response.json();


        // Check API response

        if (data.response_code !== 0) {

            alert(
                "Not enough questions available for this selection."
            );

            location.reload();

            return;
        }


        // Store questions

        questions =
            data.results;


        // Create answer arrays

        userAnswers =
            new Array(
                questions.length
            ).fill(null);


        // Create review arrays

        reviewQuestions =
            new Array(
                questions.length
            ).fill(false);


        // Create question buttons

        createQuestionButtons();


        // Show first question

        showQuestion();


    } catch (error) {

        console.log(error);


        alert(
            "Internet connection is required to load questions."
        );


        location.reload();
    }
}


// ================= SHOW QUESTION =================

function showQuestion() {

    // Stop previous timer

    clearInterval(timer);


    let question =
        questions[currentQuestion];


    // Question number

    document
        .getElementById("questionNumber")
        .innerText =
        `Question ${currentQuestion + 1} / ${questions.length}`;


    // Question text

    document
        .getElementById("question")
        .innerHTML =
        decodeHTML(
            question.question
        );


    // Progress

    let progress =
        (
            (currentQuestion + 1)
            /
            questions.length
        ) * 100;


    document
        .getElementById("progressBar")
        .style.width =
        progress + "%";


    // Combine answers

    let answers = [

        ...question.incorrect_answers,

        question.correct_answer

    ];


    // Randomize answers

    answers.sort(
        () =>
            Math.random() - 0.5
    );


    // Create options

    let optionsHTML = "";


    answers.forEach(
        function(answer) {


            let selectedClass =
                "";


            // Restore selected answer

            if (
                userAnswers[currentQuestion]
                === answer
            ) {

                selectedClass =
                    "selected";
            }


            optionsHTML += `

                <div
                    class="option ${selectedClass}"
                    data-answer="${encodeURIComponent(answer)}"
                    onclick="selectAnswer(this)"
                >

                    ${decodeHTML(answer)}

                </div>

            `;

        }
    );


    document
        .getElementById("options")
        .innerHTML =
        optionsHTML;


    // Review status

    if (
        reviewQuestions[currentQuestion]
    ) {

        document
            .getElementById("reviewStatus")
            .innerText =
            "🚩 Marked for Review";

    } else {

        document
            .getElementById("reviewStatus")
            .innerText =
            "";
    }


    // Update palette

    updateQuestionButtons();


    // Start 30-second timer

    startQuestionTimer();
}


// ================= SELECT ANSWER =================

function selectAnswer(element) {


    // Remove previous selection

    document
        .querySelectorAll(".option")
        .forEach(
            function(option) {

                option
                    .classList
                    .remove("selected");

            }
        );


    // Select current option

    element
        .classList
        .add("selected");


    // Save answer

    userAnswers[currentQuestion] =
        decodeURIComponent(
            element.dataset.answer
        );


    // Update question palette

    updateQuestionButtons();
}


// ================= SAVE & NEXT =================

function saveNext() {


    // Last question

    if (
        currentQuestion
        ===
        questions.length - 1
    ) {

        finishQuiz();

        return;
    }


    // Go to next question

    currentQuestion++;


    showQuestion();
}


// ================= MARK REVIEW =================

function markReview() {


    // Toggle review

    reviewQuestions[currentQuestion] =
        !reviewQuestions[currentQuestion];


    // Show status

    if (
        reviewQuestions[currentQuestion]
    ) {

        document
            .getElementById("reviewStatus")
            .innerText =
            "🚩 Marked for Review";

    } else {

        document
            .getElementById("reviewStatus")
            .innerText =
            "";
    }


    // Update buttons

    updateQuestionButtons();
}


// ================= 30 SECOND TIMER =================

function startQuestionTimer() {


    // Stop old timer

    clearInterval(timer);


    // Reset to 30 seconds

    timeLeft = 30;


    document
        .getElementById("timer")
        .innerText =
        timeLeft;


    // Start countdown

    timer =
        setInterval(
            function() {


                timeLeft--;


                document
                    .getElementById("timer")
                    .innerText =
                    timeLeft;


                // Time finished

                if (
                    timeLeft <= 0
                ) {


                    clearInterval(timer);


                    // Last question

                    if (
                        currentQuestion
                        ===
                        questions.length - 1
                    ) {

                        finishQuiz();

                    } else {


                        // Automatically next

                        currentQuestion++;


                        showQuestion();

                    }

                }


            },
            1000
        );
}


// ================= QUESTION BUTTONS =================

function createQuestionButtons() {


    let container =
        document
            .getElementById(
                "questionButtons"
            );


    container.innerHTML = "";


    questions.forEach(
        function(question, index) {


            let button =
                document.createElement(
                    "button"
                );


            button.className =
                "questionBtn";


            button.innerText =
                index + 1;


            button.onclick =
                function() {


                    currentQuestion =
                        index;


                    showQuestion();

                };


            container.appendChild(
                button
            );

        }
    );
}


// ================= UPDATE QUESTION BUTTONS =================

function updateQuestionButtons() {


    let buttons =
        document
            .querySelectorAll(
                ".questionBtn"
            );


    buttons.forEach(
        function(button, index) {


            // Reset

            button.className =
                "questionBtn";


            // Current question

            if (
                index
                ===
                currentQuestion
            ) {

                button.classList
                    .add("current");
            }


            // Answered

            if (
                userAnswers[index]
                !==
                null
            ) {

                button.classList
                    .add("answered");
            }


            // Review

            if (
                reviewQuestions[index]
            ) {

                button.classList
                    .add("review");
            }

        }
    );
}


// ================= FINISH QUIZ =================

function finishQuiz() {


    // Stop timer

    clearInterval(timer);


    let correct =
        0;


    let wrong =
        0;


    let unanswered =
        0;


    // Calculate result

    questions.forEach(
        function(question, index) {


            let answer =
                userAnswers[index];


            // No answer

            if (
                answer === null
            ) {

                unanswered++;

            }


            // Correct

            else if (
                answer
                ===
                question.correct_answer
            ) {

                correct++;

            }


            // Wrong

            else {

                wrong++;
            }

        }
    );


    // Percentage

    let percentage =
        Math.round(
            (
                correct
                /
                questions.length
            ) * 100
        );


    // Hide quiz

    document
        .getElementById("quizScreen")
        .style.display =
        "none";


    // Show result

    document
        .getElementById("resultScreen")
        .style.display =
        "block";


    // Student name

    document
        .getElementById("resultName")
        .innerText =
        "Student: " + studentName;


    // Total

    document
        .getElementById("totalQuestions")
        .innerText =
        questions.length;


    // Correct

    document
        .getElementById("correctAnswers")
        .innerText =
        correct;


    // Wrong

    document
        .getElementById("wrongAnswers")
        .innerText =
        wrong;


    // Unanswered

    document
        .getElementById("unanswered")
        .innerText =
        unanswered;


    // Percentage

    document
        .getElementById("resultPercentage")
        .innerText =
        percentage + "%";


    // Show detailed answers

    showAnswerReview();
}


// ================= ANSWER REVIEW =================

function showAnswerReview() {


    let html =
        "";


    questions.forEach(
        function(question, index) {


            let userAnswer =
                userAnswers[index];


            let correctAnswer =
                question.correct_answer;


            let questionText =
                decodeHTML(
                    question.question
                );


            let correctText =
                decodeHTML(
                    correctAnswer
                );


            // ================= UNANSWERED =================

            if (
                userAnswer === null
            ) {


                html += `

                    <div
                        class="reviewCard unansweredCard"
                    >

                        <div
                            class="reviewQuestion"
                        >

                            Q${index + 1}.
                            ${questionText}

                        </div>


                        <p>

                            Your Answer:

                            <span
                                class="wrongText"
                            >

                                Not Answered

                            </span>

                        </p>


                        <p>

                            Correct Answer:

                            <span
                                class="correctAnswer"
                            >

                                ${correctText} ✓

                            </span>

                        </p>

                    </div>

                `;

            }


            // ================= CORRECT =================

            else if (
                userAnswer
                ===
                correctAnswer
            ) {


                html += `

                    <div
                        class="reviewCard correctCard"
                    >

                        <div
                            class="reviewQuestion"
                        >

                            Q${index + 1}.
                            ${questionText}

                        </div>


                        <p>

                            Your Answer:

                            <span
                                class="correctText"
                            >

                                ${decodeHTML(userAnswer)}
                                ✓

                            </span>

                        </p>

                    </div>

                `;

            }


            // ================= WRONG =================

            else {


                html += `

                    <div
                        class="reviewCard wrongCard"
                    >

                        <div
                            class="reviewQuestion"
                        >

                            Q${index + 1}.
                            ${questionText}

                        </div>


                        <p>

                            Your Answer:

                            <span
                                class="wrongText"
                            >

                                ${decodeHTML(userAnswer)}
                                ✗

                            </span>

                        </p>


                        <p>

                            Correct Answer:

                            <span
                                class="correctAnswer"
                            >

                                ${correctText}
                                ✓

                            </span>

                        </p>

                    </div>

                `;

            }

        }
    );


    document
        .getElementById("answerReview")
        .innerHTML =
        html;
}


// ================= DECODE HTML =================

function decodeHTML(text) {


    let textarea =
        document.createElement(
            "textarea"
        );


    textarea.innerHTML =
        text;


    return textarea.value;
}
