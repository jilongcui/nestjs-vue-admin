<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="题干" prop="text">
        <el-input v-model="queryParams.text" placeholder="题干关键词" clearable style="width:200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="年份" prop="year">
        <el-input v-model="queryParams.year" placeholder="年份" clearable style="width:100px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="typeId">
        <el-select v-model="queryParams.typeId" placeholder="题型" clearable style="width:140px">
          <el-option label="常识判断" value="1" /><el-option label="语言理解" value="2" />
          <el-option label="数量关系" value="3" /><el-option label="判断推理" value="4" />
          <el-option label="资料分析" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="省份" prop="province">
        <el-input v-model="queryParams.province" placeholder="省份" clearable style="width:140px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="题干" prop="text" min-width="250" show-overflow-tooltip />
      <el-table-column label="题型" prop="typeName" width="80" />
      <el-table-column label="省份" prop="province" width="70" />
      <el-table-column label="年份" prop="year" width="60" />
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
          <el-col :span="8">
            <el-form-item label="题型" prop="typeId">
              <el-select v-model="form.typeId" style="width:100%">
                <el-option label="常识判断" value="1" /><el-option label="语言理解" value="2" />
                <el-option label="数量关系" value="3" /><el-option label="判断推理" value="4" />
                <el-option label="资料分析" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="省份" prop="province"><el-input v-model="form.province" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年份" prop="year"><el-input v-model="form.year" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="材料" prop="material">
          <el-input v-model="form.material" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="题干" prop="text">
          <el-input v-model="form.text" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="选项" prop="options">
          <el-input v-model="optionsStr" type="textarea" :rows="3" placeholder="每行一个选项" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="正确答案" prop="correctAnswer"><el-input v-model="form.correctAnswer" /></el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="多选" prop="allowMultipleSelections">
              <el-switch v-model="form.allowMultipleSelections" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="来源" prop="origin"><el-input v-model="form.origin" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="解析" prop="explanation">
          <el-input v-model="form.explanation" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="知识点" prop="knowledges">
          <el-input v-model="knowledgesStr" placeholder="逗号分隔" />
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
import { listQuestion, getQuestion, updateQuestion } from "@/api/course";

export default {
  name: "CourseQuestion",
  data() {
    return {
      loading: false, total: 0, list: [], showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, text: undefined, year: undefined, typeId: undefined, province: undefined },
      dialog: { visible: false, title: "", id: null },
      form: {},
      optionsStr: "",
      knowledgesStr: "",
    };
  },
  created() { this.getList(); },
  methods: {
    async getList() {
      this.loading = true;
      const params = { ...this.queryParams };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await listQuestion(params);
      if (res.code === 200) { this.list = res.data.rows || []; this.total = res.data.total || 0; }
      this.loading = false;
    },
    handleEdit(row) {
      this.dialog.id = row._id;
      this.dialog.title = "编辑行测课程";
      this.dialog.visible = true;
      getQuestion(row._id).then(res => {
        if (res.code === 200) {
          this.form = { ...res.data };
          this.optionsStr = (this.form.options || []).join("\n");
          this.knowledgesStr = (this.form.knowledges || []).join(",");
        }
      });
    },
    async submitForm() {
      const data = { ...this.form };
      data.options = this.optionsStr.split("\n").filter(Boolean);
      data.knowledges = this.knowledgesStr.split(",").filter(Boolean);
      await updateQuestion(this.dialog.id, data);
      this.$modal.msgSuccess("保存成功");
      this.dialog.visible = false;
      this.getList();
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },
  },
};
</script>
