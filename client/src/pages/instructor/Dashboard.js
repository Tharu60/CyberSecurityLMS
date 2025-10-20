import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, videoAPI, questionAPI, stageAPI, progressAPI } from '../../services/api';
import MobileNav from '../../components/MobileNav';

const InstructorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [videos, setVideos] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stages, setStages] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form states
  const [videoForm, setVideoForm] = useState({
    title: '',
    url: '',
    duration: '',
    stage_id: '',
    description: ''
  });

  const [questionForm, setQuestionForm] = useState({
    stage_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [studentsRes, videosRes, questionsRes, stagesRes] = await Promise.all([
        adminAPI.getAllUsers('student'),
        videoAPI.getAllVideos(),
        questionAPI.getQuestionsByStage(''),
        stageAPI.getAllStages()
      ]);

      setStudents(studentsRes.data.users);
      setVideos(videosRes.data.videos);
      setQuestions(questionsRes.data.questions);
      setStages(stagesRes.data.stages);

      // Fetch analytics for each student
      const analyticsData = await Promise.all(
        studentsRes.data.users.map(student =>
          progressAPI.getUserProgress(student.id).catch(() => ({ data: { progress: null } }))
        )
      );
      setAnalytics(analyticsData.map((res, idx) => ({
        student: studentsRes.data.users[idx],
        progress: res.data.progress
      })));

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

  // Video handlers
  const handleShowVideoModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setVideoForm({
        title: video.title,
        url: video.url,
        duration: video.duration,
        stage_id: video.stage_id,
        description: video.description || ''
      });
    } else {
      setEditingVideo(null);
      setVideoForm({
        title: '',
        url: '',
        duration: '',
        stage_id: '',
        description: ''
      });
    }
    setShowVideoModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setEditingVideo(null);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await videoAPI.updateVideo(editingVideo.id, videoForm);
        setMessage({ type: 'success', text: 'Video updated successfully!' });
      } else {
        await videoAPI.createVideo(videoForm);
        setMessage({ type: 'success', text: 'Video created successfully!' });
      }
      await fetchAllData();
      setTimeout(() => {
        handleCloseVideoModal();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save video' });
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoAPI.deleteVideo(id);
        await fetchAllData();
        setMessage({ type: 'success', text: 'Video deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        setMessage({ type: 'danger', text: 'Failed to delete video' });
      }
    }
  };

  // Question handlers
  const handleShowQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        stage_id: question.stage_id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        explanation: question.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        stage_id: '',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: ''
      });
    }
    setShowQuestionModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await questionAPI.updateQuestion(editingQuestion.id, questionForm);
        setMessage({ type: 'success', text: 'Question updated successfully!' });
      } else {
        await questionAPI.createQuestion(questionForm);
        setMessage({ type: 'success', text: 'Question created successfully!' });
      }
      await fetchAllData();
      setTimeout(() => {
        handleCloseQuestionModal();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save question' });
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionAPI.deleteQuestion(id);
        await fetchAllData();
        setMessage({ type: 'success', text: 'Question deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        setMessage({ type: 'danger', text: 'Failed to delete question' });
      }
    }
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <Container>
          <div className="d-flex align-items-center">
            <MobileNav />
            <span className="navbar-brand mb-0 h1">
              <i className="bi bi-shield-lock-fill me-2"></i>
              <span className="d-none d-md-inline">Cyber Security LMS - Instructor</span>
              <span className="d-inline d-md-none">Instructor</span>
            </span>
          </div>
          <div className="d-flex align-items-center">
            <span className="text-white me-3 d-none d-md-inline">
              <i className="bi bi-person-circle me-2"></i>
              {user?.name}
            </span>
            <Button variant="outline-light" size="sm" className="d-none d-lg-inline-flex" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </Button>
          </div>
        </Container>
      </nav>

      <Container className="py-5">
        <h2 className="mb-4">Instructor Dashboard</h2>

        {message.text && (
          <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{students.length}</h3>
                <p className="text-muted">Total Students</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-play-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{videos.length}</h3>
                <p className="text-muted">Videos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-question-circle-fill text-warning" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{questions.length}</h3>
                <p className="text-muted">Questions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-diagram-3-fill text-info" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">{stages.length}</h3>
                <p className="text-muted">Stages</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          {/* Overview Tab */}
          <Tab eventKey="overview" title={<><i className="bi bi-house me-2"></i>Overview</>}>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Student List
                </h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{new Date(student.created_at).toLocaleDateString()}</td>
                        <td>
                          <Badge bg="success">Active</Badge>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Videos Tab */}
          <Tab eventKey="videos" title={<><i className="bi bi-play-circle me-2"></i>Videos</>}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Manage Videos</h5>
              <Button variant="primary" onClick={() => handleShowVideoModal()}>
                <i className="bi bi-plus-circle me-2"></i>
                Add Video
              </Button>
            </div>
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Stage</th>
                      <th>Duration</th>
                      <th>URL</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video, index) => (
                      <tr key={video.id}>
                        <td>{index + 1}</td>
                        <td>{video.title}</td>
                        <td>
                          <Badge bg="info">
                            {stages.find(s => s.id === video.stage_id)?.name || 'N/A'}
                          </Badge>
                        </td>
                        <td>{video.duration} min</td>
                        <td>
                          <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                            <i className="bi bi-link-45deg"></i> Link
                          </a>
                        </td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowVideoModal(video)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No videos found. Add your first video!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Questions Tab */}
          <Tab eventKey="questions" title={<><i className="bi bi-question-circle me-2"></i>Questions</>}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Manage Questions</h5>
              <Button variant="primary" onClick={() => handleShowQuestionModal()}>
                <i className="bi bi-plus-circle me-2"></i>
                Add Question
              </Button>
            </div>
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Stage</th>
                      <th>Correct Answer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.slice(0, 50).map((question, index) => (
                      <tr key={question.id}>
                        <td>{index + 1}</td>
                        <td>{question.question_text.substring(0, 80)}...</td>
                        <td>
                          <Badge bg="info">
                            {stages.find(s => s.id === question.stage_id)?.name || 'N/A'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="success">{question.correct_answer}</Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowQuestionModal(question)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {questions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No questions found. Add your first question!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {questions.length > 50 && (
                  <p className="text-muted text-center mt-3">
                    Showing first 50 questions out of {questions.length} total
                  </p>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* Analytics Tab */}
          <Tab eventKey="analytics" title={<><i className="bi bi-graph-up me-2"></i>Analytics</>}>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-bar-chart-line me-2"></i>
                  Student Progress Analytics
                </h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Current Stage</th>
                      <th>Completed Stages</th>
                      <th>Average Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((item, index) => (
                      <tr key={item.student.id}>
                        <td>{index + 1}</td>
                        <td>{item.student.name}</td>
                        <td>{item.student.email}</td>
                        <td>
                          {item.progress ? (
                            <Badge bg="primary">Stage {item.progress.current_stage}</Badge>
                          ) : (
                            <Badge bg="secondary">Not Started</Badge>
                          )}
                        </td>
                        <td>{item.progress?.completed_stages || 0}/5</td>
                        <td>
                          {item.progress?.average_score ? (
                            <Badge bg={item.progress.average_score >= 60 ? 'success' : 'warning'}>
                              {item.progress.average_score.toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          {item.progress?.completed_stages === 5 ? (
                            <Badge bg="success">
                              <i className="bi bi-check-circle me-1"></i>
                              Completed
                            </Badge>
                          ) : item.progress ? (
                            <Badge bg="info">
                              <i className="bi bi-hourglass-split me-1"></i>
                              In Progress
                            </Badge>
                          ) : (
                            <Badge bg="secondary">Not Started</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {analytics.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted">
                          No student data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Video Modal */}
        <Modal show={showVideoModal} onHide={handleCloseVideoModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-play-circle me-2"></i>
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleVideoSubmit}>
            <Modal.Body>
              {message.text && message.type && (
                <Alert variant={message.type}>{message.text}</Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                  placeholder="Enter video title"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Video URL *</Form.Label>
                <Form.Control
                  type="url"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (minutes) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      required
                      min="1"
                      placeholder="15"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stage *</Form.Label>
                    <Form.Select
                      value={videoForm.stage_id}
                      onChange={(e) => setVideoForm({ ...videoForm, stage_id: e.target.value })}
                      required
                    >
                      <option value="">Select Stage</option>
                      {stages.map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Enter video description (optional)"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseVideoModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-save me-2"></i>
                {editingVideo ? 'Update Video' : 'Create Video'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Question Modal */}
        <Modal show={showQuestionModal} onHide={handleCloseQuestionModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-question-circle me-2"></i>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleQuestionSubmit}>
            <Modal.Body>
              {message.text && message.type && (
                <Alert variant={message.type}>{message.text}</Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Stage *</Form.Label>
                <Form.Select
                  value={questionForm.stage_id}
                  onChange={(e) => setQuestionForm({ ...questionForm, stage_id: e.target.value })}
                  required
                >
                  <option value="">Select Stage</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Question Text *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  required
                  placeholder="Enter your question"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Option A *</Form.Label>
                    <Form.Control
                      type="text"
                      value={questionForm.option_a}
                      onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                      required
                      placeholder="Option A"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Option B *</Form.Label>
                    <Form.Control
                      type="text"
                      value={questionForm.option_b}
                      onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                      required
                      placeholder="Option B"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Option C *</Form.Label>
                    <Form.Control
                      type="text"
                      value={questionForm.option_c}
                      onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                      required
                      placeholder="Option C"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Option D *</Form.Label>
                    <Form.Control
                      type="text"
                      value={questionForm.option_d}
                      onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                      required
                      placeholder="Option D"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correct Answer *</Form.Label>
                    <Form.Select
                      value={questionForm.correct_answer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Explanation</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer (optional)"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseQuestionModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-save me-2"></i>
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default InstructorDashboard;
