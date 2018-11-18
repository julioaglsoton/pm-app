import React, { Component } from "react";
import "./Signup.css";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { FormGroup, FormControl, PageHeader, Table } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { getLoggedInUserInfo } from "../config";//NEW
import { Auth } from "aws-amplify";

export default class SignUp extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for SignUp, with global variables
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			tx_user_name: "",
			tx_role: "Admin",
			tx_user_mail: "",
			password: "",
			users: []
		};
	}

	//Function to initialize variables
	async componentDidMount() {
		if (!this.props.isAuthenticated) {
			return;
		}

		try {
			const users = await this.users();
			this.setState({ users });
		} catch (e) {
			alert(e);
		}

		this.setState({ isLoading: false });
	}
	/* END OF COMPONENT FUNCTIONS */

	/* BEGINNING OF LAMBDA FUNCTIONS */
	//Invoke lambda function to create users
	createUser(user) {
		return API.post("pm", "/create-users/", {
			body: user 
		});
	}
	
	//Invoke lambda function to get users
	users() {
		return API.get("pm", "/list-users");
	}
	/* END OF LAMBDA FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to handle change values in form inputs
	handleChange = event => {
		this.setState({
			[event.target.id]: event.target.value
		});
	}

	//Function to submit values to create a new user
	handleSubmit = async event => {
		event.preventDefault();
		var j = 0;
		var flag_no_crte = 0;
		
		for( j = 0; j < this.state.users.length; j++ )
		{
			if( this.state.users[j].tx_user_mail === this.state.tx_user_mail ){
				flag_no_crte = 1;
			}
		}
		
		if(flag_no_crte === 1)
		{
			alert("An user with the e-mail address '" + this.state.tx_user_mail + "' already exists. Please provide a different e-mail address.");
		}
		else
		{
			var obj_new_user = { "tx_user_name" : this.state.tx_user_name , "tx_role" : this.state.tx_role , "tx_user_mail" : this.state.tx_user_mail , "tx_stts" : "Active" };
			
			this.setState({ isLoading: true });
			try {
				await this.createUser(obj_new_user);
				const newUser = await Auth.signUp({ username: this.state.tx_user_mail, password: this.state.password });
				this.props.history.push("/useradministration");
			} 
			catch (e) {
				alert(e.message);
			}
			this.setState({ isLoading: false });			
		}
	
	}
	
	//Function to validate form to create new user
	validateForm() {
		return (
			this.state.tx_user_name.length > 0 &&
			this.state.tx_user_mail.length > 0 &&
			this.state.password.length > 0
		);
	}	
	/* END OF HANDLER FUNCTIONS */

	/* BEGINNING OF RENDER FUNCTIONS */
	//Function to render form
	renderForm() {
		var tx_role = getLoggedInUserInfo(this.state.users).tx_role;
		if(tx_role === "Admin")
		{
			return (
				<form onSubmit={this.handleSubmit}>
				<div align='left'> <Link to='/useradministration'> <Button bsStyle="info"> Back </Button> </Link> </div>
				<Table striped bordered condensed hover>
					<thead> <tr> <th> User name </th> <th> Role </th> <th> Email </th> <th> Password </th> </tr> </thead>
					<tr> 
						<td align='left' width="25%" >
							<FormGroup controlId="tx_user_name" bsSize="small">
							<FormControl autoFocus type="text" value={this.state.tx_user_name} onChange={this.handleChange} />
							</FormGroup>
						</td> 
						<td align='left' width="25%" > 
							<FormGroup controlId="tx_role" onChange={this.handleChange}>
								<FormControl componentClass="select" placeholder="select" value={this.state.tx_role} onChange={this.handleChange}>
								<option value="Admin">Admin</option>
								<option value="PM">PM</option>
								<option value="Developer">Developer</option>
								</FormControl>
							</FormGroup>
						</td>
						<td align='left' width="25%" > 
							<FormGroup controlId="tx_user_mail" bsSize="small">
								<FormControl autoFocus type="email" value={this.state.tx_user_mail} onChange={this.handleChange} />
							</FormGroup>
						</td> 
						<td align='left' width="25%" > 
							<FormGroup controlId="password" bsSize="small">
								<FormControl value={this.state.password} onChange={this.handleChange} type="password" />
							</FormGroup>
						</td> 
					</tr>
				</Table> 
				<LoaderButton block bsSize="small" disabled={!this.validateForm()} type="submit" isLoading={this.state.isLoading} text="Create user" loadingText="Creating user ..." />
				</form>
			);
		}
		else
		{
			this.props.history.push("/");
		}
	}
	
	//Method to display web content
	render() {
		return (
			<div className="UserAdministration">
			<PageHeader> New user </PageHeader>
			{!this.state.isLoading && this.renderForm()}
		  </div>
		);
	}
	/* END OF RENDER FUNCTIONS */
}
