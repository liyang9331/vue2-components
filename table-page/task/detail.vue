<template>
  <div class="task-detail-container">
    <div class="basic-info">
      <div class="basic-info-title-btn">
        <div>
          <p class="task-detail-title">基础信息</p>
          <img style="display: block" src="@/assets/images/doc-center/title-border.png" alt="">
        </div>
        <div>
          <el-button type="primary" @click="edit">编辑任务</el-button>
          <el-button v-if="taskForm.taskStatus < 4" type="primary" @click="handleUrge">催办</el-button>
          <el-button v-if="taskForm.taskStatus > 3" type="primary" @click="redo">重办</el-button>
          <el-button v-if="taskForm.taskStatus < 4" type="primary" @click="handleFinish">结束任务</el-button>
          <el-button type="danger" plain @click="handleDelete">删除</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>
      <el-descriptions :column="2" border :labelStyle="{'text-align': 'right'}" class="basic-info-form">
        <el-descriptions-item label="任务类型">{{ taskForm.taskType }}</el-descriptions-item>
        <el-descriptions-item label="任务等级">
          <div class="task-level">
            <img v-if="taskForm.taskLevel === '一般'" src="@/assets/images/detail_icon1.png" alt="">
            <img v-if="taskForm.taskLevel === '重要'" src="@/assets/images/detail_icon2.png" alt="">
            <img v-if="taskForm.taskLevel === '紧急'" src="@/assets/images/detail_icon3.png" alt="">
            {{ taskForm.taskLevel }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="任务名称" :span="2">{{ taskForm.taskName }}</el-descriptions-item>
        <el-descriptions-item label="接收人数">{{ taskForm.taskAllotNum }}</el-descriptions-item>
        <el-descriptions-item label="办理时限">{{ taskForm.handerTimeLimit }}</el-descriptions-item>
        <el-descriptions-item label="任务内容" :span="2">{{ taskForm.taskContent }}</el-descriptions-item>
        <el-descriptions-item label="任务要求" :span="2">{{ taskForm.taskDemand }}</el-descriptions-item>
        <el-descriptions-item label="相关附件" :span="2">
          <div class="file-image">
            <img :src="getFileImage(taskForm.suffix)" alt="">
            {{ taskForm.taskFileName }}
          </div>
          <div class="operate-btn">
            <el-button type="text" icon="el-icon-view" @click="handlePreview(taskForm.taskFileId)">预览</el-button>
            <el-button type="text" icon="el-icon-download" @click="handlerDownload(taskForm.taskFileId)">下载</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发对象/编组" :span="2">
          <div class="join-user">
            <div v-for="allot in taskForm.allotList" :key="allot.id">
              <div v-if="allot.type === 3" class="user"><i class="el-icon-user"></i>{{ allot.typeName }}</div>
              <div v-if="allot.type === 1" class="user dept"><img src="@/assets/images/dept.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
              <div v-if="allot.type === 2" class="user group"><img src="@/assets/images/group.png" alt="">{{ allot.typeName }}(共{{ allot.num }}人)</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="下发人">{{ taskForm.allotUserName }}</el-descriptions-item>
        <el-descriptions-item label="下发时间">{{ taskForm.allotTime }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="handle-info">
      <p class="task-detail-title">办理信息</p>
      <img style="display: block" src="@/assets/images/doc-center/title-border.png" alt="">
      <HandlePie :pie-data="pieData" />
      <div class="table-box">
        <el-form :model="searchQuery" ref="searchForm" label-width="100px" label-suffix=":" size="small">
          <el-row :gutter="32">
            <el-col :span="6">
              <el-form-item label="部门" prop="deptName">
                <el-cascader
                  v-model="searchQuery.deptNameArr"
                  :options="deptOptions"
                  :props="{ value: 'deptName', label: 'deptName'}"
                  @change="deptChange"
                  placeholder="请选择"
                >
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="编组" prop="groupName">
                <el-cascader
                  v-model="searchQuery.groupNameArr"
                  :options="groupOptions"
                  :props="{ value: 'groupName', label: 'groupName', children: 'childList' }"
                  @change="groupChange"
                  placeholder="请选择"
                >
                </el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="人员姓名" prop="nickName">
                <el-input v-model="searchQuery.nickName" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="办理是否超时" prop="isTimeout">
                <el-select v-model="searchQuery.isTimeout" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(timeout, index) in timeoutObj" :key="index" :value="index" :label="timeout"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="32">
            <el-col :span="20">
              <el-form-item label="进度区间" prop="completeProgressArr">
                <el-input v-model="searchQuery.completeProgressArr[0]" placeholder="请输入" style="width: 165px"></el-input>
                <span style="color: rgba(16,39,65,0.3); margin: 0 8px">-</span>
                <el-input v-model="searchQuery.completeProgressArr[1]" placeholder="请输入" style="width: 165px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" style="text-align: right">
              <el-button size="small" @click="handleReset">重置</el-button>
              <el-button size="small" type="primary" @click="handleSearch">查询</el-button>
            </el-col>
          </el-row>
        </el-form>
        <el-table :data="tableData" row-key="id" border>
          <el-table-column label="序号" width="50" type="index"></el-table-column>
          <el-table-column label="人员" prop="nickName"></el-table-column>
          <el-table-column label="部门/编组" prop="deptGroup" width="100"></el-table-column>
          <el-table-column label="办理是否超时" prop="isTimeout" width="120">
            <template slot-scope="scope">
              <span :class="['timeout-status', `timeout-status-${scope.row.isTimeout}`]">
                <span :class="['status-dot', `status-dot-${scope.row.isTimeout}`]"></span>{{ timeoutObj[scope.row.isTimeout] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="任务进度" prop="completeProgress" width="180">
            <template slot-scope="scope">
              <el-progress :percentage="scope.row.completeProgress"></el-progress>
            </template>
          </el-table-column>
          <el-table-column label="遇到的困难问题" prop="problem" min-width="180"></el-table-column>
          <el-table-column label="解决措施" prop="measure" min-width="180"></el-table-column>
          <el-table-column label="进度更新时间" prop="createTime" min-width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="所用时长" prop="useTime"></el-table-column>
          <el-table-column label="附件" prop="file" min-width="120">
            <template slot-scope="scope">
              <img :src="getFileImage(scope.row.fileType)" alt="" class="file-type-img"> {{ scope.row.fileName }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleDetail(scope.row.taskId, scope.row.taskAllotId)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="searchQuery.pageNum"
          :limit.sync="searchQuery.pageSize"
          @pagination="pageChange"
        />
      </div>
    </div>
    <div class="operate-record">
      <p class="task-detail-title">操作记录</p>
      <img style="display: block; margin-bottom: 23px" src="@/assets/images/doc-center/title-border.png" alt="">
      <div v-for="record in operateRecord" :key="record.id" class="record-item">
        <img src="@/assets/images/step-img.png" class="step-img" alt="">
        <p class="record-time">{{ record.createTime }}</p>
        <div class="record-item-content">
          <div class="content-title">
            <img src="@/assets/images/avatar.png" alt="" class="avatar-img">
            <p class="title-txt">{{ record.nickName }}</p>
            <p class="title-txt">{{ record.deptName }}</p>
          </div>
          <div class="content">
            <p>操作类型：<span class="content-value">{{ record.operType }}</span></p>
            <p>详情：<span class="content-value" v-html="record.detailInfo"></span></p>
          </div>
        </div>
      </div>
    </div>
    <AddTask ref="addTask" @confirm="init" />
    <FinishTask ref="finishTask" @confirm="init" />
    <UrgeTask ref="urgeTask" />
  </div>
</template>

<script>
import * as API_task from '@/api/task'
import { groupTree } from '@/api/system/group'
import { listDept } from '@/api/system/dept'
import { getFileDownloadUrl, getPreviewOrDownload } from '@/api/file.js'
import HandlePie from './handlePie.vue'
import AddTask from './components/addTask'
import FinishTask from './components/finishTask'
import UrgeTask from './components/urgeTask'

export default {
  name: 'TaskTaskDetail',
  components: { HandlePie, AddTask, FinishTask, UrgeTask },
  dicts: ['task_type', 'task_status', 'task_level'],
  data() {
    return {
      taskForm: {},
      pieData: {},
      total: 0,
      searchQuery: {
        taskId: '',
        pageNum: 1,
        pageSize: 10,
        deptName: '',
        groupName: '',
        nickName: '',
        isTimeout: '',
        completeProgressArr: []
      },
      timeoutObj: { 0: '否', 1: '是' },
      deptOptions: [],
      groupOptions: [],
      tableData: [],
      operateRecord: []
    }
  },
  created() {
    this.searchQuery.taskId = this.$route.query.id
    this.getGroupData()
    this.getDeptData()
    this.init()
  },
  methods: {
    init() {
      this.getDetail(this.$route.query.id)
      this.getPieData(this.$route.query.id)
      this.getTableData()
      this.getOperationData(this.$route.query.id)
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
    edit() {
      this.$refs.addTask.show(this.taskForm)
    },
    getOperationData(taskId) {
      API_task.taskOperationRecordList({ taskId }).then(res => {
        if(res.code === 200) {
          this.operateRecord = res.data.map(item => {
            return Object.assign(item, { detailInfo: item.detailInfo.replace(/\r\n/g, "<br>")})
          })
        }
      })
    },
    getGroupData() {
      groupTree().then(res => {
        if (res.code === 200) {
          this.groupOptions = res.data
        }
      })
    },
    getDeptData() {
      listDept().then(res => {
        if (res.code === 200) {
          this.deptOptions = this.handleTree(res.data, "deptId")
        }
      })
    },
    handleDetail(id, taskAllotId) {
      this.$router.push({ path: '/task/mine/detail', query: { id, taskAllotId }})
    },
    handleSearch() {
      this.searchQuery.pageNum = 1
      this.getTableData()
    },
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.searchQuery.pageNum = 1
      this.getTableData()
    },
    deptChange(val) {
      this.searchQuery.deptName = val[val.length - 1]
    },
    groupChange(val) {
      this.searchQuery.groupName = val[val.length - 1]
    },
    getTableData() {
      API_task.queryTaskHandlerPage(this.searchQuery).then(res => {
        if (res.code === 200) {
          res.rows.map(item => {
            if (item.fileName && item.fileName.lastIndexOf(".") > -1) {
              item.fileType = item.fileName.slice(item.fileName.lastIndexOf(".") + 1);
            }
          })
          this.tableData = res.rows || []
          this.total = Number(res.total)
        }
      })
    }, 
    getPieData(taskId) {
      API_task.handlerRatio(taskId).then(res => {
        if(res.code=== 200) {
          this.pieData = res.data
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
    handleUrge() {
      this.$refs.urgeTask.show(this.$route.query.id)
    },
    handleFinish() {
      this.$refs.finishTask.show(this.$route.query.id)
    },
    deleteTask() {
      API_task.taskDelete(this.$route.query.id).then(res => {
        if(res.code === 200) {
          this.$message.success(res.msg)
          this.$router.go(-1)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleDelete() {
      this.$confirm('确定要删除该任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteTask()
      }).catch(() => {})
      
    },
    redo() {
      API_task.againHandler(this.$route.query.id).then(res => {
        if(res.code === 200) {
          this.init()
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    getDetail(id) {
      API_task.getTaskDetailId(id).then(res => {
        if(res.code=== 200) {
          // 后面文件上传要改成多个
          // const fileIdArr = res.data.taskFileId.split(',')
          // fileIdArr.map(file => {
          // })
          if(res.data.taskFileId) {
            getFileDownloadUrl({ docId: res.data.taskFileId }).then(fileRes => {
              res.data.taskFileName = fileRes.data.name
              res.data.taskFileUrl = fileRes.data.fileUrl
              res.data.suffix =  fileRes.data.name.split('.')[fileRes.data.name.split('.').length-1]
              this.taskForm = res.data
            })
          } else {
            this.taskForm = res.data
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleBack() {
      this.$router.go(-1)
    },
    pageChange(page) {
      this.searchQuery.pageNum = page.page
      this.searchQuery.pageSize = page.limit
      this.getTableData()
    }
  }
}
</script>

<style lang="scss">
.task-detail-container {
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
  .table-box {
    background: #FFFFFF;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #CBD3DB;
    padding: 24px;
    margin: 24px 0;
    .timeout-status {
      &-0 {
        color: #00B224;
      } 
      &-1 {
        color: #EC0000;
      }
      .status-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 10px;
        border-radius: 50%;
        &-0 {
          background-color: #00B224;
        }
        &-1 {
          background-color: #EC0000;
        }
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