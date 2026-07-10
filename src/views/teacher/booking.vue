<template>
  <div class="app-container">
    <el-form :inline="true" size="small">
      <el-form-item label="课程" v-if="courseTitle">
        <el-tag>{{ courseTitle }}</el-tag>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="预约状态" clearable style="width:130px" @change="loadBookings">
          <el-option label="已确认" value="confirmed" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="老师ID" prop="teacherId" v-if="!courseId">
        <el-input v-model="queryParams.teacherId" placeholder="按老师ID筛选" clearable style="width:160px" @keyup.enter.native="loadBookings" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="loadBookings">查询</el-button>
        <el-button icon="el-icon-back" size="mini" @click="$router.push('/teacher/index')">返回列表</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="bookingList" stripe border size="small">
      <el-table-column label="学生" prop="userName" width="120" show-overflow-tooltip />
      <el-table-column label="老师" prop="teacherName" width="120" show-overflow-tooltip />
      <el-table-column label="课程" prop="courseTitle" min-width="200" show-overflow-tooltip />
      <el-table-column label="日期" width="110">
        <template slot-scope="scope">{{ parseTime(scope.row.bookingDate, '{y}-{m}-{d}') }}</template>
      </el-table-column>
      <el-table-column label="时间" width="120">
        <template slot-scope="scope">{{ scope.row.startTime }} - {{ scope.row.endTime }}</template>
      </el-table-column>
      <el-table-column label="金额" width="90" align="right">
        <template slot-scope="scope">{{ (scope.row.amount / 100).toFixed(2) }} 元</template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'confirmed' ? 'primary' : scope.row.status === 'completed' ? 'success' : 'info'" size="mini">
            {{ scope.row.status === 'confirmed' ? '已确认' : scope.row.status === 'completed' ? '已完成' : '已取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template slot-scope="scope">{{ parseTime(scope.row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="取消原因" prop="cancelReason" min-width="150" show-overflow-tooltip />
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="loadBookings" />
  </div>
</template>

<script>
import { listAllBookings } from "@/api/teacher";

export default {
  name: "TeacherBooking",
  data() {
    return {
      loading: false, bookingList: [], total: 0,
      courseId: '', courseTitle: '',
      queryParams: { pageNum: 1, pageSize: 20, courseId: undefined, teacherId: undefined, status: undefined },
    };
  },
  created() {
    this.courseId = this.$route.query.courseId || '';
    this.courseTitle = this.$route.query.courseTitle || '';
    this.queryParams.courseId = this.courseId || undefined;
    this.loadBookings();
  },
  methods: {
    loadBookings() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      listAllBookings(params).then(res => {
        if (res.code === 200) { this.bookingList = res.data.rows || []; this.total = res.data.total || 0; }
        this.loading = false;
      }).catch(() => { this.loading = false; });
    },
  },
};
</script>
