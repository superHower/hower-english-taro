import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss'

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarItem[];
  height?: number;
  maxValue?: number;
  title?: string;
  showValue?: boolean;
  barWidth?: string;
}

export default function BarChart ({
  data = [],
  height = 300,
  maxValue,
  title = '柱状图',
  showValue = true,
  barWidth = '60%'
}: BarChartProps) {
  const [chartMaxValue, setChartMaxValue] = useState(maxValue || 0);

  useEffect(() => {
    if (!maxValue && data.length > 0) {
      const max = Math.max(...data.map(item => item.value));
      setChartMaxValue(max || 1); // 避免除以零
    } else {
      setChartMaxValue(maxValue || 0);
    }
  }, [data, maxValue]);

  // 计算柱状图高度百分比
  const calculateHeightPercent = (value: number) => {
    if (chartMaxValue <= 0) return 0;
    return (value / chartMaxValue) * 100;
  };

  return (
    <View className="bar-chart-container">
      {title && <Text className="chart-title">{title}</Text>}
      <View className="bar-chart" style={{ height: `${height}px` }}>
        <View className="y-axis">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
            <Text key={index} className="y-tick">
              {Math.round(chartMaxValue * ratio)}
            </Text>
          ))}
        </View>
        
        <View className="chart-content">
          {data.length === 0 ? (
            <View className="no-data">
              <Text>暂无数据</Text>
            </View>
          ) : (
            data.map((item, index) => {
              const heightPercent = calculateHeightPercent(item.value);
              const barStyle = {
                height: `${heightPercent}%`,
                backgroundColor: item.color || '#409eff',
                width: barWidth
              };
              
              return (
                <View className="bar-item" key={index}>
                  {showValue && (
                    <Text className="bar-value">{item.value}</Text>
                  )}
                  <View className="bar" style={barStyle} />
                  <Text className="bar-label">{item.label}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}