import requests

url = 'http://localhost:5000/answer'
data = {
    'context': "My name is Ganesh and I am studying Data Science",
    'question': "What is Ganesh studying?"
}

response = requests.post(url, json=data)
print(response.json())