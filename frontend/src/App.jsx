import React from "react"
import { Switch } from "react-router-dom"
import OpenRoute from "./modules/auth/components/OpenRoute"
import PrivateRoute from "./modules/auth/components/PrivateRoute"
import { openRoutes, privateRoutes } from "./routes"

class App extends React.Component {
    render() {
        return (
            <Switch>
                {openRoutes.map(route => (
                    <OpenRoute key={route.path} exact {...route} />
                ))}
                {privateRoutes.map(route => (
                    <PrivateRoute key={route.path} exact {...route} />
                ))}
            </Switch>
        )
    }
}

export default App
