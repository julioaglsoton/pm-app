import React, { Component, Fragment } from "react";
import "./UserAdministration.css";
import { API } from "aws-amplify";
import { FormGroup, FormControl, PageHeader, Table, ControlLabel } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { getLoggedInUserInfo, getAssignedProjectsByUser, getQS } from "../config";//NEW

export default class UserAdministration extends Component {
	/* BEGINNING OF COMPONENT FUNCTIONS */
	//Constructor function for UserAdministration, with global variables
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			users: [],
			users_and_projects: []
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

		this.state.users.map(
			(user, i) =>
			{
				try {
					document.getElementById(user.id_user + "|tx_user_name").value = user.tx_user_name;
					document.getElementById(user.id_user + "|tx_stts").value = user.tx_stts;
					document.getElementById(user.id_user + "|tx_role").value = user.tx_role;
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
	
	//Invoke lambda function to get users and projects relationships
	users_and_projects() {
		return API.get("pm", "/list-users-and-projects");
	}
	
	//Invoke lambda function to update users
	updateUser(id_user, user_content) {
		return API.put("pm", "/update-users/" + id_user, {
			body: user_content
		});
	}
	/* END OF LAMBDA FUNCTIONS */
	
	/* BEGINNING OF HANDLER FUNCTIONS */
	//Function to edit users (display edit rows)
	handleEdit = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_user
		document.getElementById("tr|" + infoRow[0] + "|view").style.display = 'none';
		document.getElementById("tr|" + infoRow[0] + "|edit").style.display = 'table-row';
	}

	//Function to cancel editing users
	handleCancel = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_user
		document.getElementById("tr|" + infoRow[0] + "|view").style.display = 'table-row';
		document.getElementById("tr|" + infoRow[0] + "|edit").style.display = 'none';
	}

	//Function to update users
	handleUpdate = async event => {
		var infoRow = event.target.id.split("|");// 0 = id_user
		var flag_no_upde = 0;
		var pbu = [];
		
		//alert("current = " + document.getElementById(infoRow[0] + "|tx_role_current").value + ", new = " + document.getElementById(infoRow[0] + "|tx_role").value + ", user = " + infoRow[0]  + ", projects = " + getAssignedProjectsByUser( infoRow[0], this.state.users_and_projects ).length );//Rol actual -> Rol nuevo
		
		if( document.getElementById(infoRow[0] + "|tx_role_current").value !== document.getElementById(infoRow[0] + "|tx_role").value )
		{
			pbu = getAssignedProjectsByUser( infoRow[0], this.state.users_and_projects );
			if( pbu.length > 0 )
			{
				alert("Before changing the user role, deallocate this user from his current assignments (" + pbu.length + " project(s))");
				flag_no_upde = 1;
			}
		}
		
		if( document.getElementById(infoRow[0] + "|tx_user_name").value.trim() === "" )
		{
			alert("Please provide a new user name");
			flag_no_upde = 1;
		}
		
		if ( flag_no_upde === 0 )
		{
			var obj_upd_user = {
				"tx_user_name" : document.getElementById(infoRow[0] + "|tx_user_name").value.trim() , 
				"tx_role" : document.getElementById(infoRow[0] + "|tx_role").value , 
				"tx_user_mail" : document.getElementById(infoRow[0] + "|tx_user_mail").value , 
				"tx_stts" : document.getElementById(infoRow[0] + "|tx_stts").value 
			};
			
			//alert("infoRow[0] = " + infoRow[0] + ", tx_user_name = " + obj_upd_user.tx_user_name + ", tx_role = " + obj_upd_user.tx_role + ", tx_stts = " + obj_upd_user.tx_stts + ", tx_user_mail = " + obj_upd_user.tx_user_mail);
			
			this.setState({ isLoading: true });
			try {
				await this.updateUser(infoRow[0], obj_upd_user);
				this.props.history.push("/useradministration");
				window.location.reload();
			}
			catch (e) {
				alert(e.message);
			}
			document.getElementById("divMain").style.display = 'none';
			this.setState({ isLoading: false });
		}
	}
	
	//Function to filter users by status
	filterStatus = async event => {
		var selectedStatus = document.getElementById(event.target.id).value;	
		var arry_active = document.getElementsByClassName("Active_tr_status");
		var arry_inactive = document.getElementsByClassName("Inactive_tr_status");
		var arry_tredit = document.getElementsByClassName("tredit");
		var j = 0;

		if( selectedStatus === "All" )
		{
			for(j = 0; j < arry_active.length; j++){
				arry_active[j].style.display = 'table-row';
			}
			for(j = 0; j < arry_inactive.length; j++){
				arry_inactive[j].style.display = 'table-row';
			}
		}
		else
		{
			if( selectedStatus === "Active" )
			{
				for(j = 0; j < arry_active.length; j++){
					arry_active[j].style.display = 'table-row';
				}
				for(j = 0; j < arry_inactive.length; j++){
					arry_inactive[j].style.display = 'none';
				}
			}
			else
			{
				for(j = 0; j < arry_active.length; j++){
					arry_active[j].style.display = 'none';
				}
				for(j = 0; j < arry_inactive.length; j++){
					arry_inactive[j].style.display = 'table-row';
				}
			}
		}
		
		for(j = 0; j < arry_tredit.length; j++){
			arry_tredit[j].style.display = 'none';
		}
	}
	/* END OF HANDLER FUNCTIONS */
	
	/* BEGINNING OF RENDER FUNCTIONS */
	//Function to display table with user information
	drawUsersTable() {
		var tx_role = getLoggedInUserInfo(this.state.users).tx_role;
		var tx_user_mail = getLoggedInUserInfo(this.state.users).tx_user_mail;
		var k = 1;
		if(tx_role === "Admin" || tx_role === "PM" || tx_role === "Developer")
		{
			return <div id='divMain'> <form>
			<PageHeader align="left" id="pageHeader"> <img src="./pmicons/013-paper-plane.png" class="pmsmallicons" alt="" /> { tx_role === "Admin" ? "User administration" : "My info" } </PageHeader>
			{ tx_role === "Admin" ? 
				<div> <Table striped bordered condensed hover> <tr> 
					<td align='left' width="50%"> <Link to='/signup'> <Button bsStyle="success"> New user </Button> </Link> </td> 
					<td align='right' width="50%"> 
						<FormGroup controlId="ddl_role" bsSize="small" >
						<ControlLabel>Select user status</ControlLabel>
						<FormControl componentClass="select" placeholder="select" onChange={this.filterStatus} >
							<option value="All">All</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</FormControl>
						</FormGroup> 
					</td> 
				</tr> </Table> </div>
			: "" }
			<div align='center'> <Table striped bordered condensed hover>
				<thead class="tHeadUsers"> <tr> 
					<th> # </th> <th> User name </th> 
					{ tx_role === "Admin" ? 
						<Fragment>
						<th> Role </th> <th> Email </th> <th> Status </th>
						</Fragment>
					: "" }
				<th> Edit </th> </tr> </thead>
				{ this.state.users.sort( function(a, b) {if(a.tx_user_name < b.tx_user_name) { return -1; } if(a.tx_user_name > b.tx_user_name) { return 1; } return 0; } )
					.map( (user, i) =>
						<Fragment>
						{ ( tx_role === "Admin" && ( ( getQS('user') !== "" && user.id_user === getQS('user') ) || ( getQS('user') === "" || getQS('user') === null ) ) || ( tx_role !== "Admin" && user.tx_user_mail === tx_user_mail ) ) ? 
							<Fragment>
								<tr class={user.tx_stts + "_tr_status trUsers"} id={'tr|' + user.id_user + '|view'}>
									<td width="5%"> {k} </td> 
									<td align='left' width="25%" id={user.id_user + "|tr_user_name"}> {user.tx_user_name} </td> 
									{ tx_role === "Admin" ? 
									<Fragment>
										<td align='left' width="20%" id={user.id_user + "|tr_role"}> {user.tx_role} </td> 
										<td align='left' width="25%" id={user.id_user + "|tr_user_mail"}> {user.tx_user_mail} </td> 
										<td align='left' width="10%" id={user.id_user + "|tr_stts"}> {user.tx_stts} </td>
									</Fragment>
									: "" }
									<td align='left' width="20%"> <Button id={user.id_user + "|" + user.tx_user_name + "|" + user.tx_role + "|" + user.tx_user_mail + "|" + user.tx_stts} onClick={this.handleEdit} bsStyle="info"> Edit </Button> </td>
								</tr>
								<tr id={'tr|' + user.id_user + '|edit'} class={user.tx_stts + "_tr_status tredit trUsers"} >
									 <td width="5%"> {k++} </td>
										<td align='left' width="25%"> 
											<FormGroup controlId={user.id_user + "|tx_user_name"} bsSize="small">
												<FormControl autoFocus type="text" />
											</FormGroup>
											<input type="hidden" id={user.id_user + "|tx_role_current"} value={user.tx_role} />
											
											{ tx_role === "PM" || tx_role === "Developer" ? 
											<Fragment> <input type="hidden" id={user.id_user + "|tx_role"} value={user.tx_role} /> <input type="hidden" id={user.id_user + "|tx_user_mail"} value={user.tx_user_mail} /> <input type="hidden" id={user.id_user + "|tx_stts"} value={user.tx_stts} /> </Fragment>
											: "" }
										</td>
										{ tx_role === "Admin" ? 
										<Fragment>
											<td align='left' width="20%">
												<FormGroup controlId={user.id_user + "|tx_role"} bsSize="small">
													<FormControl componentClass="select" placeholder="select" >
														<option value="Admin">Admin</option>
														<option value="PM">PM</option>
														<option value="Developer">Developer</option>
													</FormControl>
												</FormGroup>
											</td>
											<td align='left' width="25%"> <input type="hidden" id={user.id_user + "|tx_user_mail"} value={user.tx_user_mail} /> {user.tx_user_mail} </td>
											<td align='left' width="10%">
												{ user.tx_role !== "Admin" ? 
													<FormGroup controlId={user.id_user + "|tx_stts"} bsSize="small">
														<FormControl componentClass="select" placeholder="select" >
															<option value="Active">Active</option>
															<option value="Inactive">Inactive</option>
														</FormControl>
													</FormGroup>
												: <div> <input type="hidden" id={user.id_user + "|tx_stts"} value={user.tx_stts} /> {user.tx_stts} </div> }
											</td>
										</Fragment>
										: "" }
										<td align='left' width="20%"> <Button id={user.id_user + "|cancel"} onClick={this.handleCancel} bsStyle="danger"> Cancel </Button> <Button id={user.id_user + "|update"} onClick={this.handleUpdate} bsStyle="primary"> Update </Button> </td>
								</tr>
							</Fragment>
						: "" }
						</Fragment>
					)
				}
			</Table> </div>
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
		  <div className="UserAdministration">
			{!this.state.isLoading && this.drawUsersTable()}
		  </div>
		);
	}	
	/* END OF RENDER FUNCTIONS */
	
}
