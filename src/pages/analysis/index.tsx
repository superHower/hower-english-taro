import { useEffect, useState, useMemo } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';

import BarChart from '../../components/BarChart/index'
import './index.scss'

interface Word {
  id: number;
  book: string;
  unit: number | string;
  type: string;
  en: string;
  cn: string;
  cnt: number;
  error: number;
  time: number;
  input?: string;
}

// 掌握程度等级配置
const MASTERY_LEVELS = [
  { label: '生疏', min: 0, max: 0, color: '#FF6B6B' },
  { label: '濒危', min: 0, max: 0.3, color: '#FFD93D' },
  { label: '一般', min: 0.3, max: 0.7, color: '#6BCB77' },
  { label: '掌握', min: 0.7, max: 1, color: '#4D96FF' },
  { label: '熟练', min: 1, max: 1, color: '#9B5DE5' },
];

// 最近7天颜色配置
const DAILY_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', 
  '#4D96FF', '#9B5DE5', '#FF6BCB', '#6B6BFF'
];

export default () => {
  // 状态管理
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  
  // 书本筛选相关状态
  const [bookOptions] = useState([
    { title: '全部书本', value: 'all' },
    { title: '7A', value: '7A' },
    { title: '7B', value: '7B' },
    { title: '8A', value: '8A' },
    { title: '8B', value: '8B' },
    { title: '9A', value: '9A' },
    { title: '9B', value: '9B' },
  ]);
  const [selectedBook, setSelectedBook] = useState('7A');
  
  // 日期筛选相关状态
  const [dateRangeOptions] = useState([
    { title: '全部时间', value: 0 },
    { title: '昨日', value: 1 },
    { title: '近三天', value: 3 },
    { title: '近一周', value: 7 },
    { title: '近半月', value: 15 },
    { title: '近一月', value: 30 },
  ]);
  const [selectedDateRange, setSelectedDateRange] = useState(0);

  // 最近7天学习数据
  const [dailyLearningData, setDailyLearningData] = useState<{ 
    label: string; 
    value: number;
    color: string;
  }[]>([]);

  // 初始化数据
  useEffect(() => {
    const storedData: Word[] = JSON.parse(Taro.getStorageSync('word') || '[]');
    setAllWords(storedData);
    
    // 计算最近7天学习数据
    calculateDailyLearningData(storedData);
  }, []);

  // 计算最近7天学习数据
  const calculateDailyLearningData = (words: Word[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 创建最近7天的日期数组
    const dateLabels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }).reverse();
    
    // 初始化每天的学习数量为0
    const dailyCounts = dateLabels.map(() => 0);
    
    // 统计每天学习的单词数
    words.forEach(word => {
      const wordDate = new Date(word.time);
      wordDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        
        if (wordDate.getTime() === date.getTime()) {
          dailyCounts[i]++;
          break;
        }
      }
    });
    
    // 组合日期、学习数量和颜色
    const result = dateLabels.map((date, index) => ({
      label: date,
      value: dailyCounts[index],
      color: DAILY_COLORS[index]
    }));
    
    setDailyLearningData(result);
  };

  // 应用筛选条件
  useEffect(() => {
    let result = [...allWords];
    // 按书本筛选
    if (selectedBook !== 'all') {
      result = result.filter(word => word.book === selectedBook); 
    }
    
    // 按时间范围筛选
    if (selectedDateRange > 0) {
      const timeThreshold = Date.now() - selectedDateRange * 24 * 60 * 60 * 1000;
      result = result.filter(word => word.time >= timeThreshold);
    }
    
    setFilteredWords(result);
  }, [allWords, selectedBook, selectedDateRange]);

  // 计算掌握情况统计数据
  const masteryData = useMemo(() => {
    // 初始化统计结果
    const levelCounts = MASTERY_LEVELS.map(level => ({
      label: level.label,
      value: 0,
      color: level.color
    }));
    
    // 遍历单词计算掌握程度
    filteredWords.forEach(word => {
      // 计算掌握程度 (1 - 错误率)
      const mastery = word.cnt > 0 ? 1 - (word.error / word.cnt) : 0;
      
      // 找到对应的掌握等级
      for (let i = 0; i < MASTERY_LEVELS.length; i++) {
        const level = MASTERY_LEVELS[i];
        
        // 特殊处理"生疏"等级 (cnt=0)
        if (i === 0 && word.cnt === 0) {
          levelCounts[i].value++;
          break;
        }
        
        // 处理其他等级
        if (
          (i === MASTERY_LEVELS.length - 1 && mastery >= level.min) || // 熟练等级
          (mastery >= level.min && mastery < level.max) // 其他等级
        ) {
          levelCounts[i].value++;
          break;
        }
      }
    });
    
    return levelCounts;
  }, [filteredWords]);

  // 计算掌握单词数量
  const masteredWordsCount = useMemo(() => {
    return masteryData
      .filter(item => ['掌握', '熟练'].includes(item.label))
      .reduce((sum, item) => sum + item.value, 0);
  }, [masteryData]);

  return (
    <View className="word-mastery-chart">
      {/* 筛选控制区 */}
      <View className="filter-controls">
        <Picker
          mode="selector"
          range={bookOptions.map(option => option.title)}
          value={bookOptions.findIndex(option => option.value === selectedBook)}
          onChange={(e) => setSelectedBook(bookOptions[e.detail.value].value)}
        >
          <View className="picker">
            {bookOptions.find(option => option.value === selectedBook)?.title || '全部书本'}
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={dateRangeOptions.map(option => option.title)}
          value={dateRangeOptions.findIndex(option => option.value === selectedDateRange)}
          onChange={(e) => setSelectedDateRange(dateRangeOptions[e.detail.value].value)}
        >
          <View className="picker">
            {dateRangeOptions.find(option => option.value === selectedDateRange)?.title || '全部'}
          </View>
        </Picker>
      </View>
      
      {/* 统计摘要 */}
      <View className="stats-summary">
        <View className="stat-item">
          <Text className="stat-label">已掌握</Text>
          <Text className="stat-value">{masteredWordsCount}</Text>
        </View>
      </View>
      
      {/* 柱状图 - 单词掌握情况 */}
      <BarChart 
        data={masteryData}  
        title={`${selectedBook}${selectedDateRange ? '近' + selectedDateRange + '天' : ''}单词掌握情况(${filteredWords.length})`} 
        height={200} 
        barWidth="40%"
      />
      
      {/* 柱状图 - 最近7天学习情况 (不受筛选控制) */}

      <BarChart 
        data={dailyLearningData} 
        title="每日学习单词数量" 
        height={200} 
        barWidth="30%"
        maxValue={Math.max(5, ...dailyLearningData.map(item => item.value))} // 设置最小Y轴范围
      />

    </View>
  );
}    