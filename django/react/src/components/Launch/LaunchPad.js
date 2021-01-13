
import { Step, Button } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component } from 'react';

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

  };

  updateStep(step) {
    this.setState({step: step});
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
            parentState={this.state}>

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
