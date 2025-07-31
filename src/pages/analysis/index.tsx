import { useEffect, useState, useMemo } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';

import BarChart from '../../components/BarChart/index'
import PieChart from '../../components/PieChart/index';
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
  { label: '未学习', min: -1, max: -1, color: '#FF6B6B' }, // cnt=0
  { label: '生疏', min: 0, max: 0.3, color: '#FFD93D' }, // error/cnt在0-0.3之间
  { label: '濒危', min: 0.3, max: 0.7, color: '#6BCB77' },
  { label: '掌握', min: 0.7, max: 0.99, color: '#4D96FF' },
  { label: '熟练', min: 0.99, max: 1.01, color: '#9B5DE5' }, // 掌握程度≥0.99且cnt≥3
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
    { title: 'all books', value: 'all' },
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
    { title: 'all times', value: 0 },
    { title: 'yesterday', value: 1 },
    { title: 'in the past 3 days', value: 3 },
    { title: 'in the past week', value: 7 },
    { title: 'in the past 15 days', value: 15 },
    { title: 'in the past month', value: 30 },
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
    
    // 创建最近7天的日期数组（格式：7月21日）
    const dateLabels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i); // 从今天往前推i天
      
      // 直接获取月份和日期，手动拼接成“X月X日”格式
      const month = date.getMonth() + 1; // 月份从0开始，需+1
      const day = date.getDate();
      return `${month}月${day}日`;
    }).reverse(); // 反转后按时间正序排列（最早→最近）
    
    // 初始化每天的学习数量为0
    const dailyCounts = dateLabels.map(() => 0);
    
    // 统计每天学习的单词数
    words.forEach(word => {
      const wordDate = new Date(word.time);
      wordDate.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i)); // 匹配标签的时间顺序
        date.setHours(0, 0, 0, 0);
        
        if (wordDate.getTime() === date.getTime()) {
          dailyCounts[i]++;
          break;
        }
      }
    });
    
    // 组合结果
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
      // 处理从未学习的单词 (cnt=0)
      if (word.cnt === 0) {
        levelCounts[0].value++;
        return;
      }
      
      // 计算掌握程度 (1 - 错误率)
      const mastery = 1 - (word.error / word.cnt);
      
      // 处理其他等级
      for (let i = 1; i < MASTERY_LEVELS.length; i++) {
        const level = MASTERY_LEVELS[i];
        
        // 熟练等级需要额外条件：cnt≥3
        if (i === MASTERY_LEVELS.length - 1) {
          if (mastery >= level.min && word.cnt >= 3) {
            levelCounts[i].value++;
            return;
          }
        }
        // 其他等级
        else if (mastery >= level.min && mastery < level.max) {
          levelCounts[i].value++;
          return;
        }
      }
      
      // 处理未匹配到任何等级的情况（理论上不会发生）
      levelCounts[1].value++; // 默认为生疏
    });
    
    return levelCounts;
  }, [filteredWords]);
  
  // 计算掌握单词数量（掌握+熟练）
  const masteredWordsCount = useMemo(() => {
    return masteryData
      .filter(item => ['掌握', '熟练'].includes(item.label))
      .reduce((sum, item) => sum + item.value, 0);
  }, [masteryData]);
  
  // 计算易遗忘的单词数量（未学习+生疏）
  const forgotWordsCount = useMemo(() => {
    return masteryData
      .filter(item => ['未学习', '生疏'].includes(item.label))
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
            {bookOptions.find(option => option.value === selectedBook)?.title || 'all books'}
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={dateRangeOptions.map(option => option.title)}
          value={dateRangeOptions.findIndex(option => option.value === selectedDateRange)}
          onChange={(e) => setSelectedDateRange(dateRangeOptions[e.detail.value].value)}
        >
          <View className="picker">
            {dateRangeOptions.find(option => option.value === selectedDateRange)?.title || 'all times'}
          </View>
        </Picker>
      </View>
      
      {/* 统计摘要 */}
      <View className="stats-summary">
  
        本书总战绩
        全部单词
        <Text className="stat-value">{filteredWords.length}</Text>
        已掌握单词
        <Text className="stat-value">{masteredWordsCount}</Text>
        易遗忘单词
        <Text className="stat-value">{forgotWordsCount}</Text>
        
      <View className="stat-item">
          <Text className="stat-label">筛选后，已掌握的单词，放一行滚动展示</Text>
          <Text className="stat-value">{masteredWordsCount}</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-label">筛选后，易遗忘的单词，放一行滚动展示</Text>
          <Text className="stat-value">{forgotWordsCount}</Text>
        </View>
      </View>
      
      <BarChart 
        data={dailyLearningData} 
        title="每日学习单词数量" 
        height={200} 
        barWidth="30%"
        maxValue={Math.max(5, ...dailyLearningData.map(item => item.value))} // 设置最小Y轴范围
      />

      <PieChart 
        data={masteryData}  
        title={`${selectedBook}单词掌握情况 ${dateRangeOptions.find(option => option.value === selectedDateRange)?.title || 'all times'}(${filteredWords.length})`} 
        size={200}
      />


    </View>
  );
}    