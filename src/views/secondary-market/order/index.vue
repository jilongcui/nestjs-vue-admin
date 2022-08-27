<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">


      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option v-for="dict in dict.type.order_status" :key="dict.value" :label="dict.label" :value="dict.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="订单ID" prop="id">
        <el-input v-model="queryParams.id" placeholder="请输入订单ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="desc">
        <el-input v-model="queryParams.desc" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>


      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除
        </el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="商品" align="left" width="160">
        <template slot-scope="scope">
          <div style="display:flex; align-items: center">
            <img style="width: 60px; height: 40px; object-fit: cover; display: block; margin-right: 6px;"
              :src="scope.row.activity.coverImage" />
            <div style="text-align: left;">
              <div style="font-size: 14px; line-height: 20px;">{{ scope.row.desc }}</div>
              <div style="font-size: 12px; line-height:20px;">x {{ scope.row.count }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总价格" align="center" prop="totalPrice" />
      <el-table-column label="实际价格" align="center" prop="realPrice" />

      <el-table-column label="订单状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.order_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime).toLocaleString() }}</span>
        </template>
      </el-table-column>

      <el-table-column label="失效时间" align="center" prop="invalidTime" width="150">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.invalidTime).toLocaleString() }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script>
import {
  getOrderList,
  deleteOrdernByIds,
  getOrderDetailsById
} from "@/api/order";
import { mapGetters } from "vuex";



export default {
  name: "Ordern",
  dicts: ['order_status'],
  data() {
    return {
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
      // 查询参数
      queryParams: {

        pageNum: 1,
        pageSize: 10,
        type: "1",
        status: undefined
      },
      dataSource: [],
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      getOrderList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dataSource = res.data.rows
          this.total = res.data.total;
        }
      }).finally(() => {
        this.loading = false;
      })
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


    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除ID为"' + ids + '"的数据项？').then(function () {
        return deleteOrdernByIds(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    }
  }
};
</script>
