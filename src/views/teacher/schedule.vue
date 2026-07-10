<template>
  <div class="app-container">
    <el-form :inline="true" size="small">
      <el-form-item label="课程">
        <el-tag>{{ courseTitle || '--' }}</el-tag>
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker v-model="scheduleDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" @change="loadSchedule" style="width:160px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="showBatchDialog = true">批量生成排期</el-button>
        <el-button icon="el-icon-back" size="mini" @click="$router.push('/teacher/index')">返回列表</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="scheduleSlots" stripe border max-height="600" size="small">
      <el-table-column label="时间段" width="140" align="center">
        <template slot-scope="scope">{{ scope.row.startTime }} - {{ scope.row.endTime }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'available' ? 'success' : scope.row.status === 'booked' ? 'danger' : 'info'" size="mini">
            {{ scope.row.status === 'available' ? '可预约' : scope.row.status === 'booked' ? '已预约' : '休息' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预约ID" prop="bookingId" min-width="200" show-overflow-tooltip />
      <el-table-column label="排期ID" prop="scheduleId" min-width="200" show-overflow-tooltip />
    </el-table>

    <!-- 批量生成弹窗 -->
    <el-dialog title="批量生成课时安排" :visible.sync="showBatchDialog" width="500px" append-to-body>
      <el-form ref="batchForm" :model="batchForm" :rules="batchRules" label-width="100px" size="small">
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="batchForm.startDate" type="date" value-format="yyyy-MM-dd" placeholder="开始日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="batchForm.endDate" type="date" value-format="yyyy-MM-dd" placeholder="结束日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="时间段" prop="timeSlots">
          <div v-for="(slot, idx) in batchForm.timeSlots" :key="idx" style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
            <el-time-select v-model="slot.startTime" :picker-options="{ start: '07:00', step: '00:30', end: '22:30' }" placeholder="开始" style="width:120px" />
            <span>~</span>
            <el-time-select v-model="slot.endTime" :picker-options="{ start: '07:30', step: '00:30', end: '23:00' }" placeholder="结束" style="width:120px" />
            <el-select v-model="slot.status" style="width:100px">
              <el-option label="可预约" value="available" />
              <el-option label="休息" value="breakTime" />
            </el-select>
            <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="batchForm.timeSlots.splice(idx, 1)" />
          </div>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="batchForm.timeSlots.push({ startTime: '09:00', endTime: '09:30', status: 'available' })">添加时间段</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" @click="submitBatchSchedule">确定生成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCourse, getCourseSchedule, batchCreateSchedule } from "@/api/teacher";

export default {
  name: "TeacherSchedule",
  data() {
    return {
      courseId: '', courseTitle: '',
      loading: false, scheduleDate: '', scheduleSlots: [],
      showBatchDialog: false,
      batchForm: {
        startDate: '', endDate: '',
        timeSlots: [{ startTime: '09:00', endTime: '09:30', status: 'available' }],
      },
      batchRules: {
        startDate: [{ required: true, message: "请选择开始日期", trigger: "change" }],
        endDate: [{ required: true, message: "请选择结束日期", trigger: "change" }],
      },
    };
  },
  created() {
    this.courseId = this.$route.query.courseId || '';
    this.courseTitle = this.$route.query.courseTitle || '';
    if (this.courseId) {
      this.scheduleDate = this.getToday();
      this.loadSchedule();
    }
  },
  methods: {
    getToday() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    loadSchedule() {
      if (!this.scheduleDate || !this.courseId) return;
      this.loading = true;
      getCourseSchedule(this.courseId, this.scheduleDate).then(res => {
        if (res.code === 200) this.scheduleSlots = res.data.slots || [];
        this.loading = false;
      }).catch(() => { this.loading = false; });
    },
    submitBatchSchedule() {
      this.$refs["batchForm"].validate(valid => {
        if (!valid) return;
        batchCreateSchedule(this.courseId, { ...this.batchForm }).then(res => {
          if (res.code === 200) {
            this.$modal.msgSuccess(`成功生成 ${res.data.created} 个课时`);
            this.showBatchDialog = false;
            this.loadSchedule();
          }
        });
      });
    },
  },
};
</script>
