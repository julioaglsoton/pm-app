import React, { Component } from "react";
import { HelpBlock, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Login.css";
import { Auth } from "aws-amplify";
import { setCookie } from "../config";

export default class Login extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for Login, with global variables
	constructor(props) {
		super(props);

		this.state = {
			isLoading: false,
			email: "",
			password: "",
			newUser: null,
			confirmationCode: "",
		};
	}
	/* END OF COMPONENT FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to change form variables
	handleChange = event => {
		this.setState({
			[event.target.id]: event.target.value
		});
	}

	//Function to submit form
	handleSubmit = async event => {
		event.preventDefault();

		this.setState({ isLoading: true });

		try {
			await Auth.signIn(this.state.email, this.state.password);
			this.props.userHasAuthenticated(true);
			setCookie("tx_user_mail", this.state.email);
			this.props.history.push("/");
		} catch (e) {
			if(e.message === "User is not confirmed.")
			{
				const newUser = true;
				this.setState({ newUser });
				//alert("Redirect");
			}
			else
			{
				alert(e.message);			
			}
			this.setState({ isLoading: false });
		}
	}

	//Function to sign in and confirm sign up
	handleConfirmationSubmit = async event => {
		event.preventDefault();

		this.setState({ isLoading: true });

		try {
			await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
			await Auth.signIn(this.state.email, this.state.password);
			setCookie("tx_user_mail", this.state.email);
			this.props.userHasAuthenticated(true);
			this.props.history.push("/");
		} catch (e) {
			alert(e.message);
			this.setState({ isLoading: false });
		}
	}
	
	//Function to validate form
	validateForm() {
		return this.state.email.length > 0 && this.state.password.length > 0;
	}
	
	//Function to validate confirmation code form
	validateConfirmationForm() {
		return this.state.confirmationCode.length > 0;
	}	
	/* END OF HANDLER FUNCTIONS */
	
	/* BEGINNING OF RENDER FUNCTIONS */
	//Function to render confirmation window
	renderConfirmationForm() {
		return (
			<form onSubmit={this.handleConfirmationSubmit}>
				<FormGroup controlId="confirmationCode" bsSize="medium">
				<ControlLabel>Confirmation Code</ControlLabel>
				<FormControl autoFocus type="tel" value={this.state.confirmationCode} onChange={this.handleChange} />
				<HelpBlock>Please check your email for the code.</HelpBlock>
				</FormGroup>
				<LoaderButton block bsSize="small" disabled={!this.validateConfirmationForm()} type="submit" isLoading={this.state.isLoading} text="Verify" loadingText="Verifying…" />
			</form>
			);
	}
		
	//Function to render either login function on redirect to confirmation window
	render() {
		return (
			<div className="Login" align="center">
				{this.state.newUser === null ?
					<form onSubmit={this.handleSubmit}>
					<FormGroup controlId="email" bsSize="medium">
						<ControlLabel>Email</ControlLabel>
						<FormControl autoFocus type="email" value={this.state.email} onChange={this.handleChange} />
					</FormGroup>
					<FormGroup controlId="password" bsSize="medium">
						<ControlLabel>Password</ControlLabel>
						<FormControl value={this.state.password} onChange={this.handleChange} type="password" />
					</FormGroup>
					<LoaderButton block bsSize="small" disabled={!this.validateForm()} type="submit" isLoading={this.state.isLoading} text="Login" loadingText="Logging in…" />
					</form>
				: this.renderConfirmationForm()
				}
			</div>
		);
	}
	/* END OF RENDER FUNCTIONS */
}
