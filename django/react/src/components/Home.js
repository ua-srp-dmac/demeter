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
        menuItem: { key: 'files', icon: 'users', content: 'Files' },
        render: () => <FileList></FileList>
      },
      {
        menuItem: (
          <Menu.Item key='analyses'>
            Analyses<Label>15</Label>
          </Menu.Item>
        ),
        render: () => <AnalysisList></AnalysisList>,
      },
    ]

    return(
     <Tab panes={panes}></Tab>
    )

  }
}