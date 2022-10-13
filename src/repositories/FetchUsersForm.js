import { useRef, useState } from "react";

function FetchUsersForm(props) {
  const formRef = useRef();
  const userInputRef = useRef();
  const [badUsernames, setBadUsernames] = useState([]);

  function testUsernames(users) {
    /* This piece of regular expression is taken from https://github.com/shinnn/github-username-regex,
    it tests whether a username is valid */
    const re = new RegExp(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
    // filters out all the bad user names
    // users.filter(user => !re.test(user))
    const goodUsers = []
    const badUsers = [];
    for (const user of users) {
        if (re.test(user)) {
            goodUsers.push(user);
        } else {
            badUsers.push(user);
        }
    }
    setBadUsernames(badUsers);
    return goodUsers;
  }

  function submitHandler(event) {
    event.preventDefault();
    const buttonName = formRef.current.buttonName;
    let users = userInputRef.current.value;
    // separate the user names
    users = users.split(',')
    const goodUsers = testUsernames(users);
    props.onFetch(goodUsers, buttonName);
    // if (buttonName === "fetch-button") {
    //   // get data
    //   console.log("fetch");
    // } else {
    //   // scrape data
    //   console.log("scrape");
    // }
  }

  function getButtonName(event) {
    formRef.current.buttonName = event.target.name;
  }

  let message;
  if (badUsernames.length > 0) {
    const badUsers = badUsernames.join(', ');
    message = badUsers + ' are invalid! Please make sure the usernames you submit are valid.';
    message = <p>message</p>;
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
