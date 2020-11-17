import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon, Dropdown, Button, Checkbox, Input } from 'semantic-ui-react'
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
      selectedGroups: {},
      selectedPairs: {},
      selectedPositions: {},
      selectedFiles: [],
      analysisType: null,
      readType: null,
      readLength: null,
    };

    this.getFiles = this.getFiles.bind(this)
    this.handleGenomeChange = this.handleGenomeChange.bind(this);
    this.handleReadLengthChange = this.handleReadLengthChange.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handlePairChange = this.handlePairChange.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
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

  handlePairChange (e, data, file_path) {
    this.setState({
      selectedPairs: {
        ...this.state.selectedPairs,
        [file_path]: data.value
      }, 
    });
  }

  handlePositionChange (e, data, file_path) {
    this.setState({
      selectedPositions: {
        ...this.state.selectedPositions,
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

  handleGroupChange (e, data, file_path) {
    this.setState({
      selectedGroups: {
        ...this.state.selectedGroups,
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
      if (this.state.readType === 'Paired') {
        file_obj.pair = this.state.selectedPairs[file]
        file_obj.position = this.state.selectedPositions[file]
      }
      if (this.state.readType === 'Unpaired') {
        file_obj.group = this.state.selectedGroups[file];
      }
      
      files.push(file_obj);
    }

    console.log(files);

    var request = {
      selectedFiles: files
    }

    var endpoint;

    if (this.state.analysisType === 'DNAseq') {
      if (this.state.readType === 'Unpaired') {
        endpoint = '/api/bowtie2_analysis/'
      } else {
        endpoint = '/api/bowtie2_paired/'
      }
      
    } else if (this.state.analysisType === 'RNAseq') {

      if (this.state.readType === 'Unpaired') {
        endpoint = '/api/star_analysis/'
      } else {
        endpoint = '/api/star_paired/'
      }
      
    } else {
      return;
    }



    axios.post(endpoint, request)
    .then(result => {
      this.props.notifySuccess('Your analysis was submitted.');
      this.setState({
        selectionStatus: {},
        selectedFiles: [],
        analysisType: null,
        submitting: false
      });
      this.props.updateTab(1);
    }) 
    .catch((error) => {
      this.props.notifyError('There was an error submitting your analysis.');
      this.setState({
        submitting: false
      });
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

    const readTypeOptions = [
      { key: 'Unpaired' , text: 'Unpaired' , value: 'Unpaired' },
      { key: 'Paired' , text: 'Paired' , value: 'Paired' },
    ];

    const groupOptions = [
      { key: 'Group 1' , text: 'Group 1' , value: 1 },
      { key: 'Group 2' , text: 'Group 2' , value: 2 },
      { key: 'Group 3' , text: 'Group 3' , value: 3 },
      { key: 'Group 4' , text: 'Group 4' , value: 4 },
      { key: 'Group 5' , text: 'Group 5' , value: 5 },
      { key: 'Group 6' , text: 'Group 6' , value: 6 },
      { key: 'Group 7' , text: 'Group 7' , value: 7 },
      { key: 'Group 8' , text: 'Group 8' , value: 8 },
      { key: 'Group 9' , text: 'Group 9' , value: 9 },
      { key: 'Group 10' , text: 'Group 10' , value: 10 },
    ]

    const pairOptions = [
      { key: 'Pair 1' , text: 'Pair 1' , value: 1 },
      { key: 'Pair 2' , text: 'Pair 2' , value: 2 },
    ]

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
            <p className="p-t-15">2. Select the read type.</p>
            <Dropdown placeholder='Select Read Type'
                      selection
                      options={readTypeOptions}
                      onChange={(e, data) => this.setState({readType: data.value})}>      
            </Dropdown>
            <p className="p-t-15">
              3. Select the files you would like to process and specify their genome types{this.state.analysisType === 'RNAseq' && <span> and read lengths</span>}.
            </p>
            <div className="table-container">   
            <Table basic='very' className="p-t-15">
                <Table.Header>
                <Table.Row>
                    { this.state.analysisType && this.state.readType && <Table.HeaderCell></Table.HeaderCell> }
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Size</Table.HeaderCell>
                    <Table.HeaderCell>Last Modified</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                    { this.state.analysisType === 'RNAseq' && <Table.HeaderCell></Table.HeaderCell>}
                    <Table.HeaderCell></Table.HeaderCell>
                    { this.state.readType === 'Paired' && <Table.HeaderCell></Table.HeaderCell> }
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.fileList.map((file, i) => {
                    return (
                        <Table.Row obj={file} key={file.path}>
                            { this.state.analysisType && this.state.readType && 
                            <Table.Cell>
                            <Checkbox
                              onChange={(e, data) => this.handleCheck(e, data, file.path, i)}
                              checked={file.selected}/>
                            </Table.Cell> }
                            
                            <Table.Cell>{file.name}</Table.Cell>
                            <Table.Cell>{file.size}</Table.Cell>
                            <Table.Cell>{file.last_updated}</Table.Cell>
                            <Table.Cell>
                              { this.state.selectionStatus[file.path] &&
                                <>
                                <Dropdown placeholder='Genome'
                                        value={this.state.selectedGenomes[file.path]}
                                        selection
                                        options={genomeOptions}
                                        className="table-dropdown"
                                        onChange={(e, data) => this.handleGenomeChange(e, data, file.path)}>      
                                </Dropdown> 
                        
                                </>
                              }
                            </Table.Cell>
                            { this.state.analysisType === 'RNAseq' &&
                            <Table.Cell>
                              { this.state.selectionStatus[file.path] &&
                                <>

                                
                                  <Dropdown placeholder='Read Length'
                                            value={this.state.selectedReadLengths[file.path]}
                                            className="table-dropdown"
                                            selection
                                            options={readLengthOptions}
                                            onChange={(e, data) => this.handleReadLengthChange(e, data, file.path)}>      
                                  </Dropdown>
                                
                                </>
                              }
                            </Table.Cell>}
                            { this.state.readType === 'Unpaired' &&
                            <Table.Cell>
                              { this.state.selectionStatus[file.path] &&
                                <>
                                <Dropdown placeholder='Group'
                                          value={this.state.selectedGroups[file.path]}
                                          className="table-dropdown"
                                          selection
                                          options={groupOptions}
                                          onChange={(e, data) => this.handleGroupChange(e, data, file.path)}>      
                                </Dropdown>
                                </>
                              }
                            </Table.Cell>
                            }
                            { this.state.readType === 'Paired' &&
                            <>
                              <Table.Cell>
                                { this.state.selectionStatus[file.path] &&
                                  <>
                                  <Dropdown placeholder='Pair'
                                            value={this.state.selectedPairs[file.path]}
                                            className="table-dropdown"
                                            selection
                                            options={pairOptions}
                                            onChange={(e, data) => this.handlePairChange(e, data, file.path)}>      
                                  </Dropdown>
                                  </>
                                }
                              </Table.Cell>
                              <Table.Cell>
                                { this.state.selectionStatus[file.path] &&
                                  <>
                                  <Input 
                                    type="number"
                                    min="0"
                                    placeholder="Position"
                                    value={this.state.selectedPositions[file.path]}
                                    className="table-input"
                                    onChange={(e, data) => this.handlePositionChange(e, data, file.path)}/>
                                  {/* <Dropdown placeholder='Select Position'
                                            value={this.state.selectedPositions[file.path]}
                                            selection
                                            options={groupOptions}
                                            onChange={(e, data) => this.handlePositionChange(e, data, file.path)}>      
                                  </Dropdown> */}
                                  </>
                                }
                              </Table.Cell>
                            </>
                            }
                        </Table.Row>
                    )
                })}
                </Table.Body>
            </Table>
            </div>
          
            
            {this.state.submitting ? 
                <div className="m-t-25">
                  <Button primary loading disabled>Launch Analysis</Button>
                </div>  
                :
                <div className="m-t-25">
                  <Button disabled={!submitEnabled} primary onClick={() => this.handleSubmit()}>Launch Analysis</Button>
                </div>
                
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