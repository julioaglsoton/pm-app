import React, { Component, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import "./App.css";
import Routes from "./Routes";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { setCookie } from "./config";//NEW

class App extends Component {
	//Constructor of the container file
	constructor(props) {
		super(props);

		this.state = {
		  isAuthenticated: false,
		  isAuthenticating: true
		};
	}

	//Flag to check if the user is authenticated
	userHasAuthenticated = authenticated => {
	  this.setState({ isAuthenticated: authenticated });
	}

	//Constructor of the container file
	async componentDidMount() {
	  try {
		await Auth.currentSession();
		this.userHasAuthenticated(true);
	  }
	  catch(e) {
		if (e !== 'No current user') {
		  alert(e);
		}
	  }

	  this.setState({ isAuthenticating: false });
	}
	
	//Logout function
	handleLogout = async event => {
		await Auth.signOut();
		this.userHasAuthenticated(false);
		setCookie("tx_user_mail", "");
		this.props.history.push("/");
	}

	//Render page
	render() {
	  const childProps = {
		isAuthenticated: this.state.isAuthenticated,
		userHasAuthenticated: this.userHasAuthenticated
	  };

	  return (
		!this.state.isAuthenticating &&
		<div class="AppContainer">
		  <Navbar fluid collapseOnSelect className="navheader">
			<Navbar.Header>
			  <Navbar.Brand>
				<Link to="/"> Home </Link>
			  </Navbar.Brand>
			  <Navbar.Toggle />
			</Navbar.Header>
			<Navbar.Collapse>
			  <Nav pullRight>
				{this.state.isAuthenticated
				  ? <NavItem onClick={this.handleLogout}>Logout</NavItem>
				  : <Fragment>
					  <LinkContainer to="/login">
						<NavItem>Login</NavItem>
					  </LinkContainer>
					</Fragment>
				}
			  </Nav>
			</Navbar.Collapse>
		  </Navbar>
		  <Routes childProps={childProps} />
		</div>
	  );
	}

}

export default withRouter(App);

