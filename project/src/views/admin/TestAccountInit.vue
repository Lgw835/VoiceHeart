<template>
  <div class="test-account-init">
    <el-card class="init-card">
      <template #header>
        <div class="card-header">
          <h2>测试账号管理</h2>
        </div>
      </template>

      <!-- 账号状态展示 -->
      <div class="account-status">
        <el-descriptions title="账号概览" :column="1" border>
          <el-descriptions-item label="普通用户账号">
            {{ accountStatus.user || 0 }} 个
          </el-descriptions-item>
          <el-descriptions-item label="创作者账号">
            {{ accountStatus.creator || 0 }} 个
          </el-descriptions-item>
          <el-descriptions-item label="审核管理员账号">
            {{ accountStatus.admin || 0 }} 个
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="operations">
        <el-button type="primary" :loading="loading" @click="handleInitAccounts">
          一键初始化所有测试账号
        </el-button>
        <el-button type="warning" @click="handleResetPasswords" :loading="resetting">
          重置所有账号密码
        </el-button>
      </div>

      <!-- 账号列表 -->
      <div class="account-list">
        <el-table :data="accountList" style="width: 100%" border>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="role" label="角色">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)">
                {{ getRoleDisplayName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button 
                type="primary" 
                link 
                @click="handleResetPassword(scope.row)"
              >
                重置密码
              </el-button>
              <el-button 
                :type="scope.row.status === 1 ? 'danger' : 'success'" 
                link 
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeTestAccounts, checkAccountExists, resetTestAccount } from '@/utils/initTestAccounts'
import testAccounts from '@/config/accounts.json'

// 状态变量
const loading = ref(false)
const resetting = ref(false)
const accountStatus = ref({})
const accountList = ref([])

// 获取账号列表
const fetchAccountList = async () => {
  try {
    const response = await axios.get('/api/auth/test-accounts')
    accountList.value = response.data
    updateAccountStatus()
  } catch (error) {
    ElMessage.error('获取账号列表失败：' + error.message)
  }
}

// 更新账号状态统计
const updateAccountStatus = () => {
  const status = {
    user: 0,
    creator: 0,
    admin: 0
  }
  accountList.value.forEach(account => {
    status[account.role] = (status[account.role] || 0) + 1
  })
  accountStatus.value = status
}

// 初始化账号
const handleInitAccounts = async () => {
  try {
    loading.value = true
    await initializeTestAccounts()
    await fetchAccountList()
    ElMessage.success('测试账号初始化成功')
  } catch (error) {
    ElMessage.error('初始化失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 重置所有密码
const handleResetPasswords = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有测试账号的密码吗？', '警告', {
      type: 'warning'
    })
    resetting.value = true
    
    for (const role in testAccounts.accounts) {
      for (const account of testAccounts.accounts[role]) {
        await resetTestAccount(account.username, account.password)
      }
    }
    
    ElMessage.success('所有密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败：' + error.message)
    }
  } finally {
    resetting.value = false
  }
}

// 重置单个账号密码
const handleResetPassword = async (account) => {
  try {
    await ElMessageBox.confirm(`确定要重置账号 ${account.username} 的密码吗？`, '提示')
    // 从测试账号配置中找到原始密码
    const originalAccount = Object.values(testAccounts.accounts)
      .flat()
      .find(a => a.username === account.username)
    
    if (originalAccount) {
      await resetTestAccount(account.username, originalAccount.password)
      ElMessage.success('密码重置成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败：' + error.message)
    }
  }
}

// 切换账号状态
const handleToggleStatus = async (account) => {
  try {
    const action = account.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}账号 ${account.username} 吗？`, '提示')
    
    await axios.post('/api/auth/toggle-status', {
      username: account.username,
      status: account.status === 1 ? 0 : 1
    })
    
    account.status = account.status === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`操作失败：${error.message}`)
    }
  }
}

// 获取角色显示名称
const getRoleDisplayName = (role) => {
  const roleMap = {
    user: '普通用户',
    creator: '创作者',
    admin: '审核管理员'
  }
  return roleMap[role] || role
}

// 获取角色标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    user: '',
    creator: 'success',
    admin: 'danger'
  }
  return typeMap[role] || ''
}

// 页面加载时获取账号列表
onMounted(fetchAccountList)
</script>

<style scoped>
.test-account-init {
  padding: 20px;
}

.init-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-status {
  margin-bottom: 20px;
}

.operations {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.account-list {
  margin-top: 20px;
}
</style> 