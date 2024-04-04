document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');
    const textInput = document.getElementById('textInput');
    var output = document.getElementById('output');

    micBtn.addEventListener('click', function () {
        let recognization = new webkitSpeechRecognition();
        recognization.onstart = () => {
            textInput.value = "";
            textInput.placeholder = "Listening audio...";
            micBtn.style.backgroundColor = "red";
        }
        recognization.onresult = (res) => {
            var transcript = res.results[0][0].transcript;
            textInput.value = transcript;

            micBtn.style.backgroundColor = "blue";
        }
        recognization.start();
    });


    generateBtn.addEventListener('click', async function () {
        const inputText = document.getElementById('textInput').value;
        const prompt1 = `<s> [INST] <SYS>Subjective</SYS>` + inputText;
        const prompt = prompt1 + "[/INST]"
        output.innerHTML = "";
        output.classList.add("loader");

        try {
            // Api call to the Llama model
            let response = await fetch("http://127.0.0.1:8080/completion", {
                method: 'POST',
                body: JSON.stringify({
                    prompt,
                    n_predict: 50,
                })

            });
            // Formatting the output
            var sentencesArray = [];
            const data = await response.json();
            console.log(data);
            var sentences = data.content.split('?');
            var htmlString = '<ul>';
            sentences.forEach(function (sentence) {
                var lines = sentence.trim().split('\n');
                lines.forEach(function (line) {
                    sentencesArray.push(line.trim() + '?');
                    htmlString += '<li>' + line.trim() + "?" + '</li>';
                });
            });
            htmlString += '</ul>';
            output.classList.remove("loader");
            console.log(sentencesArray);
            output.innerHTML = htmlString;
            const updatedSentences = [];

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





        } catch (error) {
            console.error('Error:', error);
        }

    });

});
