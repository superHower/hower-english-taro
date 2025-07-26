import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Index page loaded.')
  })

  return (
    <View className='index'>
      <View className='header'>
        <Text className='title'>Hower英语</Text>
        <Text className='subtitle'>每天进步一点点，英语能力大提升</Text>
      </View>
      
      <View className='card'>
        <Text className='card-title'>今日单词</Text>
        <View className='word-container'>
          <Text className='word'>vocabulary</Text>
          <Text className='phonetic'>/vəˈkæbjələri/</Text>
          <Text className='meaning'>n. 词汇；词汇量；词表</Text>
          <Text className='example'>He has an extensive vocabulary.</Text>
        </View>
        
        <Button className='learn-btn' type='primary'>开始学习</Button>
      </View>
      
      <View className='stats'>
        <View className='stat-item'>
          <Text className='stat-value'>12</Text>
          <Text className='stat-label'>今日已学</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>256</Text>
          <Text className='stat-label'>总计单词</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>7</Text>
          <Text className='stat-label'>连续天数</Text>
        </View>
      </View>
    </View>
  )
}