// ─── api/authApi.js ─────────────────────────────────────────────────────────
// Service functions สำหรับ Authentication
// อิงข้อมูลจาก: models/branchModel (user data structure)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login ด้วย username/password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function login(username, password) {
  // TODO: เปลี่ยนเป็น API call จริงเมื่อ backend พร้อม
  // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })

  // Mock: simulate network delay
  await delay(800);

  if (!username || !password) {
    return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }

  // Mock success
  const user = {
    id:       'u_' + Date.now(),
    username,
    fname:    username,
    lname:    'User',
    email:    `${username}@student.psu.ac.th`,
  };

  return { success: true, user };
}

/**
 * Register ผู้ใช้ใหม่
 * @param {{ fname, lname, dob, gender, username, password }} formData
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function register(formData) {
  await delay(1000);

  const { fname, lname, dob, gender, username, password, confirm } = formData;

  if (!fname || !lname || !dob || !gender || !username || !password) {
    return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }
  if (password !== confirm) {
    return { success: false, error: 'รหัสผ่านไม่ตรงกัน' };
  }
  if (password.length < 8) {
    return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }

  const user = { id: 'u_' + Date.now(), username, fname, lname, gender, dob };
  return { success: true, user };
}

/**
 * ตรวจสอบว่า username ถูกใช้แล้วหรือยัง
 * @param {string} username
 * @returns {Promise<{ available: boolean }>}
 */
export async function checkUsernameAvailability(username) {
  await delay(300);
  const takenNames = ['admin', 'psu_user', 'hello_myname', 'test'];
  return { available: !takenNames.includes(username.trim().toLowerCase()) };
}

// ── Internal helper ────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
