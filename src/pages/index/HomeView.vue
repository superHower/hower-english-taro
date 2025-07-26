<template>
  <div class="about" :style="{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }">
    <div class="top">
      <div class="content-left">
        <el-select size="small" style="width: 150px;" v-model="search.book" placeholder="Book" @change="handleBook">
          <el-option value="7A" label="7A"></el-option>
          <el-option value="7B" label="7B"></el-option>
          <el-option value="8A" label="8A"></el-option>
          <el-option value="8B" label="8B"></el-option>
          <el-option value="9A" label="9A"></el-option>
          <el-option value="9B" label="9B"></el-option>
        </el-select>
        <el-select size="small" v-model="search.type" multiple placeholder="Choose word type">
          <el-option value="v" :label="vcnt"></el-option>
          <el-option value="n" :label="ncnt"></el-option>
          <el-option value="a" :label="acnt"></el-option>
          <el-option value="o" :label="ocnt"></el-option>
          <el-option value="d" :label="dcnt"></el-option>
        </el-select>
        
        <!-- 新增：学习配置区域 -->
        <el-popover placement="bottom" :width="300" trigger="click" popper-class="dark-popover">
          <template #reference>
            <el-button size="small" type="info">学习配置</el-button>
          </template>
          <div class="config-panel">
            <div class="config-item">
              <label>新单词数量：</label>
              <el-input-number v-model="config.newWordCount" :min="0" :max="100" size="small" />
            </div>
            <div class="config-item">
              <label>错误单词数量：</label>
              <el-input-number v-model="config.errorWordCount" :min="0" :max="100" size="small" />
            </div>
            <div class="config-item">
              <label>复习单词数量：</label>
              <el-input-number v-model="config.reviewWordCount" :min="0" :max="100" size="small" />
            </div>
            <div class="config-item">
              <label>每个单词时间(秒)：</label>
              <el-input-number v-model="config.timePerWord" :min="5" :max="60" size="small" />
            </div>
            <div class="config-presets">
              <el-button size="small" @click="setPreset('light')">轻松模式</el-button>
              <el-button size="small" @click="setPreset('normal')">标准模式</el-button>
              <el-button size="small" @click="setPreset('intensive')">强化模式</el-button>
            </div>
          </div>
        </el-popover>
        
        <el-button size="small" class="submit" @click="searchHandle(true)" :disabled="!canStart">背诵</el-button>
        <el-button size="small" type="primary" class="submit" @click="searchHandle(false)" :disabled="!canStart">默写</el-button>
      </div>
      <div class="top-down">
        <div class="time"><span>{{ Math.floor(remainingTime / 60) }} m {{ remainingTime % 60 }} s</span></div>
        <div class="score">score：<span>{{ score }}</span></div>
        <el-button size="small" class="submit" type="success" @click="handleSubmit">Submit</el-button>
      </div>
    </div>
    
    <div class="content">
      <el-table :data="tableData" :style="{width: windowWidth + 'px'}" size="small">
        <el-table-column type="index" label="ID" width="50" />
        <el-table-column label="Input" width="140">
          <template #default="scope">
            <el-input type="input" placeholder="Type answer" v-model="scope.row.input"
              @keyup.enter="focusNextInput(scope.$index)" @change="changeHandle" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="cn" label="Chinese" width="80" />
        <el-table-column prop="en" label="English" width="120">
          <template #default="scope">
            <div v-show="showAnswers" :class="scope.row.res ? 'ok' : 'err'">{{ scope.row.en }}</div>
          </template>
        </el-table-column>
        <el-table-column label="战绩" width="60">
          <template #default="scope">
            {{ scope.row.error }} / {{ scope.row.cnt }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Type" width="80" />

        <el-table-column prop="unit" label="Unit" width="60" />
        <el-table-column prop="time" label="默写时间" width="180">
          <template #default="scope">
            {{ handleTime(scope.row.time) }}
          </template>
        </el-table-column>
      </el-table>
      <div :style="{width: windowWidth + 'px'}">
        <el-progress :text-inside="true" :stroke-width="16" striped-flow :percentage="progressPercentage" :color="color" class="custom-progress"/>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount, computed } from 'vue';
