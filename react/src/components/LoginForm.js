import React, { Component } from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { Container, Dimmer, Loader } from 'semantic-ui-react'
import axios from '../axios';

export default class LoginForm extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      username: '',
      password: '',
    };

    this.login = this.login.bind(this)
    this.handleChange = this.handleChange.bind(this);
  }

  login() {

    this.setState({
      error: null,
      loading:true
    });
  
    axios.post('/api/delogin/', {
      username: this.state.username,
      password: this.state.password,
    })
    .then(result => {
        this.setState({error: null, loading: false, loggedIn: true });
        this.props.updateAuth(true);
        console.log('Logged in.')
    })
    .catch((error) => {
        console.log(error)
    });

  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  renderLoginForm() {
    return (
      <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h2' color='teal' textAlign='center'>
          Log-in with your CyVerse account
        </Header>
        <Form size='large' onSubmit={this.login}>
          <Segment stacked>
            <Form.Input
              fluid
              icon='user'
              iconPosition='left'
              placeholder='Username'
              onChange={this.handleChange}
              name="username"
              value={this.state.username}
            />
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
              onChange={this.handleChange}
              name="password"
              value={this.state.password}
            />
            <Button color='teal' fluid size='large' type="submit">
              Login
            </Button>
          </Segment>
        </Form>
        {/* <Message>
          Need an account? <a href='#'>Request one here.</a>
        </Message> */}
      </Grid.Column>
    </Grid>
    )
  }

  renderLoading() {
    return (
      <Dimmer active>
        <Loader>Logging In</Loader>
      </Dimmer>
    )
  }
  
  render() {
    return (
      <>
        { this.state.loading && this.renderLoading() }
        { !this.state.loggedIn && this.renderLoginForm() }
      </>
    )
  } 
}