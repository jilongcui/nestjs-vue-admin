<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="68px">
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="活动状态" clearable>
                    <el-option v-for="dict in dict.type.submitter_status" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="dataSource">
            <el-table-column label="ID" align="center" prop="id" width="60" />
            <el-table-column label="手机号" align="center" prop="mobile" width="120" />
            <el-table-column label="发行商" align="center" prop="merchName" width="160" />
            <el-table-column label="藏品名称" align="center" prop="collectionName" width="160" />
            <el-table-column label="藏品图片" align="center" prop="image">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.image" :height="60" :width="160" />
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status" width="60">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.submitter_status" :value="scope.row.status" />
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)">详细
                    </el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['system:submitter:']">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="580px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="手机号" prop="mobile">
                            <el-input v-model="form.mobile" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发行商" prop="merchName">
                            <el-input v-model="form.merchName" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="藏品名称" prop="collectionName">
                            <el-input v-model="form.collectionName" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="描述信息" prop="collection_desc">
                            <el-input type="textarea" v-model="form.collection_desc" placeholder="请输入描述信息" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="图片">
                            <ImagePreview :src="form.image" :height="160" />
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancel">关 闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    getSubmitter,
    getSubmitterList,
    deleteSubmitterByIds
} from "@/api/system/submitter";
import { mapGetters } from "vuex";
import ImagePreview from "../../../components/ImagePreview/index.vue";


const DEFAULT_FORM = {
    status: undefined,
}

export default {
    name: "Submitter",
    dicts: ["submitter_status"],
    data() {
        return {
            // 遮罩层
            loading: true,
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
                position: undefined
            },
            // 表单参数
            form: {
                ...DEFAULT_FORM
            },
            // 表单校验
            rules: {
            },
            dataSource: [],
        };
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询列表 */
        getList() {
            this.loading = true;
            getSubmitterList(this.queryParams).then(res => {
                if (res.code === 200) {
                    this.dataSource = res.data.rows;
                    this.total = res.data.total;
                }
            }).finally(() => {
                this.loading = false;
            });
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

        handleDetail(row) {
            this.reset();
            const submitterId = row.id || this.ids
            getSubmitter(submitterId).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "发行商提交藏品详情";
            });

        },

        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal.confirm("是否确认删除ID为\"" + ids + "\"的提交内容？").then(function () {
                return deleteSubmitterByIds(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        }
    },
    components: { ImagePreview }
};
</script>
