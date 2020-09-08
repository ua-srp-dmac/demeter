import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header } from 'semantic-ui-react'
import axios from '../axios';


export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: null,
    };

    this.getFiles = this.getFiles.bind(this)
  }

  async componentDidMount() {
    this.getFiles();
  }

  getFiles() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/defiles/', {})
    .then(result => {
        this.setState({error: null, loading: false, fileList: result.data });
        console.log(result);
    })
    .catch((error) => {
        console.log(error);
    });

  }

  renderFileList() {
    return (
      <>
      <Container>
        <Header as='h1'>Your Files</Header>
        { this.state.fileList &&
            <Table basic='very'>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Size</Table.HeaderCell>
                    <Table.HeaderCell>Last Modified</Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.fileList.map(function(file, i){
                    return (
                        <Table.Row obj={file} key={i}>
                            <Table.Cell>{file.name}</Table.Cell>
                            <Table.Cell>{file.size}</Table.Cell>
                            <Table.Cell>{file.last_updated}</Table.Cell>
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
        }
        </Container>
      </>
    )
  }
  
  render() {
    return (
      <>
        { this.renderFileList() }
      </>
    )
  } 
}