import { ElMessage } from 'element-plus';
import db from './word.js'

const search = ref({
  book: "",
  type: [],
})

// 新增：学习配置
const config = ref({
  newWordCount: 10,        // 新单词数量
  errorWordCount: 30,      // 错误单词数量  
  reviewWordCount: 10,     // 复习单词数量
  timePerWord: 10,         // 每个单词的时间(秒)
})

const wordData = ref([])
const tableData = ref([])
const database = ref([])
const vcnt = ref("")
const ncnt = ref("")
const dcnt = ref("")
const ocnt = ref("")
const acnt = ref("")
const score = ref(0);
const remainingTime = ref(0); // 假设每个单词有 10 秒时间
const showAnswers = ref(false); // 控制答案是否显示
let countdownInterval = null; // 定义计时器变量

const windowWidth = ref(window.innerWidth - 24);
onMounted(()=> {
  window.addEventListener('resize', handleResize);

  database.value = JSON.parse(localStorage.getItem('word'))
  if(!database.value) {
    localStorage.setItem('word', JSON.stringify(db))
    database.value = JSON.parse(localStorage.getItem('word'))
  }
})
// 定义处理提交函数
function handleSubmit() {
  // 检查答案
  tableData.value.forEach((item) => {
    const userInput = item.input.trim().toLowerCase();
    const correct = item.en.trim().toLowerCase();
    
    if (userInput === correct) {
      item.res = true;
      score.value++;
      // 更新数据库中的数据
      const dbItem = database.value.find(dbItem => dbItem.id === item.id);
      if (dbItem) {
        dbItem.cnt++;
        dbItem.time = Date.now();
      }
    } else {
      item.res = false;
      // 更新数据库中的数据
      const dbItem = database.value.find(dbItem => dbItem.id === item.id);
      if (dbItem) {
        dbItem.cnt++;
        dbItem.error++;
        dbItem.time = Date.now();
      }
    }
  });
  
  // 保存到本地存储
  localStorage.setItem('word', JSON.stringify(database.value));
  
  // 显示答案
  showAnswers.value = true;
  
  // 清除计时器
  clearInterval(countdownInterval);
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(countdownInterval);
});
const handleResize = () => {
  windowWidth.value = window.innerWidth - 24;
};
// 选择书本
const handleBook = () => {
  wordData.value = database.value.filter(item => item.book === search.value.book)
  let ve = 0, vc = 0, vt = 0, ae = 0, ac = 0, at = 0, de = 0, dc = 0, dt = 0, ne = 0, nc = 0, nt = 0, oe = 0, oc = 0, ot = 0
  wordData.value.forEach(item => {
    if (item.type == "n") {
      nt++
      if (item.error > 0) ne++;
      if (item.cnt > 0) nc++
    } else if (item.type == "v") {
      vt++
      if (item.error > 0) ve++;
      if (item.cnt > 0) vc++
    } else if (item.type == "a") {
      at++
      if (item.error > 0) ae++;
      if (item.cnt > 0) ac++
    } else if (item.type == "o") {
      ot++
      if (item.error > 0) oe++;
      if (item.cnt > 0) oc++
    } else if (item.type == "d") {
      dt++
      if (item.error > 0) de++;
      if (item.cnt > 0) dc++
    }
  })

  ncnt.value = "名词: " + nc + "/" + ne + "/" + nt
  acnt.value = "形容词: " + ac + "/" + ae + "/" + at
  dcnt.value = "短语: " + dc + "/" + de + "/" + dt
  vcnt.value = "动词: " + vc + "/" + ve + "/" + vt
  ocnt.value = "其他: " + oc + "/" + oe + "/" + ot
}
// 默写 or 背诵
// 新增：检查是否可以开始学习
const canStart = computed(() => {
  return search.value.book && search.value.type.length > 0;
});

// 新增：预设配置
const setPreset = (mode) => {
  switch(mode) {
    case 'light':
      config.value = { newWordCount: 5, errorWordCount: 15, reviewWordCount: 5, timePerWord: 15 };
      break;
    case 'normal':
      config.value = { newWordCount: 10, errorWordCount: 30, reviewWordCount: 10, timePerWord: 10 };
      break;
    case 'intensive':
      config.value = { newWordCount: 20, errorWordCount: 50, reviewWordCount: 20, timePerWord: 8 };
      break;
  }
};

