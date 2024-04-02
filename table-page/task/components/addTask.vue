<template>
  <el-dialog
    class="add-task"
    title="新增任务"
    :visible.sync="dialogVisible"
    width="70%"
    :before-close="handleClose">
    <el-descriptions title="" :column="2" border>
      <el-descriptions-item label="任务类型">
        <el-select v-model="taskForm.taskType" style="width: 100%">
          <el-option v-for="type in dict.type.task_type" :key="type.value" :value="type.value" :label="type.label"></el-option>
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item label="任务等级">
        <el-radio-group v-model="taskForm.taskLevelId" @change="levelChange">
          <el-radio v-for="level in dict.type.task_level" :key="level.value" :label="level.value">{{ level.label }}</el-radio>
        </el-radio-group>
      </el-descriptions-item>
      <el-descriptions-item span="2" label="任务名称">
        <el-input v-model="taskForm.taskName"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="接收人数">
        <el-input v-model="taskForm.taskAllotNum" disabled placeholder="根据选择下发对象/编组自动统计"></el-input>
      </el-descriptions-item>
      <el-descriptions-item label="办理时限">
        <el-date-picker
          style="width: 100%"
          v-model="taskForm.handerTimeLimit"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期">
        </el-date-picker>
      </el-descriptions-item>
      <el-descriptions-item span="2" label="任务内容">
        <el-input v-model="taskForm.taskContent" type="textarea"></el-input>
      </el-descriptions-item>
      <el-descriptions-item span="2" label="任务要求">
        <el-input v-model="taskForm.taskDemand" type="textarea"></el-input>
      </el-descriptions-item>
      <el-descriptions-item span="2" label="相关附件">
        <el-upload
          class="upload-demo"
          ref="fileUpload"
          :action="uploadFileUrl"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :headers="headers"
          :limit="1"
          :on-success="handleUploadSuccess"
          :file-list="taskForm.fileList">
          <el-button size="small" type="primary" icon="el-icon-upload2">上传附件</el-button>
          <div slot="tip" class="el-upload__tip">支持doc、docx、png、jpg、jpeg...格式附件</div>
        </el-upload>
      </el-descriptions-item>
      <el-descriptions-item span="2" label="下发对象/编组">
        <template>
          <el-button size="small" type="primary" plain icon="el-icon-plus" @click="addUser">添加人员</el-button>
          <div class="join-user">
            <div v-for="allot in taskForm.allotList" :key="allot.id">
              <div v-if="allot.type === 3" class="user"><i class="el-icon-user"></i>{{ allot.typeName }}</div>
              <div v-if="allot.type === 1" class="user dept"><img src="@/assets/images/dept.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
              <div v-if="allot.type === 2" class="user group"><img src="@/assets/images/group.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
            </div>
          </div>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">{{ taskForm.createBy }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ taskForm.createTime }}</el-descriptions-item>
    </el-descriptions>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
    <Department :open="orgVisible" @cancel="orgVisible = false" @handleSubmit="orgSubmit" :checkUser="checkUser" v-if="orgVisible"/>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from "@/utils/auth"
import Department from '@/components/Department/index.vue'
import { editTask } from '@/api/task'

export default {
  components: { Department },
  dicts: ['task_type', 'task_status', 'task_level'],
  data() {
    return {
      taskForm: { fileList: [] },
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/task/upload", // 上传文件服务器地址
      dialogVisible: false,
      orgVisible: false,
      checkUser: []
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ]),
  },
  methods: {
    handlePreview() {},
    handleRemove(file, fileList) {
      this.taskForm.fileList = fileList
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        this.taskForm.fileList.push({ name: res.data.document.name, url: res.data.document.fileUrl, id: res.data.document.docId })
      } else {
        this.$message.error(res.msg)
        this.$refs.fileUpload.handleRemove(file)
      }
    },
    levelChange(val) {
      this.$set(this.taskForm, 'taskLevel', this.dict.type.task_level.find(item => item.value === val).label)
    },
    addUser() {
      this.orgVisible = true
    },
    orgSubmit(selectUser) {
      this.taskForm.allotList = selectUser.map(i => {
        return {
          num: i.userId ? null : 2,
          type: i.userId ? 3 : i.pid ? 2 : 1,
          typeId: i.userId ? i.userId : i.id ? i.id : i.deptId,
          typeName: i.userId ? i.userName : i.pid ? i.groupName : i.deptName 
        }
      })
      this.orgVisible = false
    },
    show(taskForm) {
      if(taskForm) {
        this.taskForm = Object.assign({ fileList:[{ id: taskForm.taskFileId, url: taskForm.taskFileUrl, name: taskForm.taskFileName }] }, taskForm)
        this.checkUser = taskForm.allotList.map(i => {
          return {
            deptId: i.type == 1 ? i.typeId : null,
            id: i.type == 2 ? i.typeId : null,
            userId: i.type == 3 ? i.typeId : null,
            deptName: i.type == 1 ? i.typeName : null,
            groupName: i.type == 2 ? i.typeName : null,
            userName: i.type == 3 ? i.typeName : null,
          }
        })
      } else {
        const now = new Date();
        const currentTime = now.getTime();
        this.taskForm.createBy = this.name
        this.taskForm.createTime = this.parseTime(currentTime)
      }
      this.dialogVisible = true
      
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleConfirm() {
      const fileIdArr = this.taskForm.fileList.map(item => { return item.id })
      const params = Object.assign({
        taskFileId: fileIdArr.join(','),
        taskAllotNum: 8,
        taskProgress: 0
      }, this.taskForm)
      editTask(params).then(res => {
        if (res.code === 200) {
          this.dialogVisible = false
          this.$message.success(res.msg)
          this.$emit('confirm')
        } else {
          this.$message.error(res.msg)
        }
      })
      
    }
  }
}
</script>

<style lang="scss" scoped>
.add-task {
  .join-user {
    display: flex;
    .user {
      padding: 0 7px;
      height: 34px;
      line-height: 34px;
      background: #F1F6FC;
      border-radius: 4px;
      color: #006EEC;
      margin-right: 8px;
      margin-top: 8px;
      i {
        margin-right: 3px;
      }
    }
    .dept {
      background: #FEFBEC;
      color: #FF9100;
      img {
        width: 18px;
        height: 18px;
        vertical-align: middle;
        margin-right: 5px;
      }
    }
    .group {
      background: #EDF8F6;
      color: #00A3CE;
      img {
        width: 22px;
        height: 18px;
        vertical-align: middle;
        margin-right: 5px;
      }
    }
  }
}
</style>