<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="题干" prop="text">
        <el-input v-model="queryParams.text" placeholder="题干关键词" clearable style="width:200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="搜索标题" clearable style="width:170px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input v-model="queryParams.year" placeholder="年份" clearable style="width:100px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="typeIds">
        <el-select v-model="queryParams.typeIds" placeholder="面试类型" clearable style="width:140px">
          <el-option label="社会现象" value="1" /><el-option label="态度观点" value="2" />
          <el-option label="组织管理" value="3" /><el-option label="应急应变" value="4" />
          <el-option label="人际关系" value="5" /><el-option label="现场模拟" value="6" />
          <el-option label="演讲" value="7" /><el-option label="漫画图片" value="8" />
          <el-option label="结构化小组" value="9" />
        </el-select>
      </el-form-item>
      <el-form-item label="省份" prop="province">
        <el-input v-model="queryParams.province" placeholder="省份" clearable style="width:110px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
      <el-table-column label="考试" prop="careerName" width="80" />
      <el-table-column label="省份" prop="province" width="80" />
      <el-table-column label="年份" prop="year" width="70" />
      <el-table-column label="来源" prop="origin" width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="800px" top="2vh">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="考试类型" prop="careerName"><el-input v-model="form.careerName" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="省份" prop="province"><el-input v-model="form.province" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="年份" prop="year"><el-input v-model="form.year" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源" prop="origin"><el-input v-model="form.origin" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门" prop="department"><el-input v-model="form.department" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="类型IDs" prop="typeIds">
          <el-input v-model="form.typeIds" placeholder="逗号分隔, 如 1,2,3" />
        </el-form-item>
        <el-form-item label="说明" prop="introduction">
          <el-input v-model="form.introduction" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="材料" prop="material">
          <el-input v-model="form.material" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="题干" prop="text">
          <el-input v-model="form.text" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="参考答案" prop="sampleAnswer">
          <el-input v-model="form.sampleAnswer" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="思维导图" prop="mindmapUrl">
          <el-input v-model="form.mindmapUrl" placeholder="URL" />
        </el-form-item>
        <el-form-item label="分析" prop="analysis">
          <el-input v-model="form.analysis" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialog.visible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInterview, getInterview, updateInterview } from "@/api/course";

export default {
  name: "CourseInterview",
  data() {
    return {
      loading: false, total: 0, list: [], showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, text: undefined, title: undefined, year: undefined, typeIds: undefined, province: undefined },
      dialog: { visible: false, title: "", id: null },
      form: {},
    };
  },
  created() { this.getList(); },
  methods: {
    async getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await listInterview(params);
      if (res.code === 200) { this.list = res.data.rows || []; this.total = res.data.total || 0; }
      this.loading = false;
    },
    handleEdit(row) {
      this.dialog.id = row._id;
      this.dialog.title = "编辑面试课程";
      this.dialog.visible = true;
      getInterview(row._id).then(res => {
        if (res.code === 200) {
          this.form = { ...res.data };
          if (Array.isArray(this.form.typeIds)) this.form.typeIds = this.form.typeIds.join(",");
        }
      });
    },
    async submitForm() {
      const data = { ...this.form };
      if (typeof data.typeIds === "string") data.typeIds = data.typeIds.split(",").filter(Boolean);
      await updateInterview(this.dialog.id, data);
      this.$modal.msgSuccess("保存成功");
      this.dialog.visible = false;
      this.getList();
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },
  },
};
</script>
