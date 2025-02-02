import axios from 'axios'
import testAccounts from '../config/accounts.json'
import { ElMessage } from 'element-plus'
import { encrypt } from './crypto' // 假设我们有一个加密工具

/**
 * 初始化测试账号
 * @returns {Promise<void>}
 */
export const initializeTestAccounts = async () => {
  try {
    const { accounts } = testAccounts
    
    // 遍历所有角色的账号
    for (const role in accounts) {
      const roleAccounts = accounts[role]
      
      for (const account of roleAccounts) {
        // 对密码进行加密
        const encryptedPassword = encrypt(account.password)
        
        // 构建用户数据
        const userData = {
          username: account.username,
          password: encryptedPassword,
          role: account.role,
          description: account.description,
          createTime: new Date().toISOString(),
          status: 1 // 1表示账号启用状态
        }

        // 调用注册接口
        await axios.post('/api/auth/register', userData)
      }
    }
    
    ElMessage.success('测试账号初始化成功')
    console.log('所有测试账号已成功导入系统')
  } catch (error) {
    ElMessage.error('初始化失败：' + error.message)
    console.error('初始化测试账号时出错：', error)
  }
}

/**
 * 检查测试账号是否已存在
 * @param {string} username 用户名
 * @returns {Promise<boolean>}
 */
export const checkAccountExists = async (username) => {
  try {
    const response = await axios.get(`/api/auth/check-username/${username}`)
    return response.data.exists
  } catch (error) {
    console.error('检查账号存在性时出错：', error)
    return false
  }
}

/**
 * 重置测试账号密码
 * @param {string} username 用户名
 * @param {string} newPassword 新密码
 * @returns {Promise<void>}
 */
export const resetTestAccount = async (username, newPassword) => {
  try {
    const encryptedPassword = encrypt(newPassword)
    await axios.post('/api/auth/reset-password', {
      username,
      newPassword: encryptedPassword
    })
    ElMessage.success('密码重置成功')
  } catch (error) {
    ElMessage.error('密码重置失败：' + error.message)
    console.error('重置密码时出错：', error)
  }
} 