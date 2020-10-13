import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon, Dropdown, Button, Checkbox } from 'semantic-ui-react'
import axios from '../axios';
import AnalysisList from './AnalysisList';

export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: true,
      selectionStatus: {},
      selectedGenomes: {},
      selectedReadLengths: {},
      selectedFiles: [],
      analysisType: null,
      readLength: null,
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleGenomeChange = this.handleGenomeChange.bind(this);
    this.handleReadLengthChange = this.handleReadLengthChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handleGenomeChange (e, data, file_path) {
    this.setState({
      selectedGenomes: {
        ...this.state.selectedGenomes,
        [file_path]: data.value
      }, 
    });
  }

  handleReadLengthChange (e, data, file_path) {
    this.setState({
      selectedReadLengths: {
        ...this.state.selectedReadLengths,
        [file_path]: data.value
      }, 
    });
  }

  handleSubmit() {

    this.setState({submitting:true });
    
    var files = []

    for (var i = 0; i < this.state.selectedFiles.length; i++) {
      var file = this.state.selectedFiles[i];
      var file_obj = { path: file, genome: this.state.selectedGenomes[file] }
      if (this.state.analysisType === 'RNAseq') {
        file_obj.sjdbOverhang = this.state.selectedReadLengths[file]
      }
      files.push(file_obj);
    }

    console.log(files);

    var request = {
      selectedFiles: files
    }

    var endpoint;

    if (this.state.analysisType === 'DNAseq') {
      endpoint = '/api/bowtie2_analysis/'
    } else if (this.state.analysisType === 'RNAseq') {
      endpoint = '/api/star_analysis/'
    } else {
      return;
    }

    axios.post(endpoint, request)
    .then(result => {
      this.setState({
        selectionStatus: {},
        selectedFiles: [],
        analysisType: null,
        submitting: false
      });
      this.getFiles();
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
    const genomeOptions = [
      { key: 'mouse' , text: 'mouse' , value: 'mouse' },
      { key: 'human' , text: 'human' , value: 'human' },
      // { key: 'rat' , text: 'rat' , value: 'rat' },
    ];

    const analysisOptions = [
      { key: 'DNAseq' , text: 'DNAseq' , value: 'DNAseq' },
      { key: 'RNAseq' , text: 'RNAseq' , value: 'RNAseq' },
    ];

    const readLengthOptions = [
      { key: '50bp' , text: '50bp' , value: '49' },
      { key: '75bp' , text: '75bp' , value: '74' },
      { key: '100bp' , text: '100bp' , value: '99' },
      { key: '150bp' , text: '150bp' , value: '149' },
    ];

    const {selectedFiles, selectedGenomes, selectedReadLengths, analysisType} = this.state;

    var formComplete = true;

    if (!selectedFiles.length || !analysisType) {
      formComplete = false;
    }

    selectedFiles.forEach( function(file) {
      if (!selectedGenomes[file]) {
        formComplete = false;
      }
      if (analysisType === 'RNAseq' && !selectedReadLengths[file]) {
        formComplete = false;
      }
    })

    var submitEnabled = formComplete;

    return (

      <>
      <Container>
                
        { this.state.fileList &&
          <>
            <p className="p-t-15">1. Select the type of analysis you would like to run.</p>
            <Dropdown placeholder='Select Analysis Type'
                      selection
                      options={analysisOptions}
                      onChange={(e, data) => this.setState({analysisType: data.value})}>      
            </Dropdown>
            <p className="p-t-15">
              2. Select the files you would like to process and specify their genome types{this.state.analysisType === 'RNAseq' && <span> and read lengths</span>}.
            </p>
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
                              { this.state.selectionStatus[file.path] &&
                                <>
                                <Dropdown placeholder='Genome'
                                        className="m-r-10"
                                        value={this.state.selectedGenomes[file.path]}
                                        selection
                                        options={genomeOptions}
                                        onChange={(e, data) => this.handleGenomeChange(e, data, file.path)}>      
                                </Dropdown> 
                                { this.state.analysisType === 'RNAseq' &&
                                  <Dropdown placeholder='Select Read Length'
                                            value={this.state.selectedReadLengths[file.path]}
                                            selection
                                            options={readLengthOptions}
                                            onChange={(e, data) => this.handleReadLengthChange(e, data, file.path)}>      
                                  </Dropdown>
                                }
                                </>
                              }
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
          
            
            {this.state.submitting ? 
                <span className="p-t-15">
                  <Button primary loading disabled>Launch Analysis</Button>
                </span>  
                :
                <span className="p-t-15">
                  <Button disabled={!submitEnabled} primary onClick={() => this.handleSubmit()}>Launch Analysis</Button>
                </span>
                
            }
            
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