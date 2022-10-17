/*
 * Name: Stella Lau
 * Start Date: 10/11/2022
 * This component populates the entire GitHub Scraper page.
 */

import { useState } from "react";
import { checkStatus } from "../Util";
import FetchUsersForm from "../repositories/FetchUsersForm";
import RepositoryList from "../repositories/RepositoryList";

function FetchPublicRepoPage() {
  // Loading component
  const [isLoading, setIsLoading] = useState(false);
  // Loaded information
  const [loadedUserRepos, setLoadedUserRepos] = useState([]);
  // Store the users not in the database
  const [usersNotStored, setUsersNotStored] = useState([]);
  // Server error message
  const [serverError, setServerError] = useState("");

  /**
   * This function obtains and sets the public repositories information from the
   * database given the list of usernames in a string.
   * @param {URLSearchParams} params - a list of GitHub usernames given by the user.
   */
  async function getRepos(params) {
    try {
      setIsLoading(true);
      let res = await fetch("/getPublicRepos?" + params);
      res = await checkStatus(res);
      let result = await res.json();
      setIsLoading(false);
      const usersNotInDatabase = [];
      // only keeps the repository information for the users in the database
      result = result["users"].filter((userRepo) => {
        const userInDatabase = userRepo["projects"].length > 0;
        if (!userInDatabase) {
          usersNotInDatabase.push(userRepo["username"]);
        }
        return userInDatabase;
      });
      // sets the list of users not in the database
      setUsersNotStored(usersNotInDatabase);
      // sets the list of loaded repositories' information
      setLoadedUserRepos(result);
    } catch (err) {
      // handle error by displaying a message
      setServerError(err.message);
    }
  }

  /**
   * This function obtains the most updated information about the given list of
   * users' repositories.
   * @param {JSON} params - a list of GitHub usernames given by the user.
   */
  async function scrapeRepo(params) {
    try {
      let res = await fetch("/scrapePublicRepos", {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
        },
      });
      res = await checkStatus(res);
      let result = await res.json();
      setIsLoading(false);
      // sets the list of loaded repositories' information
      setLoadedUserRepos(result["users"]);
    } catch (err) {
      // handle error by displaying a message
      setServerError(err.message);
    }
  }

  /**
   * This function determines whether to send a 'GET' request to obtain
   * public repository information from the database or a 'POST' request
   * to scrape for the most updated information and update the database
   * with the scrapped data
   * @param {array} goodUsers - a list of GitHub usernames given by the user.
   * @param {string} buttonName - the name of the button that triggered the
   * form submission.
   */
  async function fetchRepos(goodUsers, buttonName) {
    // clearing the states make sure that every fetch starts on a clean slate
    setUsersNotStored([]);
    setLoadedUserRepos([]);
    setServerError("");
    // only send a request if there is any valid username given.
    if (goodUsers.length > 0) {
      if (buttonName === "fetch-button") {
        const params = new URLSearchParams({ users: goodUsers.join(",") });
        await getRepos(params);
      } else {
        await scrapeRepo({ users: goodUsers });
      }
    }
  }

  // determines whether to display a loading spinner or the fetched information
  let fetchResult;
  if (isLoading) {
    fetchResult = (
      <div id="spinner-container" className="flex center-x center-y">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  } else if (loadedUserRepos.length > 0) {
    fetchResult = <RepositoryList userRepos={loadedUserRepos} />;
  }

  /* determines whether to display the error message when requested users
   * are not stored in the database */
  let usersNotStoredMessage;
  if (usersNotStored.length > 0) {
    usersNotStoredMessage = (
      <p className="alert alert-danger">
        The users, {usersNotStored.join(", ")}, is/are not in the datbase
        currently.
      </p>
    );
  }

  // determines whether to display the error message for any server error
  let serverErrorMessage;
  if (serverError) {
    serverErrorMessage = <p className="alert alert-danger">{serverError}</p>;
  }

  return (
    <div>
      <FetchUsersForm onFetch={fetchRepos} />
      {usersNotStoredMessage}
      {serverErrorMessage}
      {fetchResult}
    </div>
  );
}

export default FetchPublicRepoPage;
