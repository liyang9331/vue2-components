<template>
  <el-select
    ref="select"
    :value="valueTitle"
    :placeholder="placeholder"
    :clearable="clearable"
    @clear="clearHandle"
  >
    <el-input
      class="selectInput"
      :placeholder="placeholder"
      v-model="filterText"
      v-if="isInput"
    >
    </el-input>

    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <el-tree
        id="tree-option"
        ref="selectTree"
        show-checkbox
        @check-change="orgCheckChange"
        :check-strictly="isCheckStrictly"
        :accordion="accordion"
        :data="options"
        :props="props"
        :node-key="props.value"
        :default-expanded-keys="defaultExpandedKey"
        :filter-node-method="filterNode"
        :default-expand-all="defaultExpandAll"
        @current-change="onCurrentChange"
      >
        <!-- @node-click="handleNodeClick" -->
      </el-tree>
    </el-option>
    <div class="bottom-btn" v-if="isButton">
      <el-button type="primary" @click="confirm">确认</el-button>
      <el-button @click="resetting">重置</el-button>
    </div>
  </el-select>
</template>

<script>
export default {
  name: "el-tree-select",
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          value: "id", // ID字段名
          label: "title", // 显示名称
          children: "children", // 子级字段名
        };
      },
    },
    /* 选项列表数据(树形结构的对象数组) */
    options: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /* tree 是否严格的遵循父子不互相关联的做法 */
    isCheckStrictly: {
      type: Boolean,
      default: false,
    },
    /* 是否单选 */
    isRadio: {
      type: Boolean,
      default: true,
    },
    /* 初始值 */
    value: {
      type: Number,
      default: () => {
        return null;
      },
    },
    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    /* 自动收起 */
    accordion: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    /* 文本输入框提示词 */
    inputPlaceholder: {
      type: String,
      default: () => {
        return "检索关键字";
      },
    },
    /* select提示词 */
    placeholder: {
      type: String,
      default: () => {
        return "请选择";
      },
    },
    /* 文本输入框是否显示 */
    isInput: {
      type: Boolean,
      default: true,
    },
    /* 是否显示确认、重置按钮 */
    isButton: {
      type: Boolean,
      default: true,
    },
    /* 是否默认展开所有节点 */
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      filterText: "",
      valueId: this.value, // 初始值
      valueTitle: "",
      defaultExpandedKey: [],
      selectOrg: {
        orgsid: [],
      },
      isOpenCheckStrictly: false, //是否开启父子不关联
    };
  },
  created() {
    this.isOpenCheckStrictly = this.isCheckStrictly;
  },
  mounted() {
    this.initHandle();
  },
  methods: {
    // 确认按钮点击事件处理
    confirm() {
        this.$refs.select.blur();
    },
    // 重置
    resetting() {
      this.clearHandle();
    },
    // 单选
    orgCheckChange(data, checked) {
      //   console.log(data);
      this.handleNodeClick(data);
      if (this.isRadio) {
        const indexs = this.selectOrg.orgsid.indexOf(data.id);
        if (indexs < 0 && this.selectOrg.orgsid.length === 1 && checked) {
          this.$refs.selectTree.setCheckedNodes([data]);
          this.selectOrg.orgsid = [];
          this.selectOrg.orgsid.push(data.id);
        } else if (this.selectOrg.orgsid.length === 0 && checked) {
          this.selectOrg.orgsid = [];
          this.selectOrg.orgsid.push(data.id);
        } else if (
          indexs >= 0 &&
          this.selectOrg.orgsid.length === 1 &&
          !checked
        ) {
          this.selectOrg.orgsid = [];
        }
      }
    },
    // 当前选中节点变化时触发的事件
    onCurrentChange(data, node) {
      // console.log("-----")
      // console.log(data,node)
    },
    // 初始化值
    initHandle() {
      if (this.valueId) {
        this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[
          this.props.label
        ]; // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId); // 设置默认选中
        this.defaultExpandedKey = [this.valueId]; // 设置默认展开
      }
      this.initScroll();
    },
    // 初始化滚动条
    initScroll() {
      this.$nextTick(() => {
        let scrollWrap = document.querySelectorAll(
          ".el-scrollbar .el-select-dropdown__wrap"
        )[0];
        let scrollBar = document.querySelectorAll(
          ".el-scrollbar .el-scrollbar__bar"
        );
        scrollWrap.style.cssText =
          "margin: 0px; max-height: none; overflow: hidden;";
        scrollBar.forEach((ele) => (ele.style.width = 0));
      });
    },
    // 切换选项
    handleNodeClick(node) {
      //   console.log(node);
      this.valueTitle = node[this.props.label];
      this.valueId = node[this.props.value];
      const list = this.$refs.selectTree.getCheckedNodes();
      //   console.log(list);
      this.$emit("getValue", list);
      // this.$emit("getValue", this.valueId);
      this.defaultExpandedKey = [];
    //   this.$refs.select.blur();
    },
    // 清除选中
    clearHandle() {
      this.valueTitle = "";
      this.valueId = null;
      this.defaultExpandedKey = [];
      this.clearSelected();
      this.$emit("getValue", null);
    },
    /* 清空选中样式 */
    clearSelected() {
      let allNode = document.querySelectorAll("#tree-option .el-tree-node");
      allNode.forEach((element) => element.classList.remove("is-current"));
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
  },
  watch: {
    value() {
      this.valueId = this.value;
      this.initHandle();
    },
    filterText(val) {
      this.$refs.selectTree.filter(val);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.bottom-btn {
  margin-top: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  ::v-deep .el-button {
    width: 50px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.selectInput {
  padding: 0 5px;
  box-sizing: border-box;
}
</style>