<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="课程标题" clearable style="width:180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="老师姓名" prop="teacherName">
        <el-input v-model="queryParams.teacherName" placeholder="老师姓名" clearable style="width:150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="课程状态" clearable style="width:120px">
          <el-option label="上架" value="active" />
          <el-option label="下架" value="inactive" />
        </el-select>
      </el-form-item>
      <el-form-item label="领域" prop="field">
        <el-input v-model="queryParams.field" placeholder="专业领域" clearable style="width:150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <el-col :span="1.5"><el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button></el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="courseList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="课程标题" prop="title" min-width="200" show-overflow-tooltip v-if="columns[0].visible" />
      <el-table-column label="老师" prop="teacherName" width="100" v-if="columns[1].visible" />
      <el-table-column label="价格" width="90" align="right" v-if="columns[2].visible">
        <template slot-scope="scope">{{ scope.row.price }} 元</template>
      </el-table-column>
      <el-table-column label="评分" width="180" v-if="columns[3].visible">
        <template slot-scope="scope">
          <el-rate :value="scope.row.rating" disabled show-score text-color="#ff9900" score-template="{value}" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center" v-if="columns[4].visible">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
            {{ scope.row.status === 'active' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领域" prop="field" width="120" v-if="columns[5].visible" show-overflow-tooltip />
      <el-table-column label="预约" prop="bookingCount" width="60" align="center" v-if="columns[6].visible" />
      <el-table-column label="创建时间" width="160" v-if="columns[7].visible">
        <template slot-scope="scope">{{ parseTime(scope.row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-date" @click="goSchedule(scope.row)">排期</el-button>
          <el-button size="mini" type="text" icon="el-icon-document" @click="goBookings(scope.row)">预约</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="650px" append-to-body @close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程标题" prop="title"><el-input v-model="form.title" placeholder="课程标题" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="领域" prop="field"><el-input v-model="form.field" placeholder="如：公务员面试" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" type="textarea" :rows="3" placeholder="课程描述，支持多行文本" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="老师ID" prop="teacherId"><el-input v-model="form.teacherId" placeholder="老师ID" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="老师姓名" prop="teacherName"><el-input v-model="form.teacherName" placeholder="姓名" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width:100%">
                <el-option label="上架" value="active" />
                <el-option label="下架" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :step="10" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="dialog.id">
          <el-col :span="12">
            <el-form-item label="Apple IAP" prop="iAPItem">
              <el-input v-model="form.iAPItem" placeholder="商品ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="老师头像" prop="teacherAvatar">
          <div style="display:flex; align-items:flex-start; gap:12px;">
            <image-upload v-model="form.teacherAvatar" :limit="1" :file-size="2" style="flex-shrink:0;" />
            <div style="font-size:12px; color:#999; line-height:1.6; padding-top:8px;">
              建议尺寸 200×200px，大小不超过 2MB<br/>
              支持 JPG/PNG 格式
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Apple IAP" prop="iAPItem" v-if="dialog.id">
          <el-input v-model="form.iAPItem" placeholder="商品ID" />
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
import { listCourse, getCourse, addCourse, updateCourse, delCourse } from "@/api/teacher";

export default {
  name: "TeacherCourse",
  data() {
    return {
      loading: false, total: 0, courseList: [],
      ids: [], single: true, multiple: true, showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, title: undefined, teacherName: undefined, status: undefined, field: undefined },
      columns: [
        { key: 0, label: '课程标题', visible: true }, { key: 1, label: '老师', visible: true },
        { key: 2, label: '价格', visible: true }, { key: 3, label: '评分', visible: true },
        { key: 4, label: '状态', visible: true }, { key: 5, label: '领域', visible: true },
        { key: 6, label: '预约次数', visible: false }, { key: 7, label: '创建时间', visible: true },
      ],
      dialog: { visible: false, title: "", id: null }, form: {},
      avatarError: false,
      rules: {
        title: [{ required: true, message: "课程标题不能为空", trigger: "blur" }],
        teacherId: [{ required: true, message: "老师ID不能为空", trigger: "blur" }],
        teacherName: [{ required: true, message: "老师姓名不能为空", trigger: "blur" }],
        price: [{ required: true, message: "价格不能为空", trigger: "blur" }],
      },
    };
  },
  created() { this.getList(); },
  methods: {
    getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      listCourse(params).then(res => {
        if (res.code === 200) { this.courseList = res.data.rows || []; this.total = res.data.total || 0; }
        this.loading = false;
      }).catch(() => { this.loading = false; });
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item._id);
      this.single = selection.length !== 1; this.multiple = !selection.length;
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },
    reset() { this.form = { title: "", subtitle: "", teacherId: "", teacherName: "", teacherAvatar: "", price: 0, field: "", status: "active" }; },
    cancel() { this.dialog.visible = false; this.resetForm("form"); },
    handleAdd() { this.reset(); this.dialog.id = null; this.dialog.title = "新增课程"; this.dialog.visible = true; },
    handleEdit(row) {
      this.reset(); this.dialog.id = row._id; this.dialog.title = "编辑课程"; this.dialog.visible = true;
      getCourse(row._id).then(res => {
        if (res.code === 200) this.form = { ...res.data };
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) return;
        const data = { ...this.form };
        const req = this.dialog.id ? updateCourse(this.dialog.id, data) : addCourse(data);
        req.then(() => { this.$modal.msgSuccess(this.dialog.id ? "保存成功" : "新增成功"); this.dialog.visible = false; this.getList(); });
      });
    },
    handleDelete(row) {
      const ids = row._id ? [row._id] : this.ids;
      this.$modal.confirm('是否确认删除？').then(() => delCourse(ids.join(","))).then(() => { this.getList(); this.$modal.msgSuccess("删除成功"); }).catch(() => {});
    },
    goSchedule(row) {
      this.$router.push({ path: '/teacher/schedule', query: { courseId: row._id, courseTitle: row.title } });
    },
    goBookings(row) {
      this.$router.push({ path: '/teacher/booking', query: { courseId: row._id, courseTitle: row.title } });
    },
  },
};
</script>
<style scoped>.mb8 { margin-bottom: 8px; }</style>
