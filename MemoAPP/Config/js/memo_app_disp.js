// setWindow:画面制御############################################################################################################################################################
function setWindow(height, width, stay_flg) {
	if(width === undefined){width = NORMAL_WIDTH}     // Width(デフォルト値)
	if(height === undefined){height = NORMAL_HEIGHT}  // Height(デフォルト値)
  window.resizeTo(width, height);                   // リサイズ実行
	// window.moveTo((screen.availWidth - width) / 2, (screen.availHeight - height) / 2); // Position Center
}

// msg_show:画面にメッセージを表示する##############################################################################
function msg_show(arg_msg, arg_type, fadeOut) {
	if(arg_type === undefined){arg_type = 'alert-info'}
	if(fadeOut === undefined){fadeOut = 3000}
	var random = Math.random();
	var html = '<p id="' + random + '" class="mx-auto mb-1 alert msg-active ' + arg_type + '" style="width: 95%; font-size: auto;">' + arg_msg + '</p>'; // 追加するメッセージのHTML
	$('#memo_app_msg').prepend(html);                // HTMLを先頭に追加する
	var height    = window.outerHeight;              // ウィンドウの縦サイズを取得する
  var width     = window.outerWidth;               // ウィンドウの横サイズを取得する
  var tmp_msg   = document.getElementById(random); // 追加したデータのElementを追加する
  var add_heigh = tmp_msg.offsetHeight + 10;       // メッセージ追加前に縦サイズを変更するとき追加する高さ
  var add_flg   = false;                           // 画面サイズを変更したらTrue
  
	if(!(height + add_heigh >= screen.height)){setWindow((height + add_heigh), width); add_flg = true;}   // 高さが最大じゃない場合のみサイズ変更
  $('#' + random).fadeOut(fadeOut);                                                       // 画面にメッセージを追加する
  setTimeout(function(){                                                                  // 非同期処理対策
    if(document.getElementById(random) != null){                                 // 要素が存在していれば
      tmp_msg.parentNode.removeChild(tmp_msg);                                     // 要素を削除する
      if (add_flg) {setWindow(window.outerHeight - add_heigh, window.outerWidth);} // 高さが最大じゃない場合のみサイズ変更
    }
  }, fadeOut);
}


// acordion_move:詳細メニューについて##############################################################################
function acordion_move(){
  var height     = OP_DETAILS_HEIGHT;                                    // 設定するウィンドウの縦サイズ
	var width      = window.outerWidth;                                    // 設定するウィンドウの横サイズ
	
	if(height < window.outerHeight - $('#memo_app_msg').height()){
		// もともとの高さ設定が詳細表示時より多きい場合はサイズを変更しない。
		var height = window.outerHeight - $('#memo_app_msg').height(); // 現在のサイズがテーブル表示用より大きならサイズを変更しない
		$(this).addClass('user-height')
	}  

	// 詳細メニュー入力用に拡大
	if($(this).hasClass('active')){
		$(this).removeClass('active');
		$(this).text('▽');
		if(!($(this).hasClass('user-height'))){
			setWindow($('#memo-input-form').prop("before-height") + $('#memo_app_msg').height(), width);
		}else{
			$(this).removeClass('user-height')
		}
	}	else {
		$('#memo-input-form').prop("before-height", window.outerHeight - $('#memo_app_msg').height());
		setWindow(height + $('#memo_app_msg').height(), width);         // 表示する際に画面の大きさを変更する
		$(this).addClass('active');       // クラスを追加
		$(this).text('△');                // テキスト変更
	}
}



