<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="68px">
            <el-form-item label="位置" prop="position">
                <el-input v-model="queryParams.position" placeholder="请输入Banner位置" clearable
                    @keyup.enter.native="handleQuery" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
            </el-col>

            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataSource">
            <el-table-column label="ID" align="center" prop="id" width="60" />
            <el-table-column label="排序" align="center" prop="orderNum" width="60" />
            <el-table-column label="描述" align="center" prop="desc" />
            <el-table-column label="位置" align="center" prop="position" width="90" />
            <el-table-column label="图片" align="center" prop="image">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.image" :height="60" :width="160" />
                </template>
            </el-table-column>
            <el-table-column label="链接" align="center" prop="url" width="100" />


            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改
                    </el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除
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
                    <el-col :span="24">
                        <el-form-item label="位置" prop="position">
                            <el-input v-model="form.position" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="scale" prop="scale">
                            <el-input v-model="form.scale" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="URL" prop="url">
                            <el-input v-model="form.url" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="描述信息" prop="desc">
                            <el-input type="textarea" v-model="form.desc" placeholder="请输入描述信息" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="图片" prop="image" required>
                            <image-upload v-model="form.image" :limit="1">
                                <el-button size="small">
                                    选择
                                    <i class="el-icon-upload el-icon--right"></i>
                                </el-button>
                            </image-upload>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="排序" prop="orderNum">
                            <el-input-number controls-position="right" v-model="form.orderNum" placeholder="" />
                        </el-form-item>
                    </el-col>
                </el-row>
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
    getBannerList,
    deleteBannerByIds,
    updateBanner, addBanner
} from "@/api/system/banner";
import { mapGetters } from "vuex";
import ImagePreview from "../../../components/ImagePreview/index.vue";


const DEFAULT_FORM = {
    desc: undefined,
    position: undefined,
    scale: undefined,
    image: undefined,
    url: undefined,
    orderNum: undefined,
}

export default {
    name: "Banner",
    dicts: ["banner_status"],
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
                position: [
                    { required: true, message: "藏品名称不能为空", trigger: "change" }
                ],
                image: [
                    { required: true, message: "图片不能为空", trigger: "change" }
                ],
                orderNum: [
                    { required: true, message: "supply不能为空", trigger: "change" }
                ],
                scale: [
                    { required: true, message: "current不能为空", trigger: "change" }
                ],
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
            getBannerList(this.queryParams).then(res => {
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

        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加藏品";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            this.form = row;
            this.title = "修改Banner";
            this.open = true;

        },
        /** 提交按钮 */
        submitForm: function () {
            console.log(this.form);
            this.$refs["form"].validate(valid => {
                if (valid) {

                    if (this.form.id != undefined) {
                        updateBanner(this.form).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    }
                    else {
                        addBanner(this.form).then(response => {
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
            const ids = row.id || this.ids;
            this.$modal.confirm("是否确认删除ID为\"" + ids + "\"的banner？").then(function () {
                return deleteBannerByIds(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        }
    },
    components: { ImagePreview }
};
</script>
