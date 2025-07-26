import { View, Text, Image, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Profile () {
  useLoad(() => {
    console.log('Profile page loaded.')
  })

  return (
    <View className='profile'>
      <View className='user-info'>
        <View className='avatar-container'>
          <View className='avatar-placeholder'>H</View>
        </View>
        <View className='user-details'>
          <Text className='username'>Hower用户</Text>
          <Text className='user-level'>Level 3 · 初级学习者</Text>
        </View>
        <Button className='edit-btn'>编辑</Button>
      </View>
      
      <View className='stats-card'>
        <View className='stat-item'>
          <Text className='stat-value'>89</Text>
          <Text className='stat-label'>已学单词</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>7</Text>
          <Text className='stat-label'>连续天数</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>32</Text>
          <Text className='stat-label'>学习时长</Text>
        </View>
      </View>
      
      <View className='menu-list'>
        <View className='menu-item'>
          <Text className='menu-title'>学习计划</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-title'>生词本</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-title'>学习提醒</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-title'>学习历史</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>
      
      <View className='menu-list'>
        <View className='menu-item'>
          <Text className='menu-title'>设置</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-title'>帮助与反馈</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-title'>关于我们</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>
    </View>
  )
}