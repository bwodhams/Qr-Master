import React, { Component } from 'react';

import EditUser from './EditUser';
import User from './User';

import api from '../api';

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
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    api.get().then(json => this.setState({ users: json }));
  }

  handleSelect(user) {
    this.setState({ selectedUser: user });
  }

  handleDelete(event, user) {
    event.stopPropagation();

    api.destroy(user).then(() => {
      let users = this.state.users;
      users = users.filter(h => h !== user);
      this.setState({ users: users });

      if (this.selectedUser === user) {
        this.setState({ selectedUser: null });
      }
    });
  }

  handleEnableAddMode() {
    this.setState({
      addingUser: true,
      selectedUser: { id: '', name: '', saying: '' }
    });
  }

  handleCancel() {
    this.setState({ addingUser: false, selectedUser: null });
  }

  handleSave() {
    let users = this.state.users;

    if (this.state.addingUser) {
      api
        .create(this.state.selectedUser)
        .then(result => {
          console.log('Successfully created!');

          users.push(this.state.selectedUser);
          this.setState({
            users: users,
            selectedUser: null,
            addingUser: false
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      api
        .update(this.state.selectedUser)
        .then(() => {
          this.setState({ selectedUser: null });
        })
        .catch(err => {});
    }
  }

  handleOnChange(event) {
    let selectedUser = this.state.selectedUser;
    selectedUser[event.target.name] = event.target.value;
    this.setState({ selectedUser: selectedUser });
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
                selectedUser={this.state.selectedUser}
              />
            );
          })}
        </ul>
        <div className="editarea">
          <button onClick={this.handleEnableAddMode}>Register New Account</button>
          <EditUser
            addingUser={this.state.addingUser}
            onChange={this.handleOnChange}
            selectedUser={this.state.selectedUser}
            onSave={this.handleSave}
            onCancel={this.handleCancel}
          />
        </div>
      </div>
    );
  }
}

export default Users;
