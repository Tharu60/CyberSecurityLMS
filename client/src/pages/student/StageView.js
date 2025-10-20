import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { stageAPI, videoAPI, progressAPI } from '../../services/api';
import '../../styles/StageView.css';

const StageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoProgress, setVideoProgress] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStageData();
  }, [id]);

  const fetchStageData = async () => {
    try {
      setLoading(true);
      const [stageRes, videosRes, progressRes] = await Promise.all([
        stageAPI.getStageById(id),
        videoAPI.getVideosByStage(id),
        progressAPI.getVideoProgress(id),
      ]);

      setStage(stageRes.data.stage);
      setVideos(videosRes.data.videos);
      setVideoProgress(progressRes.data.videoProgress);

      if (videosRes.data.videos.length > 0) {
        setCurrentVideo(videosRes.data.videos[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching stage data:', err);
      setError(err.response?.data?.message || 'Failed to load stage');
      setLoading(false);
    }
  };

  const handleVideoComplete = async (videoId) => {
    try {
      await progressAPI.markVideoCompleted(videoId);
      // Refresh progress
      const progressRes = await progressAPI.getVideoProgress(id);
      setVideoProgress(progressRes.data.videoProgress);
    } catch (err) {
      console.error('Error marking video complete:', err);
    }
  };

  const isVideoCompleted = (videoId) => {
    return videoProgress.some((vp) => vp.video_id === videoId && vp.completed);
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleStartQuiz = () => {
    navigate(`/student/quiz/${id}`);
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

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  const completedVideos = videoProgress.filter((vp) => vp.completed).length;
  const allVideosCompleted = videos.length > 0 && completedVideos === videos.length;

  return (
    <div className="stage-view-page">
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/student/dashboard')}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Row>
          {/* Video Player */}
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-mortarboard-fill me-2"></i>
                  {stage?.name}
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{stage?.description}</p>

                {currentVideo ? (
                  <>
                    <div className="video-container mb-3">
                      <iframe
                        width="100%"
                        height="450"
                        src={getYouTubeEmbedUrl(currentVideo.url)}
                        title={currentVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{currentVideo.title}</h6>
                      {!isVideoCompleted(currentVideo.id) && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleVideoComplete(currentVideo.id)}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Mark as Complete
                        </Button>
                      )}
                      {isVideoCompleted(currentVideo.id) && (
                        <Badge bg="success">
                          <i className="bi bi-check-circle me-1"></i>
                          Completed
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    No videos available for this stage yet.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Quiz Section */}
            <Card className="shadow-sm quiz-section">
              <Card.Body className="p-4">
                <h5 className="mb-3">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Stage Assessment
                </h5>
                <p className="text-muted mb-3">
                  Complete the assessment to unlock the next stage. You need to score at least{' '}
                  <strong>{stage?.passing_score}</strong> out of <strong>{stage?.total_questions}</strong>{' '}
                  questions to pass.
                </p>

                {videos.length > 0 && !allVideosCompleted && (
                  <Alert variant="warning" className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    It's recommended to complete all videos before taking the assessment.
                  </Alert>
                )}

                <Button variant="primary" size="lg" onClick={handleStartQuiz} className="w-100">
                  <i className="bi bi-play-circle me-2"></i>
                  {allVideosCompleted || videos.length === 0 ? 'Start Assessment' : 'Start Assessment Anyway'}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Video List Sidebar */}
          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <i className="bi bi-camera-video me-2"></i>
                  Course Videos ({completedVideos}/{videos.length})
                </h6>
              </Card.Header>
              <ListGroup variant="flush">
                {videos.length > 0 ? (
                  videos.map((video, index) => (
                    <ListGroup.Item
                      key={video.id}
                      className={`video-list-item ${
                        currentVideo?.id === video.id ? 'active' : ''
                      }`}
                      onClick={() => setCurrentVideo(video)}
                      action
                    >
                      <div className="d-flex align-items-start">
                        <div className="video-number me-3">
                          {isVideoCompleted(video.id) ? (
                            <i className="bi bi-check-circle-fill text-success"></i>
                          ) : (
                            <span className="text-muted">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium">{video.title}</div>
                          {video.description && (
                            <small className="text-muted">{video.description}</small>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>
                    <small className="text-muted">No videos available</small>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StageView;