// すべてのメモをテーブル表示する##############################################################################
function all_memo_visible(line_num, last_id){
  var files = get_file_list();
	var key_arr = ["id", "title", "memo", "create_time", "update_time", "hidden_flg", "group1", "group2"]
	var height = OP_TABLE_HEIGHT;
	var width  = OP_TABLE_WIDTH;
	// 画面用の処理
	if(!($('#all-memo').prop('user-width') === undefined && $('#all-memo').prop('user-height') === undefined)) {
		if($('#all-memo').prop('user-height') > window.outerHeight){height = $('#all-memo').prop('user-height');} else {height = window.outerHeight}
		if($('#all-memo').prop('user-width') > window.outerWidth){width  = $('#all-memo').prop('user-width');} else {width = window.outerWidth}
	}
	setWindow(height, width);
	// エラー確認時は$('tbody.scrollBody').cssの高さのマイナスを大きくすればメッセージが確認できます。(main処理でも記載があるのでそちらも消さないと意味がない)
  $('tbody.scrollBody').css({"height" : Number(window.outerHeight - 170) + "px", "width" : Number(window.outerWidth - 18) + "px"})
  $("#memo-table").empty(); //初期化
  var wak = '<tr id="th-group"><th>ID</th><th>Title</th><th>Memo</th><th>Create_Time</th><th>Update_Time</th><th>Hidden_flg</th><th>Group1</th><th>Group2</th></tr>';
  if(files.length < 1){return} // メモがないなら抜ける
  if(last_id === undefined){var i = files.length - 1;}else{var i = last_id; if(last_id >= files.length){i = files.length - 1}} // 表示されているIDで一番新しいID
  if(line_num === undefined){line_num = i - 20;  }else{line_num = i - line_num;}                                               // 表示するデータの数

	for (i; i >= line_num && i >= 0; i--) {
    var data_array = JSON.parse(file_rw(FILE + files[i], 0));
    wak += '<tr class="td-group">'
		for (j = 0; j < key_arr.length; j++) {
			if(j === 0){wak += '<td id="memo_id--' + data_array['id'] + '">';}else{wak += '<td>';} // ０の時はIDを挿入する
			wak += data_array[key_arr[j]] + '</td>\n'; // dataと閉じタグ
    }
		wak += '</tr>\n';
  }
  wak += '<tr id="visible-last-id" class="hidden_group"><td>' + i + '</td></tr>'
  $('#all-memo .latest').text(('00000' + files.length).slice(-5)); // 現在のメモ登録数
	$('#memo-table').append(wak);                                    // ファイルデータをテーブルに出力
	
	if(document.getElementById('memo_id--' + $('#all-memo .latest').text())){
    $('#all-memo .pre').addClass('hidden_group')
	}
	
	if(document.getElementById('memo_id--00001')){
		$('#all-memo .next').addClass('hidden_group')
	}
}


function all_task_visible(){
	var height = OP_TABLE_HEIGHT;
	var width  = OP_TABLE_WIDTH;
	// 画面用の処理
	if(!($('#all-task').prop('user-width') === undefined && $('#all-task').prop('user-height') === undefined)) {
		if($('#all-task').prop('user-height') > window.outerHeight){height = $('#all-task').prop('user-height');} else {height = window.outerHeight}
		if($('#all-task').prop('user-width') > window.outerWidth){width  = $('#all-task').prop('user-width');} else {width = window.outerWidth}
	}
	setWindow(height, width);
	$('#all-task-table').empty();
	$('#all-task .scrollBody').css({"height" : Number(window.outerHeight - 85) + "px", "width" : Number(window.outerWidth - 18) + "px"})
	var data_array = JSON.parse(file_rw(TASK_LIST, 0));
	for(var i = data_array.length - 1; i >= 0; i -- ){
		var html_table = '<tr id="task-num-' + i + '">'
		var data = data_array[i]
		html_table = html_table 
			+ '<td><textarea rows="4" class="task-text form-control" placeholder="タスクの内容"></textarea></td>'
			+ '<td>'
			+ '<select class="task-progress custom-select">'
			+ '<option value="作業中">作業中</option>'
			+	'<option value="予定">予定</option>'
			+	'<option value="完了">完了</option>'
			+	'<option value="保留">保留</option>'
		html_table = html_table
			+ '</select>'
			+	'</td>'
		+ '<td><input class="start form-control datepickr" value="' + data.start + '"></td>' 
		+ '<td><input class="end form-control datepickr" value="' + data.end + '"></td>'
		+ '<td class="command-btn-group">'
		+ '<span class="save btn btn-success fill-wh">保存<i class="ml-1 svg-save"></i></span>'
		+ '<span class="del ml-1 btn btn-danger fill-wh">削除<i class="ml-1 svg-remove"></i></span>'
		+ '</td>' 
		html_table = html_table + '</tr>'
		$('#all-task-table').append(html_table);
		$('#task-num-' + i + ' .task-progress').val(data.type);
		$('#task-num-' + i + ' .task-text').val(data.task);
	}
	svg_init();
}