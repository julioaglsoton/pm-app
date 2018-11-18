//Global variables
export default 
{
  s3: {
    REGION: "us-east-2",
    BUCKET: "pm-app-jagl-usca2018"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://6ow3xl1ddc.execute-api.us-east-2.amazonaws.com/prod"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_gfIDRIztA",
    APP_CLIENT_ID: "63gs4osh3h3817a36bn1kjqpvs",
    IDENTITY_POOL_ID: "us-east-2:d23445ff-18cd-4675-a95b-4ac1e58793f9"
  }
};

/* ********************************************************* */
/* Functions used across the entire applications */
/* ********************************************************* */

// Function to get information of the logged user, returns an object
export function getLoggedInUserInfo(users)
{
	var id_user = "";
	var tx_role = "";
	var tx_stts = "";
	var tx_user_mail = "";
	var tx_user_name = "";
	
    for (var i = 0; i < users.length; i++) 
	{
		if (users[i].tx_user_mail === getCookie("tx_user_mail"))	
		{
			id_user = users[i].id_user;
			tx_role = users[i].tx_role;
			tx_stts = users[i].tx_stts;
			tx_user_mail = users[i].tx_user_mail;
			tx_user_name = users[i].tx_user_name;
			break;
        }
	}
	var userInfo = {
		"id_user" : id_user , 
		"tx_role" : tx_role , 
		"tx_stts" : tx_stts , 
		"tx_user_mail" : tx_user_mail , 
		"tx_user_name" : tx_user_name 
	};
	return userInfo;
}

// Function to get the role of a specific user and the corresponding index position in the given array
export function getSpecificUserType(users, specificUser)
{
	var tx_role = "";
	var i = 0;
    for (i = 0; i < users.length; i++) 
	{
		if (users[i].id_user === specificUser)	
		{
			tx_role = users[i].tx_role;
			break;
		}
	}
	
	var roleAndIndex = {
		"nu_indx" : i, 
		"tx_role" : tx_role
	};
	
	return roleAndIndex;
}

// Function to get a query string parameter of a given url
export function getQS( field, url ) {
	var href = url ? url : window.location.href;
	var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
	var string = reg.exec(href);
	return string ? string[1] : null;
	//Code obtained in https://stackoverflow.com/questions/9870512/how-to-obtain-the-query-string-from-the-current-url-with-javascript
};

// Function to obtain users which name is similar to the parameter value passed in the function. This function is case sensitive
export function searchUsers(user, users)
{
	var i = 0;
	var users_found = []
    for (i = 0; i < users.length; i++) 
	{
		if( users[i].tx_user_name.indexOf(user) >= 0)
		{
			users_found.push(users[i]);
		}
	}
	return users_found;
}

// Function to obtain projects which name is similar to the parameter value passed in the function. This function is case sensitive
export function searchProjects(project, projects)
{
	var i = 0;
	var projects_found = []
    for (i = 0; i < projects.length; i++) 
	{
		if( projects[i].tx_prjt_name.indexOf(project) >= 0)
		{
			projects_found.push(projects[i]);
		}
	}
	return projects_found;
}

// Function to get all the projects a user is assigned to
export function getAssignedProjectsByUser(user, users_and_projects)
{
	var i = 0;
	var projects = []
    for (i = 0; i < users_and_projects.length; i++) 
	{
		if( users_and_projects[i].id_user === user)
		{
			projects.push(users_and_projects[i].id_prjt);
		}
	}
	return projects;
}

// Function to get a all the project assignments in the project pool
export function getAssignedProjectsByProject(prjt, users_and_projects)
{
	var i = 0;
	var users = []
    for (i = 0; i < users_and_projects.length; i++) 
	{
		if( users_and_projects[i].id_prjt === prjt)
		{
			users.push(users_and_projects[i].id_prjt);
		}
	}
	return users;
}

// Function to set a cookie
export function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue;//Code obtained from https://www.w3schools.com/js/js_cookies.asp
}

// Function to get a cookie
export function getCookie(cname) {
    var name = cname + "=";//Code obtained from https://www.w3schools.com/js/js_cookies.asp
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
