import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { certificateAPI, progressAPI } from '../../services/api';
import '../../styles/Certificate.css';

const Certificate = () => {
  const [certificate, setCertificate] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [certRes, progressRes] = await Promise.all([
        certificateAPI.getMyCertificate().catch(() => ({ data: { certificate: null } })),
        progressAPI.getMyProgress(),
      ]);

      setCertificate(certRes.data.certificate);
      setProgress(progressRes.data.progress);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await certificateAPI.generateCertificate();
      setCertificate(response.data.certificate);
      setGenerating(false);
    } catch (err) {
      console.error('Generate certificate error:', err);
      setError(err.response?.data?.message || 'Failed to generate certificate');
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const hasCompletedAll = progress?.completed_stages >= 4; // Need to complete Stages 1-4 and Final

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Container className="py-5">
        {error && <Alert variant="danger" className="no-print">{error}</Alert>}

        {!certificate && !hasCompletedAll && (
          <Card className="shadow-lg text-center p-5 no-print">
            <Card.Body>
              <i className="bi bi-award text-warning" style={{ fontSize: '5rem' }}></i>
              <h2 className="mt-4 mb-3">Complete All Stages to Earn Your Certificate</h2>
              <p className="text-muted mb-4">
                You need to complete all learning stages and pass the final exam to earn your
                Cybersecurity Certificate.
              </p>
              <div className="progress-stats">
                <h4>
                  Stages Completed: <span className="text-primary">{progress?.completed_stages || 0}/5</span>
                </h4>
              </div>
              <Button variant="primary" size="lg" className="mt-4" onClick={() => navigate('/student/dashboard')}>
                <i className="bi bi-arrow-left me-2"></i>
                Continue Learning
              </Button>
            </Card.Body>
          </Card>
        )}

        {!certificate && hasCompletedAll && (
          <Card className="shadow-lg text-center p-5 no-print">
            <Card.Body>
              <i className="bi bi-trophy-fill text-success" style={{ fontSize: '5rem' }}></i>
              <h2 className="mt-4 mb-3">Congratulations!</h2>
              <p className="text-muted mb-4">
                You've completed all stages! Generate your official Cybersecurity Certificate.
              </p>
              <Button
                variant="success"
                size="lg"
                onClick={handleGenerateCertificate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-award me-2"></i>
                    Generate My Certificate
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        )}

        {certificate && (
          <>
            <div className="text-center mb-4 no-print">
              <Button variant="primary" size="lg" onClick={handlePrint}>
                <i className="bi bi-printer me-2"></i>
                Print Certificate
              </Button>
            </div>

            <div className="certificate-container">
              <div className="certificate-border">
                <div className="certificate-content">
                  <div className="certificate-header">
                    <i className="bi bi-shield-lock-fill certificate-logo"></i>
                    <h1 className="certificate-title">Certificate of Completion</h1>
                  </div>

                  <div className="certificate-body">
                    <p className="certificate-text">This is to certify that</p>
                    <h2 className="certificate-name">{user?.name}</h2>
                    <p className="certificate-text">
                      has successfully completed the
                    </p>
                    <h3 className="certificate-course">Cybersecurity Fundamentals Course</h3>
                    <p className="certificate-description">
                      Demonstrating proficiency in cybersecurity principles, network security,
                      threat mitigation, and security best practices through comprehensive
                      assessments and practical learning.
                    </p>

                    <Row className="mt-5">
                      <Col md={6}>
                        <div className="certificate-detail">
                          <p className="mb-1">Certificate ID</p>
                          <h5>{certificate.certificate_code}</h5>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="certificate-detail">
                          <p className="mb-1">Date Issued</p>
                          <h5>{new Date(certificate.issued_at).toLocaleDateString()}</h5>
                        </div>
                      </Col>
                    </Row>

                    <div className="certificate-footer mt-5">
                      <div className="signature-line">
                        <div className="signature">Cyber Security LMS</div>
                        <p className="signature-label">Issuing Authority</p>
                      </div>
                    </div>
                  </div>

                  <div className="certificate-seal">
                    <i className="bi bi-patch-check-fill"></i>
                    <p>VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4 no-print">
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Your certificate can be verified using code: <strong>{certificate.certificate_code}</strong>
              </Alert>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default Certificate;
