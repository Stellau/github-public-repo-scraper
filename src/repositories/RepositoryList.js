/*
 * Name: Stella Lau
 * Start Date: 10/12/2022
 * This component populates a list of repositories that belong to the
 * users requested.
 */

import Repository from "./Repository";

function RepositoryList(props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Repository Name</th>
          <th scope="col">Last Updated</th>
          <th scope="col">Owner's Username</th>
          <th scope="col">Owner's Full Name</th>
        </tr>
      </thead>
      <tbody>
        {props.userRepos.map((userRepo) => {
          const username = userRepo["username"];
          return userRepo["projects"].map((project) => {
            // convert time from GMT to local time
            let lastUpdate = project["time"] + " GMT";
            lastUpdate = new Date(lastUpdate);
            lastUpdate = lastUpdate.toLocaleString();
            return (
              <Repository
                key={project["id"]}
                name={project["name"]}
                time={lastUpdate}
                owner-name={username}
                owner-fullname={userRepo["name"]}
              />
            );
          });
        })}
      </tbody>
    </table>
  );
}

export default RepositoryList;
