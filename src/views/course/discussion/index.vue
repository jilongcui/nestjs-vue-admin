<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="题干" prop="text">
        <el-input v-model="queryParams.text" placeholder="题干关键词" clearable style="width:200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input v-model="queryParams.year" placeholder="年份" clearable style="width:100px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="搜索名称" clearable style="width:170px" @keyup.enter.native="handleQuery" />
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
      <el-table-column label="名称" prop="name" min-width="200" show-overflow-tooltip />
      <el-table-column label="类型" prop="typeId" width="80" />
      <el-table-column label="省份" prop="province" width="70" />
      <el-table-column label="年份" prop="year" width="60" />
      <el-table-column label="总分" prop="fullScore" width="60" align="right" />
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
            <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型" prop="typeId"><el-input v-model="form.typeId" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="总分" prop="fullScore"><el-input-number v-model="form.fullScore" :min="0" style="width:100%" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province"><el-input v-model="form.province" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年份" prop="year"><el-input v-model="form.year" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门" prop="department"><el-input v-model="form.department" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="comment">
          <el-input v-model="form.comment" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="材料" prop="contents">
          <el-input v-model="contentsStr" type="textarea" :rows="4" placeholder="每段材料一行" />
        </el-form-item>
        <el-form-item label="问题" prop="text">
          <el-input v-model="form.text" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="参考答案" prop="sampleAnswer">
          <el-input v-model="form.sampleAnswer" type="textarea" :rows="4" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="答案" prop="useranswer">
              <el-input v-model="form.useranswer" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="得分点" prop="scorepoint">
              <el-input v-model="scorepointStr" placeholder="逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="dialog.visible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDiscussion, getDiscussion, updateDiscussion } from "@/api/course";

export default {
  name: "CourseDiscussion",
  data() {
    return {
      loading: false, total: 0, list: [], showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, text: undefined, year: undefined, name: undefined, province: undefined },
      dialog: { visible: false, title: "", id: null },
      form: {},
      contentsStr: "",
      scorepointStr: "",
    };
  },
  created() { this.getList(); },
  methods: {
    async getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await listDiscussion(params);
      if (res.code === 200) { this.list = res.data.rows || []; this.total = res.data.total || 0; }
      this.loading = false;
    },
    handleEdit(row) {
      this.dialog.id = row._id;
      this.dialog.title = "编辑申论课程";
      this.dialog.visible = true;
      getDiscussion(row._id).then(res => {
        if (res.code === 200) {
          this.form = { ...res.data };
          this.contentsStr = (this.form.contents || []).join("\n");
          this.scorepointStr = (this.form.scorepoint || []).join(",");
        }
      });
    },
    async submitForm() {
      const data = { ...this.form };
      data.contents = this.contentsStr.split("\n").filter(Boolean);
      data.scorepoint = this.scorepointStr.split(",").filter(Boolean);
      await updateDiscussion(this.dialog.id, data);
      this.$modal.msgSuccess("保存成功");
      this.dialog.visible = false;
      this.getList();
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },
  },
};
</script>
