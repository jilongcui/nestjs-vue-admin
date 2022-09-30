<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="queryParams.userId" placeholder="预留手机号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="queryParams.userId" placeholder="银行卡卡号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="银行名称" prop="bankName">
        <el-input v-model="queryParams.userId" placeholder="银行名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option v-for="dict in dict.type.bankcard_status" :key="dict.value" :label="dict.label"
            :value="dict.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID" prop="id">
        <el-input v-model="queryParams.userId" placeholder="请输入ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataSource">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="卡号" align="center" prop="cardNo" width="120" />
      <el-table-column label="卡类型" align="center" prop="cardType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.card_type" :value="scope.row.cardType" />
        </template>
      </el-table-column>
      <el-table-column label="银行类型" align="center" prop="bankType" width="120" />
      <el-table-column label="手机号" align="center" prop="mobile" width="120" />
      <el-table-column label="用户ID" align="center" prop="userId" width="120" />
      <!-- <el-table-column label="用户" align="left" width="160">
        <template slot-scope="scope">
          <div style="display:flex; align-items: center">
            <img style="width: 30px; height: 30px; object-fit: cover; display: block; margin-right: 6px;"
              :src="scope.row.user.avatar" />
            <div style="font-size: 14px; line-height: 20px;">{{ scope.row.user.nickName }}</div>
          </div>
        </template>
      </el-table-column> -->

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.bankcard_status" :value="scope.row.status" />
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
            <el-button v-if="scope.row.status !== '0'" size="mini" type="text"
              @click="handleInvalidateBankcard(scope.row)">
              设置失效
            </el-button>
            <el-button v-if="scope.row.status !== '0' && scope.row.status !== '3'" size="mini" type="text"
              @click="handleVerifyBankcard(scope.row)">
              手动鉴权
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
  getBankcardList,
  invalidateBankcard,
  verifyBankcard,
} from "@/api/account/bankcard";
import { mapGetters } from "vuex";



export default {
  name: "BankcardRecord",
  dicts: ['bankcard_status', 'card_type'],
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
      getBankcardList(this.queryParams).then(res => {
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
    async handleInvalidateBankcard(data) {
      if (window.confirm('确定要把此卡设置签约失效吗？')) {
        console.log(data)
        try {
          await invalidateBankcard(data.id)
          this.$modal.msgSuccess("签约失效成功");
          this.handleQuery();
        } catch (error) {
          console.error(error)
          this.$modal.msgError(error);
        }
      }
    },
    async handleVerifyBankcard(data) {
      if (window.confirm('确定要对此卡进行鉴权吗？')) {
        try {
          await verifyBankcard(data.id)
          this.$modal.msgSuccess("鉴权成功");
          this.handleQuery();
        } catch (error) {
          console.error(error)
          this.$modal.msgError(error);
        }
      }
    },

  }
};
</script>
