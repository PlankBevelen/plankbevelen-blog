<script setup lang="ts"></script>

<template>
  <div class="app-container">
    <h1>CSS样式优先级和权重叠加示例</h1>
    
    <!-- 示例1: 基础选择器优先级对比 -->
    <section class="demo-section">
      <h2>1. 基础选择器优先级对比</h2>
      <div class="priority-demo">
        <!-- 权重: 0,0,1,1 (类选择器 + 元素选择器) -->
        <p class="text-style">类选择器样式 (权重: 0,0,1,1)</p>
        
        <!-- 权重: 0,1,0,1 (ID选择器 + 元素选择器) -->
        <p id="unique-text" class="text-style">ID选择器样式 (权重: 0,1,0,1)</p>
        
        <!-- 权重: 0,0,1,1 (属性选择器 + 元素选择器) -->
        <p data-style="special" class="text-style">属性选择器样式 (权重: 0,0,1,1)</p>
      </div>
    </section>

    <!-- 示例2: 权重叠加示例 -->
    <section class="demo-section">
      <h2>2. 权重叠加示例</h2>
      <div class="weight-demo">
        <!-- 权重: 0,0,1,0 (单个类选择器) -->
        <div class="box">单个类选择器 (权重: 0,0,1,0)</div>
        
        <!-- 权重: 0,0,2,0 (两个类选择器) -->
        <div class="box highlight">两个类选择器 (权重: 0,0,2,0)</div>
        
        <!-- 权重: 0,0,3,0 (三个类选择器) -->
        <div class="box highlight special">三个类选择器 (权重: 0,0,3,0)</div>
        
        <!-- 权重: 0,1,1,0 (ID + 类选择器) -->
        <div id="special-box" class="box">ID + 类选择器 (权重: 0,1,1,0)</div>
      </div>
    </section>

    <!-- 示例3: 伪类和伪元素优先级详解 -->
    <section class="demo-section">
      <h2>3. 伪类和伪元素优先级详解</h2>
      <div class="pseudo-demo">
        <div class="priority-comparison">
          <h3>优先级对比测试：</h3>
          <!-- 测试伪类 vs 类选择器 -->
          <div class="test-item hover-test">悬停测试：伪类 vs 类选择器</div>
          
          <!-- 测试伪元素 vs 元素选择器 -->
          <p class="pseudo-element-test">伪元素测试：::before vs 元素选择器</p>
          
          <!-- 测试复合选择器权重 -->
          <div class="complex-test" data-state="active">复合选择器权重测试</div>
        </div>
        
        <button class="btn">悬停查看伪类效果</button>
        <p class="quote">这段文字有伪元素装饰</p>
        <ul class="list">
          <li>第一项 - :first-child</li>
          <li>第二项 - :nth-child(2)</li>
          <li>第三项 - :last-child</li>
        </ul>
      </div>
    </section>

    <!-- 示例4: !important 和内联样式优先级对比 -->
    <section class="demo-section">
      <h2>4. !important 和内联样式优先级对比</h2>
      <div class="important-demo">
        <p class="important-text">CSS中的 !important 样式</p>
        <p class="important-text" style="color: purple; background-color: lightgray;">内联样式 vs CSS !important</p>
        <p class="important-text" style="color: green !important; background-color: pink !important;">内联 !important vs CSS !important</p>
        <p id="priority-test" class="important-text" style="color: orange;">ID + 类 + 内联样式 vs CSS !important</p>
      </div>
    </section>
  </div>
</template>

<style>
/* @import 示例 - 通常在文件顶部 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>

<style scoped>
/* CSS样式优先级示例 */
/* 权重计算: (内联样式, ID选择器, 类选择器/属性选择器/伪类, 元素选择器) */

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-top: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 700;
}

h2 {
  color: #555;
  margin-bottom: 15px;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 5px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

/* 示例1: 基础选择器优先级 */
.priority-demo p {
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  font-weight: 600;
}

/* 权重: 0,0,1,1 - 类选择器 + 元素选择器 */
.text-style {
  background-color: lightblue !important;
  color: darkblue;
}

/* 权重: 0,1,0,1 - ID选择器 + 元素选择器 (优先级最高) */
#unique-text {
  background-color: lightcoral;
  color: darkred;
}

/* 权重: 0,0,1,1 - 属性选择器 + 元素选择器 */
p[data-style="special"] {
  background-color: lightgreen;
  color: darkgreen;
}

/* 示例2: 权重叠加 */
.weight-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

/* 权重: 0,0,1,0 - 单个类选择器 */
.box {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  background-color: #e3f2fd;
  color: #1976d2;
  border: 2px solid #bbdefb;
}

/* 权重: 0,0,2,0 - 两个类选择器 */
.box.highlight {
  background-color: #fff3e0;
  color: #f57c00;
  border-color: #ffcc02;
}

