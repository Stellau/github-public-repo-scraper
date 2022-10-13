import { useState } from "react";
import { checkStatus } from "../Util";
import FetchUsersForm from "../repositories/FetchUsersForm";

function FetchPublicRepoPage(goodUsers, buttonName) {
  const [isLoading, setIsLoading] = useState(false);
  // this is for passing the loaded repos to the Repository List component
  // const [loadedRepos, setLoadedRepos] = useState([]);

  async function fetchRepos(goodUsers, buttonName) {
    if (buttonName === "fetch-button") {
      goodUsers = goodUsers.join(",");
      const params = new URLSearchParams({ users: goodUsers });
      try {
        setIsLoading(true);
        let res = await fetch("/getPublicRepos?" + params);
        res = checkStatus(res);
        let result = await res.json();
        console.log(result);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    } else {
      // post request here
    }
  }

  let loadingSpinner;
  if (isLoading) {
    loadingSpinner = (
      <div id="spinner-container" className="flex center-x center-y">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FetchUsersForm onFetch={fetchRepos} />
      {loadingSpinner}
    </div>
  );
}

export default FetchPublicRepoPage;
