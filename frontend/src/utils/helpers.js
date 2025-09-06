// utils/helpers.js
export const generateUsername = (email) => {
  if (!email) return "user_" + Math.floor(100 + Math.random() * 900);
  const prefix = email.split("@")[0].slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}_${randomNum}`;
};
