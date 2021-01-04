import _ from 'lodash'
import React, { Component, createRef } from 'react';
import classNames from "classnames";
import axios from '../axios';
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
  Button
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

  handleCheck(e, data, file_path, i) {

    const selectedFiles = this.state.selectedFiles.slice() //copy the array

    if (data.checked) {
      selectedFiles.push(file_path);
    } else {
      var index = selectedFiles.indexOf(file_path);
      selectedFiles.splice(index, 1);
    }

    this.setState({
      selectedFiles: selectedFiles,
    }, console.log(this.state.selectedFiles));
  }

  selectGroup(index) {
    console.log(index)

    if (this.state.groups.includes(index)) {
      this.setState({selectedGroup: index});
    } else {
      this.state['group' + index] = [];
    
      this.setState(prevState => ({
        groups: [...prevState.groups, index],
        selectedGroup: index
      }));
    }
    
  }

  addFilesToGroup(group) {

    
    // if (this.state['group_' + group]) {

    // }

    this.setState({
      ['group_' + group]: this.state.selectedFiles
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
      <Grid columns={2}>
        <Grid.Column largeScreen={5}></Grid.Column>
        <Grid.Column largeScreen={11}>
          <Ref innerRef={this.contextRef}>
            <Segment>
            <Rail close position='left'>
                <Segment>
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

                </Segment>
                <Sticky context={this.contextRef} offset={100}>
                  <Segment style={{overflow: 'auto', maxHeight: '70vh' }}>
                  <Header as='h4'>Groups</Header>
                  { this.state.groups.length > 0 && 
                    <>
                    {this.state.groups.map((index, i) => {
                      let group = this.state['group' + index]
                      return (
                        <Segment key={index} 
                                onClick={() => this.selectGroup(index)}
                                className={classNames({
                                activeSegment: this.state.selectedGroup === index,
                              })}>
                          <h5>Group {index}</h5>
                          { this.state['group' + index].length === 0 &&
                            <>
                              Select files to add.
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
            <div className="table-container"> 
            { this.state.selectedGroup &&
            <>
              <h4>Select Files for Group {this.state.selectedGroup} </h4> 
              <Button primary onClick={() => this.addFilesToGroup(this.state.selectedGroup)}>Done</Button>
            </>
            }
            
            <Table basic='very' className="p-t-15">
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
                              onChange={(e, data) => this.handleCheck(e, data, file.path, i)}
                              checked={file.selected}/>
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
            
          </Ref>
        </Grid.Column>
      </Grid>
    )
  }
}