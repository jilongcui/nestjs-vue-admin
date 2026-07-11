<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" clearable style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 充值统计 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <div slot="header">
        <span>充值统计（深度2级）</span>
        <el-form :inline="true" style="display: inline-block; margin-left: 15px;" size="mini">
          <el-form-item label="老师ID" style="margin-bottom: 0;">
            <el-input v-model="teacherId" placeholder="输入老师userId查看" clearable style="width: 200px"
              @keyup.enter.native="loadEarnings" />
          </el-form-item>
          <el-form-item style="margin-bottom: 0;">
            <el-button type="primary" @click="loadEarnings">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table v-loading="earningsLoading" :data="earningsList" :empty-text="earningsEmptyText" stripe>
        <el-table-column label="用户ID" prop="userId" width="120" />
        <el-table-column label="用户名称" prop="userName" width="140" />
        <el-table-column label="昵称" prop="nickName" min-width="120" />
        <el-table-column label="充值总额" prop="totalRecharge" width="120" align="right">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.totalRecharge }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单数" prop="orderCount" width="100" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-document" @click="viewOrders(scope.row)">查看订单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 邀请树 -->
    <el-table row-key="id" :data="dataList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="id" key="id" prop="id" width="150" />
      <el-table-column label="用户">
        <template slot-scope="scope">
          <div style="display: flex; align-items: center;">
            <img :src="scope.row.avatar" style="width:32px; height: 32px; display: block; margin-right: 3px;" />
            <span>{{ scope.row.nickName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-search" @click="viewTreeEarnings(scope.row)">查看统计</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单明细弹窗 -->
    <el-dialog :title="orderDialog.title" :visible.sync="orderDialog.visible" width="900px">
      <el-table v-loading="orderDialog.loading" :data="orderDialog.list" stripe>
        <el-table-column label="订单ID" prop="id" width="150" />
        <el-table-column label="用户ID" prop="userId" width="120" />
        <el-table-column label="用户昵称" width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.user ? scope.row.user.nickName : scope.row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实付金额" prop="realPrice" width="120" align="right">
          <template slot-scope="scope">
            <span style="color: #f56c6c;">¥{{ scope.row.realPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createTime" width="170">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="desc" width="150" />
      </el-table>
      <pagination v-show="orderDialog.total > 0" :total="orderDialog.total" :page.sync="orderDialog.pageNum"
        :limit.sync="orderDialog.pageSize" @pagination="loadOrders" />
    </el-dialog>
  </div>
</template>

<script>
import { inviteTree, getStudentEarnings, getStudentOrders } from "@/api/system/invitation";

export default {
  name: "Invitation",
  data() {
    return {
      loading: true,
      showSearch: true,
      dataList: [],
      title: "",
      open: false,
      dateRange: [],
      form: {},
      queryParams: {
        userId: undefined,
        userName: undefined,
        phoneNumber: undefined,
        level: undefined,
      },
      // 充值统计
      teacherId: "",
      earningsLoading: false,
      earningsList: [],
      // 订单弹窗
      orderDialog: {
        visible: false,
        loading: false,
        title: "",
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        studentId: null,
        studentName: "",
      },
    };
  },
  computed: {
    earningsEmptyText() {
      return this.teacherId ? "该用户暂无学生充值数据" : "请输入老师ID后点击查询";
    },
  },
  created() {
    this.getList();
    this.loadEarnings();
  },
  methods: {
    /** 查询邀请树 */
    getList() {
      this.loading = true;
      const params = { ...this.queryParams }
      if (this.dateRange && this.dateRange.length === 2) {
        params['params[beginTime]'] = this.dateRange[0]
        params['params[endTime]'] = this.dateRange[1]
      }
      for (const key in params) {
        if (typeof params[key] === "undefined" || params[key] === null || params[key] === "") {
          delete params[key]
        }
      }
      inviteTree(params).then(res => {
        if (res.code === 200) {
          this.dataList = res.data
        } else {
          this.$message.error(res.msg)
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 加载充值统计 */
    loadEarnings() {
      this.earningsLoading = true;
      const params = this.teacherId ? { teacherId: this.teacherId } : {};
      getStudentEarnings(params).then(res => {
        if (res.code === 200) {
          this.earningsList = res.data || [];
        }
      }).finally(() => {
        this.earningsLoading = false;
      });
    },
    /** 从树节点查看充值统计 */
    viewTreeEarnings(row) {
      this.teacherId = row.id;
      this.loadEarnings();
    },
    /** 查看订单 */
    viewOrders(row) {
      this.orderDialog.visible = true;
      this.orderDialog.title = row.nickName + " - 购买记录";
      this.orderDialog.studentId = row.userId;
      this.orderDialog.studentName = row.nickName;
      this.orderDialog.pageNum = 1;
      this.orderDialog.pageSize = 10;
      this.loadOrders();
    },
    /** 加载订单明细 */
    loadOrders() {
      this.orderDialog.loading = true;
      const query = {
        pageNum: this.orderDialog.pageNum,
        pageSize: this.orderDialog.pageSize,
      };
      if (this.teacherId) {
        query['teacherId'] = this.teacherId;
      }
      getStudentOrders(this.orderDialog.studentId, query).then(res => {
        if (res.code === 200) {
          this.orderDialog.list = res.data.rows || [];
          this.orderDialog.total = res.data.total || 0;
        }
      }).finally(() => {
        this.orderDialog.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
  }
};
</script>
