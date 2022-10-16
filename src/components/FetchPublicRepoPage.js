import { useState } from "react";
import { checkStatus } from "../Util";
import FetchUsersForm from "../repositories/FetchUsersForm";
import RepositoryList from "../repositories/RepositoryList";

function FetchPublicRepoPage() {
  // this is to implement the loading component
  const [isLoading, setIsLoading] = useState(false);
  // this is the loaded information
  const [loadedUserRepos, setLoadedUserRepos] = useState([]);
  // this is to store the users not in the database
  const [usersNotStored, setUsersNotStored] = useState([]);

  async function getRepos(params) {
    try {
      setIsLoading(true);
      let res = await fetch("/getPublicRepos?" + params);
      res = checkStatus(res);
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
      console.log(err);
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
      res = checkStatus(res);
      let result = await res.json();
      setIsLoading(false);
      setLoadedUserRepos(result["users"]);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchRepos(goodUsers, buttonName) {
    setUsersNotStored([]);
    if (buttonName === "fetch-button") {
      const params = new URLSearchParams({ users: goodUsers.join(",") });
      await getRepos(params);
    } else {
      await scrapeRepo({ users: goodUsers });
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
  } else {
    fetchResult = <RepositoryList userRepos={loadedUserRepos} />;
  }

  let usersNotStoredMessage;
  if (usersNotStored.length > 0) {
    usersNotStoredMessage = (
      <p>
        The users, {usersNotStored.join(", ")}, is/are not in the datbase
        currently.
      </p>
    );
  }

  return (
    <div>
      <FetchUsersForm onFetch={fetchRepos} />
      {usersNotStoredMessage}
      {fetchResult}
    </div>
  );
}

export default FetchPublicRepoPage;
