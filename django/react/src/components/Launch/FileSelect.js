import _ from 'lodash'
import React, { Component, createRef } from 'react';
import classNames from "classnames";
import axios from '../../axios';

import {
  Grid,
  Header,
  Rail,
  Ref,
  Segment,
  Sticky,
  Table,
  Checkbox,
  Button,
  Icon,
  Divider,
  Label,
  Breadcrumb
} from 'semantic-ui-react'


export default class LaunchAnalysis extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      cyverseFiles: [],
      currentPath: null,
      breadcrumbs: null,
    };

    this.getFiles = this.getFiles.bind(this);
    this.getFolders = this.getFolders.bind(this);
    this.buildBreadcrumbs = this.buildBreadcrumbs.bind(this);
  
  };

  async componentDidMount() {
    this.getFolders();
    this.getFiles();
    this.props.selectGroup(1);
  }

  getFiles(path) {

    this.setState({error: null, loading:true })
  
    axios.get('/api/files/', {
      params: {
        path: path
      }
    })
    .then(result => {
      this.setState({
        error: null,
        loading: false,
        cyverseFiles: result.data.fileList,
        currentPath: result.data.currentPath
      },
        this.buildBreadcrumbs(result.data.currentPath)
      );
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  getFolders() {
    axios.get('/api/folders/', {})
    
    .then(result => {
        this.setState({
          defaultFolder: result.data.default_folder });
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  buildBreadcrumbs(path) {

    let crumbs = path.split('/');
    let breadcrumbs = [];

    for (var i = 1; i < crumbs.length; i++) {
      
      var path = crumbs.slice(0, i + 1).join("/");

      let clickable = false;
      if (path.includes(this.state.defaultFolder)) {
        clickable = true;
      }

      let crumb = {
        name: crumbs[i],
        path: path,
        clickable: clickable,
      }
      if (path.includes('srp_dmac')) {
        breadcrumbs.push(crumb);
      }
    }

    this.setState({breadcrumbs: breadcrumbs})
  }

    /**
   * Builds breadcrumb menu for file navigation.
   * @param {*} path 
   */
  buildBreadcrumbs(path) {

    let crumbs = path.split('/');
    let breadcrumbs = [];

    for (var i = 1; i < crumbs.length; i++) {
      
      var path = crumbs.slice(0, i + 1).join("/");

      let clickable = false;
      if (path.includes(this.state.defaultFolder)) {
        clickable = true;
      }

      let crumb = {
        name: crumbs[i],
        path: path,
        clickable: clickable,
      }
      if (path.includes('srp_dmac')) {
        breadcrumbs.push(crumb);
      }
    }

    this.setState({breadcrumbs: breadcrumbs})
  }

  contextRef = createRef()

  render() {

    const { currentPath, cyverseFiles } = this.state;
    const { selectedGroup, readType, groups } = this.props.parentState;

    return (
      <Grid columns={2}>
        <Grid.Column largeScreen={5}></Grid.Column>
        <Grid.Column largeScreen={11}>
          <Ref innerRef={this.contextRef}>
            <Segment.Group>
              
              <Segment clearing>
                  
                <Button
                  floated='right'
                  icon
                  labelPosition='right'
                  primary
                  size='small'
                  onClick={() => this.props.updateStep(3)}
                > 
                  Next <Icon name='caret right'/> 
                </Button>

                <Breadcrumb className="p-t-10 p-b-15">
                    { this.state.breadcrumbs &&
                      <>
                        {this.state.breadcrumbs.map((item, i) => {
                          return (
                            <span key={item.path}>
                              { item.path === currentPath ?
                                  <Breadcrumb.Section active>{item.name}</Breadcrumb.Section>
                                :
                                <>
                                  { item.clickable && 
                                    <Breadcrumb.Section link onClick={() => this.getFiles(item.path)}>
                                      {item.name}
                                    </Breadcrumb.Section>
                                  }
                                  { !item.clickable && <Breadcrumb.Section>{item.name}</Breadcrumb.Section>}
                                </>
                              }    
                              { i < this.state.breadcrumbs.length - 1 && <Breadcrumb.Divider icon='right angle'/> }
                            </span>
                          )
                        })}
                      </>
                    }
                  </Breadcrumb>
              </Segment>

              <Rail close position='left'>
                <Sticky context={this.contextRef} offset={100}>
                  <Segment style={{overflow: 'auto', maxHeight: '70vh' }}>
                  <Header as='h4'>
                      {this.props.parentState.analysisType} - {readType}
                      <Button
                        floated='right'
                        primary
                        size='mini'
                        onClick={() => this.props.updateStep(1)}
                        >
                        Change
                      </Button>
                  </Header>
                  <Divider></Divider>
                  <Header as='h4'>Groups</Header>
                  { groups.length > 0 && 
                    <>
                    {groups.map((index, i) => {
                      let group = this.props.parentState['group_' + index]
                      
                      return (
                        <Segment key={index} 
                                onClick={() => this.props.selectGroup(index)}
                                className={classNames({
                                activeSegment: selectedGroup === index,
                              })}>
                          <h5>
                            Group {index}
                            <Label size='tiny'
                                    className="floated-right">
                              {this.props.parentState['group_' + index].length} files
                            </Label>
                          </h5>
                          { this.props.parentState['group_' + index].length === 0 &&
                            <>
                              Select files to add.
                            </>
                          
                          }
                          { this.props.parentState['group_' + index].length > 0 &&
                            <>
                              {this.props.parentState['group_' + index].map((file, i) => {
                                let fileName = file.substring(file.lastIndexOf('/')+1);
                                return (
                                  <div key={file} className="word-wrap m-b-5">
                                    <Icon name='remove circle' color='red' onClick={() => this.props.removeFile(file, index)} />{fileName}
                                    {i < this.props.parentState['group_' + index].length - 1 && <Divider></Divider>}
                                  </div>
                                )
                              })}
                            </>
                          }
                        </Segment>
                      )
                    })}
                    </>
                  }
                  { groups.length < 8 && 
                    <>
                      <Segment textAlign={"center"}
                              className="change"
                              key="new"
                              onClick={() => this.props.selectGroup(groups.length + 1)}>
                        <Button circular icon='plus'/>
                      </Segment>
                    </>
                  }
                  </Segment>
                </Sticky>
              </Rail>

              <Segment>              
                <div className="table-container">
                
                  <Table basic='very' className="p-t-15" compact>      
                    <Table.Header>
                      <Table.Row>
                          { selectedGroup && <Table.HeaderCell></Table.HeaderCell> }
                          <Table.HeaderCell>Name</Table.HeaderCell>
                          <Table.HeaderCell>Size</Table.HeaderCell>
                          <Table.HeaderCell>Last Modified</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      { cyverseFiles.map((file, i) => {
                          return (
                            <Table.Row obj={file} key={file.path}>
                              { selectedGroup &&
                                <Table.Cell>
                                  { file.type === 'folder' ?
                                    <Icon name='folder'/>
                                  :
                                    <Checkbox
                                      onChange={(e, data) => this.props.handleCheck(e, data, file.path, selectedGroup)}
                                      checked={this.props.isSelected(file.path)}/>
                                  }
                                </Table.Cell>
                              }
                              <Table.Cell>
                                { file.type === 'folder' ?
                                    <span className="fake-link"><a onClick={() => this.getFiles(file.path)}>{file.name}</a></span>
                                  :
                                    <>{file.name}</>
                                }
                              </Table.Cell>
                              <Table.Cell>{file.size}</Table.Cell>
                              <Table.Cell>{file.last_updated}</Table.Cell>
                                
                            </Table.Row>
                          )
                      })}
                    </Table.Body>
                  </Table>
                </div>
              </Segment>
            </Segment.Group>
          </Ref>
        </Grid.Column>
      </Grid>
    )
  }
}
