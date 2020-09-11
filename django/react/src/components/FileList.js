import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon, Dropdown, Button } from 'semantic-ui-react'
import axios from '../axios';


export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: true,
      // selectedGenomes: {}
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleGenomeChange = this.handleGenomeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };

  async componentDidMount() {
    this.getFiles();
  }

  getFiles() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/files/', {})
    .then(result => {
        this.setState({error: null, loading: false, fileList: result.data });
        console.log(result);
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  handleGenomeChange (e, data, i) {
    this.setState({
      selectedGenomes: {
        ...this.state.selectedGenomes,
        [i]: data.value
      }
    });
  }

  handleSubmit(i) {

    var request = {
      genome: this.state.selectedGenomes[i],
      fastq: this.state.fileList[i].path
    }

    axios.post('/api/submit-analysis/', request)
    .then(result => {
        console.log(result);
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  renderLoading() {
    return (
      <Container>
        <Header as='h1'>Your Files</Header>
        <Loader active inline='centered'>Loading</Loader>
      </Container>
    )
  }

  renderFileList() {
    const genomeOptions = [
      { key: 'mouse' , text: 'mouse' , value: 'mouse' },
      { key: 'human' , text: 'human' , value: 'human' },
      { key: 'rat' , text: 'rat' , value: 'rat' },
    ];
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
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.fileList.map((file, i) => {
                    return (
                        <Table.Row obj={file} key={i}>
                            <Table.Cell>{file.name}</Table.Cell>
                            <Table.Cell>{file.size}</Table.Cell>
                            <Table.Cell>{file.last_updated}</Table.Cell>
                            <Table.Cell>
                              <Dropdown placeholder='Genome'
                                        selection
                                        options={genomeOptions}
                                        onChange={(e, data) => this.handleGenomeChange(e, data, i)}>      
                              </Dropdown>
                            </Table.Cell>
                            <Table.Cell>
                              <Button onClick={() => this.handleSubmit(i)}>Submit</Button>
                            </Table.Cell>
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
        { !this.state.loading && this.renderFileList() }
        { this.state.loading && this.renderLoading() }
      </>
    )
  } 
}