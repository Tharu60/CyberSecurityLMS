import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { blogPosts } from '../data/blogData';
import '../styles/Blog.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <h2>Post Not Found</h2>
        <p>The blog post you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
      </Container>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(tag => post.tags.includes(tag))))
    .slice(0, 3);

  return (
    <div className="blog-post-page">
      {/* Post Header */}
      <section className="post-header" style={{backgroundImage: `url(${post.image})`}}>
        <div className="header-overlay">
          <Container>
            <div className="breadcrumb-nav">
              <Link to="/blog"><i className="bi bi-arrow-left"></i> Back to Blog</Link>
            </div>
            <Badge bg="primary" className="mb-3">{post.category}</Badge>
            <h1 className="post-title-large">{post.title}</h1>
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
                <span><i className="bi bi-calendar3"></i> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
              <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>

              {/* Tags */}
              <div className="post-tags-section">
                <h5>Tags:</h5>
                <div className="tags-list">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag-badge-large">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="share-section">
                <h5>Share this article:</h5>
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
            <h2 className="section-title text-center mb-4">Related Articles</h2>
            <Row>
              {relatedPosts.map(relatedPost => (
                <Col key={relatedPost.id} lg={4} md={6} className="mb-4">
                  <Link to={`/blog/${relatedPost.slug}`} className="related-post-card">
                    <div className="related-post-image" style={{backgroundImage: `url(${relatedPost.image})`}}>
                      <Badge bg="primary">{relatedPost.category}</Badge>
                    </div>
                    <div className="related-post-content">
                      <h4>{relatedPost.title}</h4>
                      <p>{relatedPost.excerpt.substring(0, 100)}...</p>
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
