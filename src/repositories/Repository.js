/*
 * Name: Stella Lau
 * Start Date: 10/12/2022
 * This component populates a single list item with the information of
 * a give repository
 */

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