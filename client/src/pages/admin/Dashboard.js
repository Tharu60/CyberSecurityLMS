import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import MobileNav from '../../components/MobileNav';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getAllUsers(),
      ]);

      setStatistics(statsRes.data.statistics);
      setUsers(usersRes.data.users);
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <Container>
          <div className="d-flex align-items-center">
            <MobileNav />
            <span className="navbar-brand mb-0 h1">
              <i className="bi bi-shield-lock-fill me-2"></i>
              <span className="d-none d-md-inline">Cyber Security LMS - Admin</span>
              <span className="d-inline d-md-none">Admin</span>
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
        <h2 className="mb-4">Admin Dashboard</h2>

        {/* Statistics Cards */}
        {statistics && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3">{statistics.users.total_users}</h3>
                  <p className="text-muted">Total Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <i className="bi bi-mortarboard-fill text-success" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3">{statistics.users.total_students}</h3>
                  <p className="text-muted">Students</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <i className="bi bi-question-circle-fill text-info" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3">{statistics.questions.total_questions}</h3>
                  <p className="text-muted">Questions</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <i className="bi bi-camera-video-fill text-warning" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3">{statistics.videos.total_videos}</h3>
                  <p className="text-muted">Videos</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* User Management */}
        <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-people me-2"></i>
              User Management
            </h5>
          </Card.Header>
          <Card.Body>
            <Tabs defaultActiveKey="all" className="mb-3">
              <Tab eventKey="all" title={`All Users (${users.length})`}>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge
                            bg={
                              user.role === 'admin'
                                ? 'danger'
                                : user.role === 'instructor'
                                ? 'primary'
                                : 'success'
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>
              <Tab
                eventKey="students"
                title={`Students (${statistics?.users.total_students || 0})`}
              >
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.role === 'student')
                      .map((user, index) => (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Tab>
              <Tab
                eventKey="instructors"
                title={`Instructors (${statistics?.users.total_instructors || 0})`}
              >
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.role === 'instructor')
                      .map((user, index) => (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminDashboard;
