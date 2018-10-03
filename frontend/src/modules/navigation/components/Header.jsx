import React from "react"
import { Navbar, NavDropdown, MenuItem } from "react-bootstrap"

class Header extends React.Component {
    render() {
        return (
            <Navbar fixedTop fluid>
                <Navbar.Header id="app-drop-down">
                    <Navbar.Brand>
                        <NavDropdown title={<span>TAPP</span>} noCaret id="1">
                            <MenuItem href="/cp" id="1">
                                CP:TAPP
                            </MenuItem>
                        </NavDropdown>
                    </Navbar.Brand>
                </Navbar.Header>
            </Navbar>
        )
    }
}
export default Header
