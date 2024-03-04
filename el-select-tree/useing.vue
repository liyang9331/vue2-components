<template>
  <div>
    <ElSelectTree
      :props="props"
      :options="optionData"
      :clearable="isClearable"
      :accordion="isAccordion"
      :isInput="false"
      @getValue="getValue($event)"
    />
  </div>
</template>

<script>
import ElSelectTree from "./index.vue";
export default {
  components: { ElSelectTree },
  data() {
    return {
      // -------------- ElSelectTree config start--------------------
      isClearable: true, // 可清空（可选）
      isAccordion: true, // 可收起（可选）
      // valueId: 1, // 初始ID（可选）
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "children",
        // disabled:true
      },
      // 选项列表（必选）
      list: [
        { id: 1, parentId: 0, name: "北方管道", rank: 1 },
        { id: 2, parentId: 0, name: "LNG接收站公司", rank: 1 },
        { id: 3, parentId: 0, name: "西南管道", rank: 1 },
        { id: 9, parentId: 0, name: "西部管道", rank: 1 },
        { id: 4, parentId: 1, name: "石家庄输油气分公司", rank: 2 },
        { id: 5, parentId: 1, name: "沈阳输油气分公司", rank: 2 },
        { id: 6, parentId: 1, name: "大连输油气分公司", rank: 2 },
      ],
      // -------------- ElSelectTree config end--------------------
    };
  },
  computed: {
    /* 转树形数据 */
    optionData() {
      let cloneData = JSON.parse(JSON.stringify(this.list)); // 对源数据深度克隆
      return cloneData.filter((father) => {
        // 循环所有项，并添加children属性
        let branchArr = cloneData.filter(
          (child) => father.id == child.parentId
        ); // 返回每一项的子级数组
        branchArr.length > 0 ? (father.children = branchArr) : ""; //给父级添加一个children属性，并赋值
        return father.parentId == 0; //返回第一层
      });
    },
  },
  methods: {
    // 取值
    getValue(value) {
      this.valueId = value;
      console.log(this.valueId);
    },
  },
};
</script>

<style lang="scss" scoped></style>
