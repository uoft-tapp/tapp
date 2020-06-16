import React from "react";
import PropTypes from "prop-types";
import { Tab, Tabs } from "react-bootstrap";

function TabsView(props) {
    const { routes = [], infoComponents = null } = props;
    return <Tabs defaultActiveKey="landing" title="Landing"></Tabs>;
}

export { TabsView };
