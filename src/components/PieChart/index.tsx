import { useEffect, useState } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro, { CanvasContext } from '@tarojs/taro';
import './index.scss'

interface PieItem {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieItem[];
  size?: number;
  title?: string;
  showLegend?: boolean;
  showPercentage?: boolean;
  strokeWidth?: number;
}

export default function PieChart ({
  data = [],
  size = 300,
  title = '饼图',
  showLegend = true,
  showPercentage = true,
  strokeWidth = 60
}: PieChartProps) {
  const [totalValue, setTotalValue] = useState(0);
  const [segments, setSegments] = useState<Array<{
    label: string;
    value: number;
    percentage: number;
    color: string;
    startAngle: number;
    endAngle: number;
  }>>([]);

  // 默认颜色数组
  const defaultColors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#1989FA', '#5CB87A', '#B88230', '#C45656', '#6B6B80'
  ];

  // 计算总和和各项百分比
  useEffect(() => {
    if (data.length === 0) return;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    setTotalValue(total);
    
    let startAngle = 0;
    const newSegments = data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const endAngle = startAngle + (percentage / 100) * 360;
      
      const segment = {
        label: item.label,
        value: item.value,
        percentage,
        color: item.color || defaultColors[index % defaultColors.length],
        startAngle,
        endAngle
      };
      
      startAngle = endAngle;
      return segment;
    });
    
    setSegments(newSegments);
  }, [data]);

  // 唯一Canvas ID - 添加随机数以避免多个实例时的ID冲突
  const [canvasId] = useState(`pie-chart-canvas-${Math.random().toString(36).slice(2, 10)}`);
  
  // 绘制饼图
  const drawPieChart = () => {
    if (segments.length === 0) return;
    
    // 获取系统信息以确保正确的像素比
    Taro.getSystemInfo({
      success: () => {
        const canvasWidth = size;
        const canvasHeight = size;
        
        // 创建canvas上下文
        const ctx = Taro.createCanvasContext(canvasId);
        if (!ctx) return;
        
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const outerRadius = centerX;
        const innerRadius = outerRadius - strokeWidth;
        
        // 绘制环形扇区
        segments.forEach(segment => {
          const startRad = (segment.startAngle - 90) * Math.PI / 180;
          const endRad = (segment.endAngle - 90) * Math.PI / 180;
          
          ctx.beginPath();
          
          // 绘制外弧
          ctx.arc(centerX, centerY, outerRadius, startRad, endRad, false);
          
          // 连接到内圆
          const endInnerX = centerX + innerRadius * Math.cos(endRad);
          const endInnerY = centerY + innerRadius * Math.sin(endRad);
          ctx.lineTo(endInnerX, endInnerY);
          
          // 绘制内弧
          ctx.arc(centerX, centerY, innerRadius, endRad, startRad, true);
          
          // 闭合路径
          ctx.closePath();
          
          // 填充和描边
          ctx.setFillStyle(segment.color);
          ctx.fill();
          ctx.setStrokeStyle('#ffffff');
          ctx.stroke();
        });
        
        // 绘制中心文本
        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(20);
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        ctx.fillText(totalValue.toString(), centerX, centerY);
        
        // 绘制到画布
        ctx.draw();
      }
    });
  };

  // 更新绘制
  useEffect(() => {
    if (segments.length > 0) {
      drawPieChart();
    }
  }, [segments, size, strokeWidth]);

  return (
    <View className="pie-chart-container">
      {title && <Text className="chart-title">{title}</Text>}
      
      <View className="pie-chart" style={{ width: `${size}px`, height: `${size}px` }}>
        {data.length === 0 ? (
          <View className="no-data">
            <Text>暂无数据</Text>
          </View>
        ) : (
          <Canvas 
            canvasId={canvasId}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="pie-canvas"
          />
        )}
      </View>
      
      {/* 显示图例 */}
      {showLegend && (
        <View className="pie-legend">
          {segments.map((segment, index) => (
            <View key={index} className="legend-item">
              <View className="legend-color" style={{ backgroundColor: segment.color }}></View>
              <Text className="legend-label">{segment.label}</Text>
              {showPercentage && (
                <Text className="legend-percentage">{segment.value}({segment.percentage.toFixed(1)}%)</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}