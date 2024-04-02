<template>
  <div class="task-list-container">
    <el-form
      :model="searchQuery"
      ref="searchFrom"
      label-width="80px"
      label-suffix=":"
      size="small"
    >
      <el-row :gutter="32">
        <el-col :span="6">
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务状态" prop="taskStatus">
            <el-select
              v-model="searchQuery.taskStatus"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="status in dict.type.task_status"
                :key="status.value"
                :value="status.value"
                :label="status.label"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务等级" prop="taskLevel">
            <el-select
              v-model="searchQuery.taskLevel"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="level in dict.type.task_level"
                :key="level.value"
                :value="level.label"
                :label="level.label"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="任务名称" prop="taskName">
            <el-input
              v-model="searchQuery.taskName"
              placeholder="请输入"
            ></el-input>
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
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建人" prop="createBy">
            <el-input
              v-model="searchQuery.createBy"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="searchQuery.createTime"
              type="daterange"
              value-format="yyyy-MM-dd"
              style="width: 100%"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-button size="small" type="primary" @click="handleSearch"
            >查询</el-button
          >
          <el-button size="small" @click="handleReset('searchFrom')"
            >重置</el-button
          >
        </el-col>
      </el-row>
    </el-form>
    <div class="task-list-content">
      <div class="btn-wraper">
        <el-button
          type="primary"
          size="small"
          plain
          icon="el-icon-plus"
          @click="handleAdd"
          >新建任务</el-button
        >
        <el-button
          type="primary"
          size="small"
          plain
          icon="el-icon-download"
          @click="handleExport"
          >导出</el-button
        >
      </div>
      <el-table v-loading="loading" :data="tableData" row-key="id" border>
        <el-table-column label="序号" width="50" type="index"></el-table-column>
        <el-table-column label="任务类型" prop="taskType"></el-table-column>
        <el-table-column label="任务名称" prop="taskName"></el-table-column>
        <el-table-column label="任务等级" type="taskLevel">
          <template slot-scope="scope">
            <svg-icon
              icon-class="level"
              :class="
                scope.row.taskLevel === '紧急'
                  ? 'level-0'
                  : scope.row.taskLevel === '重要'
                  ? 'level-1'
                  : 'level-2'
              "
            />
            <span style="margin-left: 6px">{{ scope.row.taskLevel }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="接收人数"
          prop="taskAllotNum"
          width="80"
        ></el-table-column>
        <el-table-column
          label="办理时限"
          prop="handerTimeLimit"
          width="100"
        ></el-table-column>
        <el-table-column label="任务状态" prop="taskStatus" width="160">
          <template slot-scope="scope">
            <span :class="`status-${scope.row.taskStatus}`">
              <svg-icon
                v-if="scope.row.taskStatus < 4"
                icon-class="status-ing"
                :class="[`status-${scope.row.taskStatus}`]"
              />
              <svg-icon
                v-else
                icon-class="status-finish"
                :class="[`status-${scope.row.taskStatus}`]"
              />
              <span style="margin-left: 6px">{{
                statusObj[scope.row.taskStatus]
              }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="任务进度" prop="taskProgress" width="180">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.taskProgress"></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="createBy"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleDetail(scope.row.id)"
              >详情</el-button
            >
            <el-button
              v-if="scope.row.taskStatus < 4"
              size="mini"
              type="text"
              @click="handleUrge(scope.row.id)"
              >催办</el-button
            >
            <el-button
              v-if="scope.row.taskStatus < 4"
              size="mini"
              type="text"
              @click="handleFinish(scope.row.id)"
              >结束任务</el-button
            >
            <el-button
              size="mini"
              type="text"
              @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="searchQuery.pageNum"
        :limit.sync="searchQuery.pageSize"
        @pagination="pageChange"
      />
    </div>
    <AddTask ref="addTask" @confirm="getTableData" />
    <FinishTask ref="finishTask" @confirm="getTableData" />
    <UrgeTask ref="urgeTask" />
  </div>
</template>

<script>
import AddTask from "./components/addTask";
import FinishTask from "./components/finishTask";
import UrgeTask from "./components/urgeTask";

export default {
  components: {
    AddTask,
    FinishTask,
    UrgeTask,
  },
  dicts: ["task_type", "task_status", "task_level"],
  data() {
    return {
      searchQuery: {
        taskType: "",
        taskStatus: "",
        taskLevel: "",
        taskName: "",
        handerTimeLimit: "",
        createBy: "",
        createTime: [],
        pageNum: 1,
        pageSize: 10,
      },
      total: 12,
      typeArr: [],
      statusObj: {
        1: "进行中",
        2: "进行中（已逾期）",
        3: "进行中（已到期）",
        4: "逾期完成",
        5: "已完成",
        6: "已结束",
      },
      loading: false,
      tableData: [],
    };
  },
  created() {
    // this.getTableData();
  },
  methods: {
    getTableData() {
      API_task.getTaskList(this.searchQuery).then((res) => {
        if (res.code === 200) {
          this.total = Number(res.total);
          this.tableData = res.rows;
        }
      });
    },
    handleSearch() {
      this.searchQuery.pageNum = 1;
      this.getTableData();
    },
    handleReset(formName) {
      this.$refs[formName].resetFields();
      this.searchQuery.pageNum = 1;
      this.getTableData();
    },
    handleAdd() {
      this.$refs.addTask.show();
    },
    handleUrge(id) {
      this.$refs.urgeTask.show(id);
    },
    handleFinish(id) {
      this.$refs.finishTask.show(id);
    },
    deleteTask(taskId) {
      API_task.taskDelete(taskId).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.getTableData();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleDelete(taskId) {
      this.$confirm("确定要删除该任务吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.deleteTask(taskId);
        })
        .catch(() => {});
    },
    handleDetail(id) {
      this.$router.push({ path: "/task/task/detail", query: { id } });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "task/export",
        {
          ...this.searchQuery,
        },
        `任务列表.xlsx`
      );
    },
    pageChange(page) {
      this.searchQuery.pageNum = page.pageNum;
      this.searchQuery.pageSize = page.pageSize;
      this.getTableData();
    },
  },
};
</script>

<style lang="scss" scoped>
.task-list-container {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 24px;
  .task-list-content {
    border-top: 1px solid #f1f1f1;
    .btn-wraper {
      margin: 16px 0;
    }
    .level-0 {
      color: #ff2206;
    }
    .level-1 {
      color: #ff9100;
    }
    .level-2 {
      color: #006eec;
    }
    .status-2 {
      color: #ec0000;
    }
    .status-1 {
      color: #006eec;
    }
    .status-3,
    .status-4 {
      color: #ff9100;
    }
    .status-5 {
      color: #00b224;
    }
    .status-6 {
      color: rgba(16, 39, 65, 0.5);
    }
  }
}
</style>
