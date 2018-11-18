import React, { Component, Fragment } from "react";
import "./AssignationProjects.css";
import { API } from "aws-amplify";
import { FormGroup, FormControl, PageHeader, Table, ControlLabel, Button, Modal } from "react-bootstrap";
import { getLoggedInUserInfo, getSpecificUserType } from "../config";//NEW

export default class AssignationProjects extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for AssignationProjects, with global variables
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			users: [],
			projects: [],
			users_and_projects: [],
			projects_by_user: [],
			array_projects_by_user: [],
			pms: [],
			developers: [],
			flag_ac: "",
			modal_parameters: ""
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
			const users_and_projects = await this.users_and_projects();
			this.setState({ users_and_projects });
			const projects_by_user = await this.projects_by_user();
			this.setState({ projects_by_user });
			for(var k = 0; k < this.state.projects_by_user.length; k++)
			{
				this.state.array_projects_by_user.push(this.state.projects_by_user[k].id_prjt);
			}
		} catch (e) {
			alert(e);
		}

		this.setState({ isLoading: false });
		
		//Get PM's and Developers
		this.state.users.map(
			(user, i) =>
			{
				if(user.tx_role === "PM"){
					this.state.pms.push(user);
				}
				else if(user.tx_role === "Developer"){
					this.state.developers.push(user);
				}
			}
		)
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
	
	//Invoke lambda function to get users and projects relationships
	users_and_projects() {
		return API.get("pm", "/list-users-and-projects");
	}
	
	//Invoke lambda function to projects by specific user
	projects_by_user() {
		return API.get("pm", "/get-projects-by-user/" + getLoggedInUserInfo(this.state.users).id_user);
	}
	
	//Invoke lambda function to delete users and projects relationships
	deleteUserProject(id_prjt, id_user) 
	{
		return API.del("pm", "/delete-users-and-projects/" + id_prjt + "/" + id_user);
	}
	
	//Invoke lambda function to create users and projects relationships
	createUserProject(obj_user_prjt) 
	{
		return API.post("pm", "/create-users-and-projects/", { body: obj_user_prjt });
	}
	/* END OF LAMBDA FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to redirect the add and change function to the modal window; delete function
	handleChanges = async event => {		
		var infoRow = event.target.id.split("|");// 0 = id_prjt ; 1 = action (add, change, delete) ; 2 = user_type ; 3 = id_user (on change (to delete) or on delete)
		
		//Decision 
		if(infoRow[1] === "add")
		{
			this.state.modal_parameters = infoRow;
			this.state.flag_ac = "add";
			this.handleShow();
		}
		else
		{
			if(infoRow[1] === "change")
			{
				this.state.modal_parameters = infoRow;
				this.state.flag_ac = "change";
				this.handleShow();
			}
			else
			{
				if(infoRow[1] === "delete")
				{
					const confirmed = window.confirm("Are you sure you want to delete this contributor from the project?");
					if (!confirmed) {
						return;
					}
					try {
						await this.deleteUserProject(infoRow[0], infoRow[3]);
						window.location.reload();
					} 
					catch (e) {
						alert(e);
					}
				}
			}
		}
	}
	
	//Function to add or change an assignment
	handleAddChange = async event => {
		var infoRow = this.state.modal_parameters;// 0 = id_prjt ; 1 = action (add, change, delete) ; 2 = user_type ; 3 = id_user (on change (to delete) or on delete)
		var obj_user_prjt = { "id_prjt" : infoRow[0] , "id_user" : document.getElementById("ddl_user_name").value };//

		if( infoRow[2] === "Developer" )
		{//Only create
			await this.createUserProject(obj_user_prjt);
			window.location.reload();
		}
		else
		{//PM's
			if(infoRow[1] === "add")
			{//Only create
				this.setState({ show: false });
				await this.createUserProject(obj_user_prjt);
				window.location.reload();
			}
			else
			{//Change
				//Delete and create
				this.setState({ show: false });
				await this.deleteUserProject(infoRow[0], infoRow[3]);
				await this.createUserProject(obj_user_prjt);
				window.location.reload();
			}
		}
		//window.location.reload();
	}
	
	//Function to show modal window
	handleShow = async event => {
		this.setState({ show: true });
	}
	
	//Function to close modal window
	handleClose = async event => {
		this.setState({ show: false });
	}
	/* END OF HANDLER FUNCTIONS */
	
	/* BEGINNING OF RENDER FUNCTIONS */
	//Function to show add, change or remove items for each project
	getSpecificUserByProject(id_prjt, user_type, tx_role_excn) {
		//Get all users by project
		var arrayUsers = [];
		var flagNotFound = 0;
		var i = 0;
		for(i = 0; i < this.state.users_and_projects.length; i++)
		{
			if( this.state.users_and_projects[i].id_prjt === id_prjt )
			{
				arrayUsers.push(this.state.users_and_projects[i].id_user);
			}
		}
		
		//Find role per user Found	
		if(arrayUsers.length === 0)
		{
			flagNotFound = 1;
		}
		else
		{
			//return <p> Puede haber PM </p>;
			var userFound = "";
			var arrayPMorDevelopers = [];
			for(i = 0; i < arrayUsers.length; i++)
			{
				var roleAndIndex = getSpecificUserType(this.state.users, arrayUsers[i]);
				if( ( user_type === "PM" && roleAndIndex.tx_role === "PM" ) || ( user_type === "Developer" && roleAndIndex.tx_role === "Developer" ) )
				{
					//alert( "\n id_prjt = " + id_prjt + "\n arrayUsers de i = " + arrayUsers[i] + "\n role de i = " + this.state.users[i].tx_role + "\n role de nu_indx = " + this.state.users[roleAndIndex.nu_indx].tx_role + "\n getSpecificUserType de i = " + getSpecificUserType(this.state.users, arrayUsers[i]).tx_role + "\n i de i = " + i + "\n roleAndIndex = " + roleAndIndex.nu_indx );
					arrayPMorDevelopers.push( this.state.users[roleAndIndex.nu_indx] );
				}
			}
			if( arrayPMorDevelopers.length === 0 )
			{
				flagNotFound = 1;
			}
			else
			{
				if(user_type === "PM")
				{
					if(tx_role_excn === "Admin")
					{
						return <div> { arrayPMorDevelopers[0].tx_user_name } <br/> <Button id={id_prjt + "|change|" + user_type + "|" + arrayPMorDevelopers[0].id_user} bsStyle="info" bsSize="xsmall" onClick={this.handleChanges} > Change {user_type} </Button> <Button id={id_prjt + "|delete|" + user_type + "|" + arrayPMorDevelopers[0].id_user} bsStyle="danger" bsSize="xsmall" onClick={this.handleChanges} > Remove </Button> </div>;
					}
					else
					{
						return <div> { arrayPMorDevelopers[0].tx_user_name } </div>;
					}
				}
				else
				{
					return <div>
					{
						arrayPMorDevelopers.map( (user, i) =>
							<div id={"div|" + id_prjt + "|" + arrayPMorDevelopers[i].id_user}> * { arrayPMorDevelopers[i].tx_user_name } <Button id={id_prjt + "|delete|" + user_type + "|" + arrayPMorDevelopers[i].id_user} bsStyle="danger" bsSize="xsmall" onClick={this.handleChanges} > Remove </Button> </div>
						)
					}
					<br/> <Button id={id_prjt + "|add|" + user_type} bsStyle="primary" bsSize="xsmall" onClick={this.handleChanges} > Add {user_type} </Button>
					</div>;
				}
			}
		}
		
		if(flagNotFound === 1)
		{//id_prjt, user_type
			return <Button id={id_prjt + "|add|" + user_type} bsStyle="primary" bsSize="xsmall" onClick={this.handleChanges}> Add {user_type} </Button>;
		}
	}
	
	//Function to fill dropdown with users to add
	fillDropDown = async event => {
		var arrayFill = [];
		var infoRow = this.state.modal_parameters;// 0 = id_prjt ; 1 = action (add, change, delete) ; 2 = user_type ; 3 = id_user (on change (to delete) or on delete)
		
		if(infoRow[2] === "Developer")
		{//Developer
			arrayFill = this.state.developers;
		}
		else
		{//PM's
			arrayFill = this.state.pms;
		}
		
		for(var j = 0; j < arrayFill.length; j++)
		{
			var userOption = document.createElement("option");
			userOption.text = arrayFill[j].tx_user_name;
			userOption.value = arrayFill[j].id_user;
			document.getElementById("ddl_user_name").add(userOption);
		}
	}
	
	//Draw table
	drawAssignationProjects() {
		var tx_role = getLoggedInUserInfo(this.state.users).tx_role;
		var k = 1;
		if(tx_role === "Admin" || tx_role === "PM")
		{
			return <div id='divMain'> <form>
			<PageHeader align="left" id="pageHeader"> <img src="./pmicons/006-files.png" class="pmsmallicons" alt="" /> Project Staffing </PageHeader>
			<Table striped bordered condensed hover>
				<thead class="tHeadStaffing"> <tr> <th> # </th> <th> Project name </th> <th> Project Manager </th> <th> Developers </th> </tr> </thead>
				{
					this.state.projects.sort( function(a, b) {if(a.tx_prjt_name < b.tx_prjt_name) { return -1; } if(a.tx_prjt_name > b.tx_prjt_name) { return 1; } return 0; } ).map(
						(project, i) =>
							<Fragment> 
							{ ( tx_role === "Admin" || this.state.array_projects_by_user.indexOf(project.id_prjt) >= 0 ) ? 
								<Fragment bordered>
									<tr class="trStaffing">
										<td> {k++} </td>
										<td align='left' class='tdborder' valign='top'> { project.tx_prjt_name } </td> 
										<td align='left' class='tdborder' valign='top'> { this.getSpecificUserByProject(project.id_prjt, "PM", tx_role) } </td>
										<td align='left' class='tdborder' valign='top'> { this.getSpecificUserByProject(project.id_prjt, "Developer", tx_role) } </td>
									</tr>
								</Fragment>
							: "" }
							</Fragment>
					)
				}
			</Table>
			
			<Modal show={this.state.show} onHide={this.handleClose} onShow={this.fillDropDown}>
				<Modal.Header closeButton>
					<Modal.Title> {this.state.flag_ac === "change" ? "Change PM" : "New contributor"} </Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<FormGroup controlId="ddl_user_name" bsSize="small">
						<ControlLabel> {this.state.flag_ac === "change" ? "Select PM" : "Select contributor"} </ControlLabel>
						<FormControl componentClass="select" placeholder="select">
							
						</FormControl>
					</FormGroup>
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="primary" onClick={this.handleAddChange}> {this.state.flag_ac === "change" ? "Change" : "Add"} </Button>
					<Button onClick={this.handleClose}>Close</Button>
				</Modal.Footer>
			</Modal>
			
			</form> </div>;
		}
		else
		{
			this.props.history.push("/");
		}
	}
	
	//Method to display web content
	render() {
		return (
		  <div className="AssignationProjects">
			{!this.state.isLoading && this.drawAssignationProjects()}
		  </div>
		);
	}
	/* END OF RENDER FUNCTIONS */
}
