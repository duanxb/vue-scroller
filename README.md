# vue-scroller

移动端列表信息滚动组件


## 描述
滚动列表组件：支持下拉刷新，上拉刷新，基于Bscroller封装



#### Code DEMO
```html
<scroller ref="scroller" :data="newMessageList" :pulldown="pulldown" @pulldown="loadData" stylename="content" @click.native="scrollerClickHandle">
	<ul>
		<li v-for="item in newMessageList">……</li>
	</ul>
</scroller>
```


## Props
| 参数        	| 说明           |
| ------------- |-------------|
| probeType		|[Number], 1: 滚动的时候会派发scroll事件，会截流。2: 滚动的时候实时派发scroll事件，不会截流。3: 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件。默认1	|
| click          | [Boolean]，点击列表是否派发click事件，默认true |
| scrollX       | [Boolean]：是否开启横向滚动，默认false | 
| listenScroll       | [Boolean] 是否派发滚动事件, 默认false  | 
| data  | [Array] 列表数据 | 
| pullup  | [Boolean] 是否派发滚动到底部的事件，用于上拉加载，默认false | 
| pulldown  | [Boolean] 是否派发顶部下拉的事件，用于下拉刷新 | 
| beforeScroll  | [Boolean] 是否派发列表滚动开始的事件，默认false | 
| refreshDelay  | [Number] 当数据更新后，刷新scroll的延时 默认20 | 
| stylename  | [String] 组件的样式名称 | 
|scrollToEndFlag|[Boolean] 打开后是否滚动到底部，默认false|


## 事件方法

| 参数            | 说明          |
| -------------   |-------------|
| scroll   | [Function] 监听滚动事件派发 |
| pullup | [Function] 上拉加载事件派发 |
| pulldown | [Function] 下拉刷新事件派发 |
| beforeScroll | [Function] 列表滚动开始的事件派发 |
| pullup | [Function] 上拉加载事件派发 |
