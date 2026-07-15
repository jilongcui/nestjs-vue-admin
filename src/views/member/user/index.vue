<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
          label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 200px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable style="width: 200px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
              <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型" prop="userType">
            <el-select v-model="queryParams.userType" placeholder="用户类型" clearable style="width: 130px">
              <el-option label="学生" value="01" />
              <el-option label="老师" value="02" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" width="120" />
          <el-table-column label="用户名称" align="center" key="userName" prop="userName" v-if="columns[1].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName" v-if="columns[2].visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns[3].visible"
            width="120" />
          <el-table-column label="状态" align="center" key="status" v-if="columns[4].visible">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[5].visible" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 编辑弹窗 -->
    <el-dialog :title="editTitle" :visible.sync="editVisible" width="500px" append-to-body>
      <el-form ref="editForm" :model="editForm" label-width="80px" size="small">
        <el-form-item label="用户编号"><el-input :value="editForm.userId" disabled /></el-form-item>
        <el-form-item label="用户名称"><el-input :value="editForm.userName" disabled /></el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="editForm.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMemberUser, delMemberUser, changeMemberUserStatus, updateMemberUser } from "@/api/member/user";

export default {
  name: "MemberUser",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      userList: null,
      dateRange: [],
      // 编辑
      editVisible: false,
      editUserId: null,
      editForm: { userId: '', userName: '', nickName: '', phonenumber: '' },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        userId: undefined,
        phonenumber: undefined,
        status: undefined,
        userType: undefined,
      },
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `手机号码`, visible: true },
        { key: 4, label: `状态`, visible: true },
        { key: 5, label: `创建时间`, visible: true }
      ],
    };
  },
  computed: {
    editTitle() {
      return '\u7f16\u8f91\u4f1a\u5458 - ' + (this.editForm.userName || '');
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listMemberUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗？').then(function () {
        return changeMemberUserStatus(row.userId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    handleEdit(row) {
      this.editUserId = row.userId;
      this.editForm = {
        userId: row.userId,
        userName: row.userName,
        nickName: row.nickName || '',
        phonenumber: row.phonenumber || '',
      };
      this.editVisible = true;
    },
    submitEdit() {
      var vm = this;
      updateMemberUser(this.editUserId, {
        nickName: this.editForm.nickName,
        phonenumber: this.editForm.phonenumber,
      }).then(function() {
        vm.$modal.msgSuccess('\u4fdd\u5b58\u6210\u529f');
        vm.editVisible = false;
        vm.getList();
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
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.multiple = !selection.length;
    },
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function () {
        return delMemberUser(userIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
  }
};
</script>
