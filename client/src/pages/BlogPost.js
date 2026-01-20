import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { blogPosts } from '../data/blogData';
import { translations, categoryTranslations } from '../data/translations';
import LanguageToggle from '../components/LanguageToggle';
import '../styles/Blog.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get language from URL query parameter or default to 'en'
  const queryParams = new URLSearchParams(location.search);
  const initialLang = queryParams.get('lang') || 'en';
  const [language, setLanguage] = useState(initialLang);

  const t = translations[language].blog;
  const post = blogPosts.find(p => p.slug === slug);

  // Update URL when language changes
  useEffect(() => {
    const newUrl = `/blog/${slug}?lang=${language}`;
    window.history.replaceState(null, '', newUrl);
  }, [language, slug]);

  const getPostTitle = (p) => language === 'si' && p.titleSi ? p.titleSi : p.title;
  const getPostExcerpt = (p) => language === 'si' && p.excerptSi ? p.excerptSi : p.excerpt;
  const getPostContent = (p) => language === 'si' && p.contentSi ? p.contentSi : p.content;
  const getCategoryName = (category) => categoryTranslations[language][category] || category;

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <h2>{t.postNotFound}</h2>
        <p>{t.postNotFoundDescription}</p>
        <Button onClick={() => navigate('/blog')}>{t.backToBlog}</Button>
      </Container>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(tag => post.tags.includes(tag))))
    .slice(0, 3);

  return (
    <div className="blog-post-page">
      <LanguageToggle language={language} setLanguage={setLanguage} />

      {/* Post Header */}
      <section className="post-header" style={{backgroundImage: `url(${post.image})`}}>
        <div className="header-overlay">
          <Container>
            <div className="breadcrumb-nav">
              <Link to={`/blog?lang=${language}`}><i className="bi bi-arrow-left"></i> {t.backToBlog}</Link>
            </div>
            <Badge bg="primary" className="mb-3">{getCategoryName(post.category)}</Badge>
            <h1 className="post-title-large">{getPostTitle(post)}</h1>
            <div className="post-meta-large">
              <div className="author-section">
                <div className="author-avatar-large">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <div className="author-name-large">{post.author}</div>
                  <div className="author-role-large">{post.authorRole}</div>
                </div>
              </div>
              <div className="post-info">
                <span><i className="bi bi-calendar3"></i> {new Date(post.date).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span><i className="bi bi-clock"></i> {post.readTime}</span>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* Post Content */}
      <section className="post-content-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="post-content" dangerouslySetInnerHTML={{ __html: getPostContent(post) }}></div>

              {/* Tags */}
              <div className="post-tags-section">
                <h5>{t.tagsLabel}</h5>
                <div className="tags-list">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag-badge-large">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="share-section">
                <h5>{t.shareLabel}</h5>
                <div className="share-buttons">
                  <button className="share-btn twitter">
                    <i className="bi bi-twitter"></i> Twitter
                  </button>
                  <button className="share-btn linkedin">
                    <i className="bi bi-linkedin"></i> LinkedIn
                  </button>
                  <button className="share-btn facebook">
                    <i className="bi bi-facebook"></i> Facebook
                  </button>
                  <button className="share-btn link">
                    <i className="bi bi-link-45deg"></i> Copy Link
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts-section">
          <Container>
            <h2 className="section-title text-center mb-4">{t.relatedArticles}</h2>
            <Row>
              {relatedPosts.map(relatedPost => (
                <Col key={relatedPost.id} lg={4} md={6} className="mb-4">
                  <Link to={`/blog/${relatedPost.slug}?lang=${language}`} className="related-post-card">
                    <div className="related-post-image" style={{backgroundImage: `url(${relatedPost.image})`}}>
                      <Badge bg="primary">{getCategoryName(relatedPost.category)}</Badge>
                    </div>
                    <div className="related-post-content">
                      <h4>{getPostTitle(relatedPost)}</h4>
                      <p>{getPostExcerpt(relatedPost).substring(0, 100)}...</p>
                      <div className="related-post-meta">
                        <span><i className="bi bi-clock"></i> {relatedPost.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
