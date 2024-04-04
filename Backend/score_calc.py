from flask import Flask, request, jsonify
from transformers import pipeline
from evaluate import load
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)
