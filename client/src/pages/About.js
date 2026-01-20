import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import LanguageToggle from '../components/LanguageToggle';
import { translations } from '../data/translations';
import '../styles/About.css';

const About = () => {
  const [language, setLanguage] = useState('en');
  const t = translations[language].about;

  const featureIcons = [
    'bi-shield-check',
    'bi-graph-up-arrow',
    'bi-trophy',
    'bi-people',
    'bi-laptop',
    'bi-clock-history'
  ];

  const stats = [
    { number: '110+', label: t.stats.questions },
    { number: '6', label: t.stats.stages },
    { number: '8+', label: t.stats.videoLessons },
    { number: '100%', label: t.stats.online }
  ];

  return (
    <div className="about-page">
      <LanguageToggle language={language} setLanguage={setLanguage} />

      {/* Hero Section */}
      <section className="about-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="hero-title">
                <span className="gradient-text">{t.heroTitle1}</span>
                <br />
                {t.heroTitle2}
              </h1>
              <p className="hero-description">
                {t.heroDescription}
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
              <h2 className="section-title">{t.missionTitle}</h2>
              <p className="section-description">
                {t.missionDescription}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title text-center mb-5">{t.featuresTitle}</h2>
          <Row>
            {t.features.map((feature, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center">
                    <div className="feature-icon">
                      <i className={`bi ${featureIcons[index]}`}></i>
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
          <h2 className="section-title text-center mb-5">{t.journeyTitle}</h2>
          <div className="learning-path">
            {t.journeySteps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="path-step">
                  <div className="step-number">{index + 1}</div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
                {index < t.journeySteps.length - 1 && (
                  <div className="path-arrow">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-box text-center">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaDescription}</p>
            <a href="/register" className="btn btn-light btn-lg">
              {t.ctaButton}
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
