import { View, Text, Button, Input, ScrollView, Image, Progress } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.scss'
import db from './word'
import Taro from '@tarojs/taro'
import switchPng from '../../assets/icons/switch.png'

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

  const [wordData, setWordData] = useState<Word[]>()
  const [tableData, setTableData] = useState<Word[]>([])
  const [database, setDatabase] = useState<Word[]>([])
  const [vcnt, setVcnt] = useState("")
  const [ncnt, setNcnt] = useState("")
  const [dcnt, setDcnt] = useState("")
  const [ocnt, setOcnt] = useState("")
  const [acnt, setAcnt] = useState("")
  const [score, setScore] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [progressColor, setProgressColor] = useState('#ffffff')
  const [moDisable, setMoDisable] = useState(true) // 是否禁止默写
  const [hiddenMode, setHiddenMode] = useState<'no' | 'en' | 'cn'>('no')
  
  // 新增状态
  const [studyMode, setStudyMode] = useState<'study' | 'dictation' | 'done' | 'none'>('none') // 学习模式
  const [currentWordIndex, setCurrentWordIndex] = useState(0) // 当前默写单词索引
  const [currentInput, setCurrentInput] = useState('') // 当前输入的内容
  
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

  // 选择书本
  const handleBook = (value) => {
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
    setMoDisable(true)
    setStudyMode('none')
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
  // 创建 tableData 的副本
  const newTableData = [...tableData];
  
  // 保存当前输入到当前单词
  newTableData[currentWordIndex] = { 
    ...newTableData[currentWordIndex], 
    input: currentInput 
  };
  
  let newScore = 0;
  
  // 创建数据库的副本 - 在循环外部定义
  const newDatabase = [...database];
  
  // 处理所有单词
  newTableData.forEach((item, index) => {
    const userInput = item.input?.trim().toLowerCase() || "";
    const correct = item.en.trim().toLowerCase();
    const isCorrect = userInput === correct;
    
    newTableData[index] = { 
      ...item, 
      res: isCorrect 
    };
    
    if (isCorrect) newScore++;
    
    // 在数据库副本中查找对应项
    const dbItemIndex = newDatabase.findIndex(dbItem => dbItem.id === item.id);
    
    if (dbItemIndex !== -1) {
      const dbItem = newDatabase[dbItemIndex];
      newDatabase[dbItemIndex] = {
        ...dbItem,
        cnt: dbItem.cnt + 1,
        error: isCorrect ? dbItem.error : dbItem.error + 1,
        time: Date.now()
      };
    }
  });
  
  // 更新状态
  setTableData(newTableData);
  setScore(newScore);
  setDatabase(newDatabase); // 使用更新后的数据库副本
  
  // 保存到本地存储 - 使用 newDatabase 而不是 database
  try {
    Taro.setStorageSync('word', JSON.stringify(newDatabase));
  } catch (error) {
    console.error('Storage save error:', error);
  }
  
  // 显示答案
  setStudyMode('done');

  // 清除计时器
  if (countdownIntervalRef.current) {
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = null;
  }
};

  // 搜索处理函数
  const searchHandle = (isStudyMode) => {
    setTableData([])
    setScore(0)
    setCurrentWordIndex(0)
    setCurrentInput('')

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
    
    if (isStudyMode) {
      setStudyMode('study')
      setMoDisable(false)
    } else {
      if(tableData.length === 0) {
        setMoDisable(true)
        return
      }
      setStudyMode('dictation')      // 开始计时
      setTimeout(() => {
        startCountdown()
      }, 0)
    }
  }

  // 隐藏函数
  const hiddenHandle = () => {
    if (hiddenMode === 'no') {
      setHiddenMode('en')
    } else if (hiddenMode === 'en') {
      setHiddenMode('cn')
    } else {
      setHiddenMode('no')
    }
  }

  // 计时函数
  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    
    // 使用配置的时间
    const timePerWord = search.type.includes('d') ? config.timePerWord * 2 : config.timePerWord
    setRemainingTime(tableData.length * timePerWord)
    
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
  }

  // 处理默写下一个单词
  const handleNextWord = () => {
    // 保存当前输入
    setTableData(prevData => {
      const newData = [...prevData];
      newData[currentWordIndex] = { ...newData[currentWordIndex], input: currentInput };
      return newData;
    });

    if (currentWordIndex < tableData.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setCurrentInput('')
    } else {
      handleSubmit()
    }
  }

  // 处理默写上一个单词
  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      // 保存当前输入
      const newTableData = [...tableData]
      newTableData[currentWordIndex] = { 
        ...newTableData[currentWordIndex], 
        input: currentInput 
      }
      setTableData(newTableData)
      
      setCurrentWordIndex(currentWordIndex - 1)
      setCurrentInput(tableData[currentWordIndex - 1]?.input || '')
    }
  }

  // 计算已完成的输入数量
  const completedCount = tableData.filter(item => item.input?.trim() !== '').length
  // 计算进度百分比
  const progressPercentage =  Math.min(Math.round((completedCount / (tableData.length || 1)) * 100) || 0, 100)

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
    setMoDisable(true)
  }


  const typeMap = {
    v: '动词',
    n: '名词',
    a: '形容词',
    o: '其他',
    d: '短语',
  }

  return (
    <View className='index' style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <View className='top'>
        {/* 书本选择 */}
        <View className='book-select-group'>
          {['7A', '7B', '8A', '8B', '9A', '9B'].map((book) => (
            <View 
              key={book}
              className={`book-select-item ${search.book === book ? 'selected' : ''}`}
              onClick={() => handleBook(book)} // 点击切换选中状态
            >
              {book}
              {/* 选中状态的指示图标 */}
              {search.book === book && (<View className='selected-icon'><Text>✓</Text></View>)}
            </View>
          ))}
         {/* 学习配置 */}
          <View className='config-button-container'>
            <Button className='config-button' onClick={() => setShowConfigPanel(!showConfigPanel)}>学习配置</Button>
            
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
        </View>
        
        {/* 单词类型选择 */}
        <View className='type-container'>
            <View className={`type-option ${search.type.includes('v') ? 'selected' : ''}`} onClick={() => handleTypeChange('v')}>{vcnt || typeMap['v']}</View>
            <View className={`type-option ${search.type.includes('n') ? 'selected' : ''}`} onClick={() => handleTypeChange('n')}>{ncnt || typeMap['n']}</View>
            <View className={`type-option ${search.type.includes('a') ? 'selected' : ''}`} onClick={() => handleTypeChange('a')}>{acnt || typeMap['a']}</View>
            <View className={`type-option ${search.type.includes('o') ? 'selected' : ''}`} onClick={() => handleTypeChange('o')}>{ocnt || typeMap['o']}</View>
            <View className={`type-option ${search.type.includes('d') ? 'selected' : ''}`} onClick={() => handleTypeChange('d')}>{dcnt || typeMap['d']}</View>
        </View>
        
        <View className='top-down'>
          <Button 
            className={`study-button ${!search.book || search.type.length === 0 ? 'disabled' : ''}`} 
            onClick={() => searchHandle(true)} 
            disabled={!search.book || search.type.length === 0}
          >
            背诵
          </Button>

          {search.book && search.type.length > 0 &&
            <Image className='switch-icon' src={switchPng} onClick={() => hiddenHandle()} />
          }
     

          <Button 
            className={`dictation-button ${!search.book || search.type.length === 0 || moDisable ? 'disabled' : ''}`} 
            onClick={() => searchHandle(false)} 
            disabled={!search.book || search.type.length === 0 || moDisable}
          >
            默写
          </Button>

        </View>
   
      </View>
      
      <View className='content'>
        {/* 背诵模式 - 单元格展示 */}
        {studyMode === 'study' && (
          <ScrollView 
            className='word-cards'
            scrollY
            style={{ height: 'calc(100% - 40px)', width: windowWidth + 'px' }}
          >
            <View className='cards-container'>
              {tableData.map((item, index) => (
                <View className='word-card' key={item.id}>
                  <View className='card-header'>
                    <View className='card-lable'>
                      {hiddenMode !== 'en' && <Text className='card-en'>{item.en}</Text>}
                      <Text className='card-type'>{typeMap[item.type]}</Text>
                    </View>
                   
                    <View className='card-lable'>
                      <Text className='card-unit'>Unit {item.unit}</Text>
                      <Text className='card-index'>{index + 1}</Text>
                    </View>
                  </View>
                  <View className='card-content'>
                    {hiddenMode !== 'cn' && <Text className='card-cn'>{item.cn}</Text>}
                    <Text className='card-stats'>战绩: {item.error}/{item.cnt}</Text>
                    <Text className='card-time'>{handleTime(item.time)}</Text>
                   
                  </View>
      
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* 默写模式 - 弹出组件 */}
        {studyMode == 'dictation' && (
          <View className='dictation-modal'>
            <View className='modal-overlay'></View>
            <View className='modal-content'>
              <View className='modal-header'>
                <Text className='modal-title'>默写</Text>
                <Text className='time'>{ Math.floor(remainingTime / 60) } m { remainingTime % 60 } s</Text>
                <Text className='modal-progress'>
                  {currentWordIndex + 1} / {tableData.length}
                </Text>
              </View>
              
              {tableData.length > 0 && currentWordIndex < tableData.length && (
                <View className='dictation-form'>
                  <View className='form-item'>
                    <Text className='form-label'>{tableData[currentWordIndex]?.cn}</Text>
                    <Input 
                      className='form-input'
                      placeholder='请输入英文意思'
                      value={currentInput}
                      onInput={(e) => setCurrentInput(e.detail.value)}
                    />
                  </View>
                  
                  <View className='form-buttons'>
                    <Button className='prev-button' onClick={handlePrevWord} disabled={currentWordIndex === 0}>
                      上一个
                    </Button>
                    <Button className='next-button' onClick={() => handleNextWord()}>
                      {currentWordIndex === tableData.length - 1 ? '完成' : '下一个'
                    }</Button>
                  </View>

                  <View className='progress-container'>
                    <View className='progress-bar'>
                      <Progress 
                        percent={progressPercentage}
                        showInfo
                        borderRadius={5}
                        strokeWidth={16}
                        color={progressColor}
                      >
                      </Progress>
                    </View>
                  </View>
                </View>
              )}

            </View>
          </View>
        )}

        {/* 结果展示 */}
        {studyMode === 'done' && (
          <ScrollView 
            className='result-view'
            scrollY
            style={{ height: 'calc(100% - 40px)', width: windowWidth + 'px' }}
          >
            <View className='result-container'>
              <View className='result-header'>
                <Text className='result-title'>默写结果</Text>
                <Text className='result-score'>得分: {score}/{tableData.length}</Text>
              </View>
              
              <View className='result-cards'>
                {tableData.map((item, index) => (
                  <View className={`result-card ${item.res ? 'correct' : 'incorrect'}`} key={item.id}>
                    <View className='result-card-header'>
                      <Text className='result-index'>{index + 1}</Text>
                      <Text className='result-cn-correct'>{item.cn}</Text>
                      <Text className={`result-status ${item.res ? 'correct' : 'incorrect'}`}>{item.res ? '✓' : '✗'}</Text>
                    </View>
                    <View className='result-card-content'>
                      <Text className='result-en'>{item.en}</Text>
                      <Text className='result-cn-input'>{item.input || '(未填写)'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* 默认状态 */}
        {studyMode === 'none' && (
          <View className='empty-state' style={{ height: 'calc(100% - 40px)', width: windowWidth + 'px' }}>
            <Text>请选择书本和单词类型，然后点击背诵或默写按钮开始学习</Text>
          </View>
        )}
        

      </View>
    </View>
  )
}