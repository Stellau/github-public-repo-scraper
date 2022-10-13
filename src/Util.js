export const URL = "http://127.0.0.1:5000";

export const checkStatus = (response) => {
  if (!response.ok) {
    throw Error("Error in request: " + response.statusText);
  }
  return response;
};
