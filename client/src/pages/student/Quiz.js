import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, ProgressBar, Modal, Badge } from 'react-bootstrap';
import { stageAPI, progressAPI } from '../../services/api';
import '../../styles/Quiz.css';

const Quiz = () => {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [stageId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const [stageRes, questionsRes] = await Promise.all([
        stageAPI.getStageById(stageId),
        stageAPI.getStageQuestions(stageId),
      ]);

      setStage(stageRes.data.stage);
      setQuestions(questionsRes.data.questions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const answersArray = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id],
      }));

      const response = await progressAPI.submitStageAssessment(stageId, answersArray);
      setResult(response.data);
      setShowResult(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/student/dashboard');
  };

  const handleRetry = () => {
    setShowResult(false);
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate(`/student/stage/${stageId}`)}>Back to Stage</Button>
      </Container>
    );
  }

  const progress = ((Object.keys(answers).length / questions.length) * 100).toFixed(0);
  const currentQ = questions[currentQuestion];

  return (
    <div className="quiz-page">
      <Container className="py-4">
        <Card className="quiz-card shadow-lg">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              {stage?.name} - Assessment
            </h4>
            <p className="mb-0 small">
              Pass with {stage?.passing_score}/{stage?.total_questions} correct answers
            </p>
          </Card.Header>
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Progress Indicator */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-muted">{progress}% Complete</span>
              </div>
              <ProgressBar now={progress} variant="primary" />
            </div>

            {/* Question */}
            {currentQ && (
              <div className="question-container">
                <h5 className="mb-4">
                  <Badge bg="primary" className="me-2">
                    Q{currentQuestion + 1}
                  </Badge>
                  {currentQ.question_text}
                </h5>

                <Form>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <Form.Check
                      key={option}
                      type="radio"
                      id={`q${currentQ.id}-${option}`}
                      name={`question-${currentQ.id}`}
                      label={
                        <div className="option-label">
                          <strong>{option})</strong>{' '}
                          {currentQ[`option_${option.toLowerCase()}`]}
                        </div>
                      }
                      checked={answers[currentQ.id] === option}
                      onChange={() => handleAnswerChange(currentQ.id, option)}
                      className="quiz-option mb-3"
                    />
                  ))}
                </Form>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-secondary"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Previous
              </Button>

              <div className="answered-indicator">
                <small className="text-muted">
                  Answered: {Object.keys(answers).length}/{questions.length}
                </small>
              </div>

              {currentQuestion < questions.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length !== questions.length}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Quiz
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Question Navigation Dots */}
            <div className="question-dots mt-4">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-dot ${answers[q.id] ? 'answered' : ''} ${
                    index === currentQuestion ? 'active' : ''
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                  title={`Question ${index + 1}${answers[q.id] ? ' (Answered)' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Results Modal */}
      <Modal show={showResult} onHide={() => {}} size="lg" centered backdrop="static">
        <Modal.Header className={`text-white ${result?.passed ? 'bg-success' : 'bg-danger'}`}>
          <Modal.Title>
            <i className={`bi ${result?.passed ? 'bi-trophy-fill' : 'bi-x-circle-fill'} me-2`}></i>
            {result?.passed ? 'Congratulations!' : 'Quiz Complete'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-5">
          {result && (
            <>
              <div className="result-icon mb-4">
                {result.passed ? (
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                ) : (
                  <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
                )}
              </div>
              <h2 className="mb-3">
                Your Score: {result.score}/{result.total}
              </h2>
              <h4 className={result.passed ? 'text-success' : 'text-danger'} className="mb-4">
                {result.percentage.toFixed(0)}%
              </h4>

              {result.passed ? (
                <Alert variant="success" className="text-start">
                  <Alert.Heading>You Passed!</Alert.Heading>
                  <p className="mb-0">
                    Great job! You've successfully completed this stage and unlocked the next level.
                  </p>
                </Alert>
              ) : (
                <Alert variant="warning" className="text-start">
                  <Alert.Heading>Keep Trying!</Alert.Heading>
                  <p className="mb-0">
                    You need at least {result.requiredPercentage.toFixed(0)}% to pass. Review the
                    materials and try again!
                  </p>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {result?.passed ? (
            <Button variant="success" size="lg" onClick={handleContinue} className="w-100">
              Continue to Dashboard
              <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          ) : (
            <>
              <Button variant="outline-secondary" onClick={handleContinue}>
                Back to Dashboard
              </Button>
              <Button variant="primary" onClick={handleRetry}>
                <i className="bi bi-arrow-repeat me-2"></i>
                Try Again
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Quiz;
