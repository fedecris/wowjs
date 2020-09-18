function getRenderArguments(user) {
  let username = null;
  if (user) username = user[0].name;
  return {
    username: username,
  };
}

module.exports = { getRenderArguments };
