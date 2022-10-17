/*
 * Name: Stella Lau
 * Start Date: 10/12/2022
 * This component populates a list of repositories that belong to the
 * users requested.
 */

import Repository from "./Repository";

function RepositoryList(props) {
  return (
    <ul className="list-group">
      {props.userRepos.map((userRepo) => {
        const username = userRepo["username"];
        return userRepo["projects"].map((project) => {
          // convert time from GMT to local time
          let lastUpdate = project["time"] + ' GMT';
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
    </ul>
  );
}

export default RepositoryList;
