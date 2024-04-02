<template>
  <div class="task-mine-detail-container">
    <div class="basic-info">
      <div class="basic-info-title-btn">
        <div>
          <p class="task-detail-title">基础信息</p>
          <img style="display: block" src="@/assets/images/doc-center/title-border.png" alt="">
        </div>
        <div>
          <el-button type="primary" @click="updateProgress">更新任务进度</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>
      
      <el-descriptions :column="2" border :labelStyle="{'text-align': 'right'}" class="basic-info-form">
        <el-descriptions-item label="任务类型">{{ myTask.taskType }}</el-descriptions-item>
        <el-descriptions-item label="任务等级">
          <div class="task-level">
            <img v-if="myTask.taskLevel === '一般'" src="@/assets/images/detail_icon1.png" alt="">
            <img v-if="myTask.taskLevel === '重要'" src="@/assets/images/detail_icon2.png" alt="">
            <img v-if="myTask.taskLevel === '紧急'" src="@/assets/images/detail_icon3.png" alt="">
            {{ myTask.taskLevel }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="任务名称" :span="2">{{ myTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="接收人数">{{ myTask.taskAllotNum }}</el-descriptions-item>
        <el-descriptions-item label="办理时限">{{ myTask.handerTimeLimit }}</el-descriptions-item>
        <el-descriptions-item label="任务内容" :span="2">{{ myTask.taskContent }}</el-descriptions-item>
        <el-descriptions-item label="任务要求" :span="2">{{ myTask.taskDemand }}</el-descriptions-item>
        <el-descriptions-item label="相关附件" :span="2">
          <div class="file-image">
            <img :src="getFileImage(myTask.suffix)" alt="">
            {{ myTask.taskFileName }}
          </div>
          <div class="operate-btn">
            <el-button type="text" icon="el-icon-view" @click="handlePreview(myTask.taskFileId)">预览</el-button>
            <el-button type="text" icon="el-icon-download" @click="handlerDownload(myTask.taskFileId)">下载</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发对象/编组" :span="2">
          <div class="join-user">
            <div v-for="allot in myTask.allotList" :key="allot.id">
              <div v-if="allot.type === 3" class="user"><i class="el-icon-user"></i>{{ allot.typeName }}</div>
              <div v-if="allot.type === 1" class="user dept"><img src="@/assets/images/dept.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
              <div v-if="allot.type === 2" class="user group"><img src="@/assets/images/group.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发人">{{ myTask.allotUserName }}</el-descriptions-item>
        <el-descriptions-item label="下发时间">{{ myTask.allotTime }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="operate-record">
      <p class="task-detail-title">办理进度</p>
      <img style="display: block; margin-bottom: 23px" src="@/assets/images/doc-center/title-border.png" alt="">
      <div v-for="(record, index) in operateRecord" :key="record.id" class="record-item">
        <img src="@/assets/images/step-img.png" class="step-img" alt="">
        <p class="record-time">第{{ operateRecord.length - index }}次办理 {{ record.createTime }}</p>
        <div class="record-item-content">
          <div class="content">
            <p>完成进度：<el-progress :percentage="record.completeProgress" style="display:inline-block;width: 30%"></el-progress></p>
            <p>所用时长：<span class="content-value">{{ record.useTime }}</span></p>
            <p>办理情况：<span class="content-value">{{ record.handlerSituation }}</span></p>
            <p>遇到的困难问题：<span class="content-value">{{ record.problem }}</span></p>
            <p>解决措施：<span class="content-value">{{ record.measure }}</span></p>
            <p>附件：<span class="content-value">{{ record.fileName ? record.fileName : '--' }}</span></p>
          </div>
        </div>
      </div>
    </div>
    <DealTask ref="dealTask" width="45%" @confirm="init" />
  </div>
</template>

<script>
import { getTaskDetailId, getMyHandleList } from '@/api/task'
import DealTask from './components/dealTask'
import { getPreviewOrDownload } from '@/api/file.js'
export default {
  components: {
    DealTask
  },
  name: 'TaskMineDetail',
  data() {
    return {
      myTask: {},
      operateRecord: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getDetail(this.$route.query.id)
      this.getMyHandleList(this.$route.query.id)
    },
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
    getDetail(id) {
      getTaskDetailId(id).then(res => {
        if(res.code=== 200) {
          this.$store.dispatch('file/getFileDownloadUrl',res.data.taskFileId).then(r => {
            res.data.taskFileName = r
            res.data.suffix =  res.data.taskFileName.split('.')[res.data.taskFileName.split('.').length-1]
            this.myTask = res.data
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    getMyHandleList(taskId) {
      getMyHandleList({ taskId ,taskAllotId: this.$route.query.taskAllotId }).then(res => {
        if(res.code === 200) {
          this.operateRecord = res.data.map(item => {
            if(item.fileId && item.fileId !== null) {
              this.$store.dispatch('file/getFileDownloadUrl',item.fileId).then(r => {
                Object.assign(item, { fileName: r })
              })
              return item
            } else {
              return item
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
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
    updateProgress() {
      this.$refs.dealTask.show(this.$route.query.id, this.$route.query.taskAllotId)
    },
    handleBack() {
      this.$router.go(-1)
    },
    pageChange() {
      
    }
  }
}
</script>

<style lang="scss">
.task-mine-detail-container {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
  .basic-info-title-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .task-detail-title {
    font-weight: bold;
    font-size: 18px;
    color: #001A58;
    margin: 0;
    // border-bottom: ;
  }
  .basic-info-form {
    margin: 24px 0 42px;
  }
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
  .file-type-img {
    width: 23px;
    height: 23px;
    vertical-align: middle;
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
  .operate-record {
    .record-item {
      position: relative;
      border-left: 1px dashed rgba(16, 39, 65, 0.30);
      margin-top: 10px;
      padding-bottom: 14px;
      padding-left: 24px;
      .step-img {
        position: absolute;
        top: 0;
        left: -12px;
        width: 24px;
        height: 27px;
      }
      .record-time {
        font-weight: bold;
        font-size: 16px;
        color: rgba(16,39,65,0.5);
        margin-top: 0;
      }
      &-content {
        box-shadow: 0px 3px 6px 1px rgba(0,0,0,0.08);
        border-radius: 4px 4px 4px 4px;
        border: 1px solid #EAECEF;
        .content-title {
          height: 46px;
          display: flex;
          align-items: center;
          background: #FAFBFB;
          border-bottom: 1px solid #EAECEF;
          padding-left: 24px;
        }
        .avatar-img {
          width: 24px;
          height: 24px;
        }
        .title-txt {
          font-weight: bold;
          font-size: 18px;
          color: #102741;
          margin-left: 12px;
        }
        .content {
          padding: 8px 24px;
          color: rgba(16, 39, 65, 0.70);
          .content-value {
            color: #102741;
          }
        }
      }
    }
  }
}
</style>