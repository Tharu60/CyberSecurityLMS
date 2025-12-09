import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut, Bar, Line, Radar, PolarArea } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { progressAPI, stageAPI } from '../../services/api';
import '../../styles/Progress.css';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [stageResults, setStageResults] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, stagesRes] = await Promise.all([
        progressAPI.getMyProgress(),
        stageAPI.getAllStages(),
      ]);

      setProgress(progressRes.data.progress);
      setStageResults(progressRes.data.stageResults || []);
      setStages(stagesRes.data.stages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
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

  // Calculate statistics
  const totalStages = 4; // Stages 1-4
  const completedStages = progress?.completed_stages || 0;
  const overallProgress = Math.round((completedStages / totalStages) * 100);

  const totalAttempts = stageResults.length;
  const passedAttempts = stageResults.filter(r => r.passed).length;
  const averageScore = stageResults.length > 0
    ? Math.round(stageResults.reduce((sum, r) => sum + (r.score / r.total_questions * 100), 0) / stageResults.length)
    : 0;

  // Doughnut Chart Data - Overall Progress
  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [completedStages, totalStages - completedStages],
      backgroundColor: ['#667eea', '#e9ecef'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} stage${value !== 1 ? 's' : ''}`;
          }
        }
      }
    },
  };

  // Bar Chart Data - Scores by Stage
  const stageScoreData = stages
    .filter(s => s.stage_number > 0 && s.stage_number < 5)
    .map(stage => {
      const result = stageResults.find(r => r.stage_id === stage.id && r.passed);
      return {
        stage: stage.name.split(':')[0],
        score: result ? Math.round((result.score / result.total_questions) * 100) : 0,
        passed: !!result,
      };
    });

  const barData = {
    labels: stageScoreData.map(s => s.stage),
    datasets: [{
      label: 'Score %',
      data: stageScoreData.map(s => s.score),
      backgroundColor: stageScoreData.map(s => s.passed ? '#28a745' : '#6c757d'),
      borderRadius: 8,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`
        }
      }
    },
  };

  // Line Chart Data - Attempt History
  const attemptHistory = stageResults
    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
    .map((result, index) => ({
      attempt: index + 1,
      score: Math.round((result.score / result.total_questions) * 100),
      passed: result.passed,
      date: new Date(result.completed_at).toLocaleDateString(),
    }));

  const lineData = {
    labels: attemptHistory.map(a => `Attempt ${a.attempt}`),
    datasets: [{
      label: 'Score %',
      data: attemptHistory.map(a => a.score),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: attemptHistory.map(a => a.passed ? '#28a745' : '#dc3545'),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataIndex = context.dataIndex;
            const attempt = attemptHistory[dataIndex];
            return [
              `Score: ${context.parsed.y}%`,
              `Status: ${attempt.passed ? 'Passed' : 'Failed'}`,
              `Date: ${attempt.date}`
            ];
          }
        }
      }
    },
  };

  // Radar Chart Data - Skills Assessment
  const skillCategories = ['Fundamentals', 'Network Security', 'Cryptography', 'Advanced Topics'];
  const radarData = {
    labels: skillCategories,
    datasets: [{
      label: 'Your Performance',
      data: stageScoreData.map(s => s.score),
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: '#667eea',
      borderWidth: 2,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#667eea',
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => value + '%'
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.r}%`
        }
      }
    },
  };

  // Polar Area Chart Data - Stage Difficulty vs Performance
  const polarData = {
    labels: stageScoreData.map(s => s.stage),
    datasets: [{
      label: 'Performance by Stage',
      data: stageScoreData.map(s => s.score),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.r}%`
        }
      }
    },
  };

  // Calculate performance metrics
  const performanceMetrics = {
    bestScore: Math.max(...stageResults.map(r => Math.round((r.score / r.total_questions) * 100)), 0),
    worstScore: stageResults.length > 0 ? Math.min(...stageResults.map(r => Math.round((r.score / r.total_questions) * 100))) : 0,
    improvement: attemptHistory.length >= 2 ? attemptHistory[attemptHistory.length - 1].score - attemptHistory[0].score : 0,
    consistency: stageResults.length > 1 ? Math.round(100 - (stageResults.reduce((sum, r) => {
      const score = (r.score / r.total_questions) * 100;
      return sum + Math.abs(score - averageScore);
    }, 0) / stageResults.length)) : 100,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>My Progress & Analytics</h2>
            <p className="text-muted">Track your learning journey</p>
          </div>
        </div>

        {/* Summary Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{completedStages}/{totalStages}</h3>
                <p className="text-muted">Stages Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <i className="bi bi-percent text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{overallProgress}%</h3>
                <p className="text-muted">Overall Progress</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <i className="bi bi-graph-up text-success" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{averageScore}%</h3>
                <p className="text-muted">Average Score</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <i className="bi bi-clipboard-check text-info" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{totalAttempts}</h3>
                <p className="text-muted">Total Attempts</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-pie-chart me-2"></i>
                  Stage Completion
                </h6>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '250px' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Scores by Stage
                </h6>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '250px' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {attemptHistory.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Performance Trend
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Advanced Charts Row */}
        {stageResults.length > 0 && (
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-pentagon me-2"></i>
                    Skills Assessment Radar
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Radar chart shows your performance across different cybersecurity domains
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-diagram-3 me-2"></i>
                    Stage Performance Distribution
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <PolarArea data={polarData} options={polarOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Polar area chart visualizes your score distribution across stages
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Performance Metrics */}
        {stageResults.length > 0 && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm text-center border-success">
                <Card.Body>
                  <i className="bi bi-star-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="mt-3 text-success">{performanceMetrics.bestScore}%</h3>
                  <p className="text-muted mb-0">Best Score</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center border-info">
                <Card.Body>
                  <i className="bi bi-arrow-up-circle-fill text-info" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="mt-3 text-info">
                    {performanceMetrics.improvement > 0 ? '+' : ''}{performanceMetrics.improvement}%
                  </h3>
                  <p className="text-muted mb-0">Improvement</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center border-warning">
                <Card.Body>
                  <i className="bi bi-graph-down text-warning" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="mt-3 text-warning">{performanceMetrics.worstScore}%</h3>
                  <p className="text-muted mb-0">Lowest Score</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center border-primary">
                <Card.Body>
                  <i className="bi bi-speedometer2 text-primary" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="mt-3 text-primary">{performanceMetrics.consistency}%</h3>
                  <p className="text-muted mb-0">Consistency</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Attempt History Table */}
        <Card className="shadow-sm">
          <Card.Header>
            <h6 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Attempt History
            </h6>
          </Card.Header>
          <Card.Body>
            {stageResults.length > 0 ? (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Stage</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Attempt</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stageResults
                    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                    .map((result, index) => {
                      const percentage = Math.round((result.score / result.total_questions) * 100);
                      return (
                        <tr key={result.id}>
                          <td>{index + 1}</td>
                          <td>{result.stage_name}</td>
                          <td>
                            <strong>{result.score}/{result.total_questions}</strong>
                            <span className="text-muted ms-2">({percentage}%)</span>
                          </td>
                          <td>
                            <Badge bg={result.passed ? 'success' : 'danger'}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </td>
                          <td>Attempt #{result.attempt_number}</td>
                          <td>{new Date(result.completed_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            ) : (
              <div className="text-center text-muted py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3">No quiz attempts yet. Start learning!</p>
                <Button variant="primary" onClick={() => navigate('/student/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Progress;
