import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Container, Menu, Segment, Grid, Header, List, Divider, Image } from 'semantic-ui-react';

import axios from './axios';
import Routes from "./Routes";
import LoginForm from "./components/LoginForm";


class App extends Component {

  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
    this.updateAuth = this.updateAuth.bind(this);
    
    this.state = {
      loggedIn: null,
      loading: true,
    };
  }

  async componentDidMount() {
    axios.get('/api/auth/')
      .then(result => {
        this.setState({loggedIn: true, loading:false});
        console.log('logged in')
      })
      .catch((error) => {
        this.setState({loggedIn: false, loading:false});
          console.log(error)
          console.log('not logged in')
    });
  }

  updateAuth(authenticated) {
    if (authenticated) {
      this.setState({loggedIn: true});
    } else {
      this.setState({loggedIn: false});
    }
  }

  logout() {
    
    axios.get('/api/logout/')
      .then(result => {
          this.setState({loggedIn: false});
          console.log('logged out')
      })
      .catch((error) => {
          console.log(error)
    });
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Menu fixed='top' inverted className="raised-menu">
            <Container>
              <Menu.Item as='a' header>
                <h1>demeter</h1>
              </Menu.Item>
              <Menu.Item as='a' href="/"><h4>Home</h4></Menu.Item>
              {this.state.loggedIn && <Menu.Item as='a' onClick={this.logout}><h4>Logout</h4></Menu.Item>}
            </Container>
          </Menu>
        </header>
        <Container className="appBody">
          { this.state.loggedIn && <div style={{ minHeight: '80vh' }}><Routes childProps={{loggedIn: this.state.loggedIn}} /></div>}
          { !this.state.loggedIn && !this.state.loading && <LoginForm updateAuth={this.updateAuth}></LoginForm>}
        </Container>

        <Segment vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }} fixed='bottom'>
          <Container textAlign='center'>
            <Divider section />
            <Grid divided inverted stackable>
              <Grid.Column width={8}>
                <Grid.Column width={8}>
                <Image centered size='medium' src={"/static/ua-logo.png"} as='a' href='https://www.superfund.arizona.edu/'/>
              </Grid.Column>
              </Grid.Column>
              <Grid.Column width={8}>
                <Image centered size='medium' src={"/static/niehs-logo.png"} as='a' href='https://www.niehs.nih.gov/research/supported/centers/srp/index.cfm'/>
              </Grid.Column>
            </Grid>

            {/* <Divider section />
            <List horizontal divided link size='small'>
              <List.Item as='a' href='#'>
                Need help? Contact myung@email.arizona.edu
              </List.Item>
              <List.Item as='a' href='#'>
                Contact Us
              </List.Item>
              <List.Item as='a' href='#'>
                Terms and Conditions
              </List.Item>
              <List.Item as='a' href='#'>
                Privacy Policy
              </List.Item>
            </List> */}
          </Container>
        </Segment>
      </div>
    );
  }
}

export default App;

