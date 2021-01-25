import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon,  Button } from 'semantic-ui-react'
import axios from '../axios';
import AnalysisList from './AnalysisList';

export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: true,
    };

    this.getFiles = this.getFiles.bind(this)

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

  renderLoading() {
    return (
      <Container>
        <Loader active inline='centered'>Loading</Loader>
      </Container>
    )
  }

  renderFileList() {

    return (
      <>
      <div class="ui secondary menu">
        <div class="right menu">
          <Button floated='right'
                  icon
                  className='small-button-link'
                  // labelPosition='left'
                  primary
                  size='small'
                  as={Link} to='/launch'
          >
            Launch Analysis
          </Button>
        </div>
      
      </div>
      
        <Container>
        
          { this.state.fileList &&
            <>
              <div className="table-container">   
              <Table basic='very' className="p-t-15">
                  <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Size</Table.HeaderCell>
                      <Table.HeaderCell>Last Modified</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>

                  <Table.Body>
                  {this.state.fileList.map((file, i) => {
                      return (
                        <Table.Row obj={file} key={file.path}>
                          <Table.Cell>{file.name}</Table.Cell>
                          <Table.Cell>{file.size}</Table.Cell>
                          <Table.Cell>{file.last_updated}</Table.Cell>
                        </Table.Row>
                      )
                  })}
                  </Table.Body>
              </Table>
              </div>  
            </>
          }
        </Container>
      </>
    )
  }
  
  render() {
    return (
      <>
        { !this.state.loading && this.renderFileList() }
        { this.state.loading && this.renderLoading() }
      </>
    )
  } 
}