import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Container, Menu } from 'semantic-ui-react';

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
          <Menu fixed='top' inverted>
          <Container>
            <Menu.Item as='a' header>
              DMAC File Status
            </Menu.Item>
            <Menu.Item as='a'>Home</Menu.Item>
            {this.state.loggedIn && <Menu.Item as='a' onClick={this.logout}>Logout</Menu.Item>}
          </Container>
        </Menu>
        <Container className="appBody">
          { this.state.loggedIn && <Routes childProps={{loggedIn: this.state.loggedIn}} />}
          { !this.state.loggedIn && !this.state.loading && <LoginForm updateAuth={this.updateAuth}></LoginForm>}
        </Container>
        </header>
      </div>
    );
  }
}

export default App;

