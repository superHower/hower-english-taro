import { View, Text, Button, Input, ScrollView, Image, Picker } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.scss'
import db from './word'
interface Word {
  id: number;
  book: string;
  unit: number;
  type: string;
  en: string;
  cn: string;
  cnt: number;
  error: number;
  time: number;
  input?: string;
  score?: number;
  res?: boolean;
}

export default function Index() {
  // 状态定义
  const [search, setSearch] = useState<any>({
    book: "",
    type: []
  })

  // 学习配置
  const [config, setConfig] = useState<any>({
    newWordCount: 10,        // 新单词数量
    errorWordCount: 30,      // 错误单词数量  
    reviewWordCount: 10,     // 复习单词数量
    timePerWord: 10,         // 每个单词的时间(秒)
  })

  const [wordData, setWordData] = useState<Word[]>([])
  const [tableData, setTableData] = useState<Word[]>([])
  const [database, setDatabase] = useState<Word[]>([])
  const [vcnt, setVcnt] = useState("")
  const [ncnt, setNcnt] = useState("")
  const [dcnt, setDcnt] = useState("")
  const [ocnt, setOcnt] = useState("")
  const [acnt, setAcnt] = useState("")
  const [score, setScore] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [color, setColor] = useState('#ffffff')
  
  // 计时器引用
  const countdownIntervalRef = useRef<any>(null)

  // 组件加载时
  useLoad(() => {
    console.log('Index page loaded.')
    // 使用Taro API获取系统信息
    Taro.getSystemInfo({
      success: (res) => {
        setWindowWidth(res.windowWidth - 24)
      }
    })
    
    // 从本地存储加载数据
    try {
      const storedData = Taro.getStorageSync('word')
      if (storedData) {
        setDatabase(JSON.parse(storedData))
      } else {
        Taro.setStorageSync('word', JSON.stringify(db))
        setDatabase(db)
      }
    } catch (error) {
      console.error('Storage error:', error)
      // 出错时使用默认数据
      setDatabase(db)
    }

    // 小程序环境不需要监听窗口大小变化
    
    // 组件卸载时清理
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  })

  // 窗口大小变化处理 - 小程序环境使用
  const handleResize = () => {
    Taro.getSystemInfo({
      success: (res) => {
        setWindowWidth(res.windowWidth - 24)
      }
    })
  }

  // 选择书本
  const handleBook = (value) => {
    const newSearch = { ...search, book: value }
    setSearch(newSearch)
    
    const filteredData = database.filter(item => item.book === value)
    setWordData(filteredData)
    
    let ve = 0, vc = 0, vt = 0, ae = 0, ac = 0, at = 0, de = 0, dc = 0, dt = 0, ne = 0, nc = 0, nt = 0, oe = 0, oc = 0, ot = 0
    
    filteredData.forEach(item => {
      if (item.type === "n") {
        nt++
        if (item.error > 0) ne++
        if (item.cnt > 0) nc++
      } else if (item.type === "v") {
        vt++
        if (item.error > 0) ve++
        if (item.cnt > 0) vc++
      } else if (item.type === "a") {
        at++
        if (item.error > 0) ae++
        if (item.cnt > 0) ac++
      } else if (item.type === "o") {
        ot++
        if (item.error > 0) oe++
        if (item.cnt > 0) oc++
      } else if (item.type === "d") {
        dt++
        if (item.error > 0) de++
        if (item.cnt > 0) dc++
      }
    })

    setNcnt(`名词: ${nc}/${ne}/${nt}`)
    setAcnt(`形容词: ${ac}/${ae}/${at}`)
    setDcnt(`短语: ${dc}/${de}/${dt}`)
    setVcnt(`动词: ${vc}/${ve}/${vt}`)
    setOcnt(`其他: ${oc}/${oe}/${ot}`)
  }

  // 设置预设配置
  const setPreset = (mode) => {
    switch(mode) {
      case 'light':
        setConfig({ newWordCount: 5, errorWordCount: 15, reviewWordCount: 5, timePerWord: 15 })
        break
      case 'normal':
        setConfig({ newWordCount: 10, errorWordCount: 30, reviewWordCount: 10, timePerWord: 10 })
        break
      case 'intensive':
        setConfig({ newWordCount: 20, errorWordCount: 50, reviewWordCount: 20, timePerWord: 8 })
        break
      default:
        break
    }
  }

  // 处理提交
  const handleSubmit = () => {
    // 检查答案
    const newTableData = [...tableData!]
    let newScore = 0
    
    newTableData.forEach((item, index) => {
      const userInput = item.input?.trim().toLowerCase() || ""
      const correct = item.en.trim().toLowerCase()
      
      if (userInput === correct) {
        newTableData[index] = { ...item, res: true }
        newScore++
        
        // 更新数据库中的数据
        const newDatabase = [...database]
        const dbItemIndex = newDatabase.findIndex(dbItem => dbItem.id === item.id)
        
        if (dbItemIndex !== -1) {
          newDatabase[dbItemIndex] = {
            ...newDatabase[dbItemIndex],
            cnt: newDatabase[dbItemIndex].cnt + 1,
            time: Date.now()
          }
        }
        
        setDatabase(newDatabase)
      } else {
        newTableData[index] = { ...item, res: false }
        
        // 更新数据库中的数据
        const newDatabase = [...database]
        const dbItemIndex = newDatabase.findIndex(dbItem => dbItem.id === item.id)
        
        if (dbItemIndex !== -1) {
          newDatabase[dbItemIndex] = {
            ...newDatabase[dbItemIndex],
            cnt: newDatabase[dbItemIndex].cnt + 1,
            error: newDatabase[dbItemIndex].error + 1,
            time: Date.now()
          }
        }
        
        setDatabase(newDatabase)
      }
    })
    
    setTableData(newTableData)
    setScore(newScore)
    
    // 保存到本地存储
    try {
      Taro.setStorageSync('word', JSON.stringify(database))
    } catch (error) {
      console.error('Storage save error:', error)
    }
    
    // 显示答案
    setShowAnswers(true)
    
    // 清除计时器
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  // 搜索处理函数
  const searchHandle = (type) => {
    setShowAnswers(type)
    setTableData([])
    setScore(0)

    // 检查是否选择了单词类型
    if (search.type.length === 0) {
      // 使用Taro的Toast组件
      Taro.showToast({
        title: '请至少选择一种单词类型',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let newData: Word[] = []
    let errData: Word[] = []
    let okkData: Word[] = []

    // 根据选择的类型过滤单词
    const selectedTypes: string[] = search.type
    
    // 1. 拿到新单词
    newData = wordData!.filter(item => 
      item.cnt === 0 && selectedTypes.includes(item.type)
    )
    
    // 2. 拿到默写错的单词
    errData = wordData!.filter(item => 
      item.error > 0 && selectedTypes.includes(item.type)
    )
    
    // 3. 拿到默写对的单词
    okkData = wordData!.filter(item => 
      item.cnt > 0 && item.error === 0 && selectedTypes.includes(item.type)
    )

    // 排序逻辑
    if (errData.length > 0) {
      const times = errData.map(item => item.time)
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      const timeRange = maxTime - minTime || 1
    
      errData.forEach((item, index) => {
        const errorRate = item.cnt === 0 ? 1 : item.error / item.cnt
        const timeScore = (maxTime - item.time) / timeRange
        errData[index] = { ...item, score: errorRate * 0.7 + timeScore * 0.3 }
      })
    
      errData.sort((a, b) => b.score! - a.score!)
    }

    if (okkData.length > 0) {
      const times = okkData.map(item => item.time)
      const cnts = okkData.map(item => item.cnt)
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      const timeRange = maxTime - minTime || 1
    
      const maxCnt = Math.max(...cnts)
      const minCnt = Math.min(...cnts)
      const cntRange = maxCnt - minCnt || 1
    
      okkData.forEach((item, index) => {
        const timeScore = (maxTime - item.time) / timeRange
        const cntScore = (maxCnt - item.cnt) / cntRange
        okkData[index] = { ...item, score: timeScore * 0.6 + cntScore * 0.4 }
      })
    
      okkData.sort((a, b) => b.score! - a.score!)
    }

    // 使用配置的数量
    let newTableData: Word[] = []
    
    // 添加新单词
    let newcnt = 0
    for (let item of newData) {
      if (newcnt >= config.newWordCount) break
      newcnt++
      newTableData.push({...item, input: ""})
    }

    // 添加错误单词
    let errcnt = 0
    for (let item of errData) {
      if (errcnt >= config.errorWordCount) break
      errcnt++
      newTableData.push({...item, input: ""})
    }

    // 添加复习单词
    let okkcnt = 0
    for (let item of okkData) {
      if (okkcnt >= config.reviewWordCount) break
      okkcnt++
      newTableData.push({...item, input: ""})
    }

    // 如果总数不够，继续添加新单词
    const totalTarget = config.newWordCount + config.errorWordCount + config.reviewWordCount
    if (newTableData.length < totalTarget) {
      let ids = newTableData.map(k => k.id)
      let remain = totalTarget - newTableData.length
      for (let item of newData) {
        if (ids.includes(item.id)) continue
        if (remain === 0) break
        remain--
        newTableData.push({...item, input: ""})
      }
    }

    setTableData(newTableData)
    
    // 开始计时
    setTimeout(() => {
      startCountdown(type)
    }, 0)
  }

  // 计时函数
  const startCountdown = (type) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    
    // 使用配置的时间
    const timePerWord = search.type.includes('d') ? config.timePerWord * 2 : config.timePerWord
    setRemainingTime(tableData!.length * timePerWord)
    
    if (!type) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1
          } else {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }
            handleSubmit()
            Taro.showToast({
              title: '时间到！',
              icon: 'none',
              duration: 2000
            })
            return 0
          }
        })
      }, 1000)
    } else {
      setScore(0)
      setRemainingTime(0)
    }
  }

  // 计算已完成的输入数量
  const completedCount = tableData!.filter(item => item.input?.trim() !== '').length

  // 计算进度百分比
  const progressPercentage = Math.min(Math.round((completedCount / (tableData!.length || 1)) * 100) || 0, 100)

  // 单词输入时，显示速度
  const changeHandle = () => {
    if (tableData!.length === 0) return
    
    const time = tableData!.length * 10 - remainingTime - completedCount * 10
    const RATE = search.type.includes('d') ? 20 : 10
    
    if (time >= 1.5 * RATE) setColor('#f56c6c')
    else if (time >= RATE && time < 1.5 * RATE) setColor('#e6a23c')
    else if (time >= 0 && time < RATE) setColor('#5cb87a')
    else if (time >= -RATE && time < 0) setColor('#1989fa')
    else if (time <= -RATE) setColor('#6f7ad3')
  }

  // 回车自动换行
  const focusNextInput = (index) => {
    if (index < tableData!.length - 1) {
      // 在小程序环境中，我们需要使用Taro的选择器API
      // 注意：小程序环境中的focus可能需要额外处理
      // 这里我们简单地移动到下一个输入框，实际使用时可能需要调整
      const nextIndex = index + 1
      if (nextIndex < tableData!.length) {
        // 在实际应用中，可能需要使用Taro.createSelectorQuery获取元素
        // 并调用.focus()方法，这里简化处理
      }
    }
  }

  // 处理默写时间
  const handleTime = (t) => {
    const diff = Date.now() - t
    const day = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hour = Math.floor(diff / (60 * 60 * 1000))
    const min = Math.floor(diff / (60 * 1000))
    const sec = Math.floor(diff / (1000))
    
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

  // 处理类型选择
  const handleTypeChange = (type) => {
    const newTypes = [...search.type]
    const index = newTypes.indexOf(type)
    
    if (index === -1) {
      newTypes.push(type)
    } else {
      newTypes.splice(index, 1)
    }
    
    setSearch({ ...search, type: newTypes })
  }

  // 处理单词输入变化
  const handleInputChange = (index, value) => {
    const newTableData = [...tableData!]
    newTableData[index] = { ...newTableData[index], input: value }
    setTableData(newTableData)
    changeHandle()
  }

  return (
    <View className='index' style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <View className='top'>
        <View className='content-left'>
          {/* 书本选择 */}
          <View className='select-container'>
            <Picker
              mode='selector'
              range={['选择书本', '7A', '7B', '8A', '8B', '9A', '9B']}
              value={search.book ? ['7A', '7B', '8A', '8B', '9A', '9B'].indexOf(search.book) + 1 : 0}
              onChange={(e) => handleBook(['', '7A', '7B', '8A', '8B', '9A', '9B'][e.detail.value])}
            >
              <View className='book-select'>
                {search.book || '选择书本'}
              </View>
            </Picker>
          </View>
          
          {/* 单词类型选择 */}
          <View className='type-select-container'>
            <View className='type-options'>
              <View 
                className={`type-option ${search.type.includes('v') ? 'selected' : ''}`}
                onClick={() => handleTypeChange('v')}
              >
                {vcnt || '动词'}
              </View>
              <View 
                className={`type-option ${search.type.includes('n') ? 'selected' : ''}`}
                onClick={() => handleTypeChange('n')}
              >
                {ncnt || '名词'}
              </View>
              <View 
                className={`type-option ${search.type.includes('a') ? 'selected' : ''}`}
                onClick={() => handleTypeChange('a')}
              >
                {acnt || '形容词'}
              </View>
              <View 
                className={`type-option ${search.type.includes('o') ? 'selected' : ''}`}
                onClick={() => handleTypeChange('o')}
              >
                {ocnt || '其他'}
              </View>
              <View 
                className={`type-option ${search.type.includes('d') ? 'selected' : ''}`}
                onClick={() => handleTypeChange('d')}
              >
                {dcnt || '短语'}
              </View>
            </View>
          </View>
          
          <View className='top-down'>
            {/* 学习配置 */}
            <View className='config-button-container'>
              <Button 
                className='config-button' 
                onClick={() => setShowConfigPanel(!showConfigPanel)}
              >
                学习配置
              </Button>
            
              {showConfigPanel && (
                <View className='config-panel'>
                  <View className='config-item'>
                    <Text className='config-label'>新单词数量：</Text>
                    <Input 
                      type='number' 
                      className='config-input'
                      value={config.newWordCount.toString()} 
                      onInput={(e) => setConfig({...config, newWordCount: parseInt(e.detail.value) || 0})}
                    />
                  </View>
                  <View className='config-item'>
                    <Text className='config-label'>错误单词数量：</Text>
                    <Input 
                      type='number' 
                      className='config-input'
                      value={config.errorWordCount.toString()} 
                      onInput={(e) => setConfig({...config, errorWordCount: parseInt(e.detail.value) || 0})}
                    />
                  </View>
                  <View className='config-item'>
                    <Text className='config-label'>复习单词数量：</Text>
                    <Input 
                      type='number' 
                      className='config-input'
                      value={config.reviewWordCount.toString()} 
                      onInput={(e) => setConfig({...config, reviewWordCount: parseInt(e.detail.value) || 0})}
                    />
                  </View>
                  <View className='config-item'>
                    <Text className='config-label'>每个单词时间(秒)：</Text>
                    <Input 
                      type='number' 
                      className='config-input'
                      value={config.timePerWord.toString()} 
                      onInput={(e) => setConfig({...config, timePerWord: parseInt(e.detail.value) || 5})}
                    />
                  </View>
                  <View className='config-presets'>
                    <Button className='preset-button' onClick={() => setPreset('light')}>轻松模式</Button>
                    <Button className='preset-button' onClick={() => setPreset('normal')}>标准模式</Button>
                    <Button className='preset-button' onClick={() => setPreset('intensive')}>强化模式</Button>
                  </View>
                </View>
              )}
            </View>
            
            <View className='time'>
              <Text>{Math.floor(remainingTime / 60)} m {remainingTime % 60} s</Text>
            </View>
            {/* <View className='score'>
              <Text>得分：</Text>
              <Text className='score-value'>{score}</Text>
            </View> */}

            <Button className='study-button' 
              onClick={() => searchHandle(true)} 
              disabled={!search.book || search.type.length === 0}
            >
            背诵
            </Button>
            <Button className='dictation-button' 
              onClick={() => searchHandle(false)} 
              disabled={!search.book || search.type.length === 0}
            >
              默写
            </Button>
            <Button className='submit-button' onClick={handleSubmit}>提交</Button>
          </View>
        </View>
      </View>
      
      <View className='content'>
        <ScrollView 
          className='word-table'
          scrollY
          style={{ height: 'calc(100% - 40px)', width: windowWidth + 'px' }}
        >
          {tableData!.length > 0 ? (
            <View className='table'>
              <View className='table-header'>
                <View className='th th-index'>序号</View>
                <View className='th th-input'>输入</View>
                <View className='th th-cn'>中文</View>
                <View className='th th-en'>英文</View>
                <View className='th th-stats'>战绩</View>
                <View className='th th-type'>类型</View>
                <View className='th th-unit'>单元</View>
                <View className='th th-time'>默写时间</View>
              </View>
              
              {tableData!.map((item, index) => (
                <View className='table-row' key={item.id}>
                  <View className='td td-index'>{index + 1}</View>
                  <View className='td td-input'>
                    <Input 
                      className='word-input'
                      value={item.input || ''}
                      onInput={(e) => handleInputChange(index, e.detail.value)}
                      onConfirm={() => focusNextInput(index)}
                    />
                  </View>
                  <View className='td td-cn'>{item.cn}</View>
                  <View className='td td-en'>
                    {showAnswers && (
                      <Text className={item.res ? 'ok' : 'err'}>{item.en}</Text>
                    )}
                  </View>
                  <View className='td td-stats'>{item.error} / {item.cnt}</View>
                  <View className='td td-type'>{item.type}</View>
                  <View className='td td-unit'>{item.unit}</View>
                  <View className='td td-time'>{handleTime(item.time)}</View>
                </View>
              ))}
            </View>
          ) : (
            <View className='empty-state'>
              <Text>请选择书本和单词类型，然后点击背诵或默写按钮开始学习</Text>
            </View>
          )}
        </ScrollView>
        
        <View className='progress-container' style={{width: windowWidth + 'px'}}>
          <View className='progress-bar'>
            <View 
              className='progress-inner' 
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: color
              }}
            >
              <Text className='progress-text'>{progressPercentage}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}