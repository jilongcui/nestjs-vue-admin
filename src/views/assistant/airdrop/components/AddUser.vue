<template>
    <div>
        <div v-if="value">
            <div style="display: flex; align-items:center; ">
                <img :src="value.avatar" style="width:32px; height:32px; border-radius: 50%; display: block; margin-right:4px;" />
                <span>{{ value.nickName }}</span>
            </div>
            <el-button size="mini" @click="openCollectionSelector">重新选择</el-button>
        </div>
        <el-button v-else @click="openCollectionSelector">选择用户</el-button>
        <el-dialog title="选择藏品" :visible.sync="open" width="780px" append-to-body>
            <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
                label-width="68px">
                <el-form-item label="名称" prop="userId">
                    <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table v-loading="loading" :data="dataSource">
                <el-table-column label="userId" align="center" prop="userId" width="60" />
                <el-table-column label="userName" align="center" prop="userName" />
                <el-table-column label="nickName" align="center" prop="nickName" width="160">
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

import { listUser } from "@/api/system/user";
export default {
    name: "AddUser",
    props: ['value'],
    model: {
        prop: "value", //绑定的值，通过父组件传递
        event: "update" //自定义时间名
    },
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
        }
    },
    created() {
        console.log(this.value)
    },
    methods: {
        /** 查询列表 */
        getList() {
            this.loading = true;
            listUser(this.queryParams).then(res => {
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
        choose(user) {
            if (!user) return
            this.$emit('update', user)
            this.open = false
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
    min-height: 80px;
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