import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'
import { useState } from 'react'

export default function Profile () {
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);
  
  useLoad(() => {
    console.log('Profile page loaded.')
  })

  const clearCache = () => {
    try {
      Taro.removeStorageSync('word')
      Taro.showToast({
        title: '缓存已清除',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('Clear storage error:', error)
      Taro.showToast({
        title: '清除缓存失败',
        icon: 'error',
        duration: 2000
      })
    }
  }
    // 复制缓存内容功能
  const copyCache = async () => {
    try {
      // 获取缓存数据
      const data = Taro.getStorageSync('word');
      if (!data) {
        Taro.showToast({ title: '缓存为空', icon: 'none', duration: 2000 });
        return;
      }
      
      // 将数据设置到剪贴板
      await Taro.setClipboardData({
        data: typeof data ==='string'? data : JSON.stringify(data, null, 2)
      });
      
      Taro.showToast({ title: '复制成功', icon:'success', duration: 2000 });
    } catch (error) {
      console.error('复制缓存失败:', error);
      Taro.showToast({ 
        title: `复制失败: ${error.message || error.errMsg}`,
        icon: 'error',
        duration: 2000
      });
    }
  };

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
        <View className='menu-item' onClick={clearCache}>
          <Text className='menu-title'>清除本地缓存</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item' onClick={copyCache}>
          <Text className='menu-title'>复制缓存内容</Text>
          <Text className='menu-arrow'>›</Text>
        </View>

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