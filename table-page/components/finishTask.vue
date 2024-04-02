<template>
  <el-dialog
    class="finish-task"
    title="结束任务"
    :visible.sync="dialogVisible"
    width="40%"
    :before-close="handleClose">
    <div>结束办理任务后，所有人将不可再继续办理，是否确结束办理任务？</div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>

export default {
  data() {
    return {
      taskId: '',
      dialogVisible: false
    }
  },
  methods: {
    show(taskId) {
      this.taskId = taskId
      this.dialogVisible = true
    },
    handleConfirm() {
      finishTask({ taskId: this.taskId }).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.handleClose()
          this.$emit('confirm')
        } else {
          this.$message.error(res.msg)
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