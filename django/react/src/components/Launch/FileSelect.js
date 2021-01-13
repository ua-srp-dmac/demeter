import _ from 'lodash'
import React, { Component, createRef } from 'react';
import classNames from "classnames";
import axios from '../../axios';

import {
  Grid,
  Header,
  Image,
  Rail,
  Ref,
  Segment,
  Sticky,
  Table,
  Checkbox,
  Dropdown,
  Button,
  Icon,
  Divider,
  Label
} from 'semantic-ui-react'


export default class LaunchAnalysis extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      fileList: [],
      selectedFiles: [],
      selectedGroup: null,
      groups: []
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleCheck = this.handleCheck.bind(this);
    this.selectGroup = this.selectGroup.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.removeFile = this.removeFile.bind(this);

  };

  async componentDidMount() {
    this.getFiles();
  }

  getFiles() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/files/', {})
    .then(result => {
        this.setState({error: null, loading: false, fileList: result.data });
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  
  selectGroup(index) {
    console.log(index)

    if (this.state.groups.includes(index)) {
      this.setState({selectedGroup: index});
    } else {
      this.state['group_' + index] = [];
    
      this.setState(prevState => ({
        groups: [...prevState.groups, index],
        selectedGroup: index
      }));
    }
    
  }

  handleCheck(e, data, file_path, group) {

    let selectedFiles;
    
    if (this.state['group_' + group]) {
      selectedFiles = this.state['group_' + group]
    } else {
      selectedFiles = [];
    }

    if (data.checked) {
      selectedFiles.push(file_path);
    } else {
      var index = selectedFiles.indexOf(file_path);
      selectedFiles.splice(index, 1);
    }

    this.setState({
      ['group_' + group]: selectedFiles,
    }, console.log(this.state['group_' + group]));
  }

  isSelected(file) {
    let group = this.state.selectedGroup;

    if (this.state['group_' + group].includes(file)) {
      return true;
    } else {
      return false;
    }
  }

  removeFile(file, group) {
    let selectedFiles = this.state['group_' + group]
    
    var index = selectedFiles.indexOf(file);
    selectedFiles.splice(index, 1);

    this.setState({
      ['group_' + group]: selectedFiles,
    }, console.log(this.state['group_' + group]));

  }

  contextRef = createRef()

  render() {
    const analysisOptions = [
      { key: 'DNAseq' , text: 'DNAseq' , value: 'DNAseq' },
      { key: 'RNAseq' , text: 'RNAseq' , value: 'RNAseq' },
    ];

    const readTypeOptions = [
      { key: 'Unpaired' , text: 'Unpaired' , value: 'Unpaired' },
      { key: 'Paired' , text: 'Paired' , value: 'Paired' },
    ];

    

    return (
        <>

        {/* <Button
            floated='left'
            icon
            labelPosition='left'
            primary
            size='small'
            onClick={() => this.props.updateStep(1)}>
            Back
        </Button>

        <Button
            floated='right'
            icon
            labelPosition='right'
            primary
            size='small'
            onClick={() => this.props.updateStep(3)}>
            Next
        </Button> */}
      <Grid columns={2}>
        <Grid.Column largeScreen={5}></Grid.Column>
        <Grid.Column largeScreen={11}>
          <Ref innerRef={this.contextRef}>
            <Segment.Group>
              { this.state.selectedGroup &&
                <Segment clearing>
                  <h4>
                    Select Files for Group {this.state.selectedGroup} 
                    <Button
                      floated='right'
                      icon
                      labelPosition='left'
                      primary
                      size='small'
                      onClick={() => this.props.updateStep(3)}
                    >
                      <Icon name='check'/> Next
                    </Button>
                  </h4>
                </Segment>

              }
              <Rail close position='left'>
                  {/* <Segment>
                    <h4>Analysis Type</h4>
                    <Dropdown placeholder='Select Analysis Type'
                          selection
                          
                          options={analysisOptions}
                          onChange={(e, data) => this.setState({analysisType: data.value})}>      
                    </Dropdown>
                    <Dropdown placeholder='Select Read Type'
                              selection
                              className='m-t-15'
                              options={readTypeOptions}
                              onChange={(e, data) => this.setState({readType: data.value})}>      
                    </Dropdown>

                  </Segment> */}
                  <Sticky context={this.contextRef} offset={100}>
                    <Segment style={{overflow: 'auto', maxHeight: '70vh' }}>
                    <Header as='h4'>
                        RNAseq Paired
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
                    { this.state.groups.length > 0 && 
                      <>
                      {this.state.groups.map((index, i) => {
                        let group = this.state['group_' + index]
                        
                        return (
                          <Segment key={index} 
                                  onClick={() => this.selectGroup(index)}
                                  className={classNames({
                                  activeSegment: this.state.selectedGroup === index,
                                })}>
                            <h5>
                              Group {index}
                              <Label size='tiny'
                                     className="floated-right">
                                {this.state['group_' + index].length} files
                              </Label>
                            </h5>
                            { this.state['group_' + index].length === 0 &&
                              <>
                                Select files to add.
                              </>
                            
                            }
                            { this.state['group_' + index].length > 0 &&
                              <>
                                {this.state['group_' + index].map((file, i) => {
                                  let fileName = file.substring(file.lastIndexOf('/')+1);
                                  return (
                                    <div key={file} className="word-wrap m-b-5">
                                      <Icon name='remove circle' color='red' onClick={() => this.removeFile(file, index)} />{fileName}
                                      <Divider></Divider>
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
                    { this.state.groups.length < 8 && 
                      <>
                        <Segment textAlign={"center"}
                                className="change"
                                key="new"
                                onClick={() => this.selectGroup(this.state.groups.length + 1)}>
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
                          { this.state.selectedGroup && <Table.HeaderCell></Table.HeaderCell> }
                          <Table.HeaderCell>Name</Table.HeaderCell>
                          <Table.HeaderCell>Size</Table.HeaderCell>
                          <Table.HeaderCell>Last Modified</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {this.state.fileList.map((file, i) => {
                          return (
                              <Table.Row obj={file} key={file.path}>
                                { this.state.selectedGroup &&
                                  <Table.Cell>
                                  <Checkbox
                                    onChange={(e, data) => this.handleCheck(e, data, file.path, this.state.selectedGroup)}
                                    checked={this.isSelected(file.path)}/>
                                  </Table.Cell>
                                  }
                                  <Table.Cell>{file.name}</Table.Cell>
                                  <Table.Cell>{file.size}</Table.Cell>
                                  <Table.Cell>{file.last_updated}</Table.Cell>
                                  
                              </Table.Row>
                          )
                      })}
                    </Table.Body>
                  </Table>
                </div>
              </Segment>

              {/* { this.state.selectedGroup &&
                <Segment clearing>
                  <h4 >
                    Select Files for Group {this.state.selectedGroup} 
                    <Button
                      floated='right'
                      icon
                      labelPosition='left'
                      primary
                      size='small'
                      onClick={() => this.setState({selectedGroup: null})}
                    >
                      <Icon name='check'/> Done
                    </Button>
                  </h4>
                </Segment>

              } */}
            </Segment.Group>
          </Ref>
        </Grid.Column>
      </Grid>
      </>
    )
  }
}
