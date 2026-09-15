export const getToken = () =>
  localStorage.getItem("campusconnect_token");

export const getUser = () => {
  const user = localStorage.getItem("campusconnect_user");
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => !!getToken();
