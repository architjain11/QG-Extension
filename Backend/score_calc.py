from flask import Flask, request, jsonify
from transformers import (pipeline,
    TokenClassificationPipeline,
    AutoModelForTokenClassification,
    AutoTokenizer,
)
from evaluate import load
from flask_cors import CORS
import wikipedia
from transformers.pipelines import AggregationStrategy
import numpy as np
import requests
import json


app = Flask(__name__)
CORS(app)


class KeyphraseExtractionPipeline(TokenClassificationPipeline):
    def __init__(self, model, *args, **kwargs):
        super().__init__(
            model=AutoModelForTokenClassification.from_pretrained(model),
            tokenizer=AutoTokenizer.from_pretrained(model),
            *args,
            **kwargs
        )

    def postprocess(self, all_outputs):
        results = super().postprocess(
            all_outputs=all_outputs,
            aggregation_strategy=AggregationStrategy.SIMPLE,
        )
        return np.unique([result.get("word").strip() for result in results])

# Load pipeline
model_name = "ml6team/keyphrase-extraction-kbir-inspec"
extractor = KeyphraseExtractionPipeline(model=model_name)

def quesgenerate(input_text,questype):
    if(questype=="option2"):
        prompt1 = "<s> [INST] " + input_text
        prompt = prompt1 + "[/INST]</s>"
    else:
        prompt1 = "<s> [INST] <SYS>Subjective</SYS>" + input_text
        prompt = prompt1 + "[/INST]</s>"
        
    payload = {
        'prompt': prompt,
        'n_predict': 50
    }

    # Define the URL
    url = "http://127.0.0.1:8080/completion"

    # Make the POST request
    response = requests.post(url, data=json.dumps(payload))

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Accessing the response content
        data = response.json()
        # Do something with the response data
        print(data)
    else:
        # Handle the case where the request was not successful
        print("Request was not successful. Status code:", response.status_code)
    return data

def answerquestion(context,question):
    answer = qa(context=context, question=question)
    print(context)
    print(question)
    print(type(question))
    print(answer['answer'])
   

    generated_questions = [question]
    print(generated_questions)
    
    contexts = [context]
    print(contexts)
    answers = [answer['answer']]
    print(type(answers))
    results = rqugescore.compute(generated_questions=generated_questions, contexts=contexts, answers=answers)
    
    print(results["mean_score"])
    return (results["mean_score"])


# Create pipeline for QA
qa = pipeline('question-answering')
rqugescore = load("alirezamsh/rquge")
@app.route('/answer', methods=['POST'])
def answer_question():
    data = request.get_json()
    context = data['context']
    question = data['question']
    answer = qa(context=context, question=question)
    print(context)
    print(question)
    print(type(question))
    print(answer['answer'])
   

    generated_questions = [question]
    print(generated_questions)
    
    contexts = [context]
    print(contexts)
    answers = [answer['answer']]
    print(type(answers))
    results = rqugescore.compute(generated_questions=generated_questions, contexts=contexts, answers=answers)
    
    print(results["mean_score"])
    
    # Use the QA pipeline to find answer
    
    
    return jsonify({'score': results["mean_score"]})




@app.route('/open-ended', methods=['POST'])
def interviews():
    data1 = request.get_json()
    prompt= data1["context"]
    questype=data1["questype"]
    scorecalc=data1["score"]

    keyphrases = extractor(prompt)
    page_data = []
    print(keyphrases)

    for keyphrase in keyphrases[:2]:
        try:
            content = wikipedia.summary(keyphrase,auto_suggest=False, sentences=5)
            page_data.append(content)
        except wikipedia.exceptions.PageError:
            pass
   # questionlist=[]
    questions=[]
    print(page_data)
    for pagedata in page_data:
        prompt=pagedata
        response=quesgenerate(prompt,questype)
        question_list = response["content"].split('</s>')
        print(question_list)
        print("/n /n /n")
        #question_list = [question.strip() for question in question_list if question.strip()]
        
        #questionlist.append(response["content"])
       
        for q in question_list:
            if(scorecalc==True):
                score=answerquestion(q,pagedata)
                questions.append(str(q)+" Score:"+str(score))
            else:
                questions.append(q)
        

   
    print(questions)
   
    return questions

if __name__ == '__main__':
    app.run(debug=True)
