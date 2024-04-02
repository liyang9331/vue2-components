<template>
  <el-dialog title="任务办理" :visible.sync="open" :width="width" append-to-body :before-close="cancel">
    <el-row :gutter="20">
      <el-col v-if="width === '90%'" :span="12">
        <el-descriptions :column="2" border>
        <el-descriptions-item label="任务类型">{{ detailInfo.taskType }}</el-descriptions-item>
        <el-descriptions-item label="任务等级">
          <div class="task-level">
            <img v-if="detailInfo.taskLevel === '一般'" src="@/assets/images/detail_icon1.png" alt="">
            <img v-if="detailInfo.taskLevel === '重要'" src="@/assets/images/detail_icon2.png" alt="">
            <img v-if="detailInfo.taskLevel === '紧急'" src="@/assets/images/detail_icon3.png" alt="">
            {{ detailInfo.taskLevel }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="任务名称" :span="2">{{ detailInfo.taskName }}</el-descriptions-item>
        <el-descriptions-item label="接收人数">{{ detailInfo.taskAllotNum }}</el-descriptions-item>
        <el-descriptions-item label="办理时限">{{ detailInfo.handerTimeLimit }}</el-descriptions-item>
        <el-descriptions-item label="任务内容" :span="2">{{ detailInfo.taskContent }}</el-descriptions-item>
        <el-descriptions-item label="任务要求" :span="2">{{ detailInfo.taskDemand }}</el-descriptions-item>
        <el-descriptions-item label="相关附件" :span="2">
          <div class="file-image">
            <img :src="getFileImage(detailInfo.suffix)" alt="">
            {{ detailInfo.taskFileName }}
          </div>
          <div class="operate-btn">
            <el-button type="text" icon="el-icon-view" @click="handlePreview(detailInfo.taskFileId)">预览</el-button>
            <el-button type="text" icon="el-icon-download" @click="handlerDownload(detailInfo.taskFileId)">下载</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发对象/编组" :span="2">
          <div class="join-user">
            <div v-for="allot in detailInfo.allotList" :key="allot.id">
              <div v-if="allot.type === 3" class="user"><i class="el-icon-user"></i>{{ allot.typeName }}</div>
              <div v-if="allot.type === 1" class="user dept"><img src="@/assets/images/dept.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
              <div v-if="allot.type === 2" class="user group"><img src="@/assets/images/group.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发人">{{ detailInfo.allotUserName }}</el-descriptions-item>
        <el-descriptions-item label="下发时间">{{ detailInfo.allotTime }}</el-descriptions-item>
      </el-descriptions>
      </el-col>
      <el-col :span="width === '90%' ? 12 : 24">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="auto" class="demo-ruleForm" label-suffix=":">
          <el-form-item label="完成进度" prop="completeProgress">
            <el-slider v-model="ruleForm.completeProgress" show-input show-stops :step="10"></el-slider>
          </el-form-item>
          <el-form-item label="办理情况" prop="handlerSituation">
            <el-input v-model="ruleForm.handlerSituation" type="textarea" row="3"></el-input>
          </el-form-item>
          <el-form-item label="遇到的困难问题" prop="problem">
            <el-input v-model="ruleForm.problem" type="textarea" row="3"></el-input>
          </el-form-item>
          <el-form-item label="解决措施" prop="measure">
            <el-input v-model="ruleForm.measure" type="textarea" row="3"></el-input>
          </el-form-item>
          <el-form-item label="附件" prop="fileList">
            <el-upload
              class="upload-demo"
              ref="fileUpload"
              :action="uploadFileUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headers"
              :limit="1"
              :on-success="handleUploadSuccess"
              :file-list="ruleForm.fileList">
              <el-button size="small" type="primary" icon="el-icon-upload2">上传附件</el-button>
              <div slot="tip" class="el-upload__tip">支持doc、docx、png、jpg、jpeg...格式附件</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">关 闭</el-button>
      <el-button type="primary" @click="handleSubmit">提 交</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getPreviewOrDownload } from '@/api/file.js'
import { getTaskDetailId, getTaskHandle } from '@/api/task.js'
import { getToken } from "@/utils/auth"
 export default {
   name: 'TaskDeal',
   props: {
    width: {
      type: String,
      default: '45%'
    }
   },
   data () {
     return {
      open: false,
      detailInfo: {},
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/task/upload", // 上传文件服务器地址
      ruleForm: {
        taskId: '',
        taskAllotId: '',
        completeProgress: 0,
        handlerSituation: '',
        problem: '',
        measure: '',
        fileList: []
      },
      rules: {
        completeProgress: { type: 'number',required: true,message: '请选择完成进度',tigger: 'blur'},
        handlerSituation: { required: true,message: '请输入办理情况',tigger: 'blur'},
      }
     }
   },
   mounted() {

   },
   methods: {
    getFileImage(val) {
      switch(val) {
        case 'doc':
        case 'docx':
          return require('@/assets/images/word.png');
        case 'pdf':
          return require('@/assets/images/pdf.png');
        case 'xls':
        case 'xlsx':
          return require('@/assets/images/xls.png')
      }
    },
    show(taskId, taskAllotId) {
      if(this.width === '90%') {
        getTaskDetailId(taskId).then(res => {
          if(res.code=== 200) {
            this.$store.dispatch('file/getFileDownloadUrl',res.data.taskFileId).then(r => {
              res.data.taskFileName = r
              res.data.suffix =  res.data.taskFileName.split('.')[res.data.taskFileName.split('.').length-1]
              this.detailInfo = res.data
            })
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      this.ruleForm.taskId = taskId
      this.ruleForm.taskAllotId = taskAllotId
      this.open = true
    },
    handlePreview() {},
    handleRemove(file, fileList) {
      this.ruleForm.fileList = fileList
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        this.ruleForm.fileList.push({ name: res.data.document.name, url: res.data.document.fileUrl, id: res.data.document.docId })
      } else {
        this.$message.error(res.msg)
        this.$refs.fileUpload.handleRemove(file)
      }
    },
    cancel() {
      this.open = false
    },
    handlerDownload(docId) {
      getPreviewOrDownload(docId,{preview: false}).then(res => {
        console.log('res1111',res)
      })
    },
    handlePreview(docId) {
      getPreviewOrDownload(docId).then(res => {
        console.log('res1111',res)
      })
    },
    handleSubmit() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          getTaskHandle(Object.assign({ fileId: this.ruleForm.fileList.length > 0 ? this.ruleForm.fileList[0].id : '' }, this.ruleForm)).then(res => {
            if (res.code === 200) {
              this.$emit('confirm')
              this.$message.success(res.msg)
              this.open = false
            } else {
              this.$message.error(res.msg)
            }
          })
        } else {
          return false;
        }
      });
    }
   }
 }
</script>

<style lang='scss' scoped>
.task-level {
  img {
    width: 18px;
    height: 18px;
    margin-right: 10px;
    vertical-align: middle;
  }
}
.file-image {
  display: inline-block;
  img {
    width: 23px;
    height: 23px;
    vertical-align: middle;
  }
}
.operate-btn {
  display: inline-block;
  font-size: 12px;
  margin-left: 50px;
}
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
</style>