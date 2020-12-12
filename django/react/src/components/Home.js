import React, { Component } from 'react'
import { Label, Menu, Tab } from 'semantic-ui-react'
import AnalysisList from './AnalysisList';
import FileList from './FileList';
import LaunchAnalysis from './LaunchAnalysis';
import ReviewAnalysis from './ReviewAnalysis';
import {NotificationContainer, NotificationManager} from 'react-notifications';


export default class Home extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: 0
    }

    this.updateTab = this.updateTab.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.notifySuccess = this.notifySuccess.bind(this);
    this.notifyError = this.notifyError.bind(this);
  };

  notifySuccess(message) {
    NotificationManager.success('Success', message);
  }

  notifyError(message) {
    NotificationManager.error('Error', message);
  }

  updateTab (tab) {
    this.setState({ activeIndex: tab });
  }

  handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex });

  render() {
    
    const { activeIndex } = this.state

    const panes = [
      {
        menuItem: (
          <Menu.Item key='files'>
            <h2>Files</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><FileList updateTab={this.updateTab} notifySuccess={this.notifySuccess} notifyError={this.notifyError}></FileList></div>
      },
      {
        menuItem: (
          <Menu.Item key='analyses'>
            <h2>Analyses</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><AnalysisList></AnalysisList></div>,
      },
      {
        menuItem: (
          <Menu.Item key='launch'>
            <h2>Launch</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><LaunchAnalysis></LaunchAnalysis></div>,
      },
      {
        menuItem: (
          <Menu.Item key='review'>
            <h2>Review</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><ReviewAnalysis></ReviewAnalysis></div>,
      },
    ]

    return(
      <>
        <Tab panes={panes} activeIndex={activeIndex} onTabChange={this.handleTabChange}></Tab>
        <NotificationContainer/>
      </>
    )

  }
}