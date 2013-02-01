(function() {
	//加载随即音乐列表
    //http://www.luoo.net/radio/radio436/mp3.xml
	// 目前有436期 手动更新
    document.domain = 'luoo.net';
	var lastNum = 436;
	function getRandomNum(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		return (Min + Math.round(Rand * Range));
	}
	function getXml(callback) {
		var num = getRandomNum(1, lastNum);
        if(num < 295) type = 'mp3player';
        else type = 'mp3';
		$.ajax({
            url: 'http://www.luoo.net/radio/radio'+num+'/'+type+'.xml',
            dataType:'xml',
			type: 'get',
			success:function(doc){
                var ret = [];
                $(doc).find('song').each(function(index,item){
                    ret.push({
                        title:$(item).attr('title'),
                        path:$(item).attr('path')
                    });
                });
                callback(ret);
            } 
		});
	}
	soundManager.onready(function() {
		getXml(function(data) {
            for(var i=0;i<data.length;i++){
                var song = data[i];
                $('#myradio').append('<li><a href="'+data[i].path+'">'+data[i].title+'</a></li>');
            }
			pagePlayer = new PagePlayer();
			pagePlayer.init(typeof PP_CONFIG !== 'undefined' ? PP_CONFIG: null);
		});
	});
})();

