
import { Step, Button } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component } from 'react';
import axios from '../../axios';

import AnalysisType from './AnalysisType';
import FileSelect from './FileSelect';
import Review from './Review';


export default class LaunchPad extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      step: 1,
      analysisType: null,
      readType: null,
      groups: [],
    };

    this.updateStep = this.updateStep.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.selectGroup = this.selectGroup.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.updateParentState = this.updateParentState.bind(this);
  };

  updateStep(step) {
    this.setState({step: step});
  }

  updateParentState(attribute, value) {
    this.setState({[attribute]: value});
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
            removeFile={this.removeFile}>
          </Review>
        } 
      </>
    )
  }
  
  
}
