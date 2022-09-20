<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option v-for="dict in dict.type.withdraw_status" :key="dict.value" :label="dict.label"
            :value="dict.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="ID" prop="id">
        <el-input v-model="queryParams.id" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery" />
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

    <el-table v-loading="loading" :data="dataSource">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="merchBatchNo" align="center" prop="merchBatchNo" width="120" />
      <el-table-column label="merchBillNo" align="center" prop="merchBillNo" width="120" />
      <el-table-column label="用户" align="left" width="160">
        <template slot-scope="scope">
          <div style="display:flex; align-items: center">
            <img style="width: 30px; height: 30px; object-fit: cover; display: block; margin-right: 6px;"
              :src="scope.row.user.avatar" />
            <div style="font-size: 14px; line-height: 20px;">{{ scope.row.user.nickName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="totalPrice" />
      <el-table-column label="手续费" align="center" prop="totalFee" />
      <el-table-column label="到账金额" align="center" prop="realPrice" />

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.withdraw_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template slot-scope="scope">
          <span>{{ new Date(scope.row.createTime).toLocaleString() }}</span>
        </template>
      </el-table-column>


      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div style="display: flex; align-items: center;justify-content: center;">
            <el-button v-if="scope.row.status === '0'" size="mini" type="text" @click="handleConfirm(scope.row)">通过
            </el-button>
            <el-button v-if="scope.row.status === '0'" size="mini" type="text" @click="handleReject(scope.row)">拒绝
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script>
import {
  getWithdrawList,
  confirmWithdraw,
  rejectWithdraw
} from "@/api/account/withdraw";
import { mapGetters } from "vuex";



export default {
  name: "WithdrawRecord",
  dicts: ['withdraw_status'],
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
      getWithdrawList(this.queryParams).then(res => {
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
    async handleConfirm(data) {
      if (window.confirm('确定要通过此提现申请吗？')) {
        console.log(data)
        try {
          await confirmWithdraw(data.id)
          this.$modal.msgSuccess("审核成功");
          this.handleQuery();
        } catch (error) {
          console.error(error)
          // this.$modal.msgError(error);
        }
      }
    },
    async handleReject(data) {
      if (window.confirm('确定要拒绝此提现申请吗？')) {
        try {
          await rejectWithdraw(data.id)
          this.$modal.msgSuccess("审核成功");
          this.handleQuery();
        } catch (error) {
          console.error(error)

        }
      }
    },

  }
};
</script>
