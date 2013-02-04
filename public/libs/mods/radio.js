define(function(require, exports, module) {
   var raidoHtml = '<div id="radio">\
                <div class="radio-iframe"><iframe src="http://www.luoo.net/tuer/soundmanager/demo/page-player/radio.html" frameborder="no" scrolling="no" style="width:100%;height:100%;overflow:hidden;"></iframe></div>\
                </div>';
   $(function(){
        $('body').append(raidoHtml);
   });
});
