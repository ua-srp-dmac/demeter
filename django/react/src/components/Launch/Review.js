
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
  Label,
  Card
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
        <Button
            floated='left'
            icon
            labelPosition='left'
            primary
            size='small'
            onClick={() => this.props.updateStep(2)}>
            Back <Icon name='caret left'/>
        </Button>

        <div>
        { this.props.parentState.groups.length > 0 && 
            
          <Card.Group>
            <>
            {this.props.parentState.groups.map((index, i) => {
              let group = this.props.parentState['group_' + index]
              
              return (
                <Card key={index} 
                      onClick={() => this.props.selectGroup(index)}>
                  <Card.Content>
                    <Card.Header>
                      Group {index}
                      <Label size='tiny'
                              className="floated-right">
                        {this.props.parentState['group_' + index].length} files
                      </Label>
                    </Card.Header>
                    <Card.Description>
                      { this.props.parentState['group_' + index].length === 0 &&
                        <>
                          No files selected.
                        </>
                      }
                      { this.props.parentState['group_' + index].length > 0 &&
                        <>
                          {this.props.parentState['group_' + index].map((file, i) => {
                            let fileName = file.substring(file.lastIndexOf('/')+1);
                            return (
                              <div key={file} className="word-wrap m-b-5">
                                {fileName}
                                <Divider></Divider>
                              </div>
                            )
                          })}
                        </>
                      }
                    </Card.Description>
                  </Card.Content>
                </Card>
              )
            })}
            
            </>
          </Card.Group>
           
          }
          </div>

          {/* <Grid.Column>
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
        </Grid> */}
      </>
    )
  }
  
  
}
