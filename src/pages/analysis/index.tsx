import { View, Text, Picker, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

// 单词数据类型定义
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

// 每日统计数据类型
interface WordStats {
  date: string;
  total: number;
  mastered: number;
  familiar: number;
  生疏: number;
  unlearned: number;
}

// 纯CSS柱状图组件
const CssBarChart = ({ data }: { data: any[] }) => {
  // 计算最大值用于缩放
  const maxValue = data.length > 0 ? Math.max(...data.map(item => item.学习量)) : 1
  
  return (
    <div className="relative w-full h-[300px] bg-white rounded-lg shadow-sm p-4 overflow-hidden">
      {/* 标题 */}
      <div className="text-center mb-4">
        <Text className="text-lg font-medium text-gray-800">每日学习量</Text>
      </div>
      
      {/* 坐标轴和网格线 */}
      <div className="absolute left-12 right-4 top-12 bottom-10 border-l border-b border-gray-200">
        {/* 水平网格线 */}
        {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <div 
            key={index} 
            className="absolute w-full h-px bg-gray-100" 
            style={{ bottom: `${ratio * 100}%` }}
          />
        ))}
        
        {/* Y轴标签 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <div 
            key={index} 
            className="absolute -left-12 text-xs text-gray-500" 
            style={{ bottom: `${ratio * 100}%`, transform: 'translateY(50%)' }}
          >
            {Math.round(maxValue * ratio)}
          </div>
        ))}
        
        {/* 数据条容器 */}
        <div className="absolute inset-0 flex justify-between items-end p-2">
          {data.map((item, index) => {
            const heightPercent = (item.学习量 / maxValue) * 100
            return (
              <div 
                key={index} 
                className="flex-1 mx-[2px] flex flex-col items-center"
              >
                {/* 数据条 */}
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-700" 
                  style={{ height: `${heightPercent}%` }}
                />
                
                {/* 数值标签 */}
                <div className="mt-1 text-xs font-medium text-gray-700">
                  {item.学习量}
                </div>
                
                {/* 日期标签 */}
                <div className="mt-1 text-xs text-gray-500">
                  {item.date}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 纯CSS折线图组件
const CssLineChart = ({ data }: { data: any[] }) => {
  // 计算最大值用于缩放
  const values = data.flatMap(item => [item.熟练, item.一般, item.生疏, item.未学习])
  const maxValue = values.length > 0 ? Math.max(...values) : 1
  
  // 线条颜色和标签
  const lineColors = ['#4ade80', '#fbbf24', '#ef4444', '#9ca3af']
  const lineLabels = ['熟练', '一般', '生疏', '未学习']
  
  return (
    <div className="relative w-full h-[350px] bg-white rounded-lg shadow-sm p-4 overflow-hidden">
      {/* 标题 */}
      <div className="text-center mb-4">
        <Text className="text-lg font-medium text-gray-800">掌握程度趋势</Text>
      </div>
      
      {/* 图例 */}
      <div className="flex justify-center space-x-4 mb-4">
        {lineLabels.map((label, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lineColors[index] }} />
            <Text className="text-sm text-gray-600">{label}</Text>
          </div>
        ))}
      </div>
      
      {/* 坐标轴和网格线 */}
      <div className="absolute left-12 right-4 top-12 bottom-16 border-l border-b border-gray-200">
        {/* 水平网格线 */}
        {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <div 
            key={index} 
            className="absolute w-full h-px bg-gray-100" 
            style={{ bottom: `${ratio * 100}%` }}
          />
        ))}
        
        {/* Y轴标签 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <div 
            key={index} 
            className="absolute -left-12 text-xs text-gray-500" 
            style={{ bottom: `${ratio * 100}%`, transform: 'translateY(50%)' }}
          >
            {Math.round(maxValue * ratio)}
          </div>
        ))}
        
        {/* X轴标签 */}
        {data.map((item, index) => (
          <div 
            key={index} 
            className="absolute text-xs text-gray-500" 
            style={{ 
              left: `${(index / (data.length - 1)) * 100}%`, 
              bottom: '-20px',
              transform: 'translateX(-50%)'
            }}
          >
            {item.date}
          </div>
        ))}
        
        {/* 折线图容器 */}
        <div className="absolute inset-0">
          {/* 绘制每条线 */}
          {lineLabels.map((label, lineIndex) => {
            // 计算每个数据点的位置
            const points = data.map((item, index) => {
              const xPercent = (index / (data.length - 1)) * 100
              const yPercent = 100 - (item[label] / maxValue) * 100
              return { x: xPercent, y: yPercent }
            })
            
            return (
              <div key={lineIndex} className="relative w-full h-full">
                {/* 绘制线条 */}
                <div className="absolute h-full w-full">
                  {points.slice(0, -1).map((point, index) => {
                    const nextPoint = points[index + 1]
                    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)
                    const length = Math.sqrt(
                      Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
                    )
                    
                    return (
                      <div
                        key={index}
                        className="absolute"
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          width: `${length}%`,
                          height: '2px',
                          backgroundColor: lineColors[lineIndex],
                          transformOrigin: '0 50%',
                          transform: `rotate(${angle}deg)`
                        }}
                      />
                    )
                  })}
                </div>
                
                {/* 绘制数据点 */}
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 rounded-full border-2"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      backgroundColor: '#fff',
                      borderColor: lineColors[lineIndex],
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Analysis() {
  // 状态管理
  const [words, setWords] = useState<Word[]>([])
  const [selectedBook, setSelectedBook] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('7d') // 7d/15d/30d
  const [wordStats, setWordStats] = useState<WordStats[]>([])
  const [barChartData, setBarChartData] = useState<any[]>([])
  const [lineChartData, setLineChartData] = useState<any[]>([])
  
  // 筛选选项
  const books = ['all', '7A', '7B', '8A', '8B', '9A', '9B']
  const timeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '15d', label: '最近15天' },
    { value: '30d', label: '最近30天' }
  ]
  
  // 加载本地存储的单词数据
  useEffect(() => {
    try {
      const storedData = Taro.getStorageSync('word')
      if (storedData) {
        setWords(JSON.parse(storedData))
      }
    } catch (error) {
      console.error('加载单词数据失败:', error)
    }
  }, [])
  
  // 筛选条件变化时重新计算统计数据
  useEffect(() => {
    if (words.length > 0) {
      analyzeData()
    }
  }, [selectedBook, timeRange, words])
  
  // 格式化日期为 "月/日"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  
  // 分析单词数据，生成统计信息
  const analyzeData = () => {
    // 筛选当前书本的单词
    const filteredWords = selectedBook === 'all' 
      ? words 
      : words.filter(word => word.book === selectedBook)
    
    // 计算时间范围（7/15/30天前）
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '15d' ? 15 : 30
    const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    // 初始化每日统计数据
    const dailyStats: Record<string, WordStats> = {}
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dailyStats[dateStr] = {
        date: dateStr,
        total: 0,
        mastered: 0,
        familiar: 0,
        生疏: 0,
        unlearned: 0
      }
    }
    
    // 统计每个单词的掌握情况
    filteredWords.forEach(word => {
      const wordDate = new Date(word.time).toISOString().split('T')[0]
      if (new Date(word.time) >= startTime) {
        // 确保日期存在于统计中
        if (!dailyStats[wordDate]) {
          dailyStats[wordDate] = {
            date: wordDate,
            total: 0,
            mastered: 0,
            familiar: 0,
            生疏: 0,
            unlearned: 0
          }
        }
        dailyStats[wordDate].total++
        
        // 按错误率划分掌握程度
        if (word.cnt === 0) {
          dailyStats[wordDate].unlearned++ // 未学习
        } else {
          const errorRate = word.error / word.cnt
          if (errorRate <= 0.2) {
            dailyStats[wordDate].mastered++ // 熟练（错误率≤20%）
          } else if (errorRate <= 0.5) {
            dailyStats[wordDate].familiar++ // 一般（错误率≤50%）
          } else {
            dailyStats[wordDate].生疏++ // 生疏（错误率>50%）
          }
        }
      }
    })
    
    // 转换为数组并按日期排序
    const statsArray = Object.values(dailyStats)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // 准备图表数据
    setBarChartData(statsArray.map(day => ({
      date: formatDate(day.date),
      学习量: day.total
    })))
    
    setLineChartData(statsArray.map(day => ({
      date: formatDate(day.date),
      熟练: day.mastered,
      一般: day.familiar,
      生疏: day.生疏,
      未学习: day.unlearned
    })))
    
    setWordStats(statsArray)
  }

  return (
    <View className='analyse-page'>
      {/* 筛选区域 */}
      <View className='filter-area'>
        <View className='filter-item'>
          <Text className='filter-label'>选择书本:</Text>
          <Picker
            mode='selector'
            range={books}
            value={books.indexOf(selectedBook)}
            onChange={(e) => setSelectedBook(books[e.detail.value])}
          >
            <View className='picker'>
              <Text>{selectedBook === 'all' ? '全部' : selectedBook}</Text>
            </View>
          </Picker>
        </View>
        
        <View className='filter-item'>
          <Text className='filter-label'>时间范围:</Text>
          <Picker
            mode='selector'
            range={timeOptions.map(option => option.label)}
            value={timeOptions.findIndex(option => option.value === timeRange)}
            onChange={(e) => setTimeRange(timeOptions[e.detail.value].value)}
          >
            <View className='picker'>
              <Text>{timeOptions.find(option => option.value === timeRange)?.label}</Text>
            </View>
          </Picker>
        </View>
      </View>
      
      {/* 数据概览卡片 */}
      <View className='overview-cards'>
        <View className='overview-card'>
          <Text className='card-title'>总单词数</Text>
          <Text className='card-value'>{words.length}</Text>
        </View>
        <View className='overview-card'>
          <Text className='card-title'>已学习</Text>
          <Text className='card-value'>{words.filter(word => word.cnt > 0).length}</Text>
        </View>
        <View className='overview-card'>
          <Text className='card-title'>熟练掌握</Text>
          <Text className='card-value'>{words.filter(word => word.cnt > 0 && (word.error / word.cnt) <= 0.2).length}</Text>
        </View>
        <View className='overview-card'>
          <Text className='card-title'>学习进度</Text>
          <Text className='card-value'>
            {words.length > 0 
              ? `${((words.filter(word => word.cnt > 0).length / words.length) * 100).toFixed(1)}%` 
              : '0%'}
          </Text>
        </View>
      </View>
      
      {/* 图表区域 */}
      <ScrollView className='charts-container' scrollY>
        {/* 每日学习量柱状图 */}
        <View className='chart-card'>
          <CssBarChart data={barChartData} />
        </View>
        
        {/* 掌握程度趋势折线图 */}
        <View className='chart-card'>
          <CssLineChart data={lineChartData} />
        </View>
      </ScrollView>
    </View>
  )
}