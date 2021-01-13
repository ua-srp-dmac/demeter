
import { Step } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component, createRef } from 'react';

import AnalysisType from './AnalysisType';
import FileSelect from './FileSelect';
import Review from './Review';


export default class LaunchPad extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      step: 1
    };

    this.updateStep = this.updateStep.bind(this);

  };

  updateStep(step) {
    this.setState({step: step});
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
          <AnalysisType updateStep={this.updateStep}>

          </AnalysisType>
        }

        { this.state.step === 2 && 
          <FileSelect updateStep={this.updateStep}></FileSelect>
        } 

        { this.state.step === 3 && 
          <Review updateStep={this.updateStep}></Review>
        } 
      </>
    )
  }
  
  
}
