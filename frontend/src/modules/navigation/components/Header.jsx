import React from "react"
import { Navbar, Nav, NavDropdown } from "react-bootstrap"
import { Link, Route, NavLink } from "react-router-dom"

const CustomNavItem = ({ href, children }) => (
    <li role="presentation">
        <NavLink role="button" to={href}>
            {children}
        </NavLink>
    </li>
)

const TappNavItems = () => (
    <Nav>
        <CustomNavItem href="/tapp/positions">Positions</CustomNavItem>
        <CustomNavItem href="/tapp/applicants">Applicants by Course</CustomNavItem>
        <CustomNavItem href="/tapp/assigned">All Assigned</CustomNavItem>
        <CustomNavItem href="/tapp/unassigned">All Unassigned</CustomNavItem>
        <CustomNavItem href="/tapp/summary">Summary</CustomNavItem>
    </Nav>
)

const CpNavItems = () => <Nav />

class Header extends React.Component {
    render() {
        return (
            <Navbar fixedTop fluid>
                <Navbar.Header id="app-drop-down">
                    <Navbar.Brand>
                        <Route path="/tapp" render={() => <Link to="/cp">TAPP</Link>} />
                        <Route path="/cp" render={() => <Link to="/tapp/positions">CP</Link>} />
                    </Navbar.Brand>
                </Navbar.Header>
                <Route path="/tapp" component={TappNavItems} />
                <Route path="/cp" component={CpNavItems} />
                <Nav pullRight>
                    <NavDropdown eventKey={3} title="Tools" id="tools-dropdown">
                        <CustomNavItem href="/tapp/positions/new">New Position</CustomNavItem>
                    </NavDropdown>
                </Nav>
            </Navbar>
        )
    }
}
export default Header
