import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import Launch from "./components/Launch/LaunchPad";
import AnalysisList from "./components/AnalysisList";
// import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";

export default ({ childProps }) =>
    <BrowserRouter>
        <Switch>
            <Route path="/launch" exact component={Launch} props={childProps} />
            <AppliedRoute path="/" exact component={Home} props={childProps} />
            <AppliedRoute path="/analyses" exact component={Home} props={childProps} />
            
            { /* Finally, catch all unmatched routes */ }
            {/* <Route component={NotFound} /> */}
        </Switch>
    </BrowserRouter>