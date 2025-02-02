import CryptoJS from 'crypto-js'

// 加密密钥，实际项目中应该从环境变量获取
const SECRET_KEY = 'your-secret-key-2024'

/**
 * 加密函数
 * @param {string} text 要加密的文本
 * @returns {string} 加密后的文本
 */
export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

/**
 * 解密函数
 * @param {string} ciphertext 加密的文本
 * @returns {string} 解密后的文本
 */
export const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
} 