
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

  render() {
    
    const readLengthOptions = [
      { key: '50bp' , text: '50bp' , value: '49' },
      { key: '75bp' , text: '75bp' , value: '74' },
      { key: '100bp' , text: '100bp' , value: '99' },
      { key: '150bp' , text: '150bp' , value: '149' },
    ];

    const genomeOptions = [
      { key: 'mouse' , text: 'mouse' , value: 'mouse' },
      { key: 'human' , text: 'human' , value: 'human' },
      // { key: 'rat' , text: 'rat' , value: 'rat' },
    ];

    return (
      <>
        <Grid>
          <Grid.Column textAlign="center">
          <Button
              floated='left'
              icon
              labelPosition='left'
              size='small'
              onClick={() => this.props.updateStep(2)}>
              Back <Icon name='caret left'/>
          </Button>
          </Grid.Column>
        </Grid>
{/* 
        <div class="ui secondary menu">
          <div class="left menu">
            
          </div>
        </div>
         */}
        <div>
        { this.props.parentState.groups.length > 0 && 
            
          <Card.Group className="two doubling stacking centered">
            <>
            {this.props.parentState.groups.map((index, i) => {
              let group = this.props.parentState['group_' + index]
              
              return (
                <Card key={index} fluid>
                  <Card.Content>
                    <Card.Header>
                      Group {index}
                      <Label size='tiny'
                              className="floated-right">
                        {this.props.parentState['group_' + index].length} {this.props.parentState['group_' + index].length === 1 ? 'file' : 'files' }
                      </Label>
                    </Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <Card.Description>
                      <h4>Selected Files</h4>
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
                              </div>
                            )
                          })}
                        </>
                      }

                      
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Dropdown placeholder='Genome'
                              value={this.props.parentState['genome_' + index]}
                              selection
                              clearable
                              fluid
                              options={genomeOptions}
                              onChange={(e, data) => this.props.updateGroup(index, 'genome', data.value)}
                    >      
                    </Dropdown>

                    <Dropdown placeholder='Read Length'
                            value={this.props.parentState['readLength_' + index]}
                            selection
                            clearable
                            fluid
                            options={readLengthOptions}
                            className='m-t-15'
                            onChange={(e, data) => this.props.updateGroup(index, 'readLength', data.value)}
                    >      
                    </Dropdown> 
                  </Card.Content>
                </Card>
              )
            })}
            
            </>
          </Card.Group>
           
        }
        </div>

        <Divider hidden></Divider>
        
        <Grid>
          <Grid.Column textAlign="center">
            <Button
              icon
              labelPosition='right'
              primary
              size='large'
              loading={this.props.submitting}
              disabled={this.props.submitting}
              onClick={() => this.props.handleSubmit()}>
              Submit Analysis <Icon name='check circle outline'/>
            </Button>
          </Grid.Column>
        </Grid>

          

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
