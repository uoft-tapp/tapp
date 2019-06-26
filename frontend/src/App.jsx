import React from "react";
import { Switch } from "react-router-dom";
import moment from "moment";
import CustomNotifications from "./modules/notifications/components/CustomNotifications";
import { openRoutes, privateRoutes } from "./routes";
import OpenRoute from "./modules/auth/components/OpenRoute";
import PrivateRoute from "./modules/auth/components/PrivateRoute";
import Header from "./modules/navigation/components/Header";

class App extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Header />
                <Switch>
                    {openRoutes.map(route => (
                        <OpenRoute key={route.path} exact {...route} />
                    ))}
                    {privateRoutes.map(route => (
                        <PrivateRoute key={route.path} exact {...route} />
                    ))}
                </Switch>
                <footer>
                    <div className="container-fluid">
                        <p className="text-muted">
                            University of Toronto, {moment().format("YYYY")}
                        </p>
                    </div>
                </footer>
                <CustomNotifications />
            </React.Fragment>
        );
    }
}

export default App;
