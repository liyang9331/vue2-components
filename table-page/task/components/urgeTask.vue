<template>
  <el-dialog
    class="urge-task"
    title="催办"
    :visible.sync="dialogVisible"
    width="40%"
    :before-close="handleClose">
    <el-form ref="urgeForm" :model="urgeForm" :rules="urgeFormRules" label-width="100px" label-suffix=":">
      <el-form-item label="催办人" prop="userNames">
        <el-input v-model="urgeForm.userNames" placeholder="默认显示未完成任务人员信息" disabled></el-input>
      </el-form-item>
      <el-form-item label="催办内容" prop="detailInfo">
        <el-input v-model="urgeForm.detailInfo" type="textarea" placeholder="“&{任务名称}”任务即将到期，请尽快办理！"></el-input>
      </el-form-item>
      <!-- <el-form-item label="通知方式" prop="noticeWay">
        <el-checkbox-group v-model="urgeForm.noticeWay">
          <el-checkbox label="1">系统通知</el-checkbox>
          <el-checkbox label="2">邮件</el-checkbox>
        </el-checkbox-group>
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getNotCompletePerson, urgeTask } from '@/api/task'

export default {
  data() {
    return {
      urgeForm: {
        taskId: '',
        userNames: '',
        userIds: [],
        detailInfo: '',
        // noticeWay: []
      },
      urgeFormRules: {
        userNames: [{ required: true, message: '请输入催办人', trigger: 'blur' }],
        detailInfo: [{ required: true, message: '请输入催办内容', trigger: 'blur' }],
        // noticeWay: [{ type: 'array', required: true, message: '请选择通知方式', trigger: 'change' }],
      },
      dialogVisible: false
    }
  },
  methods: {
    show(taskId) {
      this.urgeForm.taskId = taskId
      getNotCompletePerson({ taskId }).then(res => {
        if(res.code === 200) {
          const userNames = res.data.map(item => item.nickName)
          this.urgeForm.userIds = res.data.map(item => item.userId)
          this.urgeForm.userNames = userNames.join(',')
        }
      })
      this.dialogVisible = true
    },
    handleConfirm() {
      this.$refs.urgeForm.validate(valid => {
        if(valid) {
          urgeTask(this.urgeForm).then(res => {
            if(res.code === 200) {
              this.$message.success(res.msg)
              this.handleClose()
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          return false
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style>

</style>