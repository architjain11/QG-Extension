document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');
    const textInput = document.getElementById('textInput');
    var output = document.getElementById('output');


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
            const data = await response.json();
            console.log(data);
            var sentences = data.content.split('?');
            var htmlString = '<ul>';
            sentences.forEach(function (sentence) {
                var lines = sentence.trim().split('\n');
                lines.forEach(function (line) {
                    htmlString += '<li>' + line.trim() + "?" + '</li>';
                });
            });
            htmlString += '</ul>';
            output.classList.remove("loader");

            output.innerHTML = htmlString;

        } catch (error) {
            console.error('Error:', error);
        }
    });



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
});
