
import { Step } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component, createRef } from 'react';

import {
  Grid,
  Header,
  Image,
  Ref,
  Segment,
  Dropdown,
  Button,
  Icon,
  Divider,
  Label
} from 'semantic-ui-react'

export default class AnalysisType extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      analysisType: null,
      readType: null
    };

  };

  updateStep() {

  }

  render() {
    const analysisOptions = [
      { key: 'DNAseq' , text: 'DNAseq' , value: 'DNAseq' },
      { key: 'RNAseq' , text: 'RNAseq' , value: 'RNAseq' },
    ];

    const readTypeOptions = [
      { key: 'Unpaired' , text: 'Unpaired' , value: 'Unpaired' },
      { key: 'Paired' , text: 'Paired' , value: 'Paired' },
    ];
    
    return (
      <>
        Analysis Type

        <Button
            floated='right'
            icon
            labelPosition='right'
            primary
            size='small'
            onClick={() => this.props.updateStep(2)}>
            Next <Icon name='caret right'/>
        </Button>

        
      </>
    )
  }
  
  
}
