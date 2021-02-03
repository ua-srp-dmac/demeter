import React, { Component } from 'react'
import { Tab } from 'semantic-ui-react'

import {
  BrowserRouter,
  Route,
  NavLink,
  Switch
} from "react-router-dom";

import AnalysisList from './AnalysisList';
import FileList from './FileList';
import {NotificationManager} from 'react-notifications';


export default class Home extends Component {
  
  constructor(props) {
    super(props);

    this.notifySuccess = this.notifySuccess.bind(this);
    this.notifyError = this.notifyError.bind(this);
  };

  notifySuccess(message) {
    NotificationManager.success('Success', message);
  }

  notifyError(message) {
    NotificationManager.error('Error', message);
  }

  render() {

      const panes = [
        {
          menuItem: {
            as: NavLink,
            id: "files",
            content: <h3>Files</h3>,
            to: "/",
            exact: true,
            key: "files"
          },
          pane: (
            <Route
              path="/"
              exact
              render={() => (
                <div className="p-t-25"><FileList notifySuccess={this.notifySuccess} notifyError={this.notifyError}></FileList></div>
              )}
            />
          )
        },
        {
          menuItem: {
            as: NavLink,
            id: "analyses",
            content: <h3>Analyses</h3>,
            to: "/analyses",
            exact: true,
            key: "analyses"
          },
          pane: (
            <Route
              path="/analyses"
              exact
              render={() => (
                <div className="p-t-25"><AnalysisList></AnalysisList></div>
              )}
            />
          )
        },
      
      ];
  
      return (
        <BrowserRouter>
          <Switch>
            <Tab renderActiveOnly={false} activeIndex={-1} panes={panes} />
          </Switch>
        </BrowserRouter>
      );

  }
}