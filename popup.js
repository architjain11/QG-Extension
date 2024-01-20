document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');

    generateBtn.addEventListener('click', function () {
        output.innerText = "Generated Questions";
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
