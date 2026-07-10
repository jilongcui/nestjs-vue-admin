<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="类别">
        <el-select v-model="queryParams.category" placeholder="全部" clearable style="width:130px" @change="handleQuery">
          <el-option label="问题反馈" value="feedback" />
          <el-option label="老师申请" value="teacher_apply" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:100px" @change="handleQuery">
          <el-option label="未读" value="0" />
          <el-option label="已读" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width:160px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="类别" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.category === 'teacher_apply' ? 'warning' : 'primary'" size="mini">
            {{ scope.row.category === 'teacher_apply' ? '老师申请' : '问题反馈' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" prop="userId" width="160" show-overflow-tooltip />
      <el-table-column label="描述" prop="description" min-width="250" show-overflow-tooltip />
      <el-table-column label="联系方式" prop="contact" width="140" />
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'danger' : 'success'" size="mini">
            {{ scope.row.status === '0' ? '未读' : '已读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="160">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" icon="el-icon-check" v-if="scope.row.status === '0'" @click="handleRead(scope.row)">标为已处理</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 查看详情弹窗 -->
    <el-dialog :title="detailTitle" :visible.sync="detailVisible" width="600px" append-to-body>
      <div v-loading="detailLoading">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="类别">
            <el-tag :type="detail.category === 'teacher_apply' ? 'warning' : 'primary'" size="mini">
              {{ detail.category === 'teacher_apply' ? '老师申请' : '问题反馈' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detail.userId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ detail.contact }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === '0' ? 'danger' : 'success'" size="mini">
              {{ detail.status === '0' ? '未读' : '已读' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ parseTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="问题描述">
            <div style="white-space:pre-wrap; line-height:1.6;">{{ detail.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="图片" v-if="detail.images && detail.images.length">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <el-image v-for="(img, i) in detail.images" :key="i"
                :src="img" style="width:100px; height:100px; border-radius:4px; border:1px solid #eee;"
                fit="cover" :preview-src-list="detail.images" />
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer">
        <el-button v-if="detail.status === '0'" type="primary" @click="handleRead(detail)">标为已处理</el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listReporter, getReporter, markReporterRead, delReporter } from "@/api/reporter";

export default {
  name: "Reporter",
  data() {
    return {
      loading: false, total: 0, list: [],
      ids: [], multiple: true, showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, category: undefined, status: undefined, userId: undefined },
      // 详情弹窗
      detailVisible: false, detailLoading: false,
      detail: {},
    };
  },
  computed: {
    detailTitle() {
      if (!this.detail.id) return '详情';
      const type = this.detail.category === 'teacher_apply' ? '老师申请' : '问题反馈';
      return `${type}详情 #${this.detail.id}`;
    },
  },
  created() { this.getList(); },
  methods: {
    getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      listReporter(params).then(res => {
        if (res.code === 200) { this.list = res.data.rows || []; this.total = res.data.total || 0; }
        this.loading = false;
      }).catch(() => { this.loading = false; });
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.multiple = !selection.length;
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },

    handleView(row) {
      this.detailLoading = true;
      this.detailVisible = true;
      getReporter(row.id).then(res => {
        if (res.code === 200) {
          this.detail = res.data;
          // 如果是未读，查看后就变为已读了，刷新列表
          if (row.status === '0') this.getList();
        }
        this.detailLoading = false;
      }).catch(() => { this.detailLoading = false; });
    },

    handleRead(row) {
      const id = row.id || row._id;
      markReporterRead(id).then(() => {
        this.$modal.msgSuccess('已标记为已处理');
        if (this.detailVisible && this.detail.id === id) {
          this.detail.status = '1';
        }
        this.getList();
      });
    },

    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids;
      this.$modal.confirm('是否确认删除？').then(() => delReporter(ids.join(",")))
        .then(() => { this.getList(); this.$modal.msgSuccess("删除成功"); })
        .catch(() => {});
    },
  },
};
</script>
<style scoped>.mb8 { margin-bottom: 8px; }</style>
