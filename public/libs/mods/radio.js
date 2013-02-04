define(function(require, exports, module) {
    
   document.domain = 'tuer.me'; 

   var raidoHtml = '<div id="radio">\
                <div class="radio-iframe"><iframe id="luoo-iframe" src="http://www.luoo.net/tuer/soundmanager/demo/page-player/radio.html" frameborder="no" scrolling="no" style="width:100%;height:auto;overflow:hidden;"></iframe></div>\
                </div>';

   window.setRadioHeight = function(height){
        $('#radio').height(height);   
        $('#luoo-iframe').height(height);   
   };

   $(function(){
        $('body').append(raidoHtml);
   });
});
