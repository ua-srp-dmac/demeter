import _ from 'lodash'
import React, { Component, createRef } from 'react';
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
  Checkbox
} from 'semantic-ui-react'

const Placeholder = () => <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />



export default class StickyExampleAdjacentContext extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      fileList: [],
      selectedFiles: [],
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleCheck = this.handleCheck.bind(this);

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
      selectionStatus: {
        ...this.state.selectionStatus,
        [file_path]: data.checked
      }, 
    });

  }
  contextRef = createRef()

  render() {
    return (
      <Grid columns={3}>
        <Grid.Column largeScreen={12}>
          <Ref innerRef={this.contextRef}>
            <Segment>
            <div className="table-container"> 
            <Table basic='very' className="p-t-15">
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Size</Table.HeaderCell>
                    <Table.HeaderCell>Last Modified</Table.HeaderCell>

                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.fileList.map((file, i) => {
                    return (
                        <Table.Row obj={file} key={file.path}>
                           
                            <Table.Cell>
                            <Checkbox
                              onChange={(e, data) => this.handleCheck(e, data, file.path, i)}
                              checked={file.selected}/>
                            </Table.Cell>
                            
                            <Table.Cell>{file.name}</Table.Cell>
                            <Table.Cell>{file.size}</Table.Cell>
                            <Table.Cell>{file.last_updated}</Table.Cell>
                            

       
                          
                         
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
            </div>

              <Rail close position='right'>
                <Sticky context={this.contextRef} offset={100}>
                  <Segment style={{overflow: 'auto', maxHeight: '70vh' }}>
                  <Header as='h3'>Groups</Header>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  <Segment>Group 1</Segment>
                  </Segment>
                </Sticky>
              </Rail>
            </Segment>
            
          </Ref>
        </Grid.Column>
      </Grid>
    )
  }
}