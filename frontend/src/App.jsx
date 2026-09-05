import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://sage-ai-teacher.onrender.com'

function App() {
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  const studentId = 1
  const conceptId = 1

  const getNextQuestion = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/adaptive/students/${studentId}/concepts/${conceptId}/next-question`
      )

      if (!response.ok) {
        throw new Error('Failed to get question')
      }

      const data = await response.json()

      setQuestion(data)
      setFeedback(null)
      setAnswer('')
    } catch (error) {
      console.error(error)
      setFeedback({
        type: 'error',
        message: 'Could not connect to SAGE backend.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getNextQuestion()
  }, [])

  const submitAnswer = async () => {
    if (!answer.trim() || !question) return

    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/interactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lesson_id: 1,
            concept: question.concept,
            question: question.question,
            student_answer: answer,
            correct: false,
            misconception: null,
            teacher_action: null
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()

      setFeedback({
  type: data.correct ? 'correct' : 'incorrect',
  message: 'SAGE analyzed your answer.',
  misconception: data.misconception,
  explanation: data.explanation,
  teacher_action: data.teacher_action
})

    } catch (error) {
      console.error(error)

      setFeedback({
        type: 'error',
        message: 'Something went wrong while analyzing your answer.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">

      <header className="header">
        <div className="logo">
          <div className="logo-mark">S</div>
          <div>
            <h1>SAGE</h1>
            <span>AI Teacher</span>
          </div>
        </div>

        <div className="student">
          <span className="avatar">👩‍🎓</span>
          <div>
            <strong>Demo Student</strong>
            <small>Beginner</small>
          </div>
        </div>
      </header>

      <main className="main">

        <section className="welcome">
          <p className="eyebrow">ADAPTIVE LEARNING</p>

          <h2>
            Learn at your own pace.
          </h2>

          <p className="subtitle">
            SAGE understands your answers and adapts the next question
            to your current level.
          </p>
        </section>

        {question && (
          <section className="learning-card">

            <div className="progress-row">
              <div>
                <span className="label">CURRENT CONCEPT</span>
                <h3>{question.concept}</h3>
              </div>

              <div className="mastery">
                <span>Mastery</span>
                <strong>{question.mastery_score}%</strong>
              </div>
            </div>

            <div className="difficulty">
              NEXT LEVEL: {question.next_difficulty.toUpperCase()}
            </div>

            <div className="question-box">
              <span className="label">QUESTION</span>
              <h2>{question.question}</h2>
            </div>

            <div className="answer-section">
              <label htmlFor="answer">Your answer</label>

              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="5"
              />

              <button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
              >
                {loading ? 'Analyzing...' : 'Submit Answer →'}
              </button>
            </div>

          </section>
        )}

        {feedback && (
          <section className={`feedback ${feedback.type}`}>

            <div className="feedback-title">
              {feedback.type === 'correct' && '✓ Correct'}
              {feedback.type === 'incorrect' && '○ Let’s improve this'}
              {feedback.type === 'error' && '⚠ Connection problem'}
            </div>

            {feedback.misconception && (
  <p>
    <strong>🧠 What SAGE noticed:</strong>{' '}
    {feedback.misconception}
  </p>
)}

{feedback.explanation && (
  <p>
    <strong>📖 Explanation:</strong>{' '}
    {feedback.explanation}
  </p>
)}

{feedback.teacher_action && (
  <p>
    <strong>👨‍🏫 Next step:</strong>{' '}
    {feedback.teacher_action}
  </p>
)}

<p>{feedback.message}</p>

            {feedback.type !== 'error' && (
              <button
                className="next-button"
                onClick={getNextQuestion}
              >
                Get Next Question →
              </button>
            )}

          </section>
        )}

      </main>

      <footer>
        <span>SAGE AI Teacher</span>
        <span>Adaptive learning powered by AI</span>
      </footer>

    </div>
  )
}

export default App