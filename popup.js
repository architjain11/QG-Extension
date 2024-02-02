document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');


    generateBtn.addEventListener('click', async function () {
        const inputText = document.getElementById('textInput').value;



        try {

            const response = await fetch('https://api-inference.huggingface.co/models/ZhangCheng/T5-Base-finetuned-for-Question-Generation', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "inputs": inputText })
            });

            const data = await response.json();


            let generatedText = '';
            data.forEach(item => {
                generatedText += item.generated_text + '<br>';
            });
            console.log(generatedText);
            output.innerHTML = generatedText;


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
