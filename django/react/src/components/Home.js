import React, { Component } from 'react'
import { Label, Menu, Tab } from 'semantic-ui-react'
import AnalysisList from './AnalysisList';
import FileList from './FileList';
import {NotificationContainer, NotificationManager} from 'react-notifications';


export default class Home extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      activeIndex: 0
    }

    this.updateTab = this.updateTab.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.notify = this.notify.bind(this);
  };

  notify(message) {
    NotificationManager.success('Submitted', message);
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
        render: () => <div className="p-t-25"><FileList updateTab={this.updateTab} notify={this.notify}></FileList></div>
      },
      {
        menuItem: (
          <Menu.Item key='analyses'>
            <h2>Analyses</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><AnalysisList></AnalysisList></div>,
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