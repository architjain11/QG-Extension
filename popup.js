document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generateBtn');
    const micBtn = document.getElementById('micBtn');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');


    generateBtn.addEventListener('click', async function () {
        const inputText = document.getElementById('textInput').value;
        const prompt1 = `<s> [INST] <SYS>Subjective</SYS>` + inputText;
        const prompt = prompt1 + "[/INST]"



        try {

            let response = await fetch("http://127.0.0.1:8080/completion", {
                method: 'POST',
                body: JSON.stringify({
                    prompt,
                    n_predict: 400,
                })

            });

            const data = await response.json();
            console.log(data);

            output.innerHTML = data.content;

            /*let generatedText = '';
            data.forEach(item => {
                generatedText += item.generated_text + '<br>';
            });
            console.log(generatedText);*/
            //output.innerHTML = data;


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
