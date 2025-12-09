import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/About.css';

const About = () => {
  const features = [
    {
      icon: 'bi-shield-check',
      title: 'Comprehensive Security Training',
      description: 'Learn from beginner to expert level with our structured 6-stage curriculum covering all aspects of cybersecurity.'
    },
    {
      icon: 'bi-graph-up-arrow',
      title: 'Progressive Learning Path',
      description: 'Start at your skill level with our initial assessment and progress through stages tailored to your knowledge.'
    },
    {
      icon: 'bi-trophy',
      title: 'Certification',
      description: 'Earn a verified certificate upon completion of all stages, showcasing your cybersecurity expertise.'
    },
    {
      icon: 'bi-people',
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience in cybersecurity and ethical hacking.'
    },
    {
      icon: 'bi-laptop',
      title: 'Hands-on Learning',
      description: 'Practice with real-world scenarios, video tutorials, and interactive assessments.'
    },
    {
      icon: 'bi-clock-history',
      title: 'Learn at Your Pace',
      description: 'Self-paced learning platform that fits your schedule with 24/7 access to all course materials.'
    }
  ];

  const stats = [
    { number: '110+', label: 'Questions' },
    { number: '6', label: 'Stages' },
    { number: '8+', label: 'Video Lessons' },
    { number: '100%', label: 'Online' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="hero-title">
                <span className="gradient-text">Master Cybersecurity</span>
                <br />
                One Stage at a Time
              </h1>
              <p className="hero-description">
                A comprehensive Learning Management System designed to take you from cybersecurity basics
                to advanced expertise through structured, progressive learning stages.
              </p>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <h3>{stat.number}</h3>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <h2 className="section-title">Our Mission</h2>
              <p className="section-description">
                To empower individuals with essential cybersecurity knowledge and skills through
                accessible, high-quality education. We believe everyone should understand how to
                protect themselves and their organizations in the digital world.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title text-center mb-5">Why Choose Our Platform?</h2>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center">
                    <div className="feature-icon">
                      <i className={`bi ${feature.icon}`}></i>
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Learning Path Section */}
      <section className="learning-path-section">
        <Container>
          <h2 className="section-title text-center mb-5">Your Learning Journey</h2>
          <div className="learning-path">
            <div className="path-step">
              <div className="step-number">1</div>
              <h4>Initial Assessment</h4>
              <p>Take a 25-question assessment to determine your starting level</p>
            </div>
            <div className="path-arrow">
              <i className="bi bi-arrow-right"></i>
            </div>
            <div className="path-step">
              <div className="step-number">2</div>
              <h4>Progressive Stages</h4>
              <p>Complete Stages 1-4, each with videos and quizzes</p>
            </div>
            <div className="path-arrow">
              <i className="bi bi-arrow-right"></i>
            </div>
            <div className="path-step">
              <div className="step-number">3</div>
              <h4>Final Assessment</h4>
              <p>Demonstrate mastery with comprehensive final exam</p>
            </div>
            <div className="path-arrow">
              <i className="bi bi-arrow-right"></i>
            </div>
            <div className="path-step">
              <div className="step-number">4</div>
              <h4>Certification</h4>
              <p>Receive your verified cybersecurity certificate</p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-box text-center">
            <h2>Ready to Start Your Cybersecurity Journey?</h2>
            <p>Join thousands of learners building their cybersecurity expertise</p>
            <a href="/register" className="btn btn-light btn-lg">
              Get Started Today
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
