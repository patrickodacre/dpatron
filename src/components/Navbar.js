import React, { Component } from 'react'
import farmer from '../farmer.png'

class Navbar extends Component {

    constructor(props) {
        super(props)
    }

    loadEth = async() => {
        this.props.onLoadEth()
    }
  render() {

      let accountButton

      if (this.props.account) {
          accountButton = <small className="text-secondary">
              <small id="account">{this.props.account}</small>
              </small>
      } else {
          accountButton = <button className="btn btn-primary" onClick={this.loadEth}>Enable Ethereum</button>
      }

    return (
      <nav className="navbar navbar-dark bg-dark flex-md-nowrap mb-4 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={farmer} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; DApp Token Farm
        </a>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            {accountButton}
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
