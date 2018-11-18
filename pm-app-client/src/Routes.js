import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import NotFound from "./containers/NotFound";
import AppliedRoute from "./components/AppliedRoute";
import Signup from "./containers/Signup";
import UserAdministration from "./containers/UserAdministration";
import ProjectAdministration from "./containers/ProjectAdministration";
import AssignationProjects from "./containers/AssignationProjects";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

//Configuration of routes in the application
export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <AuthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
    <AuthenticatedRoute path="/useradministration" exact component={UserAdministration} props={childProps} />
    <AuthenticatedRoute path="/projectadministration" exact component={ProjectAdministration} props={childProps} />
    <AuthenticatedRoute path="/assignationprojects" exact component={AssignationProjects} props={childProps} />
    <Route component={NotFound} />
  </Switch>;
