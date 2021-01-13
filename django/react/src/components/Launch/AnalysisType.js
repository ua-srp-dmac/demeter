
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
  Label,
  Form
} from 'semantic-ui-react'

export default class AnalysisType extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      analysisType: null,
      readType: null
    };

  };

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
        <Grid textAlign='center' style={{ height: '50vh' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 475 }}>
            <Header as='h3' color='grey' textAlign='center'>
              Select Analysis Type
            </Header>
            <Form size='large' onSubmit={this.login}>
              <Segment stacked>
              
              <Dropdown placeholder='Select Analysis Type'
                    selection
                    fluid
                    options={analysisOptions}
                    onChange={(e, data) => this.props.updateParentState('analysisType', data.value)}>      
              </Dropdown>
              
              <Dropdown placeholder='Select Read Type'
                        selection
                        fluid
                        className='m-t-15 m-b-15'
                        options={readTypeOptions}
                        onChange={(e, data) => this.props.updateParentState('readType', data.value)}>      
              </Dropdown>
              
              <Button
                  icon
                  labelPosition='right'
                  primary
                  size='small'
                  disabled={!this.props.parentState.readType || !this.props.parentState.analysisType}
                  onClick={() => this.props.updateStep(2)}>
                  Next <Icon name='caret right'/>
              </Button>

              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
        
      </>
    )
  }
  
  
}
