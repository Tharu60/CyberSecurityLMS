import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { progressAPI, stageAPI } from '../../services/api';
import '../../styles/Dashboard.css';

const StudentDashboard = () => {
  const [progress, setProgress] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progressRes, stagesRes] = await Promise.all([
        progressAPI.getMyProgress(),
        stageAPI.getAllStages()
      ]);

      setProgress(progressRes.data.progress);
      setStages(stagesRes.data.stages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleStartInitialAssessment = () => {
    navigate('/student/initial-assessment');
  };

  const handleViewStage = (stageId) => {
    navigate(`/student/stage/${stageId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const calculateOverallProgress = () => {
    if (!progress || !stages.length) return 0;
    const completedStages = progress.completed_stages || 0;
    const totalStages = 4; // Only count Stage 1-4
    return Math.round((completedStages / totalStages) * 100);
  };

  const needsInitialAssessment = progress && !progress.initial_assessment_completed;

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h2 className="mb-3">Welcome back, {user?.name}! 👋</h2>
            <p className="text-muted">Continue your cybersecurity learning journey</p>
          </Col>
        </Row>

        {/* Initial Assessment Alert */}
        {needsInitialAssessment && (
          <Alert variant="info" className="mb-4">
            <Alert.Heading>
              <i className="bi bi-clipboard-check me-2"></i>
              Start Your Learning Journey
            </Alert.Heading>
            <p>
              Take the initial assessment to determine your current knowledge level and start at the
              appropriate stage.
            </p>
            <Button variant="primary" onClick={handleStartInitialAssessment}>
              <i className="bi bi-play-circle me-2"></i>
              Start Initial Assessment
            </Button>
          </Alert>
        )}

        {/* Progress Overview */}
        {!needsInitialAssessment && progress && (
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">
                <i className="bi bi-graph-up me-2"></i>
                Your Progress
              </h5>
              <Row>
                <Col md={4}>
                  <div className="stat-card">
                    <div className="stat-icon bg-primary">
                      <i className="bi bi-trophy-fill"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{progress.completed_stages || 0}</h3>
                      <p>Stages Completed</p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-card">
                    <div className="stat-icon bg-success">
                      <i className="bi bi-flag-fill"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{progress.current_stage}</h3>
                      <p>Current Stage</p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-card">
                    <div className="stat-icon bg-info">
                      <i className="bi bi-percent"></i>
                    </div>
                    <div className="stat-info">
                      <h3>{calculateOverallProgress()}%</h3>
                      <p>Overall Progress</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <label className="mb-2 text-muted">Overall Completion</label>
                <ProgressBar
                  now={calculateOverallProgress()}
                  variant="primary"
                  striped
                  animated
                  label={`${calculateOverallProgress()}%`}
                />
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Learning Stages */}
        <h4 className="mb-3">
          <i className="bi bi-mortarboard-fill me-2"></i>
          Learning Stages
        </h4>
        <Row>
          {stages
            .filter((stage) => stage.stage_number > 0 && stage.stage_number < 5)
            .map((stage) => (
              <Col md={6} lg={3} key={stage.id} className="mb-4">
                <Card
                  className={`stage-card h-100 ${
                    stage.unlocked ? 'unlocked' : 'locked'
                  } ${stage.completed ? 'completed' : ''}`}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="stage-header mb-3">
                      <div className="stage-icon">
                        {stage.completed ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : stage.unlocked ? (
                          <i className="bi bi-unlock-fill text-primary"></i>
                        ) : (
                          <i className="bi bi-lock-fill text-muted"></i>
                        )}
                      </div>
                      <Badge
                        bg={
                          stage.completed
                            ? 'success'
                            : stage.unlocked
                            ? 'primary'
                            : 'secondary'
                        }
                      >
                        Stage {stage.stage_number}
                      </Badge>
                    </div>
                    <h5 className="mb-2">{stage.name}</h5>
                    <p className="text-muted small flex-grow-1">{stage.description}</p>
                    <div className="stage-footer mt-2">
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-question-circle me-1"></i>
                          {stage.total_questions} Questions
                        </small>
                      </div>
                      {stage.unlocked ? (
                        <Button
                          variant={stage.completed ? 'outline-success' : 'primary'}
                          size="sm"
                          className="w-100"
                          onClick={() => handleViewStage(stage.id)}
                        >
                          {stage.completed ? (
                            <>
                              <i className="bi bi-arrow-repeat me-2"></i>
                              Review
                            </>
                          ) : (
                            <>
                              <i className="bi bi-play-circle me-2"></i>
                              Start Learning
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" className="w-100" disabled>
                          <i className="bi bi-lock me-2"></i>
                          Locked
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>

        {/* Final Stage */}
        {progress && progress.current_stage >= 4 && (
          <Row className="mt-4">
            <Col>
              <Card className="final-stage-card shadow-lg border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h4 className="mb-2">
                        <i className="bi bi-award-fill text-warning me-2"></i>
                        Final Assessment
                      </h4>
                      <p className="text-muted mb-0">
                        Complete the final assessment to earn your certification
                      </p>
                    </div>
                    <Button
                      variant="warning"
                      size="lg"
                      onClick={() => {
                        const finalStage = stages.find((s) => s.stage_number === 5);
                        if (finalStage) handleViewStage(finalStage.id);
                      }}
                    >
                      <i className="bi bi-trophy me-2"></i>
                      Take Final Exam
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;
