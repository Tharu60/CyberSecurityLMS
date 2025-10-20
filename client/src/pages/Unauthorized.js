import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Container>
        <Card className="shadow-lg text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <i className="bi bi-shield-exclamation text-danger" style={{ fontSize: '5rem' }}></i>
            </div>
            <h2 className="mb-3">Access Denied</h2>
            <p className="text-muted mb-4">
              You don't have permission to access this page. Please contact your administrator if you
              believe this is an error.
            </p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Unauthorized;
