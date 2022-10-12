function FetchUsersForm() {
    return(
        <form className="flex">
            <div>
                <label htmlFor="usernames">Usernames</label>
                <input type="text" required id="usernames" />
            </div>
            <div>
                <button className="btn btn-dark">Fetch Public Repositories</button>
            </div>
        </form>
    );
}

export default FetchUsersForm;