// 优化后的搜索处理函数
function searchHandle(type) {
  showAnswers.value = type;
  tableData.value = []
  score.value = 0

  // 移除强制选择2种类型的限制
  if (search.value.type.length === 0) {
    ElMessage.error('请至少选择一种单词类型');
    return;
  }

  let newData = []
  let errData = []
  let okkData = []

  // 根据选择的类型过滤单词
  const selectedTypes = search.value.type;
  
  // 1. 拿到新单词
  newData = wordData.value.filter(item => 
    item.cnt == 0 && selectedTypes.includes(item.type)
  );
  
  // 2. 拿到默写错的单词
  errData = wordData.value.filter(item => 
    item.error > 0 && selectedTypes.includes(item.type)
  );
  
  // 3. 拿到默写对的单词
  okkData = wordData.value.filter(item => 
    item.cnt > 0 && item.error == 0 && selectedTypes.includes(item.type)
  );

  // 排序逻辑保持不变
  if (errData.length > 0) {
    const times = errData.map(item => item.time);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const timeRange = maxTime - minTime || 1;
  
    errData.forEach(item => {
      const errorRate = item.cnt === 0 ? 1 : item.error / item.cnt;
      const timeScore = (maxTime - item.time) / timeRange;
      item.score = errorRate * 0.7 + timeScore * 0.3;
    });
  
    errData.sort((a, b) => b.score - a.score);
  }

  if (okkData.length > 0) {
    const times = okkData.map(item => item.time);
    const cnts = okkData.map(item => item.cnt);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const timeRange = maxTime - minTime || 1;
  
    const maxCnt = Math.max(...cnts);
    const minCnt = Math.min(...cnts);
    const cntRange = maxCnt - minCnt || 1;
  
    okkData.forEach(item => {
      const timeScore = (maxTime - item.time) / timeRange;
      const cntScore = (maxCnt - item.cnt) / cntRange;
      item.score = timeScore * 0.6 + cntScore * 0.4;
    });
  
    okkData.sort((a, b) => b.score - a.score);
  }

  // 使用配置的数量而不是硬编码
  let newcnt = 0;
  for (let item of newData) {
    if (newcnt >= config.value.newWordCount) break;
    newcnt++;
    tableData.value.push({...item, input: ""});
  }

  let errcnt = 0;
  for (let item of errData) {
    if (errcnt >= config.value.errorWordCount) break;
    errcnt++;
    tableData.value.push({...item, input: ""});
  }

  let okkcnt = 0;
  for (let item of okkData) {
    if (okkcnt >= config.value.reviewWordCount) break;
    okkcnt++;
    tableData.value.push({...item, input: ""});
  }

  // 如果总数不够，继续添加新单词
  const totalTarget = config.value.newWordCount + config.value.errorWordCount + config.value.reviewWordCount;
  if (tableData.value.length < totalTarget) {
    let ids = tableData.value.map(k => k.id);
    let remain = totalTarget - tableData.value.length;
    for (let item of newData) {
      if (ids.includes(item.id)) continue;
      if (remain === 0) break;
      remain--;
      tableData.value.push({...item, input: ""});
    }
  }

  nextTick(() => {
    startCountdown(type);
  });
}

// 优化计时函数
function startCountdown(type) {
  clearInterval(countdownInterval);
  // 使用配置的时间而不是硬编码
  const timePerWord = search.value.type.includes('d') ? config.value.timePerWord * 2 : config.value.timePerWord;
  remainingTime.value = tableData.value.length * timePerWord;
  
  if(!type) {
    countdownInterval = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--;
      } else {
        clearInterval(countdownInterval);
        handleSubmit(); // 修改为正确的提交函数
        ElMessage.warning('时间到！');
      }
    }, 1000);
  } else {
    score.value = 0;
    remainingTime.value = 0;
  }
}


// 单词输入时，显示速度
let color = ref('#ffffff')
// 计算已完成的输入数量
const completedCount = computed(() => {
  return tableData.value.filter(item => item.input.trim() !== '').length;
});

