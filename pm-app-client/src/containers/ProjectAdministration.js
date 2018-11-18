import React, { Component, Fragment } from "react";
import "./ProjectAdministration.css";
import { API } from "aws-amplify";
import { FormGroup, FormControl, PageHeader, Table, ControlLabel, Button, Modal } from "react-bootstrap";
import { getLoggedInUserInfo, getAssignedProjectsByProject, getQS } from "../config";//NEW

export default class ProjectAdministration extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for ProjectAdministration, with global variables
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			users: [],
			projects: [],
			projects_by_user: [],
			array_projects_by_user: [],
			tx_new_prjt: "",
			show: false
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
			const projects_by_user = await this.projects_by_user();
			this.setState({ projects_by_user });
			for(var k = 0; k < this.state.projects_by_user.length; k++)
			{
				this.state.array_projects_by_user.push(this.state.projects_by_user[k].id_prjt);
			}
			const users_and_projects = await this.users_and_projects();
			this.setState({ users_and_projects });
		} catch (e) {
			alert(e);
		}

		this.setState({ isLoading: false });
		
		//Hide edit columns
		var tredit = document.getElementsByClassName("tredit");
		for (var i = 0; i < tredit.length; i++) {
			tredit[i].style.display = "none";
		}

		this.state.projects.map(
			(project, i) =>
			{
				try {
					document.getElementById(project.id_prjt + "|tx_prjt_name").value = project.tx_prjt_name;
					document.getElementById(project.id_prjt + "|tx_stts").value = project.tx_stts;
				} catch (e) {
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
	
	//Invoke lambda function to get project relationships by an specific user
	projects_by_user() {
		return API.get("pm", "/get-projects-by-user/" + getLoggedInUserInfo(this.state.users).id_user);
	}

	//Invoke lambda function to get users and projects relationships
	users_and_projects() {
		return API.get("pm", "/list-users-and-projects");
	}
	
	//Invoke lambda function to create a project
	createProject(prjt) {
		return API.post("pm", "/create-projects/", {
			body: prjt
		});
	}
	
	//Invoke lambda function to delete a project
	deleteProject(id_prjt) {
		return API.del("pm", "/delete-projects/" + id_prjt + "");
	}
	
	//Invoke lambda function to update a project
	updateProject(id_prjt, user_content) {
		return API.put("pm", "/update-projects/" + id_prjt, {
			body: user_content
		});
	}	
	/* END OF LAMBDA FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to create a new project
	handleCreate = async event => {
		var new_prjt_name = document.getElementById("tx_new_prjt").value.trim();
		if( new_prjt_name === "")
		{
			alert("Please provide a project name");
		}
		else
		{
			var obj_new_prjt = { "tx_prjt_name" : new_prjt_name , "tx_stts" : "Commencing" };//
			
			this.setState({ isLoading: true });
			try {
				await this.createProject(obj_new_prjt);
				this.props.history.push("/projectadministration");
				window.location.reload();
			} 
			catch (e) {
				alert(e.message);
			}
		}
	}

	//Function to handle change values in form inputs
	handleChange = event => {
		this.setState({
			[event.target.id]: event.target.value
		});
	}
	
	//Function to show edit projects options
	handleEdit = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_prjt
		document.getElementById("tr|" + infoRow[0] + "|view").style.display = 'none';
		document.getElementById("tr|" + infoRow[0] + "|edit").style.display = 'table-row';
	}

	//Function to show cancel editing
	handleCancel = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_prjt
		document.getElementById("tr|" + infoRow[0] + "|view").style.display = 'table-row';
		document.getElementById("tr|" + infoRow[0] + "|edit").style.display = 'none';
	}

	//Function to show delete projects
	handleDelete = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_prjt
		var ubp = [];
		
		ubp = getAssignedProjectsByProject( infoRow[0], this.state.users_and_projects );
		
		if(ubp.length > 0)
		{
			alert("Before deleting this project, deallocate the corresponding users from the project  (" + ubp.length + " user(s))");
		}
		else
		{
			const confirmed = window.confirm("Are you sure you want to delete this project?");
			if (!confirmed) {
				return;
			}
			try {
				document.getElementById('tr|' + infoRow[0] + '|view').remove();
				document.getElementById('tr|' + infoRow[0] + '|edit').remove();
				await this.deleteProject(infoRow[0]);
			} 
			catch (e) {
				alert(e);
			}
		}
	}
	
	//Function to show update projects
	handleUpdate = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_prjt
		if( document.getElementById(infoRow[0] + "|tx_prjt_name").value.trim() === "" )
		{
			alert("Please provide a new project name");
		}
		else
		{
			var obj_upd_user = {
				"tx_prjt_name" : document.getElementById(infoRow[0] + "|tx_prjt_name").value.trim() , 
				"tx_stts" : document.getElementById(infoRow[0] + "|tx_stts").value 
			};
			
			this.setState({ isLoading: true });
			try {
				await this.updateProject(infoRow[0], obj_upd_user);
				this.props.history.push("/projectadministration");
				window.location.reload();
			} 
			catch (e) {
				alert(e.message);
			}		
			document.getElementById("divMain").style.display = 'none';
			this.setState({ isLoading: false });
		}
	}

	//Function to show modal window
	handleShow = async event => {
		this.setState({ show: true });
	}
	
	//Function to close modal window
	handleClose = async event => {
		this.setState({ show: false });
	}
	
	//Function to filter projects by status
	filterStatus = async event => {
		var selectedStatus = document.getElementById(event.target.id).value;	
		var arry_tredit = document.getElementsByClassName("tredit");
		var arry_trs = [];
		var arry_stts = ['Commencing', 'Active', 'Stand-By', 'Completed', 'Cancelled']
		var j = 0;
		var k = 0;
				
		if( selectedStatus === "All" )
		{
			for(j = 0; j < arry_stts.length; j++)
			{
				arry_trs = document.getElementsByClassName(arry_stts[j] + "_tr_status");
				for(k = 0; k < arry_trs.length; k++){
					arry_trs[k].style.display = 'table-row';
				}
			}
		}
		else
		{
			for(j = 0; j < arry_stts.length; j++)
			{
				arry_trs = document.getElementsByClassName(arry_stts[j] + "_tr_status");
				for(k = 0; k < arry_trs.length; k++)
				{
					console.log("arry_stts de j = " + arry_stts[j] + ", selectedStatus = " + selectedStatus + ", arry_trs = " + arry_trs[k]);
					if(arry_stts[j] === selectedStatus) {
						arry_trs[k].style.display = 'table-row';
					}
					else {
						arry_trs[k].style.display = 'none';
					}
				}
			}
		}

		for(j = 0; j < arry_tredit.length; j++){
			arry_tredit[j].style.display = 'none';
		}
	}	
	/* END OF HANDLER FUNCTIONS */
	
	/* BEGINNING OF RENDER FUNCTIONS */
	//Function to render table with projects
	drawProjectsTable() {
		//alert(this.state.array_projects_by_user.length);
		var tx_role = getLoggedInUserInfo(this.state.users).tx_role;
		var k = 1;
		if(tx_role === "Admin" || tx_role === "PM" || tx_role === "Developer")
		{
			return <div id='divMain'> <form>
			<PageHeader align="left" id="pageHeader"> <img src="./pmicons/030-diagram.png" class="pmsmallicons" alt="" /> { tx_role === "Admin" ? "Project administration" : ( tx_role === "PM" ? "Project tracking" : "My projects" ) } </PageHeader>
			{ tx_role === "Admin" ? 
			<div> 
				<Table striped bordered condensed hover> <tr> 
					<td align='left' width="50%"> <Button bsStyle="success" onClick={this.handleShow} > New project </Button> </td>
					<td align='right' width="50%"> 
						<FormGroup controlId="ddl_status" bsSize="small">
							<ControlLabel>Select project status</ControlLabel>
							<FormControl componentClass="select" placeholder="select" onChange={this.filterStatus} >
								<option value="All">All</option>
								<option value="Commencing">Commencing</option>
								<option value="Active">Active</option>
								<option value="Stand-By">Stand-By</option>
								<option value="Completed">Completed</option>
								<option value="Cancelled">Cancelled</option>
							</FormControl>
						</FormGroup>
					</td> 
			</tr> </Table> </div>
			: "" }
			<Table striped bordered condensed hover>
				<thead class="tHeadProjects"> <tr> <th> # </th> <th> Project name </th> <th> Status </th> { tx_role === "Admin" || tx_role === "PM" ? <th> Edit </th> : "" } </tr> </thead>
				{ 
					this.state.projects.sort( function(a, b) {if(a.tx_prjt_name < b.tx_prjt_name) { return -1; } if(a.tx_prjt_name > b.tx_prjt_name) { return 1; } return 0; } ).map(
						(project, i) =>
							<Fragment> 
							{ ( tx_role === "Admin" && ( ( getQS('project') !== "" && project.id_prjt === getQS('project') ) || ( getQS('project') === "" || getQS('project') === null ) ) || ( tx_role !== "Admin" && this.state.array_projects_by_user.indexOf(project.id_prjt) >= 0 ) ) ? 
								<Fragment>
									<tr class={project.tx_stts + "_tr_status trProjects"} id={'tr|' + project.id_prjt + '|view'}>
										<td width="5%"> {k} </td> 
										<td align='left' width="25%" id={project.id_prjt + "|tr_prjt_name"}> {project.tx_prjt_name} </td> 
										<td align='left' width="10%" id={project.id_prjt + "|tr_stts"}> {project.tx_stts} </td> 
										{ tx_role === "Admin" || tx_role === "PM" ?
											<td align='left' width="20%">
												<Button id={project.id_prjt + "|" + project.tx_prjt_name + "|" + project.tx_stts} onClick={this.handleEdit} bsStyle="info"> Edit </Button> 
											{ tx_role === "Admin" ?
												<Button id={project.id_prjt + "|" + project.tx_prjt_name + "|" + project.tx_stts + "|delete"} onClick={this.handleDelete} bsStyle="danger"> Delete </Button>
											: "" }
											</td>
										: "" }
									</tr>
									<tr id={'tr|' + project.id_prjt + '|edit'} class={project.tx_stts + "_tr_status tredit trProjects"} >
										 <td> {k++} </td>
											<td align='left'> 
												{ tx_role === "Admin" ? 
												<FormGroup controlId={project.id_prjt + "|tx_prjt_name"} bsSize="small">
													<FormControl autoFocus type="text" className='formInput' />
												</FormGroup> 
												: <div> {project.tx_prjt_name} <input type="hidden" id={project.id_prjt + "|tx_prjt_name"} /> </div>
												}
											</td> 
											<td align='left'>
												<FormGroup controlId={project.id_prjt + "|tx_stts"} bsSize="small">
													<FormControl componentClass="select" placeholder="select" >
														<option value="Commencing">Commencing</option>
														<option value="Active">Active</option>
														<option value="Stand-By">Stand-By</option>
														<option value="Completed">Completed</option>
														<option value="Cancelled">Cancelled</option>
													</FormControl>
												</FormGroup>
											</td>
											<td align='left'> <Button id={project.id_prjt + "|cancel"} onClick={this.handleCancel} bsStyle="danger"> Cancel </Button> <Button id={project.id_prjt + "|update"} onClick={this.handleUpdate} bsStyle="primary"> Update </Button> </td>
									</tr>
								</Fragment>
						: "" }
						</Fragment>
					)
				}
			</Table>
			
			<Modal show={this.state.show} onHide={this.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title> New project </Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<FormGroup controlId="tx_new_prjt" bsSize="small">
						<ControlLabel> Project name </ControlLabel>
						<FormControl autoFocus type="text" value={this.state.tx_new_prjt} onChange={this.handleChange} />
					</FormGroup>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.handleCreate} bsStyle="primary">Create</Button>
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
		  <div className="ProjectAdministration">
			{!this.state.isLoading && this.drawProjectsTable()}
		  </div>
		);
	}
	/* END OF RENDER FUNCTIONS */
}
