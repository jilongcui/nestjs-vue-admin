<template>
    <div>
        <div class="add-button" @click="openCollectionSelector">
            <i class="el-icon-plus" style="font-size: 36px;"></i>
            <p class="text">添加藏品</p>
        </div>
        <el-dialog title="选择藏品" :visible.sync="open" width="780px" append-to-body>
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
            <el-table v-loading="loading" :data="dataSource">
                <el-table-column label="序号" align="center" prop="id" width="60" />
                <el-table-column label="名称" align="center" prop="name" />

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

                <el-table-column label="操作" fixed="right" align="right">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="choose(scope.row)">选择
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-dialog>
    </div>
</template>

<script>

import {
    getCollectionList,
} from "@/api/collection";

import { getContractList } from "@/api/contract";
export default {
    name: "AddActivityCollectionItem",
    dicts: ['collection_status'],
    data() {
        return {
            // 遮罩层
            loading: true,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                status: undefined
            },

            showSearch: true,
            // 是否显示弹出层
            open: false,
            // 总条数
            total: 0,
            dataSource: [],
            contractList: [],
        }
    },
    created() {
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
        openCollectionSelector() {
            this.open = true
            this.getList()
        },

        // 取消按钮
        cancel() {
            this.open = false;
            this.resetForm("queryForm");
        },
        choose(c) {
            if (!c) return
            this.$modal.confirm(`确定要添加这个藏品吗？`).then(() => {
                console.log('添加')
                this.$emit('add', c)
                this.open = false
            })
        }
    }
};
</script>

<style lang="scss" scoped>
.add-button {
    width: 100%;
    height: 100%;
    max-width: 256px;
    max-height: 256px;
    min-height: 248px;
    border: dashed 1px #ccc;
    border-radius: 8px;
    padding: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    transition: all 200ms;

    &:hover {
        border-color: #000;
    }

    .text {
        margin-top: 8px;
        margin-block: 0;
    }

}
</style>>