// 计算进度百分比
const progressPercentage = computed(() => {
  return Math.min(Math.round((completedCount.value / tableData.value.length) * 100) || 0, 100);
});

function changeHandle() {
  if (tableData.value.length === 0) return;
  
  let time = tableData.value.length * 10 - remainingTime.value - completedCount.value * 10
  let RATE = search.value.type.includes('d') ? 20 : 10
  if (time >= 1.5 * RATE) color.value = '#f56c6c'
  else if (time >= RATE && time < 1.5 * RATE) color.value = '#e6a23c'
  else if (time >= 0 && time < RATE) color.value = '#5cb87a'
  else if (time >= -RATE && time < 0) color.value = '#1989fa'
  else if (time <= -RATE) color.value = '#6f7ad3'
}
// 回车自动换行
function focusNextInput(index) {
  if (index < tableData.value.length - 1) {
    nextTick(() => {
      const inputs = document.querySelectorAll('.el-input__inner');
      if (index + 1 < inputs.length) {
        inputs[index + 1].focus();
      }
    });
  }
}
// 处理默写时间
function handleTime(t) {
  let diff = Date.now() - t
  let day = Math.floor(diff / (24 * 60 * 60 * 1000))
  let hour = Math.floor(diff / (60 * 60 * 1000))
  let min = Math.floor(diff / (60 * 1000))
  let sec = Math.floor(diff / (1000))
  if (day < 1) {
    if (hour < 1) {
      if (min < 1) {
        return "before " +  sec + " second"
      }
      else return "before " +  min + " mintute"
    }
    else return "before " +  hour + " hour"
  }
  else return "before " +  day + " day"
}

</script>


<style>
.about {
  height: 100%;
  width: 100%;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.top {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #fff;
}

.title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.score,
.time {
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.score span,
.time span {
  font-weight: bold;
  font-size: 20px;
  color: #4fc08d;
  text-shadow: 0 0 10px rgba(79, 192, 141, 0.4);
}

.content {
  height: calc(100% - 110px);
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.el-table {
  border: none;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.05) !important;
  height: calc(100% - 20px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.el-table::before {
  display: none;
}

/* Custom table header styles */
.el-table .el-table__header-wrapper th {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: #fff !important;
  font-weight: 600;
  padding: 8px 0;
  border-bottom: 2px solid #4fc08d;
}

/* Custom table row styles */
.el-table .el-table__row {
  background-color: transparent !important;
  color: #eee !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.el-table .el-table__row:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.el-table .el-table__row td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Custom table cell styles */
.el-table .cell {
  padding: 8px 12px;
}

/* Custom input styles */
.el-table .el-input__inner {
  background-color: rgba(30, 30, 40, 0.6) !important;
  border: 1px solid rgba(79, 192, 141, 0.2) !important;
  color: #fff !important;
  border-radius: 4px;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
}

.el-table .el-input__inner:focus {
  border-color: #4fc08d !important;
  box-shadow: 0 0 0 2px rgba(79, 192, 141, 0.3);
  background-color: rgba(30, 30, 40, 0.8) !important;
}

.percentage-value {
  font-weight: bold;
  color: #fff;
  font-size: 20px;
}

.percentage-label {
  margin-left: 5px;
  color: #fff;
}

.submit {
  cursor: pointer;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.submit:active {
  transform: translateY(0);
}

.ok {
  color: #4fc08d;
  font-weight: bold;
}

.err {
  color: #f56c6c;
  font-weight: bold;
  text-decoration: line-through;
}

.content-left {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.content-left > .el-select {
  margin-right: 12px;
  min-width: 120px;
}

.right-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.top-down {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 6px;
}

/* 配置面板样式 */
.config-panel {
  padding: 10px;
  background: #1a1a2e;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.config-item label {
  color: #eee;
  font-size: 14px;
}

.config-presets {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

/* 进度条样式优化 */
.el-progress-bar__outer {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px;
}

.el-progress-bar__inner {
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* 下拉选择框样式 */
.el-select .el-input__inner {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 6px;
}

.el-select .el-input.is-focus .el-input__inner {
  border-color: #4fc08d;
}
</style>
