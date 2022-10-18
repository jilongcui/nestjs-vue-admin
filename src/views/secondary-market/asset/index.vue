<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="68px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入藏品名称" clearable
                    @keyup.enter.native="handleQuery" />
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
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
                    @click="handleDelete" v-hasPermi="['system:collection:delete']">删除
                </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataSource" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="ID" align="center" prop="id" width="60" />
            <el-table-column label="藏品" align="center" prop="collection" width="160">
                <template slot-scope="scope">
                    <ImagePreview :src="scope.row.collection.images[0]" :height="80" />
                </template>
            </el-table-column>
            <el-table-column label="藏品名称" align="center" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.collection.name }}#{{ scope.row.assetNo }}</span>
                </template>
            </el-table-column>

            <el-table-column label="价格" align="center" prop="price" width="90" />
            <el-table-column label="状态" align="center" prop="status" width="100">
            </el-table-column>

            <el-table-column label="持有者" align="center" prop="user" width="160">
                <template slot-scope="scope">
                    <span>{{ scope.row.user.nickName }}</span>
                </template>
            </el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['system:collection:delete']">删除
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
                        <el-form-item label="name" prop="name">
                            <el-input v-model="form.name" placeholder="请输入藏品名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="remark" prop="remark">
                            <el-input type="textarea" v-model="form.remark" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="desc" prop="desc">
                            <el-input type="textarea" v-model="form.desc" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="图片" prop="images" required>
                            <image-upload v-model="form.images">
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
                        <el-form-item label="supply" prop="supply">
                            <el-input-number controls-position="right" v-model="form.supply" placeholder="" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="current" prop="current">
                            <el-input-number controls-position="right" v-model="form.current" placeholder="" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态" prop="status">
                            <el-select v-model="form.status" placeholder="请选择状态">
                                <el-option v-for="dict in dict.type.asset_status" :key="dict.value" :label="dict.label"
                                    :value="dict.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合约" prop="contractId">
                            <el-select v-model="form.contractId" placeholder="请选择合约">
                                <el-option v-for="c in contractList" :key="c.id" :label="c.chain" :value="c.id">
                                </el-option>
                            </el-select>
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
    getAssetList,
    deleteAssetByIds,
    getAssetDetailsById,
    updateAsset
} from "@/api/secondary-market/asset";
import { getContractList } from "@/api/contract";
import { mapGetters } from "vuex";
import ImagePreview from "../../../components/ImagePreview/index.vue";


const DEFAULT_FORM = {
    name: undefined,
    remark: undefined,
    desc: undefined,
    images: undefined,
    supply: undefined,
    current: undefined,
    status: undefined,
    authorId: undefined,
    contractId: undefined
}

export default {
    name: "Asset",
    dicts: ["asset_status"],
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
            dataSource: [],
            contractList: [],
        };
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    created() {
        this.getList();
        getContractList({ pageNum: 1, pageSize: 999 }).then(res => {
            if (res.code === 200) {
                this.contractList = res.data.rows;
            }
        });
    },
    methods: {
        /** 查询列表 */
        getList() {
            this.loading = true;
            getAssetList(this.queryParams).then(res => {
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
        // 多选框选中数据
        handleSelectionChange(selection) {
            this.ids = selection.map(item => item.id);
            this.single = selection.length != 1;
            this.multiple = !selection.length;
        },
        /** 提交按钮 */
        submitForm: function () {
            console.log(this.form);
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const { images, ...reset } = this.form;
                    const data = {
                        ...reset,
                        images: typeof images === "string" ? images.split(",") : images,
                        authorId: this.userInfo.userId
                    };
                    if (this.form.id != undefined) {
                        updateAsset(data).then(response => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    }
                    else {
                        addAsset(data).then(response => {
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
            this.$modal.confirm("是否确认删除ID为\"" + ids + "\"的数据项？").then(function () {
                return deleteAssetByIds(ids);
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        }
    },
    components: { ImagePreview }
};
</script>
