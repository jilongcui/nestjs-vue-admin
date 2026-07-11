<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="支付ID" prop="id">
        <el-input v-model="queryParams.id" placeholder="支付ID" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="支付状态" clearable style="width: 120px">
          <el-option label="未支付" value="0" />
          <el-option label="支付中" value="1" />
          <el-option label="已完成" value="2" />
          <el-option label="失败" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="type">
        <el-select v-model="queryParams.type" placeholder="支付方式" clearable style="width: 140px">
          <el-option label="微信" value="2" />
          <el-option label="苹果" value="3" />
          <el-option label="支付宝" value="4" />
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

    <el-table v-loading="loading" :data="paymentList" stripe>
      <el-table-column label="支付ID" prop="id" width="160" />
      <el-table-column label="用户ID" prop="userId" width="120" />
      <el-table-column label="用户昵称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.user ? scope.row.user.nickName : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.user ? scope.row.user.phonenumber : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单ID" prop="orderId" width="160" />
      <el-table-column label="金额" width="100" align="right">
        <template slot-scope="scope">
          <span style="color: #f56c6c;">¥{{ scope.row.order ? scope.row.order.totalPrice : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini">{{ {0:'余额',1:'银行卡',2:'微信',3:'苹果',4:'支付宝'}[scope.row.type] || scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '2' ? 'success' : scope.row.status === '3' ? 'danger' : 'warning'" size="mini">
            {{ {0:'未支付',1:'支付中',2:'完成',3:'失败'}[scope.row.status] || scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listMemberPayment } from "@/api/member/payment";

export default {
  name: "MemberPayment",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      paymentList: [],
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
      listMemberPayment(params).then(res => {
        if (res.code === 200) {
          this.paymentList = res.data.rows || [];
          this.total = res.data.total || 0;
        }
      }).finally(() => {
        this.loading = false;
      });
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
