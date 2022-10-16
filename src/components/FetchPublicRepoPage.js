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

  async function getRepos(params) {
    try {
      setIsLoading(true);
      let res = await fetch("/getPublicRepos?" + params);
      res = await checkStatus(res);
      let result = await res.json();
      setIsLoading(false);
      const usersNotInDatabase = [];
      result = result["users"].filter((userRepo) => {
        const userInDatabase = userRepo["projects"].length > 0;
        if (!userInDatabase) {
          usersNotInDatabase.push(userRepo["username"]);
        }
        return userInDatabase;
      });
      setUsersNotStored(usersNotInDatabase);
      setLoadedUserRepos(result);
    } catch (err) {
      setServerError(err.message);
    }
  }

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
      setLoadedUserRepos(result["users"]);
    } catch (err) {
      setServerError(err.message);
    }
  }

  async function fetchRepos(goodUsers, buttonName) {
    // clearing the states make sure that every fetch starts on a clean slate
    setUsersNotStored([]);
    setLoadedUserRepos([]);
    setServerError('');
    if (goodUsers.length > 0) {
      if (buttonName === "fetch-button") {
        const params = new URLSearchParams({ users: goodUsers.join(",") });
        await getRepos(params);
      } else {
        await scrapeRepo({ users: goodUsers });
      }
    }
  }

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

  let usersNotStoredMessage;
  if (usersNotStored.length > 0) {
    usersNotStoredMessage = (
      <p className="alert alert-danger">
        The users, {usersNotStored.join(", ")}, is/are not in the datbase
        currently.
      </p>
    );
  }

  let serverErrorMessage;
  if (serverError) {
    serverErrorMessage = (
      <p className="alert alert-danger">
        {serverError}
      </p>
    );
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
