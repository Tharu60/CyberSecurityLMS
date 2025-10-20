import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, ProgressBar, Modal, Badge } from 'react-bootstrap';
import { stageAPI, progressAPI } from '../../services/api';
import '../../styles/Quiz.css';

const InitialAssessment = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Get General Stage (stage_number = 0)
      const stagesRes = await stageAPI.getAllStages();
      const generalStage = stagesRes.data.stages.find((s) => s.stage_number === 0);

      if (!generalStage) {
        setError('General stage not found');
        return;
      }

      const questionsRes = await stageAPI.getStageQuestions(generalStage.id);
      setQuestions(questionsRes.data.questions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to load assessment');
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
    // Check if all questions are answered
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

      const response = await progressAPI.submitInitialAssessment(answersArray);
      setResult(response.data);
      setShowResult(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.response?.data?.message || 'Failed to submit assessment');
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/student/dashboard');
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
        <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
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
              Initial Assessment
            </h4>
            <p className="mb-0 small">Determine your starting level</p>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

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
                          <strong>{option})</strong> {currentQ[`option_${option.toLowerCase()}`]}
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
                      Submit Assessment
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Question Navigation */}
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
      <Modal show={showResult} onHide={handleContinue} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-trophy-fill me-2"></i>
            Assessment Complete!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-5">
          {result && (
            <>
              <div className="result-icon mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
              </div>
              <h2 className="mb-3">Your Score: {result.score}/{result.total}</h2>
              <h4 className="text-primary mb-4">{result.percentage.toFixed(0)}%</h4>

              <Alert variant="info" className="text-start">
                <Alert.Heading>Starting Stage Determined</Alert.Heading>
                <p className="mb-0">
                  Based on your performance, you will start at{' '}
                  <strong>Stage {result.startingStage}</strong>.
                </p>
              </Alert>

              <div className="mt-4">
                <p className="text-muted">
                  {result.percentage >= 75
                    ? 'Excellent! You have strong foundational knowledge.'
                    : result.percentage >= 50
                    ? 'Good job! You have a solid understanding of the basics.'
                    : result.percentage >= 25
                    ? 'Nice start! You have some knowledge to build upon.'
                    : 'Don\'t worry! We\'ll start from the fundamentals.'}
                </p>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" size="lg" onClick={handleContinue} className="w-100">
            Continue to Dashboard
            <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InitialAssessment;
