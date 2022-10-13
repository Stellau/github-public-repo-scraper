import { useRef } from "react";

function FetchUsersForm() {
  const formRef = useRef();
  const userInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();
    const buttonName = formRef.current.buttonName;
    //let users = userInputRef.current.value;
    if (buttonName === "fetch-button") {
      // fetch from database
      console.log("fetch");
    } else {
      // live scrape and store in database
      console.log("scrape");
    }
  }

  function getButtonName(event) {
    formRef.current.buttonName = event.target.name;
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
    </div>
  );
}

export default FetchUsersForm;
