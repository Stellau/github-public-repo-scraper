/*
 * Name: Stella Lau
 * Start Date: 10/11/2022
 * This file stores all the common constant or method that are used.
 */

export const checkStatus = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw Error(
      "Error " + error["code"] + " in request: " + error["description"]
    );
  }
  return response;
};
