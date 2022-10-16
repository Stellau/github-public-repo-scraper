function Repository(props) {
    return (
        <li className="list-group-item flex">
            <span>{props['name']}</span>
            <span>{props['time']}</span>
            <span>{props['owner-name']}</span>
            <span>{props['owner-fullname']}</span>
        </li>
    );
}

export default Repository;