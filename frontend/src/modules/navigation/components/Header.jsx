import React from "react"
import { Navbar, Nav } from "react-bootstrap"
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
        <CustomNavItem href="/tapp/applicants">Applicants</CustomNavItem>
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
            </Navbar>
        )
    }
}
export default Header
