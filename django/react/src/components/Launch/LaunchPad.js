
import { Step, Button, Grid, Icon } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component } from 'react';
import axios from '../../axios';
import { Redirect } from "react-router-dom";

import AnalysisType from './AnalysisType';
import FileSelect from './FileSelect';
import FileSelectPaired from './FileSelectPaired';
import ReviewPaired from './ReviewPaired';
import Review from './Review';


export default class LaunchPad extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      step: 1,
      analysisType: null,
      readType: null,
      pair_1: [],
      pair_2: [],
      pair_1_order: {},
      pair_2_order: {},
      pairs: [1, 2],
      groups: [],
      genomes: {},
      readLengths: {},
    };

    this.updateStep = this.updateStep.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.selectGroup = this.selectGroup.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.updateParentState = this.updateParentState.bind(this);
    this.updateGroup = this.updateGroup.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);


    this.selectPair = this.selectPair.bind(this);
    this.handleCheckPaired = this.handleCheckPaired.bind(this);
    this.isSelectedPaired = this.isSelectedPaired.bind(this);
    this.removeFilePaired = this.removeFilePaired.bind(this);
    this.handleSubmitPaired = this.handleSubmitPaired.bind(this);
    this.updatePair = this.updatePair.bind(this);
  }

  componentDidMount() {
    console.log(this.props)
  }
  

  updateStep(step) {
    this.setState({step: step});
  }

  updateParentState(attribute, value) {
    this.setState({[attribute]: value});
  }

  updateGroup(group, attribute, value) {
    this.setState({
      [attribute + '_' + group]: value}, 
      console.log(this.state[attribute + '_' + group])
    );
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

  removeGroup(index) {
    console.log(this.state.groups);
    // for (var i = index; i < this.state.groups.length; i++) {
    //   this.setState({['group_' + i]: this.state['group_' + (i + 1)]})
    // }
    
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

  handleSubmit() {

    this.setState({submitting:true });
    
    var groups = []

    for (var i = 1; i <= this.state.groups.length; i++) {
      var group = {}
      group['files'] = this.state['group_' + i];
      group['sjdbOverhang'] = this.state['readLength_' + i];
      group['genome'] = this.state['genome_' + i];
      groups.push(group);
    }

    var request = {
      groups: groups
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
        submitting: false
      });
      this.props.history.push("/analyses");
    }) 
    .catch((error) => {
      this.props.notifyError('There was an error submitting your analysis.');
      this.setState({
        submitting: false
      });
    });
  }

  /**-------------------------------- Paired ------------------------------------ */

  updatePair(attribute, value) {
    this.setState({
      [attribute]: value}, 
      console.log(this.state[attribute])
    );
  }

  updatePairOrder(pair, attribute, value) {
    this.setState({
      [attribute]: value}, 
      console.log(this.state[attribute])
    );
  }
  
  selectPair(index) {
    this.setState({selectedPair: index});
  }

  handleCheckPaired(e, data, file_path, pair) {

    let selectedFiles;
    
    if (this.state['pair_' + pair]) {
      selectedFiles = this.state['pair_' + pair]
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
      ['pair_' + pair]: selectedFiles,
    }, console.log(this.state['pair_' + pair]));
  }

  isSelectedPaired(file) {
    let pair = this.state.selectedPair;

    if (this.state['pair_' + pair].includes(file)) {
      return true;
    } else {
      return false;
    }
  }

  removeFilePaired(file, pair) {
    let selectedFiles = this.state['pair_' + pair]
    
    var index = selectedFiles.indexOf(file);
    selectedFiles.splice(index, 1);

    this.setState({
      ['pair_' + pair]: selectedFiles,
    }, console.log(this.state['pair_' + pair]));

  }

  handleSubmitPaired() {

    this.setState({submitting:true });
    
    var groups = []

    for (var i = 1; i <= this.state.groups.length; i++) {
      var group = {}
      group['files'] = this.state['pair_' + i];
      group['sjdbOverhang'] = this.state['readLength_' + i];
      group['genome'] = this.state['genome_' + i];
      groups.push(group);
    }

    var request = {
      groups: groups
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
        submitting: false
      });
      this.props.history.push("/analyses");
    }) 
    .catch((error) => {
      this.props.notifyError('There was an error submitting your analysis.');
      this.setState({
        submitting: false
      });
    });
  }

  render() {
    return (
      <>
        
        <Step.Group ordered widths={3}>
          <Step className={classNames({
              completed: this.state.step > 1, active: this.state.step === 1
            })}>
            <Step.Content>
              <Step.Title>Analysis Type</Step.Title>
              <Step.Description>Select analysis type</Step.Description>
            </Step.Content>
          </Step>

          <Step className={classNames({
              completed: this.state.step > 2, active: this.state.step === 2
            })}>
            <Step.Content>
              <Step.Title>Files</Step.Title>
              <Step.Description>Select Files</Step.Description>
            </Step.Content>
          </Step>

          <Step className={classNames({
              completed: this.state.step > 3, active: this.state.step === 3
            })}>
            <Step.Content>
              <Step.Title>Review</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>
   
        { this.state.step === 1 && 
          <AnalysisType
            updateStep={this.updateStep}
            parentState={this.state}
            updateParentState={this.updateParentState}>
          </AnalysisType>
        }

        { this.state.readType === 'Unpaired' && 
          <>
            { this.state.step === 2 && 
              <FileSelect
                updateStep={this.updateStep}
                parentState={this.state}
                handleCheck= {this.handleCheck}
                selectGroup= {this.selectGroup}
                isSelected= {this.isSelected}
                removeFile={this.removeFile}>
              </FileSelect>
            }

            { this.state.step === 3 && 
              <Review
                updateStep={this.updateStep}
                parentState={this.state}
                handleCheck= {this.handleCheck}
                selectGroup= {this.selectGroup}
                isSelected= {this.isSelected}
                removeFile={this.removeFile}
                updateGroup={this.updateGroup}
                handleSubmit={this.handleSubmit}
                submitting={this.state.submitting}>
              </Review>
            }
          </>
        }

        { this.state.readType === 'Paired' && 
          <>
            { this.state.step === 2 && 
              <FileSelectPaired
                updateStep={this.updateStep}
                parentState={this.state}
                handleCheck= {this.handleCheckPaired}
                selectGroup= {this.selectPair}
                isSelected= {this.isSelectedPaired}
                removeFile={this.removeFilePaired}>
              </FileSelectPaired>
            }

            { this.state.step === 3 && 
              <ReviewPaired
                updateStep={this.updateStep}
                parentState={this.state}
                handleCheck= {this.handleCheckPaired}
                selectGroup= {this.selectPair}
                isSelected= {this.isSelectedPaired}
                removeFile={this.removeFilePaired}
                updatePair={this.updatePair}
                handleSubmit={this.handleSubmitPaired}
                submitting={this.state.submitting}>
              </ReviewPaired>
            }
          </>
        } 
      </>
    )
  }
  
  
}
