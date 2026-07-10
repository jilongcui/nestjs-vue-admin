<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="用户ID">
        <el-input v-model="queryParams.userId" placeholder="用户ID搜索" clearable style="width:200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="profileList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户ID" prop="userId" width="200" show-overflow-tooltip />
      <el-table-column label="评分" prop="rating" width="80" align="center" />
      <el-table-column label="服务学生" prop="servedStudents" width="80" align="center" />
      <el-table-column label="服务时长(分)" prop="totalDuration" width="100" align="center" />
      <el-table-column label="基础价格" width="90" align="right">
        <template slot-scope="scope">{{ scope.row.basePrice }} 元</template>
      </el-table-column>
      <el-table-column label="地区" prop="region" width="80" align="center" />
      <el-table-column label="总接单" prop="totalSessions" width="70" align="center" />
      <el-table-column label="完成数" prop="completedSessions" width="70" align="center" />
      <el-table-column label="擅长领域" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag v-for="(tag, i) in (scope.row.expertise || [])" :key="i" size="mini" style="margin-right:4px">{{ tag }}</el-tag>
          <span v-if="!scope.row.expertise || !scope.row.expertise.length">--</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 编辑弹窗 -->
    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="500px" append-to-body @close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-form-item label="用户ID"><el-input :value="form.userId" disabled /></el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="form.region" style="width:100%">
            <el-option label="华北" value="NORTH" />
            <el-option label="华南" value="SOUTH" />
            <el-option label="华东" value="EAST" />
            <el-option label="西北" value="WEST" />
            <el-option label="海外" value="OVERSEA" />
          </el-select>
        </el-form-item>
        <el-form-item label="基础价格" prop="basePrice">
          <el-input-number v-model="form.basePrice" :min="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="擅长领域" prop="expertise">
          <el-select v-model="form.expertise" multiple filterable allow-create default-first-option style="width:100%" placeholder="输入领域并回车">
            <el-option v-for="item in expertiseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTeacherProfile, getTeacherProfile, updateTeacherProfile } from "@/api/teacher";

export default {
  name: "TeacherProfile",
  data() {
    return {
      loading: false, total: 0, profileList: [],
      ids: [], showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20 },
      dialog: { visible: false, title: "", userId: null }, form: {},
      rules: {
        region: [{ required: true, message: "请选择地区", trigger: "change" }],
        basePrice: [{ required: true, message: "请输入基础价格", trigger: "blur" }],
      },
      expertiseOptions: ['公务员面试', '结构化面试', '无领导小组', '行测', '申论', '言语理解', '数量关系'],
    };
  },
  created() { this.getList(); },
  methods: {
    getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      listTeacherProfile(params).then(res => {
        if (res.code === 200) { this.profileList = res.data.rows || []; this.total = res.data.total || 0; }
        this.loading = false;
      }).catch(() => { this.loading = false; });
    },
    handleSelectionChange(selection) { this.ids = selection.map(item => item.userId); },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },
    reset() { this.form = { region: undefined, basePrice: 10, expertise: [] }; },
    cancel() { this.dialog.visible = false; this.resetForm("form"); },
    handleEdit(row) {
      this.reset();
      this.dialog.userId = row.userId;
      this.dialog.title = `编辑老师档案 - ${row.userId}`;
      this.dialog.visible = true;
      getTeacherProfile(row.userId).then(res => {
        if (res.code === 200) {
          const data = res.data;
          this.form = { region: data.region, basePrice: data.basePrice, expertise: data.expertise || [], userId: data.userId };
        }
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) return;
        updateTeacherProfile(this.dialog.userId, { ...this.form }).then(() => {
          this.$modal.msgSuccess("保存成功");
          this.dialog.visible = false;
          this.getList();
        });
      });
    },
  },
};
</script>
