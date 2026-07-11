<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people"><svg-icon icon-class="peoples" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">会员总数</div>
            <div class="card-panel-num">{{ summary.userTotal }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" style="color:#36a3f7;"><svg-icon icon-class="peoples" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日新增会员</div>
            <div class="card-panel-num" style="color:#36a3f7;">{{ summary.userToday }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping"><svg-icon icon-class="shopping" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">订单总数</div>
            <div class="card-panel-num">{{ summary.orderTotal }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" style="color:#36a3f7;"><svg-icon icon-class="shopping" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日新增订单</div>
            <div class="card-panel-num" style="color:#36a3f7;">{{ summary.orderToday }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money"><svg-icon icon-class="money" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">总收入</div>
            <div class="card-panel-num">{{ summary.revenueTotal }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" style="color:#36a3f7;"><svg-icon icon-class="money" class-name="card-panel-icon" /></div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日收入</div>
            <div class="card-panel-num" style="color:#36a3f7;">{{ summary.revenueToday }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-col :span="12">
        <line-chart :chart-data="userChartData" />
      </el-col>
      <el-col :span="12">
        <line-chart :chart-data="orderChartData" :names="['创建订单', '完成订单', '收入(元)']" :dual-axis="true"/>
      </el-col>
    </el-row>

    <!-- 学习统计 -->
    <el-divider content-position="left" style="font-size:18px;font-weight:bold;">学习统计</el-divider>

    <el-row :gutter="20" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col" v-for="item in learningSummary" :key="item.subject">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper" :class="item.subject === 'interview' ? 'icon-message' : item.subject === 'xingce' ? 'icon-people' : 'icon-shopping'">
            <svg-icon :icon-class="item.subject === 'interview' ? 'form' : item.subject === 'xingce' ? 'list' : 'edit'" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ item.name }}</div>
            <div class="card-panel-num" style="font-size:14px;line-height:1.8;">
              套题{{ item.totalSets }} | 今日{{ item.todaySets }}<br>
              总练习{{ item.totalUsers }}人 / 今日{{ item.todayUsers }}人
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-col :span="24">
        <el-tabs v-model="activeLearningTab" @tab-click="loadLearningTrend">
          <el-tab-pane label="面试" name="interview">
            <line-chart :chart-data="interviewChartData" :names="['练习套数', '练习人数', '']"/>
          </el-tab-pane>
          <el-tab-pane label="行测" name="xingce">
            <line-chart :chart-data="xingceChartData" :names="['练习套数', '练习人数', '']"/>
          </el-tab-pane>
          <el-tab-pane label="申论" name="shenlun">
            <line-chart :chart-data="shenlunChartData" :names="['练习套数', '练习人数', '']"/>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from './dashboard/LineChart'
import { getDashboardSummary, getDashboardDailyTrend, getLearningSummary, getLearningTrend } from '@/api/dashboard'

export default {
  name: 'Dashboard',
  components: { LineChart },
  data() {
    return {
      summary: { userTotal: 0, userToday: 0, orderTotal: 0, orderToday: 0, revenueTotal: 0, revenueToday: 0 },
      userChartData: { expectedData: [], date: [] },
      orderChartData: { expectedData: [], actualData: [], revenueData: [], date: [] },
      learningSummary: [],
      activeLearningTab: 'interview',
      interviewChartData: { expectedData: [], date: [] },
      xingceChartData: { expectedData: [], date: [] },
      shenlunChartData: { expectedData: [], date: [] },
      learningTrendCache: null,
    }
  },
  created() {
    this.loadSummary()
    this.loadDailyTrend()
    this.loadLearningSummary()
    this.loadLearningTrend()
  },
  methods: {
    loadSummary() {
      getDashboardSummary().then(res => {
        if (res.code === 200) this.summary = res.data
      })
    },
    loadDailyTrend() {
      getDashboardDailyTrend(30).then(res => {
        if (res.code === 200 && res.data) {
          const date = res.data.map(d => d.date.slice(5));
          this.userChartData = { date, expectedData: res.data.map(d => parseInt(d.newUsers)) };
          this.orderChartData = {
            date,
            expectedData: res.data.map(d => parseInt(d.totalOrders)),
            actualData: res.data.map(d => parseInt(d.newOrders)),
            revenueData: res.data.map(d => parseFloat(d.revenue)),
          };
        }
      })
    },
    loadLearningSummary() {
      getLearningSummary().then(res => {
        if (res.code === 200) this.learningSummary = res.data || []
      })
    },
    loadLearningTrend() {
      getLearningTrend(30).then(res => {
        if (res.code === 200 && res.data) {
          this.learningTrendCache = res.data;
          this.applyLearningChart();
        }
      })
    },
    applyLearningChart() {
      if (!this.learningTrendCache) return;
      const tab = this.activeLearningTab;
      this[`${tab}ChartData`] = {
        date: this.learningTrendCache.map(d => d.date),
        expectedData: this.learningTrendCache.map(d => d[`${tab}Sets`] || 0),
        actualData: this.learningTrendCache.map(d => d[`${tab}Users`] || 0),
      };
    },
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  .panel-group { margin-top: 18px; }
  .card-panel-col { margin-bottom: 32px; }
  .card-panel {
    height: 108px; font-size: 12px; position: relative; overflow: hidden;
    color: #666; background: #fff;
    box-shadow: 4px 4px 40px rgba(0,0,0,.05); border-color: rgba(0,0,0,.05);
    .card-panel-icon-wrapper {
      float: left; margin: 14px 0 0 14px; padding: 16px;
      transition: all 0.38s ease-out; border-radius: 6px;
    }
    .card-panel-icon { float: left; font-size: 48px; }
    .card-panel-description {
      float: right; font-weight: bold; margin: 26px; margin-left: 0px;
      .card-panel-text {
        line-height: 18px; color: rgba(0,0,0,0.45); font-size: 16px; margin-bottom: 12px;
      }
      .card-panel-num { font-size: 20px; }
    }
  }
}
</style>
