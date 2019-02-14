import React, {
  Component
} from 'react';

import EditUser from './EditUser';
import Login from './Login';
import User from './User';

import api from '../api';
import AddCard from './AddCard';

class Users extends Component {
  constructor() {
    super();

    this.state = {
      users: [],
      creatingUser: false
    };

    this.handleEnableAddMode = this.handleEnableAddMode.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleBeginLogin = this.handleBeginLogin.bind(this);
    this.handleUpdateStripeInfo = this.handleUpdateStripeInfo.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    api.get().then(json => this.setState({
      users: json
    }));
  }

  handleSelect(user) {
    this.setState({
      selectedUser: user
    });
  }

  handleBeginLogin() {
    this.setState({
      startLogin: true,
      loggedIn: null
    });
  }

  

  handleLogin(event, email, inputPassword) {
    event.stopPropagation();
    api.login(email, inputPassword).then(result => {
      this.setState({
        startLogin: false
      });
      if (result.loggedIn === true) {
        this.setState({
          loggedIn: true
        });
      } else {
        this.setState({
          loggedIn: false
        });
      }
      console.log(result.message);
    });
  }

  handleUpdateStripeInfo(){
    this.setState({
      showAddCard: true
    });
  }

  handleAddCard(event, creditcard, expDate, cvv, firstName, lastName, address, city, state, zip){
    event.stopPropagation();
    
  }

  handleDelete(event, user) {
    event.stopPropagation();

    api.destroy(user).then(() => {
      let users = this.state.users;
      users = users.filter(h => h !== user);
      this.setState({
        users: users
      });

      if (this.selectedUser === user) {
        this.setState({
          selectedUser: null
        });
      }
    });
  }

  handleEnableAddMode() {
    this.setState({
      addingUser: true,
      selectedUser: {
        id: '',
        name: '',
        emailVerifCode: ''
      }
    });
  }

  handleCancel() {
    this.setState({
      addingUser: false,
      selectedUser: null,
      startLogin: false,
      showAddCard: false
    });
  }

  handleSave() {
    let users = this.state.users;
    if (this.state.addingUser) {
      api
        .create(this.state.selectedUser)
        .then(result => {
          if (result.accountCreated === true) {
            console.log('Successfully created!');
            console.log(result.message);
            users.push(this.state.selectedUser);
            this.setState({
              users: users,
              selectedUser: null,
              addingUser: false
            });
          }else{
            console.log(result.message);
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      api
        .update(this.state.selectedUser)
        .then(() => {
          this.setState({
            selectedUser: null
          });
        })
        .catch(err => {});
    }
  }

  handleOnChange(event) {
    let selectedUser = this.state.selectedUser;
    selectedUser[event.target.name] = event.target.value;
    this.setState({
      selectedUser: selectedUser
    });
  }

  render() {
    return (
      <div>
        <ul className="users">
          {this.state.users.map(user => {
            return (
              <User
                key={user.email}
                user={user}
                onSelect={this.handleSelect}
                onDelete={this.handleDelete}
                onLogin={this.handleLogin}
                selectedUser={this.state.selectedUser}
              />
            );
          })}
        </ul>
        <div className="editarea">
          <button onClick={this.handleEnableAddMode}>Register New Account</button>
          <button onClick={this.handleBeginLogin}>Login to Account</button>
          <button onClick={this.handleUpdateStripeInfo}>Add Stripe Info</button>
          <EditUser
            addingUser={this.state.addingUser}
            onChange={this.handleOnChange}
            selectedUser={this.state.selectedUser}
            onSave={this.handleSave}
            onCancel={this.handleCancel}
          />
          <Login
            startLogin={this.state.startLogin}
            loggedIn={this.state.loggedIn}
            onLogin={this.handleLogin}
            onCancel={this.handleCancel}
          />
          <AddCard
            addingCard={this.state.showAddCard}
            onAddCard={this.handleAddCard}
            onCancel={this.handleCancel}
          />
        </div>
      </div>
    );
  }


}

export default Users;