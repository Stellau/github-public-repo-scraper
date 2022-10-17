/*
 * Name: Stella Lau
 * Start Date: 10/11/2022
 * This component populates a form that allows users to request public
 * repository information about GitHub individual users.
 */

import { useRef, useState } from "react";

function FetchUsersForm(props) {
  // to keep track of which button is clicked
  const formRef = useRef();
  // to obtain the usernames input
  const userInputRef = useRef();
  // to keep track of the invalid usernames
  const [badUsernames, setBadUsernames] = useState([]);

  /**
   * this function checks every username in an array to see if they are valid
   * GitHub username
   * @param {array} users - a list of GitHub usernames given by the user.
   * @returns {array} - a list of valid GitHub usernames given by the user.
   */
  function testUsernames(users) {
    /* This piece of regular expression is taken from https://github.com/shinnn/github-username-regex,
    it tests whether a username is valid */
    setBadUsernames([]);
    const re = new RegExp(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
    const goodUsers = [];
    const badUsers = [];
    for (let user of users) {
      user = user.trim();
      if (re.test(user)) {
        goodUsers.push(user);
      } else {
        badUsers.push(user);
      }
    }
    setBadUsernames(badUsers);
    return goodUsers;
  }

  /**
   * This function sends the list of valid GitHub usernames to the
   * FetchPublicRepoPage component to fetch for public repositories
   * with the list of valid usernames
   * @param {event} event - the event object that triggered this callback function
   */
  function submitHandler(event) {
    event.preventDefault();
    const buttonName = formRef.current.buttonName;
    let users = userInputRef.current.value;
    // put the usernames in an array
    users = users.split(",");
    // obtain the valid usernames
    const goodUsers = testUsernames(users);
    // fetch for public repositories information for the given valid users
    props.onFetch(goodUsers, buttonName);
  }

  /**
   * This function detects which one of the submit buttons is clicked.
   * @param {event} event - the event object that triggered this callback function
   */
  function getButtonName(event) {
    formRef.current.buttonName = event.target.name;
  }

  // sets an error message if there is any invalid usernames given
  let message;
  if (badUsernames.length > 0) {
    const badUsers = badUsernames.join(", ");
    message =
      "The username(s), " +
      badUsers +
      ", is/are invalid! Please make sure the usernames you submit are valid.";
    message = <p className="alert alert-danger">{message}</p>;
  }

  return (
    <div>
      <p>Please enter GitHub username(s) separated by , (comma).</p>
      <form className="flex" onSubmit={submitHandler} ref={formRef}>
        <div>
          <label htmlFor="usernames" className="form-label">
            Usernames
          </label>
          <input
            type="text"
            required
            id="usernames"
            className="form-control"
            ref={userInputRef}
          />
        </div>
        <div>
          <button
            className="btn btn-dark"
            name="fetch-button"
            onClick={getButtonName}
          >
            Fetch from Database
          </button>
        </div>
        <div>
          <button
            className="btn btn-dark"
            name="scrape-button"
            onClick={getButtonName}
          >
            Live Scrape from GitHub
          </button>
        </div>
      </form>
      {message}
    </div>
  );
}

export default FetchUsersForm;
