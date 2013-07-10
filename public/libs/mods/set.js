/**
 * page:set
 */

define(function(require, exports, module) {

	$('#J_nick').validate({
		expression: "if (VAL!=='' && VAL && VAL.length<10) return true; else return false;",
		message: "昵称小于10个字节就好啦~"
	});

	$('#J_pwd').validate({
		expression: "if (VAL!=='' && VAL.length > 5 && VAL.length<15 && VAL) return true; else return false;",
		message: "密码至少得大于5位数啦！"
	});

	$('#J_profile').validate({
		expression: "if (VAL.length>30) return false; else return true;",
		message: "签名别多于30个字就好了.."
	});

	$('#J_soleUrl').validate({
		expression: "if (VAL.length<=10 && !(/[^0-9a-z]/g).test(VAL)) return true; else return false;",
		message: "最多10个字符，还不能带特殊标点~"
	});

	$('#J_Change_Avatar').click(function() {
		return false;
	});

});

