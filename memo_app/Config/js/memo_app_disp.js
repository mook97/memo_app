// setWindow:画面制御############################################################################################################################################################
function setWindow(height, width, stay_flg) {
	if(width === undefined){width = NORMAL_WIDTH}    // Width(デフォルト値)
	if(height === undefined){height = NORMAL_HEIGHT}  // Height(デフォルト値)
	window.resizeTo(width, height);         // リサイズ実行
	// window.moveTo((screen.availWidth - width) / 2, (screen.availHeight - height) / 2); // Position Center
}

// msg_show:画面にメッセージを表示する##############################################################################
function msg_show(arg_msg, arg_type, fadeIn, delay, fadeOut){
	if(arg_type === undefined){arg_type = 'alert-info'}
	if(fadeIn === undefined){fadeIn = 100}
	if(delay === undefined){delay = 300}
	if(fadeOut === undefined){fadeOut = 300}
	$('#memo_app_msg').html(arg_msg);
	$('#memo_app_msg').addClass(arg_type);

	// 詳細メニュー表示対応
	if($('#conf-detail-btn').hasClass('active')){
		var height = OP_DETAILS_HEIGHT;
		var width = NORMAL_WIDTH;
	}
	else if(!($('#all-memo').hasClass('hidden_group'))){
		var height = OP_TABLE_HEIGHT;
		var width = OP_TABLE_WIDTH;
	}
	else {
		var height = NORMAL_HEIGHT;
		var width = NORMAL_WIDTH;
	}
	
	setWindow(height + 43, width);
	$('#memo_app_msg').fadeIn(fadeIn).delay(delay).fadeOut(fadeOut);
	setTimeout(function(){
		setWindow(height, width);
 	},fadeIn + delay + fadeOut);
}



// acordion_move:詳細メニューについて##############################################################################
function acordion_move(){
	// 詳細メニュー入力用に拡大
	if($(this).hasClass('active')){
		setWindow(NORMAL_HEIGHT);
		$(this).removeClass('active');
		$(this).text('▽');
	}
	else{
		setWindow(OP_DETAILS_HEIGHT);         // 表示する際に画面の大きさを変更する
		$(this).addClass('active');       // クラスを追加
		$(this).text('△');                // テキスト変更 
	}
}




