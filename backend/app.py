import os
import requests
import datetime
import mysql.connector
from flask import Flask, request, abort, json
from GitHubScraper import GitHubScraper

app = Flask(__name__)

# A generic error handler adapted from Flask's docs: https://flask.palletsprojects.com/en/2.2.x/errorhandling/
@app.errorhandler(Exception)
def errorHandler(e):
    response = e.get_response()
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

# A basic get call for testing
@app.route("/sayHello", methods = ['GET'])
def hello():
    return "Hello World!"

# get user information from the database
@app.route("/getPublicRepos", methods = ['GET'])
def getPublicRepos():
    """
    Returns
    -------
    result
        a JSON object that contains the users' actual names and
        public repositories information fetched from the database
    """
    # get the database cursor
    db = getDB()
    cursor = db.cursor(buffered=True)
    # retrieves the request data
    users = request.args.get('users')
    users = users.split(',')
    results = {}
    results['users'] = []
    for user in users:
        # start setting up user data
        user_data = {}
        user_data['username'] = user
        user_data['name'] = ''
        user_data['projects'] = []
        # check if the user is in the table
        select_stmt = "SELECT id, full_name FROM users WHERE user_name = %(user_name)s"
        cursor.execute(select_stmt, { 'user_name': user })
        select_result = cursor.fetchall()
        if select_result:
            user_id = select_result[0][0]
            user_data['name'] = select_result[0][1]
            select_stmt = "SELECT repo_name, last_updated_date FROM repositories WHERE owner_id = %(owner_id)s"
            cursor.execute(select_stmt, { 'owner_id': user_id })
            select_results = cursor.fetchall()
            if select_results:
                for result in select_results:
                    project = {}
                    project['name'] = result[0]
                    project['time'] = datetime.datetime.strftime(result[1], '%Y-%m-%d %H:%M:%S')
                    user_data['projects'].append(project)
        results['users'].append(user_data)
    db.close()
    return results

# performs hard update of data on the users requested
# this is a quite expensive call and should not be called often
@app.route("/scrapePublicRepos", methods = ['POST'])
def scrapePublicRepos():
    """
    Returns
    -------
    result
        a JSON object that contains the users' actual names and
        public repositories information returned by the webscarpper
        (if there is no error when updating the database)
    """
    # checks if the request type is JSON
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        # retrieves the request data
        data = request.json
        try:
            # instantiate a scraper to scraper information about users
            scraper = GitHubScraper()
            results = scraper.scrapeProfile(*data['users'])
            # get the database cursor
            db = getDB()
            cursor = db.cursor(buffered=True)
            # loop through every user
            users = results['users']
            for user in users:
                # insert user or update user's full name if need to
                user_id = insertOrUpdateUser(cursor, user)
                # add all projects to the database, if they are not already in there
                for project in user['projects']:
                    insertOrUpdateProject(cursor, project, user_id)
            # commit the database updates
            db.commit()
            # close the database connection
            db.close()
            return results
        except AttributeError:
            # the repositories website structure is different for organization GitHub users
            abort(400, 'One or more of the usernames do not belong to individual GitHub users.')
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                abort(e.response.status_code, 'One or more of the usernames are not valid.')
            else:
                abort(e.response.status_code)
    else:
        # notify user to submit the correct request type
        abort(400, 'Request type must be JSON!')

def insertOrUpdateUser(cursor, user):
    """
    Description
    -----------
    Insert the user into the user table or update user's full name if it is changed since
    the last time the user's data was stored in the database.
    Parameters
    ----------
    cursor : MySQLCursor
        A MYSQLCursor that allows changes to be made to the database
    user: JSON object
        A JSON object that contains user information: user names and full names.
    Returns
    -------
    result
        The user id of the current user
    """
    # check if the user is in the table
    select_stmt = "SELECT id, full_name FROM users WHERE user_name = %(user_name)s"
    cursor.execute(select_stmt, { 'user_name': user['username'] })
    select_result = cursor.fetchall()
    # insert user into table if it is not already in the table
    if not select_result:
        insert_stmt = (
            "INSERT INTO users (user_name, full_name) "
            "VALUES (%s, %s)"
        )
        user_data = (user['username'], user['name'])
        cursor.execute(insert_stmt, user_data)
        return cursor.lastrowid
    user_id = select_result[0][0]
    name = select_result[0][1]
    # update name if it is different from what it was when it was last stored in database
    if name != user['name']:
        update_stmt = (
            "UPDATE users "
            "SET name = %(name)s "
            "WHERE id = %(id)s"
        )
        update_data = {
            'name': user['name'],
            'id': user_id
        }
        cursor.execute(update_stmt, update_data)
    return user_id
        
def insertOrUpdateProject(cursor, project, user_id):
    """
    Description
    -----------
    Insert the project/repository into the repositories table or update repository's last updated datetime
    if it is changed since the last time the user's data was stored in the database.
    Parameters
    ----------
    cursor : MySQLCursor
        A MYSQLCursor that allows changes to be made to the database
    project: JSON object
        A JSON object that contains the repository information: name, datetime last updated, and owner id.
    """
    select_stmt = "SELECT id, last_updated_date FROM repositories WHERE owner_id = %(owner_id)s AND repo_name = %(repo_name)s"
    project_data = {
        'owner_id': user_id,
        'repo_name': project['name']
    }
    cursor.execute(select_stmt, project_data)
    select_result = cursor.fetchall()
    if not select_result:
        # insert project into table if it is not already in the table
        insert_stmt = (
            "INSERT INTO repositories (repo_name, last_updated_date, owner_id) "
            "VALUES (%s, %s, %s)"
        )
        project_data = (project['name'], project['time'], user_id)
        cursor.execute(insert_stmt, project_data)
    else:
        project_id = select_result[0][0]
        last_updated_datetime = select_result[0][1]
        # convert the datetime string to python datetime.datetime format so the 2 datetimes can be compared
        stored_last_update_datetime = datetime.datetime.strptime(project['time'], '%Y-%m-%d %H:%M:%S')
        # check the last updated date of the project and update that if need to
        if last_updated_datetime != stored_last_update_datetime:
            update_stmt = (
                "UPDATE repositories "
                "SET last_updated_date = %(last_updated_date)s "
                "WHERE id = %(id)s"
            )
            update_data = {
                'last_updated_date': project['time'],
                'id': project_id
            }
            cursor.execute(update_stmt, update_data)

def getDB():
    """
    Description
    -----------
    Returns the database connection to the github MYSQL database
    Returns
    ----------
    db : MySQLConnection
        A MYSQLConnection connected to the github MYSQL database
    """
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd=os.environ.get('GITHUB_DB_PASSWORD'),
        database="github"
    )
    return db
