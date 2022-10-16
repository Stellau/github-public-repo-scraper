export const checkStatus = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw Error("Error " + error['code'] + " in request: " + error['description']);
  }
  return response;
};
