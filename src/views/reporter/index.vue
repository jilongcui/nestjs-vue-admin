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
        <el-button type="success" icon="el-icon-check" size="mini" :disabled="multiple" @click="handleBatchRead">批量已读</el-button>
      </el-col>
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
import { listReporter, getReporter, markReporterRead, batchReadReporter, delReporter } from "@/api/reporter";

export default {
  name: "Reporter",
  data() {
    return {
      loading: false, total: 0, list: [],
      ids: [], multiple: true, showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, category: undefined, status: undefined, userId: undefined },
      detailVisible: false, detailLoading: false,
      detail: {},
      socket: null,
    };
  },
  computed: {
    detailTitle() {
      if (!this.detail.id) return '\u8be6\u60c5';
      var type = this.detail.category === 'teacher_apply' ? '\u8001\u5e08\u7533\u8bf7' : '\u95ee\u9898\u53cd\u9988';
      return type + '\u8be6\u60c5 #' + this.detail.id;
    },
  },
  created() {
    this.getList();
    this.initSocket();
  },
  beforeDestroy() {
    if (this.socket) this.socket.close();
  },
  methods: {
    getList() {
      this.loading = true;
      var params = { ...this.queryParams };
      Object.keys(params).forEach(function(k) { if (!params[k] && params[k] !== 0) delete params[k]; });
      listReporter(params).then(function(res) {
        if (res.code === 200) { this.list = res.data.rows || []; this.total = res.data.total || 0; }
        this.loading = false;
      }.bind(this)).catch(function() { this.loading = false; }.bind(this));
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(function(item) { return item.id; });
      this.multiple = !selection.length;
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },

    initSocket() {
      if (typeof io === 'undefined') return;
      var token = localStorage.getItem('Admin-Token');
      if (!token) return;
      var vm = this;
      this.socket = io(location.origin, {
        path: '/socket.io',
        auth: { token: token.replace('Bearer ', '') },
      });
      this.socket.on('connect', function() { console.log('admin WS connected'); });
      this.socket.on('admin:new-reporter', function(data) {
        vm.$notify({
          title: data.category === 'teacher_apply' ? '\u65b0\u8001\u5e08\u7533\u8bf7' : '\u65b0\u95ee\u9898\u53cd\u9988',
          message: data.description ? data.description.slice(0, 50) : '---',
          type: data.category === 'teacher_apply' ? 'warning' : 'info',
          duration: 5000,
        });
        vm.getList();
      });
    },

    handleView(row) {
      this.detailLoading = true;
      this.detailVisible = true;
      getReporter(row.id).then(function(res) {
        if (res.code === 200) {
          this.detail = res.data;
          if (row.status === '0') this.getList();
        }
        this.detailLoading = false;
      }.bind(this)).catch(function() { this.detailLoading = false; }.bind(this));
    },

    handleRead(row) {
      var id = row.id || row._id;
      markReporterRead(id).then(function() {
        this.$modal.msgSuccess('\u5df2\u6807\u8bb0\u4e3a\u5df2\u5904\u7406');
        if (this.detailVisible && this.detail.id === id) {
          this.detail.status = '1';
        }
        this.getList();
      }.bind(this));
    },

    handleBatchRead() {
      if (!this.ids.length) return;
      this.$modal.confirm('\u786e\u8ba4\u5c06\u9009\u4e2d\u7684 ' + this.ids.length + ' \u6761\u6807\u8bb0\u4e3a\u5df2\u5904\u7406\uff1f').then(function() {
        batchReadReporter(this.ids).then(function() {
          this.$modal.msgSuccess('\u5df2\u6279\u91cf\u6807\u8bb0\u4e3a\u5df2\u5904\u7406');
          this.getList();
        }.bind(this));
      }.bind(this)).catch(function() {});
    },

    handleDelete(row) {
      var ids = row.id ? [row.id] : this.ids;
      this.$modal.confirm('\u662f\u5426\u786e\u8ba4\u5220\u9664\uff1f').then(function() {
        delReporter(ids.join(",")).then(function() {
          this.getList();
          this.$modal.msgSuccess('\u5220\u9664\u6210\u529f');
        }.bind(this));
      }.bind(this)).catch(function() {});
    },
  },
};
</script>
<style scoped>.mb8 { margin-bottom: 8px; }</style>
