/*
 * Name: Stella Lau
 * Start Date: 10/12/2022
 * This component populates a single list item with the information of
 * a give repository
 */

function Repository(props) {
    return (
        <tr>
            <td>{props['name']}</td>
            <td>{props['time']}</td>
            <td className="center-text">{props['owner-name']}</td>
            <td className="center-text">{props['owner-fullname']}</td>
        </tr>
    );
}

export default Repository;