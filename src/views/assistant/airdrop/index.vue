<template>
    <div class="app-container">
        <!-- <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="地址" prop="address">
          <el-input v-model="queryParams.address" placeholder="请输入地址" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-select v-model="queryParams.status" placeholder="活动状态" clearable>
            <el-option v-for="dict in dict.type.activity_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="活动类型" clearable>
            <el-option v-for="dict in dict.type.activity_type" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form> -->

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['system:airdrop:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain size="mini" @click="handleImportData"
                    v-hasPermi="['system:airdrop:import']">导入</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain size="mini" @click="handleExportData"
                    v-hasPermi="['system:airdrop:export']">导出
                </el-button>
            </el-col>
            <!-- <el-col :span="1.5">
                <el-button type="danger" plain size="mini" @click="handleDownloadTemp">下载模版
                </el-button>
            </el-col> -->
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataList">
            <el-table-column label="id" align="center" prop="id" width="80" />
            <el-table-column label="数量" align="center" prop="count" />
            <el-table-column label="状态" align="center" prop="status" width="80">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.airdropwhitelist_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="领取方式" align="center" prop="claimType" width="100">
                <template slot-scope="scope">
                    <span>{{ claimTypes[scope.row.claimType].label}}</span>
                </template>
            </el-table-column>
            <el-table-column label="藏品合集ID" align="center" prop="collectionIds" width="100">
            </el-table-column>
            <el-table-column label="用户" width="200">
                <template slot-scope="scope">
                    <span>{{ scope.row.user.nickName || '-'}}</span>
                    <!-- <div style="display: flex; align-items: center;"> -->
                    <!-- <img :src="scope.row.user.avatar"
                            style="width:32px; height: 32px; display: block; margin-right: 3px;" /> -->
                    <!-- <span>{{ scope.row.user.nickName || '-'}}</span> -->
                    <!-- </div> -->
                </template>
            </el-table-column>

            <el-table-column label="创建时间" align="center" prop="createTime" width="160">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更改时间" align="center" prop="updateTime" width="160">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
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
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">

                <el-form-item label="藏品" prop="collections">
                    <el-row>
                        <el-col :span="12" v-for="c in form.collections" :key="c.id">
                            <div style="padding: 6px">
                                <CollectionItem :item="c" v-on:remove="handleRemoveCollection(c)" />
                            </div>
                        </el-col>
                        <el-col :span="12">
                            <div style="padding: 6px">
                                <AddCollection v-on:add="handleAddCollection" />
                            </div>
                        </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item label="用户" prop="user">
                    <AddUser v-model="form.user" />
                </el-form-item>
                <el-form-item label="空投数量" prop="count">
                    <el-input v-model="form.count"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="11">
                        <el-form-item label="领取方式" prop="claimType">
                            <el-select v-model="form.claimType" placeholder="请选择领取">
                                <el-option v-for="dict in claimTypes" :key="dict.value" :label="dict.label"
                                    :value="dict.value"></el-option>
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

        <!-- 用户导入对话框 -->
        <el-dialog title="从Excel导入" :visible.sync="upload.open" width="400px" append-to-body>
            <el-upload ref="upload" :limit="1" accept=".xlsx, .xls, .csv" :headers="upload.headers" :action="upload.url"
                :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess"
                :auto-upload="false" drag>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip text-center" slot="tip">
                    <span>仅允许导入xls、xlsx、csv格式文件。</span>
                    <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                        @click="handleDownloadTemp">下载模板</el-link>
                </div>
            </el-upload>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitFileForm">确 定</el-button>
                <el-button @click="upload.open = false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
  
<script>
import {
    addAirdropWhitelist,
    getAirdropWhiteList,
    getAirdropWhitelistDetailsById,
    deleteAirdropWhitelistById,
    updateAirdropWhitelist,
    downloadExcelTemp,
    exportWhitelistData
} from "@/api/system/airdrop";
import { getToken } from "@/utils/auth";
import AddCollection from "./components/AddCollection.vue"
import AddUser from "./components/AddUser.vue"
import CollectionItem from "./components/CollectionItem.vue"

const DEFAULT_FORM = {
    count: undefined,
    status: undefined,
    collections: [],
    user: undefined,
    claimType: '0',
};

export default {
    name: "AirdropWhitelist",
    components: {
        CollectionItem,
        AddCollection,
        AddUser
    },
    dicts: ['airdropwhitelist_status'],
    data() {
        return {
            claimTypes: [
                {
                    label: '直接发放',
                    value: '0'
                },
                {
                    label: '需要领取',
                    value: '1'
                },
            ],
            baseUrl: process.env.VUE_APP_BASE_API,
            top_status_dict: {
                1: {
                    label: "是",
                    value: "1",
                    type: "success",
                },
                0: {
                    label: "否",
                    value: "0",
                    type: "danger",
                },
            },
            // 遮罩层
            loading: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 数据
            dataList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                title: undefined,
                type: undefined,
                userId: undefined,
                userName: undefined,
                count: undefined,
                // 空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败
                status: undefined,
                // 领取方式 0: 直接发放，1:需要领取
                claimType: undefined
            },
            // 表单参数
            form: {
                ...DEFAULT_FORM,
            },
            // 表单校验
            rules: {
                collections: [{ required: true, message: "藏品不能为空" }],
                user: [{ required: true, message: "用户不能为空" }],
                count: [{ required: true, message: "数量不能为空" }],
                status: [{ required: true, message: "状态不能为空" }],
                claimType: [{ required: true, message: "领取方式不能为空" }],
            },

            // 用户导入参数
            upload: {
                // 是否显示弹出层（用户导入）
                open: false,
                // 是否禁用上传
                isUploading: false,
                // 设置上传的请求头部
                headers: { Authorization: "Bearer " + getToken() },
                // 上传的地址
                url: process.env.VUE_APP_BASE_API + "/airdropWhitelist/importData"
            },
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询列表 */
        getList() {
            this.loading = true;
            getAirdropWhiteList(this.queryParams).then((response) => {
                this.dataList = response.data.rows;
                this.total = response.data.total;
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
                ...DEFAULT_FORM,
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
            this.title = "添加空投白名单";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();


            const { collections = [], ...reset } = row;
            this.form = {
                ...reset,
                collections
            };
            // this.currentCollections = collections;
            this.open = true;
            this.title = "修改空投白名单";
        },

        /**
         * 移除藏品
         * @param {*} c
         */
        handleRemoveCollection(c) {
            this.form.collections = this.form.collections.filter(
                (item) => item.id !== c.id
            );
        },
        /**
         * 添加藏品
         * @param {*} c
         */
        handleAddCollection(c) {
            const idx = (this.form.collections || []).findIndex(item => item.id === c.id)
            if (idx < 0) {
                this.form.collections = [...this.form.collections, c];
            } else {
                this.$message.error('藏品已存在')
            }
        },

        /** 提交按钮 */
        submitForm: function () {
            console.log(this.form);
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    const { user, collections, count, ...reset } = this.form;
                    const data = {
                        ...reset,
                        collectionIds: collections.map(item => item.id).join(','),
                        userId: user.userId,
                        userName: user.userName,
                        count: parseInt(count)
                    };

                    console.log(data)
                    if (this.form.id != undefined) {
                        updateAirdropWhitelist(data, this.form.id).then(() => {
                            this.$modal.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        data.status = "0"
                        addAirdropWhitelist(data).then(() => {
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

            this.$modal
                .confirm('是否确认删除编号为"' + row.id + '"的数据？')
                .then(function () {
                    return deleteAirdropWhitelistById(row.id);
                })
                .then(() => {
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                })
                .catch(() => { });
        },


        async handleExportData() {
            await exportWhitelistData()
        },

        async handleImportData() {
            this.upload.open = true
        },

        // 文件上传中处理
        handleFileUploadProgress(event, file, fileList) {
            this.upload.isUploading = true;
        },

        // 文件上传成功处理
        handleFileSuccess(response, file, fileList) {
            this.upload.open = false;
            this.upload.isUploading = false;
            this.$refs.upload.clearFiles();
            this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
            this.getList();
        },
        // 提交上传文件
        submitFileForm() {
            this.$refs.upload.submit();
        },

        async handleDownloadTemp() {
            await downloadExcelTemp()
            this.$message.success('模版下载成功')
        }
    },
};
</script>
  