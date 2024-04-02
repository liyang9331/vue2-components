<template>
  <div class="task-mine-list-container">
    <el-form ref="searchForm" :model="searchQuery" label-width="80px" label-suffix=":" size="small">
      <el-row :gutter="32">
        <el-col :span="6">
          <el-form-item label="任务类型" prop="taskType">
            <el-select v-model="searchQuery.taskType" placeholder="请选择" style="width: 100%">
              <el-option v-for="type in dict.type.task_type" :key="type.value" :value="type.value" :label="type.label"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务状态" prop="taskStatus">
            <el-select v-model="searchQuery.taskStatus" placeholder="请选择" style="width: 100%">
              <el-option v-for="status in dict.type.task_status" :key="status.value" :value="status.value" :label="status.label"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务等级" prop="taskLevel">
            <el-select v-model="searchQuery.taskLevel" placeholder="请选择" style="width: 100%">
              <el-option v-for="level in dict.type.task_level" :key="level.value" :value="level.label" :label="level.label"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="searchQuery.taskName" placeholder="请输入"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="32">
        <el-col :span="6">
          <el-form-item label="办理时限" prop="handerTimeLimit">
            <el-date-picker
              style="width: 100%"
              v-model="searchQuery.handerTimeLimit"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="下发人" prop="allotUserName">
            <el-input v-model="searchQuery.allotUserName" placeholder="请输入"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="下发时间" prop="allotTime">
            <el-date-picker
              v-model="searchQuery.allotTime"
              type="daterange"
              style="width: 100%"
              range-separator="至"
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-button size="small" type="primary" @click="handleSearch">查询</el-button>
          <el-button size="small" @click="handleReset('searchForm')">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <div class="task-list-content">
      <div class="btn-wraper">
        <el-button type="primary" size="small" plain icon="el-icon-download" @click="handleExport">导出</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" row-key="id" border>
        <el-table-column label="序号" width="50" type="index"></el-table-column>
        <el-table-column label="任务类型" prop="taskType"></el-table-column>
        <el-table-column label="任务名称" prop="taskName"></el-table-column>
        <el-table-column label="任务等级" type="level">
          <template slot-scope="scope">
            <svg-icon icon-class="level" :class="scope.row.taskLevel === '紧急' ? 'level-0' : scope.row.taskLevel === '重要' ?'level-1' : 'level-2'" />
            <span style="margin-left: 6px">{{ scope.row.taskLevel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="办理时限" prop="handerTimeLimit" width="100"></el-table-column>
        <el-table-column label="任务状态" prop="taskStatus" width="160">
          <template slot-scope="scope">
            <span :class="`status-${scope.row.taskStatus}`">
              <svg-icon v-if="scope.row.taskStatus < 4" icon-class="status-ing" :class="[`status-${scope.row.taskStatus}`]" />
              <svg-icon v-else icon-class="status-finish" :class="[`status-${scope.row.taskStatus}`]" />
              <span style="margin-left: 6px">{{ statusObj[scope.row.taskStatus] }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="任务进度" prop="taskProgress" width="180">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.taskProgress"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="个人办理是否超时" prop="isTimeout" width="130">
          <template slot-scope="scope">
              <span :class="['timeout-status', `timeout-status-${scope.row.isTimeout}`]">
                <span :class="['status-dot', `status-dot-${scope.row.isTimeout}`]"></span>{{ timeoutObj[scope.row.isTimeout] }}
              </span>
            </template>
        </el-table-column>
        <el-table-column label="个人任务进度" prop="myTaskProgress" width="180">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.myTaskProgress"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="下发人" prop="allotUserName"></el-table-column>
        <el-table-column label="下发时间" prop="allotTime" min-width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.allotTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleDetail(scope.row.taskId, scope.row.taskAllotId)">详情</el-button>
            <el-button v-if="scope.row.taskStatus < 4" size="mini" type="text" @click="handleDeal(scope.row.taskId, scope.row.taskAllotId)">办理</el-button>
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
    <DealTask ref="dealTask" width="90%" @confirm="getTableData" />
  </div>
</template>

<script>
import { myTaskList } from '@/api/task'
import DealTask from './components/dealTask'

export default {
  components: {
    DealTask
  },
  dicts: ['task_type', 'task_status', 'task_level'],
  data() {
    return {
      searchQuery: {
        taskType: '',
        taskStatus: '',
        taskLevel: '',
        taskName: '',
        handerTimeLimit: '',
        allotUserName: '',
        allotTime: [],
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      statusObj: { 1: '进行中', 2: '进行中（已逾期）', 3: '进行中（已到期）', 4: '逾期完成', 5: '已完成', 6: '已结束' },
      timeoutObj: { 0: '否', 1: '是' },
      loading: false,
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    getTableData() {
      this.loading = true
      myTaskList(this.searchQuery).then(res => {
        if(res.code === 200) {
          this.total = Number(res.total)
          this.tableData = res.rows
        } else {
          this.$message.error(res.msg)
        }
        this.loading = false
      })
    },
    handleSearch() {
      this.searchQuery.pageNum = 1
      this.getTableData()
    },
    handleReset(formName) {
      this.$refs[formName].resetFields()
      this.searchQuery.pageNum = 1
      this.getTableData()
    },
    handleDetail(id, taskAllotId) {
      this.$router.push({ path: '/task/mine/detail', query: { id, taskAllotId }})
    },
    handleDeal(id, taskAllotId) {
      this.$refs.dealTask.show(id, taskAllotId)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('task/exportMyTask', {
        ...this.searchQuery
      }, `我的任务列表.xlsx`)
    },
    pageChange(page) {
      this.searchQuery.pageNum = page.pageNum
      this.searchQuery.pageSize = page.pageSize
      this.getTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.task-mine-list-container {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 24px;
  .task-list-content {
    border-top: 1px solid #F1F1F1;
    .btn-wraper {
      margin: 16px 0;
    }
    .level-0 {
      color: #FF2206;
    }
    .level-1 {
      color: #FF9100;
    }
    .level-2 {
      color: #006EEC;
    }
    .status-2 {
      color: #EC0000;
    }
    .status-1 {
      color: #006EEC;
    }
    .status-3, .status-4 {
      color: #FF9100
    }
    .status-5 {
      color: #00B224;
    }
    .status-6 {
      color: rgba(16,39,65,0.5)
    }
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
}
</style>