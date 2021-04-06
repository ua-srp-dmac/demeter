
import React, { Component } from 'react';
import _ from 'lodash'

import {
  Grid,
  Dropdown,
  Button,
  Icon,
  Divider,
  Label,
  Card
} from 'semantic-ui-react'

export default class ReviewPaired extends Component {

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

    const orderOptions = _.range(
      1, this.props.parentState['pair_1'].length + 1
    ).map(function(i) {
      return {
        key: i,
        text: i,
        value: i
      };
    });

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

        <div>

          <Card.Group className="two doubling stacking centered">
            <>
              {this.props.parentState.pairs.map((index, i) => {
                let group = this.props.parentState['pair_' + index]
                
                return (
                  <Card key={index} fluid>
                    <Card.Content>
                      <Card.Header>
                        Group {index}
                        <Label size='tiny'
                                className="floated-right">
                          {this.props.parentState['pair_' + index].length} {this.props.parentState['pair_' + index].length === 1 ? 'file' : 'files' }
                        </Label>
                      </Card.Header>
                    </Card.Content>
                    <Card.Content>
                      <Card.Description>
                        <h4>Order Files</h4>
                        { this.props.parentState['pair_' + index].length === 0 &&
                          <>
                            No files selected.
                          </>
                        }
                        { this.props.parentState['pair_' + index].length > 0 &&
                          <>
                            {this.props.parentState['pair_' + index].map((file, i) => {
                              let fileName = file.substring(file.lastIndexOf('/')+1);
                              return (
                                <div key={file} className="word-wrap">
                                  <Dropdown
                                    placeholder={i+1}
                                    value={this.props.parentState['pair_order_' + index][file]}
                                    selection
                                    compact
                                    options={orderOptions}
                                    onChange={(e, data) => this.props.updatePairOrder(index, file, data.value)}
                                  >      
                                  </Dropdown>
                                  <span className="m-l-10">{fileName}</span>
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

              <Card fluid>
                <Card.Content>
                  <Card.Header>
                    Parameters
                  </Card.Header>
                </Card.Content>
                
                <Card.Content extra>
                  <Dropdown placeholder='Genome'
                            value={this.props.parentState.pairGenome}
                            selection
                            clearable
                            fluid
                            options={genomeOptions}
                            onChange={(e, data) => this.props.updatePair('pairGenome', data.value)}
                  >      
                  </Dropdown>

                  <Dropdown placeholder='Read Length'
                          value={this.props.parentState.pairReadLength}
                          selection
                          clearable
                          fluid
                          options={readLengthOptions}
                          className='m-t-15'
                          onChange={(e, data) => this.props.updatePair('pairReadLength', data.value)}
                  >      
                  </Dropdown> 
                </Card.Content>
              </Card>
            
            </>
          </Card.Group>
           
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
      </>
    )
  }
  
  
}
