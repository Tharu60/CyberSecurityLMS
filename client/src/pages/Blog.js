import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';
import { blogPosts, categories } from '../data/blogData';
import { translations, categoryTranslations } from '../data/translations';
import LanguageToggle from '../components/LanguageToggle';
import '../styles/Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en');

  const t = translations[language].blog;

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const searchField = language === 'si' && post.titleSi ? post.titleSi : post.title;
    const excerptField = language === 'si' && post.excerptSi ? post.excerptSi : post.excerpt;
    const matchesSearch = searchField.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         excerptField.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getPostTitle = (post) => language === 'si' && post.titleSi ? post.titleSi : post.title;
  const getPostExcerpt = (post) => language === 'si' && post.excerptSi ? post.excerptSi : post.excerpt;
  const getCategoryName = (category) => categoryTranslations[language][category] || category;

  return (
    <div className="blog-page">
      <LanguageToggle language={language} setLanguage={setLanguage} />

      {/* Hero Section */}
      <section className="blog-hero">
        <Container>
          <div className="text-center">
            <h1 className="hero-title">
              <span className="gradient-text">{t.heroTitle}</span> {t.heroTitleSuffix}
            </h1>
            <p className="hero-description">
              {t.heroDescription}
            </p>
          </div>
        </Container>
      </section>

      {/* Filters Section */}
      <section className="blog-filters">
        <Container>
          <Row className="align-items-center mb-4">
            <Col md={8}>
              <div className="category-pills">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {getCategoryName(category)}
                  </button>
                ))}
              </div>
            </Col>
            <Col md={4}>
              <Form.Control
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog Posts Section */}
      <section className="blog-posts">
        <Container>
          {filteredPosts.length === 0 ? (
            <div className="no-results text-center">
              <i className="bi bi-search"></i>
              <h3>{t.noResults}</h3>
              <p>{t.noResultsDescription}</p>
            </div>
          ) : (
            <Row>
              {filteredPosts.map(post => (
                <Col key={post.id} lg={4} md={6} className="mb-4">
                  <Card className="blog-card h-100">
                    <div className="blog-card-image" style={{backgroundImage: `url(${post.image})`}}>
                      <Badge bg="primary" className="category-badge">{getCategoryName(post.category)}</Badge>
                    </div>
                    <Card.Body>
                      <div className="post-meta mb-2">
                        <span><i className="bi bi-calendar3"></i> {new Date(post.date).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span><i className="bi bi-clock"></i> {post.readTime}</span>
                      </div>
                      <h3 className="post-title">{getPostTitle(post)}</h3>
                      <p className="post-excerpt">{getPostExcerpt(post)}</p>
                      <div className="post-footer">
                        <div className="author-info">
                          <div className="author-avatar">
                            <i className="bi bi-person-circle"></i>
                          </div>
                          <div className="author-details">
                            <div className="author-name">{post.author}</div>
                            <div className="author-role">{post.authorRole}</div>
                          </div>
                        </div>
                        <Link to={`/blog/${post.slug}?lang=${language}`} className="read-more-btn">
                          {t.readMore} <i className="bi bi-arrow-right"></i>
                        </Link>
                      </div>
                      <div className="post-tags mt-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag-badge">{tag}</span>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Newsletter CTA */}
      <section className="newsletter-section">
        <Container>
          <div className="newsletter-box text-center">
            <i className="bi bi-envelope-fill newsletter-icon"></i>
            <h2>{t.newsletterTitle}</h2>
            <p>{t.newsletterDescription}</p>
            <div className="newsletter-form">
              <input type="email" placeholder={t.newsletterPlaceholder} className="newsletter-input" />
              <button className="newsletter-btn">{t.newsletterButton}</button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Blog;
