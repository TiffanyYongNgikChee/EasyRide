import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const UserMenu = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Nav className="me-auto">
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link href="/timetable">Timetable</Nav.Link>
              <Nav.Link href="/camera">Ticket</Nav.Link>
            </Nav>
          </Container>
      </Navbar>
  );
  };
  
  export default UserMenu;