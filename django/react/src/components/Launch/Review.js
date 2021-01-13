
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

export default class Review extends Component {
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
        Review

        <Button
            floated='left'
            icon
            labelPosition='left'
            primary
            size='small'
            onClick={() => this.props.updateStep(2)}>
            Back
        </Button>

        <Grid container columns={3} stackable>
          <Grid.Column>
            <Segment>Content 1</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 2</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 3</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 4</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 5</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 6</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 7</Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>Content 8</Segment>
          </Grid.Column>
        </Grid>
      </>
    )
  }
  
  
}
