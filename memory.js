const memory = {};

function getUserState(phone) {
  return memory[phone] || { step: 0, data: {} };
}

function setUserState(phone, state) {
  memory[phone] = state;
}

module.exports = { getUserState, setUserState };

