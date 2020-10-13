import React, { Component } from 'react'
import { Label, Menu, Tab } from 'semantic-ui-react'
import AnalysisList from './AnalysisList';
import FileList from './FileList';

export default class Home extends Component {
  
  constructor(props) {
    super(props);
  };

  render() {

    const panes = [
      {
        menuItem: (
          <Menu.Item key='files'>
            <h2>Files</h2>
          </Menu.Item>
        ),
        render: () => <div className="p-t-25"><FileList></FileList></div>
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
     <Tab panes={panes}></Tab>
    )

  }
}