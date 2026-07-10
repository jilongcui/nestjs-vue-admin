<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="类别">
        <el-select v-model="queryParams.category" placeholder="全部" clearable style="width:130px" @change="handleQuery">
          <el-option label="问题反馈" value="feedback" />
          <el-option label="老师申请" value="teacher_apply" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:100px" @change="handleQuery">
          <el-option label="未读" value="0" />
          <el-option label="已读" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width:160px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-check" size="mini" :disabled="multiple" @click="handleBatchRead">批量已读</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="类别" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.category === 'teacher_apply' ? 'warning' : 'primary'" size="mini">
            {{ scope.row.category === 'teacher_apply' ? '老师申请' : '问题反馈' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" prop="userId" width="160" show-overflow-tooltip />
      <el-table-column label="描述" prop="description" min-width="200" show-overflow-tooltip />
      <el-table-column label="联系方式" prop="contact" width="120" />
      <el-table-column label="状态" width="70" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'danger' : 'success'" size="mini">
            {{ scope.row.status === '0' ? '未读' : '已读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="150">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- ==================== 浮动会话组件 ==================== -->
    <!-- 最小化：圆形浮动按钮 -->
    <div v-if="!chatExpanded && chatReporterId" class="chat-fab" @click="chatExpanded = true">
      <el-badge :value="chatUnread" :hidden="chatUnread === 0" :max="99">
        <div class="fab-avatar">C</div>
      </el-badge>
    </div>

    <!-- 展开：右侧浮动面板 -->
    <div v-if="chatExpanded" class="chat-panel">
      <!-- 头部 -->
      <div class="chat-header">
        <span class="chat-title">{{ chatTitle }}</span>
        <div class="chat-header-actions">
          <el-button type="text" size="mini" icon="el-icon-minus" style="color:#fff;" @click="chatExpanded = false" title="最小化"></el-button>
          <el-button type="text" size="mini" icon="el-icon-close" style="color:#fff;" @click="closeChat" title="关闭"></el-button>
        </div>
      </div>
      <!-- 消息区 -->
      <div class="chat-body" ref="chatBox">
        <div v-if="chatLoading" style="text-align:center; color:#999; padding:60px 0;">加载中...</div>
        <template v-for="(item, i) in chatDisplayItems">
          <div v-if="item._type === 'time'" :key="'t'+i" class="chat-time-divider">
            <span>{{ item.text }}</span>
          </div>
          <div v-else-if="item._type === 'original'" :key="'o'+i" style="margin-bottom:14px;">
            <div style="display:flex; align-items:flex-start; gap:8px;">
              <div class="chat-avatar chat-avatar-user">U</div>
              <div style="flex:1; min-width:0;">
                <div class="chat-msg-meta">用户 ({{ item.userId }})</div>
                <div class="chat-bubble chat-bubble-user">
                  {{ item.description }}
                </div>
                <div v-if="item.contact" class="chat-extra">联系方式：{{ item.contact }}</div>
                <div v-if="item.images && item.images.length" style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
                  <el-image v-for="(img, j) in item.images" :key="j" :src="img"
                    style="width:60px; height:60px; border-radius:4px; border:1px solid #eee; cursor:pointer;"
                    fit="cover" :preview-src-list="item.images" />
                </div>
                <div class="chat-msg-time">{{ parseTime(item.createTime) }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="item._type === 'msg'" :key="'m'+i" style="margin-bottom:10px;">
            <div v-if="item.senderRole === 'admin'" style="display:flex; align-items:flex-start; gap:8px; flex-direction:row-reverse;">
              <div class="chat-avatar chat-avatar-admin">A</div>
              <div style="flex:1; min-width:0; display:flex; flex-direction:column; align-items:flex-end;">
                <div class="chat-bubble chat-bubble-admin">{{ item.content }}</div>
                <div class="chat-msg-time">{{ parseTime(item.createTime) }}</div>
              </div>
            </div>
            <div v-else style="display:flex; align-items:flex-start; gap:8px;">
              <div class="chat-avatar chat-avatar-user">U</div>
              <div style="flex:1; min-width:0;">
                <div class="chat-bubble chat-bubble-user">{{ item.content }}</div>
                <div class="chat-msg-time">{{ parseTime(item.createTime) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 输入区 -->
      <div class="chat-footer">
        <el-input v-model="chatInput" type="textarea" :rows="2" placeholder="输入回复..." @keyup.enter.native="sendChatMessage" :disabled="chatLoading" style="flex:1;" />
        <el-button type="primary" @click="sendChatMessage" :disabled="chatLoading || !chatInput.trim()" style="height:52px; width:72px; margin-left:8px;">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { listReporter, getReporter, markReporterRead, batchReadReporter, delReporter, getReporterMessages, sendReporterMessage } from "@/api/reporter";
import io from "socket.io-client";

function parseTimeStr(t) {
  if (!t) return 0;
  return new Date(t).getTime();
}
function formatDateLabel(t) {
  var d = new Date(t);
  var now = new Date();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  var hour = String(d.getHours()).padStart(2, '0');
  var min = String(d.getMinutes()).padStart(2, '0');
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return '\u4eca\u5929 ' + hour + ':' + min;
  }
  return month + '\u6708' + day + '\u65e5 ' + hour + ':' + min;
}

export default {
  name: "Reporter",
  data() {
    return {
      loading: false, total: 0, list: [],
      ids: [], multiple: true, showSearch: true,
      queryParams: { pageNum: 1, pageSize: 20, category: undefined, status: undefined, userId: undefined },
      // 浮动会话
      chatExpanded: false,
      chatLoading: false,
      chatMessages: [],
      chatInput: '',
      chatReporterId: null,
      chatCategory: '',
      chatUserId: '',
      chatContact: '',
      chatImages: [],
      chatCreateTime: null,
      chatDescription: '',
      chatUnread: 0,
      socket: null,
    };
  },
  computed: {
    chatTitle() {
      if (!this.chatReporterId) return '\u67e5\u770b';
      var type = this.chatCategory === 'teacher_apply' ? '\u8001\u5e08\u7533\u8bf7' : '\u95ee\u9898\u53cd\u9988';
      return type + ' #' + this.chatReporterId;
    },
    chatDisplayItems() {
      var items = [];
      if (this.chatReporterId) {
        items.push({
          _type: 'original',
          userId: this.chatUserId,
          description: this.chatDescription || '',
          contact: this.chatContact,
          images: this.chatImages || [],
          createTime: this.chatCreateTime,
        });
      }
      var lastTime = this.chatCreateTime ? parseTimeStr(this.chatCreateTime) : 0;
      for (var i = 0; i < this.chatMessages.length; i++) {
        var msg = this.chatMessages[i];
        var t = parseTimeStr(msg.createTime);
        if (lastTime && (t - lastTime) > 30 * 60 * 1000) {
          items.push({ _type: 'time', text: formatDateLabel(t) });
        }
        items.push({ _type: 'msg', senderRole: msg.senderRole, content: msg.content, createTime: msg.createTime });
        lastTime = t;
      }
      return items;
    },
  },
  created() {
    this.getList();
    this.initSocket();
  },
  beforeDestroy() {
    if (this.socket) this.socket.close();
  },
  methods: {
    getList() {
      this.loading = true;
      var params = { ...this.queryParams };
      Object.keys(params).forEach(function(k) { if (!params[k] && params[k] !== 0) delete params[k]; });
      var vm = this;
      listReporter(params).then(function(res) {
        if (res.code === 200) { vm.list = res.data.rows || []; vm.total = res.data.total || 0; }
        vm.loading = false;
      }).catch(function() { vm.loading = false; });
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(function(item) { return item.id; });
      this.multiple = !selection.length;
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList(); },
    resetQuery() { this.resetForm("queryForm"); this.handleQuery(); },

    initSocket() {
      var token = localStorage.getItem('Admin-Token');
      if (!token) return;
      var vm = this;
      this.socket = io(location.origin, {
        path: '/socket.io',
        auth: { token: token.replace('Bearer ', '') },
      });
      this.socket.on('connect', function() { console.log('admin WS connected'); });
      this.socket.on('admin:new-reporter', function(data) {
        vm.$notify({
          title: data.category === 'teacher_apply' ? '\u65b0\u8001\u5e08\u7533\u8bf7' : '\u65b0\u95ee\u9898\u53cd\u9988',
          message: data.description ? data.description.slice(0, 50) : '---',
          type: data.category === 'teacher_apply' ? 'warning' : 'info',
          duration: 5000,
        });
        vm.getList();
      });
      this.socket.on('admin:reporter-message', function(data) {
        if (data.reporterId === vm.chatReporterId) {
          if (vm.chatExpanded) {
            vm.chatMessages.push(data);
            vm.$nextTick(function() { vm.scrollChat(); });
          } else {
            vm.chatUnread++;
          }
        }
      });
    },

    handleView(row) {
      var vm = this;
      this.chatReporterId = row.id;
      this.chatCategory = row.category || 'feedback';
      this.chatMessages = [];
      this.chatInput = '';
      this.chatUnread = 0;
      this.chatExpanded = true;
      this.chatLoading = true;
      // 标记已读
      if (row.status === '0') markReporterRead(row.id).then(function() { vm.getList(); });
      // 加载详情
      getReporter(row.id).then(function(detailRes) {
        if (detailRes.code === 200) {
          var d = detailRes.data;
          vm.chatUserId = d.userId || '';
          vm.chatContact = d.contact || '';
          vm.chatImages = d.images || [];
          vm.chatCreateTime = d.createTime;
          vm.chatDescription = d.description || '';
        }
        return getReporterMessages(vm.chatReporterId);
      }).then(function(msgRes) {
        if (msgRes.code === 200) vm.chatMessages = msgRes.data || [];
        vm.chatLoading = false;
        vm.$nextTick(function() { vm.scrollChat(); });
      }).catch(function() { vm.chatLoading = false; });
    },

    closeChat() {
      this.chatExpanded = false;
      this.chatReporterId = null;
      this.chatMessages = [];
    },

    sendChatMessage() {
      var content = this.chatInput.trim();
      if (!content) return;
      this.chatInput = '';
      var vm = this;
      sendReporterMessage(this.chatReporterId, content).then(function(res) {
        if (res.code === 200) {
          vm.chatMessages.push(res.data);
          vm.$nextTick(function() { vm.scrollChat(); });
        }
      });
    },

    scrollChat() {
      var vm = this;
      setTimeout(function() {
        var box = vm.$refs.chatBox;
        if (box) box.scrollTop = box.scrollHeight;
      }, 50);
    },

    handleBatchRead() {
      if (!this.ids.length) return;
      var vm = this;
      this.$modal.confirm('\u786e\u8ba4\u5c06\u9009\u4e2d\u7684 ' + this.ids.length + ' \u6761\u6807\u8bb0\u4e3a\u5df2\u5904\u7406\uff1f').then(function() {
        batchReadReporter(vm.ids).then(function() {
          vm.$modal.msgSuccess('\u5df2\u6279\u91cf\u6807\u8bb0\u4e3a\u5df2\u5904\u7406');
          vm.getList();
        });
      }).catch(function() {});
    },

    handleDelete(row) {
      var ids = row.id ? [row.id] : this.ids;
      var vm = this;
      this.$modal.confirm('\u662f\u5426\u786e\u8ba4\u5220\u9664\uff1f').then(function() {
        delReporter(ids.join(",")).then(function() {
          vm.getList();
          vm.$modal.msgSuccess('\u5220\u9664\u6210\u529f');
        });
      }).catch(function() {});
    },
  },
};
</script>

<style scoped>
.mb8 { margin-bottom: 8px; }

/* 浮动按钮 */
.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  cursor: pointer;
}
.fab-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 12px rgba(64,158,255,0.4);
  transition: transform 0.2s;
}
.fab-avatar:hover { transform: scale(1.08); }

/* 浮动面板 */
.chat-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 420px;
  height: 580px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.chat-header {
  background: #409eff;
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.chat-title { font-size: 14px; font-weight: 600; }
.chat-header-actions { display: flex; gap: 4px; }

/* 消息区 */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f5f6f7;
}
.chat-body::-webkit-scrollbar { width: 4px; }
.chat-body::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

/* 时间分隔 */
.chat-time-divider { text-align: center; font-size: 11px; color: #999; margin: 12px 0 10px; }
.chat-time-divider span { background: #e8e8e8; padding: 2px 12px; border-radius: 8px; }

/* 头像 */
.chat-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}
.chat-avatar-admin { background: #409eff; color: #fff; }
.chat-avatar-user { background: #e6a23c; color: #fff; }

/* 气泡 */
.chat-bubble {
  padding: 8px 12px;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 13px;
}
.chat-bubble-admin {
  background: #409eff;
  color: #fff;
  border-radius: 12px 12px 4px 12px;
  max-width: 80%;
}
.chat-bubble-user {
  background: #fff;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 12px 12px 12px 4px;
  max-width: 80%;
}

/* 元信息 */
.chat-msg-meta { font-size: 11px; color: #999; margin-bottom: 2px; }
.chat-msg-time { font-size: 10px; color: #bbb; margin-top: 2px; }
.chat-extra { font-size: 11px; color: #999; margin-top: 3px; }

/* 输入区 */
.chat-footer {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px solid #eee;
  background: #fff;
  flex-shrink: 0;
}
</style>
