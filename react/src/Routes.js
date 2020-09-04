import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import FileList from "./components/FileList";
// import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";

export default ({ childProps }) =>
    <BrowserRouter>
        <Switch>
            <AppliedRoute path="/" exact component={LoginForm} props={childProps} />
            <AppliedRoute path="/home" exact component={FileList} props={childProps} />
            {/* <AppliedRoute path="/home" exact component={Home} props={childProps} /> */}
            { /* Finally, catch all unmatched routes */ }
            {/* <Route component={NotFound} /> */}
        </Switch>
    </BrowserRouter>