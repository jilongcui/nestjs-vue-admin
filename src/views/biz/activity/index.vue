<template>
  <div class="app-container">
    <!-- <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="地址" prop="address">
        <el-input v-model="queryParams.address" placeholder="请输入地址" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="type">
        <el-select v-model="queryParams.status" placeholder="活动状态" clearable>
          <el-option v-for="dict in dict.type.activity_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="活动类型" clearable>
          <el-option v-for="dict in dict.type.activity_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form> -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:notice:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:notice:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:notice:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" width="60" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="首页推荐" align="center" prop="recommend">
        <template slot-scope="scope">
          <el-tag :type="recommend_status_dict[scope.row.recommend].type">{{
              recommend_status_dict[scope.row.recommend].label
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="supply" align="center" prop="supply" width="80" />
      <el-table-column label="current" align="center" prop="current" width="80" />
      <el-table-column label="deliverDelay" align="center" prop="deliverDelay" width="100" />
      <el-table-column label="价格" align="center" prop="price" width="100" />
      <el-table-column label="类型" align="center" prop="type" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.activity_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.activity_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="活动时间" align="center" width="240">
        <template slot-scope="scope">
          <div>开始：{{ parseTime(scope.row.startTime) }}</div>
          <div>结束：{{ parseTime(scope.row.endTime) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:notice:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:notice:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="580px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>

        <el-form-item label="封面图片" prop="coverImage">
          <image-upload v-model="form.coverImage" :limit="1">
            <el-button size="small">
              选择
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </image-upload>
        </el-form-item>

        <el-form-item label="首页推荐" prop="recommend">
          <el-checkbox v-model="form.recommend">{{
              form.recommend ? '推荐' : "不推荐"
          }}</el-checkbox>
        </el-form-item>
        <el-form-item label="活动规则" prop="ruleInfo">
          <el-input type="textarea" v-model="form.ruleInfo" />
        </el-form-item>
        <el-form-item label="deliverDelay" prop="deliverDelay">
          <el-input-number controls-position="right" v-model="form.deliverDelay" />
        </el-form-item>
        <el-form-item label="supply" prop="supply">
          <el-input-number controls-position="right" v-model="form.supply" />
        </el-form-item>
        <el-form-item label="current" prop="current">
          <el-input-number controls-position="right" v-model="form.current" />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number controls-position="right" v-model="form.price" />
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker v-model="form.timeRange" type="datetimerange" range-separator="至" start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-date-picker>
        </el-form-item>
        <el-row>
          <el-col :span="11">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择活动类型">
                <el-option v-for="dict in dict.type.activity_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :offset="2" :span="11">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择活动状态">
                <el-option v-for="dict in dict.type.activity_status" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="作者">

          <div v-if="form.authorName" style="display: flex; align-items: center;">
            <img v-if="form.avatar" :src="baseUrl + form.avatar"
              style="width: 40px;height: 40px; border-radius: 20px; margin-right: 4px;" />
            <span>{{ form.authorName }}</span>
          </div>
          <div v-else style="color: red;">请选择藏品</div>
        </el-form-item>
        <el-form-item v-if="enableEditCollections" label="活动藏品" prop="collections">
          <el-row>
            <el-col :span="12" v-for="c in form.collections" :key="c.id">
              <div style="padding: 6px">
                <ActivityCollectionItem :item="c" v-on:remove="handleRemoveCollection(c)" />
              </div>
            </el-col>
            <el-col :span="12">
              <div style="padding: 6px">
                <AddActivityCollectionItem v-on:add="handleAddCollection" />
              </div>
            </el-col>
          </el-row>

        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getActivityList, getActivityDetailsById,
  deleteActivityByIds,
  appendCollectionToActivity, removeCollectionFromActivity,
  updateActivity, addActivity
} from "@/api/activity";
import ActivityCollectionItem from "./components/ActivityCollectionItem.vue";
import AddActivityCollectionItem from "./components/AddActivityCollectionItem.vue";

const DEFAULT_FORM = {
  title: undefined,
  coverImage: undefined,
  ruleInfo: undefined,
  supply: undefined,
  current: undefined,
  price: undefined,
  deliverDelay: undefined,
  contractId: undefined,
  type: undefined,
  recommend: false,
  status: undefined,
  authorName: undefined,
  avatar: undefined,
  collections: undefined,
}

export default {
  name: "Activity",
  dicts: ['activity_status', 'activity_type'],
  components: {
    ActivityCollectionItem,
    AddActivityCollectionItem
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      recommend_status_dict: {
        1: {
          label: "是",
          value: "1",
          type: 'success'
        },
        0: {
          label: "否",
          value: "0",
          type: 'danger'
        },
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 公告表格数据
      activityList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单中是否允许编辑活动内的藏品(新增活动表单不允许，修改活动表单允许)
      enableEditCollections: false,
      // 当前活动的藏品
      // currentCollections: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        status: undefined,
      },
      // 表单参数
      form: {
        ...DEFAULT_FORM
      },
      // 表单校验
      rules: {
        title: [
          { required: true, message: "活动标题不能为空" }
        ],
        coverImage: [
          { required: true, message: "活动封面不能为空" }
        ],
        ruleInfo: [
          { required: true, message: "规则不能为空" }
        ],
        supply: [
          { required: true, message: "supply不能为空" }
        ],
        current: [
          { required: true, message: "current不能为空" }
        ],
        price: [
          { required: true, message: "price不能为空" }
        ],
        deliverDelay: [
          { required: true, message: "deliverDelay不能为空" }
        ],
        type: [
          { required: true, message: "type不能为空", trigger: "change" }
        ],
        status: [
          { required: true, message: "status不能为空", trigger: "change" }
        ],
        timeRange: [
          { required: true, message: "活动时间不能为空" }
        ],
        collections: [
          { required: true, message: "藏品不能为空" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      getActivityList(this.queryParams).then(response => {
        this.activityList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        ...DEFAULT_FORM
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.enableEditCollections = false;
      this.open = true;

      this.title = "添加活动";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.enableEditCollections = true;
      this.reset();
      const id = row.id || this.ids
      getActivityDetailsById(id).then(response => {
        const { startTime, endTime, recommend, ...reset } = response.data
        this.form = {
          ...reset,
          recommend: recommend === "1" ? true : false,
          timeRange: [startTime, endTime]
        }
        // this.currentCollections = collections;
        this.open = true;
        this.title = "修改活动";
      });
    },
    /** 提交按钮 */

    submitForm: function () {
      console.log(this.form)
      this.$refs["form"].validate(valid => {
        console.log(valid)
        if (valid) {
          const { timeRange, recommend, ...reset } = this.form
          const data = {
            ...reset,
            recommend: recommend ? "1" : '0',
            startTime: timeRange[0],
            endTime: timeRange[1],
          }
          if (this.form.id != undefined) {
            updateActivity(data, this.form.id).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addActivity(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除编号为"' + ids + '"的活动项？').then(function () {
        return deleteActivityByIds(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    handleRemoveCollection(c) {
      if (this.form.id != undefined && c.id !== undefined) {
        removeCollectionFromActivity(this.form.id, c.id).then(response => {
          this.$modal.msgSuccess("删除成功");
          this.form.collections = this.form.collections.filter((item) => item.id !== c.id)

          this.form.avatar = undefined
          this.form.authorName = undefined
        });
      }
    },
    handleAddCollection(c) {
      if (this.form.id != undefined && c.id !== undefined) {
        appendCollectionToActivity(this.form.id, c.id).then(response => {
          this.$modal.msgSuccess("添加成功");
          this.form.collections = [...this.form.collections, c]

          this.form.avatar = c.author.avatar
          this.form.authorName = c.author.nickName
        });
      }
    }
  }
};
</script>
