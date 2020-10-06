import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon, Dropdown, Button, Checkbox } from 'semantic-ui-react'
import axios from '../axios';


export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: true,
      selectionStatus: {},
      selectedFiles: []
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleGenomeChange = this.handleGenomeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCheck = this.handleCheck.bind(this);


  };

  async componentDidMount() {
    this.getFiles();
    this.getAnalyses();
  }

  getFiles() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/files/', {})
    .then(result => {
        this.setState({error: null, loading: false, fileList: result.data });
        // console.log(result);
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  getAnalyses() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/analyses/', {})
    .then(result => {
        this.setState({error: null, loading: false, analyses: result.data });
        console.log(result);
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
    }, console.log(this.state.selectedFiles)) //set the new state

  }

  handleGenomeChange (e, data, file_path) {
    this.setState({
      selectedGenomes: {
        ...this.state.selectedGenomes,
        [file_path]: data.value
      }, 
    }, console.log(this.state.selectedGenomes));
  }

  handleSubmit(file_path) {

    var request = {
      genome: this.state.selectedGenomes[file_path],
      // fastq: this.state.fileList[i].path
    }

    axios.post('/api/bowtie2_analysis/', request)
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
      // { key: 'rat' , text: 'rat' , value: 'rat' },
    ];
    return (
      <>
      <Container>
        <Header as='h1'>Files </Header>
        <p>Select the files you would like to process, their genome types, and the type of analysis you would like to run.</p>
        { this.state.fileList &&
            <Table basic='very'>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Size</Table.HeaderCell>
                    <Table.HeaderCell>Last Modified</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                    {/* <Table.HeaderCell></Table.HeaderCell> */}
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
                            <Table.Cell>
                              { this.state.selectionStatus[file.path] ?
                                <Dropdown placeholder='Genome'
                                        selection
                                        options={genomeOptions}
                                        onChange={(e, data) => this.handleGenomeChange(e, data, file.path)}>      
                                </Dropdown> :
                                <></>
                              }
                            </Table.Cell>
                            {/* <Table.Cell>
                              <Button onClick={() => this.handleSubmit(i)}>Submit</Button>
                            </Table.Cell> */}
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
        }

        <Header as='h1'>Analyses</Header>
        { this.state.analyses &&
            <Table basic='very'>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Start</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>End</Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.analyses.map((item, i) => {
                    return (
                        <Table.Row obj={item} key={i}>
                            <Table.Cell>
                              <Checkbox hand/>
                            </Table.Cell>
                            <Table.Cell>{item.app_name}</Table.Cell>
                            <Table.Cell>{item.start_date}</Table.Cell>
                            <Table.Cell>{item.status}</Table.Cell>
                            <Table.Cell>{item.end_date}</Table.Cell>
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