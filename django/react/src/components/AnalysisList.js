import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon, Dropdown, Button, Checkbox, Accordion } from 'semantic-ui-react'
import axios from '../axios';


export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      analyses: null,
    };

    this.getAnalyses = this.getAnalyses.bind(this);
    this.transferFiles = this.transferFiles.bind(this);

  };

  async componentDidMount() {
    this.getAnalyses();
  }

  getAnalyses() {

    this.setState({error: null, loading:true })
  
    axios.get('/api/analyses/', {})
    .then(result => {
        this.setState({error: null, loading: false, analyses: result.data });
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  transferFiles() {
    axios.get('/api/file-transfer/', {})
    .then(result => {
      console.log('Done!')
    }) 
    .catch((error) => {
        console.log(error);
    });
  }


  renderLoading() {
    return (
      <Container>
        <Loader active inline='centered'>Loading</Loader>
      </Container>
    )
  }

  renderFileList() {

    return (

      <>
      <Container>
        { this.state.analyses &&
            <Table basic='very' className="accordian">
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Start Date</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>End Date</Table.HeaderCell>
                </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.state.analyses.map((item, i) => {
                    return (

                        <Table.Row obj={item} key={i}>
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell>{item.start_date}</Table.Cell>
                            <Table.Cell>
                              { (item.status === 'Submitted') && 
                                <><span className="text-orange">{item.status}</span></>
                              }
                              { (item.status === 'Running') && 
                                <><span className="text-green">{item.status}</span></>
                              }
                              { (item.status === 'Failed') && 
                                <><span className="text-red">{item.status}</span></>
                              }
                              { (item.status === 'Completed') && 
                                <><span className="text-blue">{item.status}</span></>
                              }
                              { (item.status === 'Canceled') && 
                                <span className="text-grey">{item.status}</span>
                              }
                            
                            </Table.Cell>
                            <Table.Cell>
                              {item.end_date === '1970-01-01 00:00:00' ? <>-----</> : item.end_date }
                            </Table.Cell>
                            <Table.Cell>
                              <Button onClick={this.transferFiles}>Transfer</Button>
                            </Table.Cell>
                        </Table.Row>

                    )
                })}
                </Table.Body>
            </Table>
        }
        </Container>
      </>
    )
  }
  
  render() {
    return (
      <>
        { !this.state.loading && this.renderFileList() }
        { this.state.loading && this.renderLoading() }
      </>
    )
  } 
}