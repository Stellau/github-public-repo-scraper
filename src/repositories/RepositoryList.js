import Repository from "./Repository";

function RepositoryList(props) {
  return (
    <ul>
      {props.userRepos.map((userRepo) => {
        const username = userRepo["username"];
        return userRepo["projects"].map((project) => (
          <Repository
            key={project["id"]}
            name={project["name"]}
            time={project["time"]}
            ownerName={username}
            ownerFullName={userRepo["name"]}
          />
        ));
      })}
    </ul>
  );
}

export default RepositoryList;
