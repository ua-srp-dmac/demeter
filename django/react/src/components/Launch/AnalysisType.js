
import { Step } from 'semantic-ui-react'
import classNames from "classnames";
import React, { Component, createRef } from 'react';

import {
  Grid,
  Header,
  Image,
  Rail,
  Ref,
  Segment,
  Sticky,
  Table,
  Checkbox,
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
            Next
        </Button>

        
      </>
    )
  }
  
  
}