/* 权重: 0,0,3,0 - 三个类选择器 */
.box.highlight.special {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border-color: #ba68c8;
  transform: scale(1.05);
}

/* 权重: 0,1,1,0 - ID + 类选择器 (最高优先级) */
#special-box.box {
  background-color: #e8f5e8;
  color: #2e7d32;
  border-color: #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* 示例3: 伪类和伪元素优先级详解 */
.pseudo-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.priority-comparison {
  background: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #4682b4;
}

.priority-comparison h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1em;
}

/* 伪类优先级测试 */
/* 权重: 0,0,1,0 - 类选择器 */
.test-item {
  padding: 12px;
  margin: 8px 0;
  background-color: #e8f4fd;
  color: #1565c0;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 权重: 0,0,1,1 - 类选择器 + 伪类 (优先级更高) */
.hover-test:hover {
  background-color: #ff6b6b;
  color: white;
  transform: scale(1.02);
}

/* 这个样式权重较低，会被上面的伪类覆盖 */
.hover-test {
  background-color: #4ecdc4;
  color: #2c3e50;
}

/* 伪元素优先级测试 */
/* 权重: 0,0,1,0 - 类选择器 */
.pseudo-element-test {
  padding: 15px;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  position: relative;
}

/* 权重: 0,0,1,1 - 类选择器 + 伪元素 */
.pseudo-element-test::before {
  content: "🔸 ";
  color: #e17055;
  font-weight: bold;
}

/* 复合选择器权重测试 */
/* 权重: 0,0,1,0 - 类选择器 */
.complex-test {
  padding: 12px;
  background-color: #ddd6fe;
  color: #5b21b6;
  border-radius: 4px;
  margin: 8px 0;
}

/* 权重: 0,0,2,0 - 类选择器 + 属性选择器 */
.complex-test[data-state="active"] {
  background-color: #a78bfa;
  color: white;
  font-weight: bold;
}

/* 权重: 0,0,2,1 - 类选择器 + 属性选择器 + 伪类 */
.complex-test[data-state="active"]:hover {
  background-color: #7c3aed;
  transform: translateX(5px);
}

/* 原有的按钮样式 */
/* 权重: 0,0,1,1 - 类选择器 + 伪类 */
.btn {
  padding: 12px 24px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:active {
  transform: translateY(0);
}

/* 权重: 0,0,1,2 - 类选择器 + 伪元素 */
.quote {
  position: relative;
  font-style: italic;
  padding: 20px;
  background-color: #f8f9fa;
  border-left: 4px solid #667eea;
}

.quote::before {
  content: '"';
  font-size: 3em;
  color: #667eea;
  position: absolute;
  left: 10px;
  top: -10px;
  line-height: 1;
}

.quote::after {
  content: '"';
  font-size: 3em;
  color: #667eea;
  position: absolute;
  right: 10px;
  bottom: -20px;
  line-height: 1;
}

/* 权重: 0,0,1,2 - 类选择器 + 伪类 + 元素选择器 */
.list {
  list-style: none;
  padding-left: 0;
}

.list li {
  padding: 8px 16px;
  margin: 5px 0;
  background-color: #f1f3f4;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.list li:nth-child(odd) {
  background-color: #e8eaf6;
}

.list li:hover {
  background-color: #c5cae9;
}

.list li:first-child {
  font-weight: bold;
  background-color: #667eea;
  color: white;
}

/* 
伪类和伪元素优先级说明:
1. 伪类(:hover, :focus, :nth-child等) 权重等同于类选择器 (0,0,1,0)
2. 伪元素(::before, ::after等) 权重等同于元素选择器 (0,0,0,1)
3. 复合选择器权重会叠加: .class:hover = 0,0,1,1
4. 伪类 + 类选择器 > 单独的类选择器
5. 伪元素 + 类选择器 > 单独的元素选择器
*/

/* 示例4: !important 优先级详解 */
.important-demo p {
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  font-weight: 600;
  border: 2px solid #ddd;
}

/* 权重: 0,0,1,1 + !important - CSS中的!important */
.important-text {
  background-color: #ffeb3b !important;
  color: #f57f17 !important;
  border-color: #fbc02d !important;
}

/* 这个样式会被上面的 !important 覆盖 */
.important-text {
  background-color: lightgray;
  color: black;
}

/* 权重: 0,1,1,1 + !important - ID + 类 + 元素选择器 + !important */
#priority-test.important-text {
  background-color: #e1f5fe !important;
  color: #0277bd !important;
  border-color: #03a9f4 !important;
}

/* 
CSS优先级规则总结:
1. 内联 !important > CSS !important > 内联样式 > ID选择器 > 类选择器 > 元素选择器
2. 相同优先级时，后定义的样式会覆盖先定义的
3. !important 可以覆盖内联样式，但内联 !important 优先级最高
4. 权重计算: (内联样式, ID, 类/属性/伪类, 元素)
*/
</style>
