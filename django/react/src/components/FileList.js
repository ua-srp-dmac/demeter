import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import { Table } from 'semantic-ui-react'
import { Container, Header, Loader, Icon,  Button, Breadcrumb } from 'semantic-ui-react'
import axios from '../axios';
import AnalysisList from './AnalysisList';

export default class FileList extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      fileList: null,
      loading: true,
      breadcrumbs: null,
      currentPath: null,
    };

    this.getFiles = this.getFiles.bind(this);
    this.getFolders = this.getFolders.bind(this);
    this.buildBreadcrumbs = this.buildBreadcrumbs.bind(this);

  };

  async componentDidMount() {
    this.getFolders();
    this.getFiles();
  }

  getFolders() {
    axios.get('/api/folders/', {})
    
    .then(result => {
        this.setState({
          defaultFolder: result.data.default_folder });
    }) 
    .catch((error) => {
        console.log(error);
    });
  }

  getFiles(path) {

    this.setState({error: null, loading:true })

    axios.get('/api/files/', {
      params: {
        path: path
      }
    })
    .then(result => {
      this.setState({
        error: null,
        loading: false,
        fileList: result.data.fileList,
        currentPath: result.data.currentPath
      }, 
        this.buildBreadcrumbs(result.data.currentPath)
      );
    }) 
    .catch((error) => {
        console.log(error);
    });
  }


  /**
   * Builds breadcrumb menu for file navigation.
   * @param {*} path 
   */
  buildBreadcrumbs(path) {

    let crumbs = path.split('/');
    let breadcrumbs = [];

    for (var i = 1; i < crumbs.length; i++) {
      
      var path = crumbs.slice(0, i + 1).join("/");

      let clickable = false;
      if (path.includes(this.state.defaultFolder)) {
        clickable = true;
      }

      let crumb = {
        name: crumbs[i],
        path: path,
        clickable: clickable,
      }
      if (path.includes('srp_dmac')) {
        breadcrumbs.push(crumb);
      }
    }

    this.setState({breadcrumbs: breadcrumbs})
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
          { this.state.fileList &&
            <>
              <div className="table-container">   
              <Table basic='very' className="p-t-15">
                  <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Size</Table.HeaderCell>
                      <Table.HeaderCell>Last Modified</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>

                  <Table.Body>
                  {this.state.fileList.map((file, i) => {
                      return (
                        <Table.Row obj={file} key={file.path}>
                          <Table.Cell>
                            { file.type === 'folder' ?
                              <>
                                <Icon name='folder'/>
                                <span className="fake-link m-l-10"><a onClick={() => this.getFiles(file.path)}>{file.name}</a></span>
                              </> :
                              <>
                                {file.name}
                              </>
                            } 
                          </Table.Cell>
                          <Table.Cell>{file.size}</Table.Cell>
                          <Table.Cell>{file.last_updated}</Table.Cell>
                        </Table.Row>
                      )
                  })}
                  </Table.Body>
              </Table>
              </div>  
            </>
          }
        </Container>
      </>
    )
  }
  
  render() {
    return (
      <>
        <Breadcrumb className="p-t-15 p-b-15">
          { this.state.breadcrumbs &&
            <>
              {this.state.breadcrumbs.map((item, i) => {
                return (
                  <span key={item.path}>
                    { item.path === this.state.currentPath ?
                        <Breadcrumb.Section active>{item.name}</Breadcrumb.Section>
                      :
                      <>
                        { item.clickable && 
                          <Breadcrumb.Section link onClick={() => this.getFiles(item.path)}>
                            {item.name}
                          </Breadcrumb.Section>
                        }
                        { !item.clickable && <Breadcrumb.Section>{item.name}</Breadcrumb.Section>}
                      </>
                      
                    }
                    
                    { i < this.state.breadcrumbs.length - 1 && <Breadcrumb.Divider icon='right angle'/> }
                  </span>
                )
              })}
            </>
          }
        </Breadcrumb>

        { !this.state.loading && this.renderFileList() }
        { this.state.loading && this.renderLoading() }
      </>
    )
  } 
}