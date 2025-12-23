import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/topics')
        .then(response => response.json())
        .then(data => setTopics(data))
        .catch(error => console.error('Error fetching topics:', error));
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          setError('');
        } else {
          setError('Неправильний логін або пароль');
        }
      })
      .catch(() => setError('Помилка входу'));
  };

  const handleTopicChange = (topic) => {
    setSelectedTopics(prevSelectedTopics => {
      if (prevSelectedTopics.includes(topic)) {
        return prevSelectedTopics.filter(t => t !== topic);
      } else {
        return [...prevSelectedTopics, topic];
      }
    });
  };

  const handleStartTest = () => {
    const fetchPromises = selectedTopics.map(topic => {
      const encodedTopic = encodeURIComponent(topic);
      return fetch(`/api/questions/${encodedTopic}`)
        .then(response => response.json());
    });

    Promise.all(fetchPromises)
      .then(results => {
        const allQuestions = results.flat();
        // Fisher-Yates (aka Knuth) Shuffle
        for (let i = allQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }
        setQuestions(allQuestions);
        setTestStarted(true);
        // Reset all states for the new test
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
      })
      .catch(error => console.error('Error fetching questions:', error));
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return; // Prevent changing the answer

    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer.correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      // Reset for the next question
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setSelectedTopics([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTestStarted(false);
  };

  const getButtonClass = (answer) => {
    if (!isAnswered) {
      return `list-group-item list-group-item-action ${selectedAnswer === answer ? 'active' : ''}`;
    }

    // After an answer is selected
    if (answer.correct) {
      return 'list-group-item list-group-item-action list-group-item-success';
    }
    if (answer === selectedAnswer && !answer.correct) {
      return 'list-group-item list-group-item-action list-group-item-danger';
    }
    return 'list-group-item list-group-item-action disabled';
  };
  
  const getCurrentQuestionText = () => {
    if (!questions[currentQuestionIndex]) return '';
    const fullQuestion = questions[currentQuestionIndex].question;
    return fullQuestion.split('\n·')[0].trim();
  };

  const getCleanAnswerText = (answerText) => {
    return answerText.replace(/^\s*·\s*/, '').trim();
  };

  if (!isAuthenticated) {
    return (
      <div className="App container">
        <div className="login-container">
          <h1 className="my-4">Вхід</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Логін</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button type="submit" className="btn btn-primary mt-3">
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App container">
      <h1 className="my-4">Митний тест</h1>

      {!testStarted && (
        <div className="topic-selection">
          <h2>Оберіть теми:</h2>
          <div className="list-group">
            {topics.map(topic => (
              <button
                key={topic}
                className={`list-group-item list-group-item-action ${selectedTopics.includes(topic) ? 'active' : ''}`}
                onClick={() => handleTopicChange(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={handleStartTest}
            disabled={selectedTopics.length === 0}
          >
            Почати тест
          </button>
        </div>
      )}

      {testStarted && !showResults && questions.length > 0 && (
        <div className="question-container card p-4 my-4">
          <h3 className="card-title">{getCurrentQuestionText()}</h3>
          <div className="list-group">
            {questions[currentQuestionIndex].answers.map((answer, index) => (
              <button
                key={index}
                className={getButtonClass(answer)}
                onClick={() => handleAnswerSelect(answer)}
                disabled={isAnswered}
              >
                {getCleanAnswerText(answer.text)}
              </button>
            ))}
          </div>
          {isAnswered && (
            <button
              className="btn btn-primary mt-3"
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Наступне питання' : 'Завершити тест'}
            </button>
          )}
          <button
            className="btn btn-secondary mt-3"
            onClick={handleRestart}
          >
            На головну
          </button>
        </div>
      )}

      {testStarted && showResults && (
        <div className="results-container card p-4 my-4">
          <h2>Результати тесту</h2>
          <p>Ви набрали {score} з {questions.length} балів.</p>
          <button className="btn btn-primary" onClick={handleRestart}>Почати заново</button>
          <button
            className="btn btn-secondary mt-3"
            onClick={handleRestart}
          >
            На головну
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
