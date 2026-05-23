// A simple local storage based auth system.
// In a real app, this would be an API call and passwords would be securely hashed.

const USERS_KEY = 'my-muse-ai-users';

interface UserStore {
  [username: string]: string; // username: password
}

const getUsers = (): UserStore => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
};

const saveUsers = (users: UserStore) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (username: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (!username.trim() || !password.trim()) {
    return { success: false, message: 'Tên người dùng và mật khẩu không được để trống.' };
  }
  if (users[username]) {
    return { success: false, message: 'Tên người dùng đã tồn tại.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  users[username] = password; // Storing password in plaintext for simplicity as requested.
  saveUsers(users);
  return { success: true, message: 'Đăng ký thành công!' };
};

export const loginUser = (username: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (!users[username]) {
    return { success: false, message: 'Tên người dùng không tồn tại.' };
  }
  if (users[username] !== password) {
    return { success: false, message: 'Mật khẩu không chính xác.' };
  }
  return { success: true, message: 'Đăng nhập thành công!' };
};
