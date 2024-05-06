document.addEventListener("DOMContentLoaded", function () {
    const generateBtn = document.getElementById("generateBtn");
    const micBtn = document.getElementById("micBtn");
    const textInput = document.getElementById("textInput");

    var output = document.getElementById("output");

    output.style.display = "none";
    const scoreCalculationCheckbox = document.getElementById("scoreCalculation");
    const typeofques = document.getElementById("dropdown1");
    const useofques = document.getElementById("dropdown2");

    micBtn.addEventListener("click", function () {
        let recognization = new webkitSpeechRecognition();
        recognization.onstart = () => {
            textInput.value = "";
            textInput.placeholder = "Listening audio...";
            micBtn.style.backgroundColor = "red";
        };
        recognization.onresult = (res) => {
            var transcript = res.results[0][0].transcript;
            textInput.value = transcript;

            micBtn.style.backgroundColor = "blue";
        };
        recognization.start();
    });

    generateBtn.addEventListener("click", async function () {
        const output1 = document.getElementById("output1");
        const outputlength = document.getElementById("outputlength").value;
        console.log(outputlength);
        console.log(typeof outputlength);
        const inputText = document.getElementById("textInput").value;
        const scorecal = scoreCalculationCheckbox.checked;
        const questype = typeofques.value;
        const quesuse = useofques.value;
        console.log(questype);
        console.log(quesuse);
        console.log(scorecal);
        console.log(typeof scorecal);
        let prompt = "";
        if (questype === "option2") {
            const prompt1 =
                `<s> [INST] <<SYS>>Generate only MCQ Questions.Dont generate answer<</SYS>> ` +
                inputText;
            prompt = prompt1 + "[/INST]</s>";
        } else {
            const prompt1 =
                `<s> [INST]<<SYS>>Generate only Subjective Questions.Dont generate answer<</SYS>>` +
                inputText;
            prompt = prompt1 + "[/INST]</s>";
        }
        output.style.display = "block";
        output.innerHTML = "";
        output.classList.add("loader");

        try {
            // Api call to the Llama model

            let response = await fetch("http://127.0.0.1:8080/completion", {
                method: "POST",
                body: JSON.stringify({
                    prompt: prompt,
                    n_predict: Number(outputlength),
                    temperature: 0.6,
                    repetition_penalty: 1.3,
                }),
            });
            // Formatting the output
            var sentencesArray = [];
            const data = await response.json();
            console.log(data);
            var sentences = data.content.split("</s>");
            var htmlString = "<ul>";
            sentences.forEach(function (sentence) {
                //  var lines = sentence.trim().split('\n');
                //lines.forEach(function (line) {
                if (sentence.trim() !== "") {
                    var str = sentence;
                    var lastLetter = str[str.length - 1];
                    if (questype === "option2" || lastLetter == "?") {
                        sentencesArray.push(sentence);
                        htmlString += "<li>" + sentence + "</li>";
                    }
                }
                //  });
            });
            htmlString += "</ul>";
            output.classList.remove("loader");
            console.log(sentencesArray);
            output.innerHTML += htmlString;
            const updatedSentences = [];
            if (scorecal === true) {
                output1.classList.add("score1");
                for (const sentence of sentencesArray) {
                    const response = await fetch("http://127.0.0.1:5000/answer", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ context: inputText, question: sentence }),
                    });

                    if (response.ok) {
                        const scores = await response.json();

                        // Access the string property
                        console.log(typeof scores);
                        console.log(scores);

                        updatedSentences.push({ sentence, scores });
                    } else {
                        console.error(
                            `Error fetching score for "${sentence}": ${response.statusText}`
                        );
                        // Handle errors gracefully, e.g., display an error message to the user
                    }
                }
                console.log(updatedSentences);
                var htmlString1 = "<ul>";
                output1.classList.remove("score1");

                for (const { sentence, scores } of updatedSentences) {
                    htmlString1 += "<li>" + sentence + " Score:" + scores.score + "</li>";
                }
                htmlString1 += "</ul>";
                output.innerHTML = htmlString1;
            }

            //const updatedSentences = [];

            if (quesuse === "option2") {
                output1.classList.add("loader1");

                const response = await fetch("http://127.0.0.1:5000/open-ended", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        context: inputText,
                        questype: questype,
                        score: scorecal,
                    }),
                });
                let data1 = "";
                if (response.ok) {
                    data1 = await response.json();
                } else {
                    console.error(`Error fetching questions`);
                }
                console.log(response);
                console.log(data1);
                let questions = "";
                var htmlString2 = "<ul>";
                data1.forEach(function (data1) {
                    // if (data1.trim() !== "") {
                    //     var str = data1;
                    //     var lastLetter = str[str.length - 1];
                    //     if (questype === "option2" || (lastLetter == '?')) {
                    sentencesArray.push(data1);
                    htmlString2 += "<li>" + data1 + "</li>";
                    // }

                    // }
                    //sentencesArray.push(data);
                    //htmlString += '<li>' + data + '</li>';
                });
                var sentences = questions.split("?");

                /*    sentences.forEach(function (sentence) {
                                //var lines = sentence.trim().split('</s>');
                                //lines.forEach(function (line) {
                                sentencesArray.push(sentence);
                                htmlString += '<li>' + sentence + '</li>';
                                //});
                            });
                            htmlString += '</ul>';*/
                console.log(sentencesArray);
                output1.classList.remove("loader1");
                output.innerHTML += htmlString2;
            }
            /*  if (scorecal === true) {
        
                        for (const sentence of sentencesArray) {
                            const response = await fetch('http://localhost:5000/answer', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ context: inputText, question: sentence })
                            });
        
                            if (response.ok) {
                                const scores = await response.json();
        
                                // Access the string property
                                console.log(typeof scores);
                                console.log(scores);
        
                                updatedSentences.push({ sentence, scores });
                            } else {
                                console.error(`Error fetching score for "${sentence}": ${response.statusText}`);
                                // Handle errors gracefully, e.g., display an error message to the user
                            }
                        }
                        console.log(updatedSentences);
                        var htmlString1 = '<ul>';
        
                        for (const { sentence, scores } of updatedSentences) {
                            htmlString1 += '<li>' + sentence + 'Score:' + scores.score + '</li>';
        
                        }
                        htmlString1 += '</ul>';
        
                        output.innerHTML = htmlString1;
                    }*/
        } catch (error) {
            console.error("Error:", error);
        }
    });
});
