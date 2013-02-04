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
	function getXml(type, num, callback) {
		$.ajax({
			url: 'http://www.luoo.net/radio/radio' + num + '/' + type + '.xml',
			dataType: 'xml',
			type: 'get',
			error: function() {
				if (type == 'mp3') {
					getXml('mp3player', num, callback);
				} else if (type == 'mp3player') {
					getXml('playlist', num, callback);
				} else if (type == 'playlist') {
					console.log('歌曲列表不存在');
				}
			},
			success: function(doc) {
				var ret = [];
				$(doc).find('song').each(function(index, item) {
					ret.push({
						title: $(item).attr('title'),
						path: $(item).attr('path')
					});
				});
				callback(ret);
			}
		});
	}

	function getSong(data) {
		var songnum = getRandomNum(0, data.length),
		song = data[songnum];
		if (!song) {
			var num = getRandomNum(1, lastNum);
			getXml('mp3', num, getSong);
		} else {
			$('#myradio').append('<li><a href="' + song.path + '">' + song.title + '</a></li>');
			pagePlayer = new PagePlayer();
			pagePlayer.init(typeof PP_CONFIG !== 'undefined' ? PP_CONFIG: null);
		}
	}

	soundManager.onready(function() {
		var num = getRandomNum(1, lastNum);
		getXml('mp3', num, getSong);
	});
})();

