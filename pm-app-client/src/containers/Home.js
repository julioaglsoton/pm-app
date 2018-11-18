import React, { Component } from "react";
import { PageHeader, Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import "./Home.css";
import { getLoggedInUserInfo } from "../config";
import { Auth } from "aws-amplify";
import { setCookie, searchUsers, searchProjects } from "../config";

export default class Home extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for Home, with global variables
	constructor(props)
	{
		super(props);

		this.state = {
			isLoading: true,
			users: [],
			projects: []
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
			const projects = await this.projects();
			this.setState({ projects });
		} catch (e) {
			alert(e);
		}

		this.setState({ isLoading: false });

		//If the user is inactive, the system log out the user and redirect him to the login page
		if( getLoggedInUserInfo(this.state.users).tx_stts === "Inactive" )
		{
			alert("Your account is currently inactive, please ask the administrator to activate your account");
			await Auth.signOut();
			this.props.userHasAuthenticated(false);
			setCookie("tx_user_mail", "");
			this.props.history.push("/login");			
		}	
	}
	/* END OF COMPONENT FUNCTIONS */

	/* BEGINNING OF LAMBDA FUNCTIONS */
	//Invoke lambda function to get users
	users() {
		return API.get("pm", "/list-users");
	}
	
	//Invoke lambda function to get projects
	projects() {
		return API.get("pm", "/list-projects");
	}
	/* END OF LAMBDA FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to search users and projects
	handleSearch = async event => {
		var txt_srch_vlue = document.getElementById("txt_search").value.trim();
		var users_found = searchUsers(txt_srch_vlue, this.state.users);
		var projects_found = searchProjects(txt_srch_vlue, this.state.projects);
		var j = 0;
		var str_html = "";
		
		if( users_found.length === 0 && projects_found.length === 0 )
		{
			str_html = "The systems did not find any users nor projects.";
		}
		else
		{
			for(j = 0; j < users_found.length; j++)
			{
				if(j === 0) {
					str_html += "Users found: <ul>";
				}
				str_html += "<li> <a href='/userAdministration?user=" + users_found[j].id_user + "'>" + users_found[j].tx_user_name + "</a> </li>";
				if(j === ( users_found.length - 1 )) {
					str_html += "</ul>";
				}
			}
			for(j = 0; j < projects_found.length; j++) {
				if(j === 0) {
					str_html += "Projects found: <ul>";
				}
				str_html += "<li> <a href='/projectAdministration?project=" + projects_found[j].id_prjt + "'>" + projects_found[j].tx_prjt_name + "</a> </li>";
				if(j === ( users_found.length - 1 )) {
					str_html += "</ul>";
				}
			}
		}
		document.getElementById("divResults").innerHTML = str_html;
	}
	/* END OF HANDLER FUNCTIONS */

	/* BEGINNING OF RENDER FUNCTIONS */
	//Render table considering user role
	renderUserLinks() 
	{
		var tx_role = getLoggedInUserInfo(this.state.users).tx_role;
		if(tx_role === "Admin")
		{//Admin links
			return <div>
				<Table striped bordered condensed hover>
				  <tbody>
					<tr>
					  <td align='center' width="33%"> <Link to={'/useradministration'}> User administration panel </Link> <div> <Link to={'/useradministration'}> <img src="./pmicons/001-profile.png" class="pmicons" alt="" /> </Link> </div> </td>
					  <td align='center' width="33%"> <Link to={'/projectadministration'}> Project administration panel </Link> <div> <Link to={'/projectadministration'}> <img src="./pmicons/007-office.png" class="pmicons" alt="" /> </Link> </div> </td>
					  <td align='center' width="33%"> <Link to={'/assignationprojects'}> Project staffing </Link> <div> <Link to={'/assignationprojects'}> <img src="./pmicons/029-diagram.png" class="pmicons" alt="" /> </Link> </div> </td>
					</tr>
				  </tbody>
				</Table>
				<Table striped bordered condensed hover> <tr> <td align='left'> <div id='divSearch'> Search users or projects by name: <input type='text' id="txt_search" /> <Button onClick={this.handleSearch} bsStyle="primary"> Search </Button> </div> <div id='divResults'> </div> </td> </tr> </Table>
			</div>;
		}
		else
		{
			if(tx_role === "PM")
			{//PM links
				return <div>
					<Table striped bordered condensed hover>
					  <tbody>
						<tr>
						  <td align='center' width="33%"> <Link to={'/projectadministration'}> Project tracking </Link> <div> <Link to={'/projectadministration'}> <img src="./pmicons/007-office.png" class="pmicons" alt="" /> </Link> </div> </td>
						  <td align='center' width="33%"> <Link to={'/assignationprojects'}> Project staffing </Link> <div> <Link to={'/assignationprojects'}> <img src="./pmicons/029-diagram.png" class="pmicons" alt="" /> </Link> </div></td>
						  <td align='center' width="33%"> <Link to={'/useradministration'}> User administration panel </Link> <div> <Link to={'/useradministration'}> <img src="./pmicons/001-profile.png" class="pmicons" alt="" /> </Link> </div> </td>
						</tr>
					  </tbody>
					</Table>
				</div>;
			}
			else
			{
				if(tx_role === "Developer")
				{//Developer links
					return <div>
						<Table striped bordered condensed hover>
						  <tbody>
							<tr>
							  <td align='center' width="50%"> <Link to={'/projectadministration'}> My projects </Link> <div> <Link to={'/projectadministration'}> <img src="./pmicons/007-office.png" class="pmicons" alt="" /> </Link> </div> </td>
							  <td align='center' width="50%"> <Link to={'/useradministration'}> User administration panel </Link> <div> <Link to={'/useradministration'}> <img src="./pmicons/001-profile.png" class="pmicons" alt="" /> </Link> </div> </td>
							</tr>
						  </tbody>
						</Table>
					</div>;
				}
			}
		}
	}

	//Function to display home page (when the user is not logged in)
	renderLander() {
		return (
			<div className="lander">
			<h1>Project Management Application</h1>
			<img src="./inicio.png" alt="" />
			</div>
		);
	}

	//Function to display welcome panel and render specific links according to the role of the logged in user
	renderUser() {
		return (
			<div className="users">
			{ this.state.isLoading ? "" : <div> <table width="100%"> <tr> <td> <PageHeader align="left" id="pageHeader"> Hi {getLoggedInUserInfo(this.state.users).tx_user_name}! </PageHeader> </td> <td> <div align="right" id="divRole"> <img src="./users.png" alt="" /> {getLoggedInUserInfo(this.state.users).tx_role} </div> </td> </tr> </table> </div> }
			{!this.state.isLoading && this.renderUserLinks()}
			</div>
		);
	}

	//Method to display web content
	render() {
		return (
			<div className="Home">
			{this.props.isAuthenticated ? this.renderUser() : this.renderLander()}
			</div>
		);
	}
	/* END OF RENDER FUNCTIONS */
}
