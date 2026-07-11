<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="订单ID" prop="id">
        <el-input v-model="queryParams.id" placeholder="请输入订单ID" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 120px">
          <el-option label="已完成" value="2" />
          <el-option label="支付中" value="1" />
          <el-option label="已取消" value="0" />
          <el-option label="已过期" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="订单类型" clearable style="width: 140px">
          <el-option label="充值" :value="2" />
          <el-option label="升级会员" :value="3" />
          <el-option label="课程" :value="5" />
          <el-option label="活动" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" stripe>
      <el-table-column label="订单ID" prop="id" width="160" />
      <el-table-column label="用户ID" prop="userId" width="120" />
      <el-table-column label="用户昵称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.user ? scope.row.user.nickName : scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.user ? maskPhone(scope.row.user.phonenumber) : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="desc" width="120" />
      <el-table-column label="内购ID" prop="iAPItem" width="150" />
      <el-table-column label="金额" prop="realPrice" width="100" align="right">
        <template slot-scope="scope">
          <span style="color: #f56c6c;">¥{{ scope.row.realPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === 2 ? 'success' : scope.row.type === 5 ? 'warning' : 'info'" size="mini">
            {{ {0:'活动',1:'市场',2:'充值',3:'会员',4:'订阅',5:'课程'}[scope.row.type] || scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '2' ? 'success' : scope.row.status === '0' ? 'danger' : 'warning'" size="mini">
            {{ {0:'取消',1:'支付中',2:'完成',3:'过期'}[scope.row.status] || scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listMemberOrder } from "@/api/member/order";

export default {
  name: "MemberOrder",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      orderList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        userId: undefined,
        status: undefined,
        type: undefined,
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      for (const key in params) {
        if (params[key] === undefined || params[key] === null || params[key] === "") {
          delete params[key];
        }
      }
      listMemberOrder(params).then(res => {
        if (res.code === 200) {
          this.orderList = res.data.rows || [];
          this.total = res.data.total || 0;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) return phone || '';
      return phone.slice(0, 3) + '****' + phone.slice(-4);
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
  }
};
</script>
