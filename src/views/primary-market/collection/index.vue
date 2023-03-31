<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入藏品名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择藏品类型" clearable>
          <el-option v-for="t in collectionTypeArr" :key="t.key" :label="t.value" :value="t.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="合约" prop="contractId">
        <el-select v-model="queryParams.contractId" placeholder="请选择合约" clearable>
          <el-option v-for="c in contractList" :key="c.id" :label="c.chain" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:collection:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:collection:add']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:collection:add']">删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" width="60" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ collectionType[scope.row.type] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="盲盒等级" align="center">
        <template slot-scope="scope">
          <span>{{ magicBoxLevel[scope.row.level] || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="supply" align="center" prop="supply" width="90" />
      <el-table-column label="current" align="center" prop="current" width="90" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.collection_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="author" align="center" prop="author" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.author.nickName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="contract" align="center" prop="contract" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.contract.chain }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:collection:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:collection:delete']">删除</el-button>
          <el-button v-if="scope.row.status==='0'" size="mini" type="text" @click="changeStatus(scope.row, true)"
            v-hasPermi="['system:collection:openMarket']">允许交易
          </el-button>
          <el-button v-if="scope.row.status==='1'" size="mini" type="text" @click="changeStatus(scope.row, false)"
            v-hasPermi="['system:collection:closeMarket']">禁止交易
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="580px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入藏品名称" />
        </el-form-item>
        <el-form-item label="图片" prop="images" required>
          <image-upload v-model="form.images">
            <el-button size="small">
              选择
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </image-upload>
        </el-form-item>
        <el-form-item label="合约" prop="contractId">
          <el-select v-model="form.contractId" placeholder="请选择合约">
            <el-option v-for="c in contractList" :key="c.id" :label="c.name" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="supply" prop="supply">
          <el-input-number controls-position="right" v-model="form.supply" placeholder="" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="藏品类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择藏品类型">
                <el-option v-for="t in collectionTypeArr" :key="t.key" :label="t.value" :value="t.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === '1'">
            <el-form-item label="盲盒等级" prop="level">
              <el-select v-model="form.level" placeholder="请选择盲盒等级">
                <el-option v-for="t in magicBoxLevelArr" :key="t.key" :label="t.value" :value="t.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="藏品介绍" prop="desc">
          <editor v-model="form.desc" :min-height="192" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCollectionList,
  deleteCollectionByIds,
  getCollectionDetailsById,
  updateCollection, addCollection,
  setAllowSell
} from "@/api/collection";
import { getContractList } from "@/api/contract";
import { mapGetters } from "vuex";


const DEFAULT_FORM = {
  name: undefined,
  remark: undefined,
  type: '0',
  desc: undefined,
  images: undefined,
  supply: undefined,
  current: 0,
  status: "0",
  authorId: undefined,
  contractId: undefined
}

export default {
  name: "Collection",
  dicts: ['collection_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined
      },
      // 表单参数
      form: {
        ...DEFAULT_FORM
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "藏品名称不能为空", trigger: "change" }
        ],
        images: [
          { required: true, message: "图片不能为空", trigger: "change" }
        ],
        supply: [
          { required: true, message: "supply不能为空", trigger: "change" }
        ],
        current: [
          { required: true, message: "current不能为空", trigger: "change" }
        ],
      },

      // 藏品类型
      collectionType: {
        0: '普通藏品',
        1: '盲盒藏品'
      },

      // 盲盒等级
      magicBoxLevel: {
        1: 'N',
        2: "SR",
        3: "SSR",
        4: 'UR'
      },

      dataSource: [],
      contractList: [],
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    collectionTypeArr() {
      const arr = []
      for (const key in this.collectionType) {
        if (Object.hasOwnProperty.call(this.collectionType, key)) {
          const value = this.collectionType[key];
          arr.push({
            key,
            value
          })

        }
      }
      return arr
    },
    magicBoxLevelArr() {
      const arr = []
      for (const key in this.magicBoxLevel) {
        if (Object.hasOwnProperty.call(this.magicBoxLevel, key)) {
          const value = this.magicBoxLevel[key];
          arr.push({
            key,
            value
          })

        }
      }
      return arr
    },
  },
  created() {
    this.getList();

    getContractList({ pageNum: 1, pageSize: 999 }).then(res => {
      if (res.code === 200) {
        this.contractList = res.data.rows
      }
    })
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      getCollectionList(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dataSource = res.data.rows
          this.total = res.data.total;
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        ...DEFAULT_FORM
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加藏品";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log(row)
      this.reset();
      const id = row.id || this.ids
      getCollectionDetailsById(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改藏品";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      console.log(this.form)
      this.$refs["form"].validate(valid => {
        if (valid) {
          const { images, ...reset } = this.form
          const data = {
            ...reset,
            images: typeof images === "string" ? images.split(',') : images,
            authorId: this.userInfo.userId
          }
          if (this.form.id != undefined) {
            updateCollection(data).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCollection(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除ID为"' + ids + '"的数据项？').then(function () {
        return deleteCollectionByIds(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    changeStatus(row, allowSell) {
      setAllowSell(row.id, allowSell).then(() => {
        this.getList();
        this.$modal.msgSuccess("设置成功");
      })
    }
  }
};
</script>
