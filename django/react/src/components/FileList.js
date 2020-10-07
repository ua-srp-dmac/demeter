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
      selectedFiles: [],
      analysis_type: null
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

  handleSubmit() {

    var files = []

    for (var i = 0; i < this.state.selectedFiles.length; i++) {
      var file = this.state.selectedFiles[i];
      files.push({ path: file, genome: this.state.selectedGenomes[file] })
    }

    console.log(files);
    console.log(this.state.analysis_type)

    var request = {
      selectedFiles: files
    }

    var endpoint;

    if (this.state.analysis_type === 'DNAseq') {
      endpoint = '/api/bowtie2_analysis/'
    } else if (this.state.analysis_type === 'RNAseq') {
      endpoint = '/api/star_analysis/'
    } else {
      return;
    }

    axios.post(endpoint, request)
    .then(result => {
      this.getFiles();
      this.getAnalyses();
      this.setState({
        selectionStatus: {},
        selectedFiles: [],
        analysis_type: null
      });
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

    const analysisOptions = [
      { key: 'DNAseq' , text: 'DNAseq' , value: 'DNAseq' },
      { key: 'RNAseq' , text: 'RNAseq' , value: 'RNAseq' },
      // { key: 'rat' , text: 'rat' , value: 'rat' },
    ];

    return (
      <>
      <Container>
        <Header as='h1'>Files </Header>
        <p className="p-t-15">Select the files you would like to process, their genome types, and the type of analysis you would like to run.</p>
        { this.state.fileList &&
          <>
            <Table basic='very' className="p-t-15">
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Size</Table.HeaderCell>
                    <Table.HeaderCell>Last Modified</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
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
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
            <Dropdown placeholder='Select Analysis Type'
                      selection
                      options={analysisOptions}
                      onChange={(e, data) => this.setState({analysis_type: data.value})}>      
            </Dropdown>
            <Button onClick={() => this.handleSubmit()}>Launch Analysis</Button>
          </>
        }

        <div class="ui divider p-t-15"></div>

        <Header as='h1' class="p-t-15">Analyses</Header>
        { this.state.analyses &&
            <Table basic='very'>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Start Date</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>End Date</Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.analyses.map((item, i) => {
                    return (
                        <Table.Row obj={item} key={i}>
                            <Table.Cell>{item.name}</Table.Cell>
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