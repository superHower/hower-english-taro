import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Analysis () {
  useLoad(() => {
    console.log('Analysis page loaded.')
  })

  return (
    <View className='analysis'>
      <View className='header'>
        <Text className='title'>学习数据分析</Text>
      </View>
      
      <View className='card'>
        <Text className='card-title'>学习概览</Text>
        <View className='overview'>
          <View className='overview-item'>
            <Text className='overview-value'>89</Text>
            <Text className='overview-label'>已学单词</Text>
          </View>
          <View className='overview-item'>
            <Text className='overview-value'>7</Text>
            <Text className='overview-label'>连续天数</Text>
          </View>
          <View className='overview-item'>
            <Text className='overview-value'>32</Text>
            <Text className='overview-label'>总学习时长(小时)</Text>
          </View>
        </View>
      </View>
      
      <View className='card'>
        <Text className='card-title'>每日学习情况</Text>
        <View className='daily-stats'>
          <View className='day-item'>
            <View className='day-bar' style='height: 60px'></View>
            <Text className='day-label'>一</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar' style='height: 90px'></View>
            <Text className='day-label'>二</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar' style='height: 40px'></View>
            <Text className='day-label'>三</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar' style='height: 70px'></View>
            <Text className='day-label'>四</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar' style='height: 80px'></View>
            <Text className='day-label'>五</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar' style='height: 50px'></View>
            <Text className='day-label'>六</Text>
          </View>
          <View className='day-item'>
            <View className='day-bar active' style='height: 30px'></View>
            <Text className='day-label'>日</Text>
          </View>
        </View>
      </View>
      
      <View className='card'>
        <Text className='card-title'>掌握情况</Text>
        <View className='mastery'>
          <View className='mastery-item'>
            <View className='mastery-progress' style='width: 75%'></View>
            <Text className='mastery-label'>熟练</Text>
            <Text className='mastery-count'>45</Text>
          </View>
          <View className='mastery-item'>
            <View className='mastery-progress' style='width: 40%'></View>
            <Text className='mastery-label'>掌握中</Text>
            <Text className='mastery-count'>24</Text>
          </View>
          <View className='mastery-item'>
            <View className='mastery-progress' style='width: 20%'></View>
            <Text className='mastery-label'>生疏</Text>
            <Text className='mastery-count'>12</Text>
          </View>
          <View className='mastery-item'>
            <View className='mastery-progress' style='width: 10%'></View>
            <Text className='mastery-label'>未学习</Text>
            <Text className='mastery-count'>8</Text>
          </View>
        </View>
      </View>
    </View>
  )
}