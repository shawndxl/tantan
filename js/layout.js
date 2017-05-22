// 在 DOM 加载及 window resize 后可以设置全局的 rem 基准比例，这样 css 中设置的 rem 值即可动态的改变大小
(function() {
  var percentage = 24 / 720; // 页面 720px 宽度 REM 基准值为 24px
  var rootElement = document.documentElement;
  function resize() {
    rootElement.style.fontSize = (rootElement.clientWidth * percentage).toFixed(2) + "px";
  }
  resize();
  window.addEventListener("resize", resize)
})();