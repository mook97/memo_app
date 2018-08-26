// Memo_app_Javascript_File

// 定数の定義
const FILE = location.href.replace('file:///', '').replace(location.href.split('/').pop(), '/csv/memo_app.csv');　// メモ出力用のCSVファイル
const INDENT = '  ';   　　    // Indent : 2 Spaces  タブキーをスペース２つに変換
const NORMAL_WIDTH = 350;  　　// 標準時の画面サイズ(横)
const NORMAL_HEIGHT = 395;　　 // 標準時の画面サイズ(縦)
const OP_DETAILS_HEIGHT = 595; // 詳細メニュー表示時の画面サイズ(縦)
const OP_TABLE_HEIGHT = 800;
const OP_TABLE_WIDTH = 800;

// メイン関数############################################################################################################################################################
$(function () {
	setWindow();
  
	if(loadText()){
		loadText();
	}

	// 保存機能
  $('#save').on('click', saveText);
  $(window).on('keydown', function(e) {
    // Ctrl + S
    if(e.ctrlKey && (e.keyCode === 83)) {
      saveText();
    }
  });
	
	// メモアプリ終了
  $('#cancel').on('click', function(e){
		saveText();
		window.close();
	});
  $(window).on('keydown', function(e) {
    // Ctrl + Q
    if(e.ctrlKey && (e.keyCode === 81)) {
			saveText();
			window.close();
    }
	});

	// 詳細設定表示
	$('#conf-detail-btn').on('click', acordion_move);
  $(window).on('keydown', function(e) {
    // Ctrl + D
    if(e.ctrlKey && (e.keyCode === 68)) {
      $('#conf-detail-btn').click();
    }
	});

	// 次のメモを開く
	$('#new').on('click', function(e){
		var id_str = $('#memo_id').text();
		saveText();
		if(loadText(Number(id_str.slice(id_str.search('[^0]'))) + 1) === 1){
			// 現在のメモの管理番号の最大値を超えた場合
			loadText(Number(id_str.slice(id_str.search('[^0]'))) + 1);
		}
	});

	// 前のメモを開く
	$('#pre').on('click', function(e){
		var id_str = $('#memo_id').text()
		saveText();
		loadText(Number(id_str.slice(id_str.search('[^0]'))) - 1);
	});

	// 新規メモを作成
  $(window).on('keydown', function(e) {
    // Ctrl + R
    if(e.ctrlKey && (e.keyCode === 82)) {
			saveText(1);
			loadText();
    }
	});

	// タブキーでインデント(スペース２つ分)
  var textarea = document.getElementById('memo_text');
  $('#memo_text').on('keydown', function(e) {
    if(e.keyCode === 9) {
        on_function(e, textarea);
    }
	});

	// すべてのメモをテーブル表示する
	$('#table-visible').on('click', all_memo_visible);
  $(window).on('keydown', function(e) {
    // Ctrl + T
    if(e.ctrlKey && (e.keyCode === 84)) {
      all_memo_visible();
    }
  });
});


// すべてのメモをテーブル表示する
function all_memo_visible(){
	$("#memo-input-form").addClass("hidden_group");
	$("#all-memo-table").removeClass("hidden_group");
	setWindow(OP_TABLE_HEIGHT, OP_TABLE_WIDTH);

	var csv_data = text_ToArray();

	if(csv_data.length < 2){
		msg_show('データの読み込みに失敗したかデータがありません(all_memo_visible)', 'alert-danger');
		return;
	} 

	var wak = "";
	for (i = 0; i < csv_data.length; i++) {
		wak += "<tr>\n";
		for (j = 0; j < csv_data[i].length; j++) {
			wak += "<td>";
			wak += csv_data[i][j];
			wak += "<td>\n";
		}
		wak += "</tr>\n";
	}
	$("#tttt").append(wak);
}

// loadText:CSVファイルの読み込み用##############################################################################
// 引数で管理番号の０埋めをのぞいた数字を渡す(なかったら最新のメモ)
// 戻り値(1の場合は新しいメモを作成する。)
function loadText(id) {
	all_select_item_ini(); // select要素の初期化  	
	var csv_data = text_ToArray();
	if(id === 0){id = csv_data.length -1} // 代入値が0なら最新に戻す
	if(id === csv_data.length){
		saveText(1);
		return 1; // 要素数と同じ番号ならいったん戻す。
	}

	if(id === undefined){id = csv_data.length -1}    // id(デフォルト値)
	if(id === 0){
		// 一番最初に開いたとき用
		saveText(1);
		return 1;
	}
	else{
		$('#memo_id').text(csv_data[id][0]);
		$('#memo_title').val(csv_data[id][1]);
		$('#memo_text').val(csv_data[id][2]);
		$('#memo_create').text(csv_data[id][3]);
		$('#memo_update').text(csv_data[id][4]);
		$('#group1').val(csv_data[id][6].slice(0, 2));
		$('#group2').val(csv_data[id][7].slice(0, 2));
	}
}

// saveText:CSVファイルへの保存用##############################################################################
function saveText(new_flg) {
  var fso = new ActiveXObject('Scripting.FileSystemObject');
	var file;
	var id_str = '';
	
	if(memo_file_exists(FILE)){
		file = fso.OpenTextFile(FILE, 1, false, false);
		var data = file.ReadAll();
		var csv_array = CSV_ToArray(data);
		file.Close();
	}
	else {
		msg_show('ファイル読み込みに失敗しました。(saveText)', 'alert-danger');
		return;
	}

	file = fso.OpenTextFile(FILE, 2, false, false); // ファイルがあれば開く(書き込み権限)

	// 新しいデータなら
	if(new_flg === 1){
		var new_id = ('00000' + csv_array.length).slice(-5);
		id_str = new_id
		csv_array[csv_array.length] = [new_id, '', '', getDateTime(), getDateTime(), 0, "00", "00"];
		// csv_array[0:ID, 1:Title, 2:Memo, 3:Create_time, 4:Update_time, 5:Hidden_flg]
	}
	else if($('#memo_id').text()){
		id_str = $('#memo_id').text()
		var group1_str = $('#group1').val() + ':' + $('#group1 option:selected').text();
		var group2_str = $('#group2').val() + ':' + $('#group2 option:selected').text();
		
		csv_array[id_str.slice(id_str.search('[^0]'))] = [$('#memo_id').text(), $('#memo_title').val(), $('#memo_text').val(), $('#memo_create').text(), getDateTime(), 0, group1_str, group2_str];
	}
	else{
		msg_show('データ読み込み中にIDが取得できませんでした(saveText)', 'alert-danger');
		return;
	}

  try {
		if(new_flg === 1){
			file.Write(Array_ToCSV(csv_array)); // 新規なら表示しない
			msg_show("新規メモを開きました","alert-success")
		}
		else{
			// これだと連打されたら表示する管理番号がおかしくなるが特に問題ないので放置します。
			file.Write(Array_ToCSV(csv_array));
			msg_show("メモを更新しました[管理番号：" + id_str + "]","alert-success")
		}
  }
  catch(e) {
		msg_show("ファイル書き込みに失敗しました。(saveText)", "alert-danger")
		return;
  }
  
  file.Close();
  file = null;
  fso = null;
}


// Array_ToCSV:配列をcsvで保存するfunction ##############################################################################
// https://qiita.com/banaoh/items/4119c0e23053b1cfa80b
function Array_ToCSV(content){
	var formatCSV = '';
  for (var i = 0; i < content.length; i++) {
		var value = content[i];
		for (var j = 0; j < value.length; j++) { 
			var innerValue = value[j]===null?'':value[j].toString();
			var result = innerValue.replace(/"/g, '""');
			result = '"' + result + '"';

      if (j > 0){
				formatCSV += ',';
      	formatCSV += result;
			}
			else if(j === 0) {
				formatCSV += result;
			}
    }
    formatCSV += '\r\n';  // 改行(Windows用)
	}
	return formatCSV;
}

// CSV_ToArrayを使用してファイルデータ取得から配列作成までを一気にする
function text_ToArray(){
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	var file;
	if(memo_file_exists(FILE) === false){
		return;
	}

	try {
			file = fso.OpenTextFile(FILE, 1, false, false);
			var data = file.ReadAll();
	}
	catch(e) {
			msg_show('ファイル読み込みに失敗しました。(text_ToArray)</br>アプリを再起動してください','alert-danger');
			return;
	}
	return CSV_ToArray(data); // 取得したファイルデータを配列にしてそのまま戻り値に使用
}

// CSV_ToArray:CSVを配列に変換 ##############################################################################
// http://memo.lovechu.net/2012/04/10-202257.php
function CSV_ToArray(text, delim) {
	if (!delim) delim = ',';
	var tokenizer = new RegExp(delim + '|\r?\n|[^' + delim + '"\r\n][^' + delim + '\r\n]*|"(?:[^"]|"")*"', 'g');

	var record = 0, field = 0, data = [['']], qq = /""/g;
	text.replace(/\r?\n$/, '').replace(tokenizer, function(token) {
		switch (token) {
			case delim: 
				data[record][++field] = '';
				break;
			case '\n': case '\r\n':
				data[++record] = [''];
				field = 0;
				break;
			default:
				data[record][field] = (token.charAt(0) != '"') ? token : token.slice(1, -1).replace(qq, '"');
		}
	});

	return data;
}

// memo_file_exists:メモ保存用のCSVがあるかないなら作成し初期化##############################################################################
function memo_file_exists(arg_file) {
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	r_data = false;

	if(fso.FileExists(arg_file)) {
		if(fso.GetFile(arg_file).Size === 0) {
			fso.DeleteFile(arg_file);
			r_data = false;
		}
		else{
			r_data = true;
		}
	}
	
	if(!(r_data)) {
		fso.CreateTextFile(arg_file, false, false);                                  // ファイル作成
		file = fso.OpenTextFile(arg_file, 2, false, false);                          // 作成したファイルを開く
		file.Write('"id","title","memo","create_time","Update_time","Hidden_flg","Group1","Group2"');  // デフォルト値
		file.close();                                                                // ファイルを閉じる
		r_data = true;
	}
	
	file = null;
    fso = null;
    if(r_data === false){msg_show('エラー(memo_file_exists)', 'alert-danger');}
	return r_data;
}

// setWindow:画面制御############################################################################################################################################################
function setWindow(height, width) {
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
	else if($('all-memo-table').hasClass('hidden_group')){
		
		var height = OP_TABLE_HEIGHT;
		var width = OP_TABLE_WIDTH;
	}
	else {
		var height = NORMAL_HEIGHT;
		var width = NORMAL_WIDTH;
	}
	
	setWindow(height + 50, width);
	$('#memo_app_msg').fadeIn(fadeIn).delay(delay).fadeOut(fadeOut);
	setTimeout(function(){
		setWindow(height, width);
 	},fadeIn + delay + fadeOut);
}

// selectboxの要素をまとめておく
function all_select_item_ini(){
	// Group1 
	$('#group1').empty();
	$('#group1').append('<option value="00">Group1</option>');
	$('#group1').append('<option value="01">data1-1</option>');
	$('#group1').append('<option value="02">data1-2</option>');
	$('#group1').append('<option value="03">data1-3</option>');
	$('#group1').append('<option value="04">data1-4</option>');
	$('#group1').append('<option value="05">data1-5</option>');

	// Group2 
	$('#group2').empty();
	$('#group2').append('<option value="00">Group2</option>');
	$('#group2').append('<option value="01">data2-1</option>');
	$('#group2').append('<option value="02">data2-2</option>');
	$('#group2').append('<option value="03">data2-3</option>');
	$('#group2').append('<option value="04">data2-4</option>');
	$('#group2').append('<option value="05">data2-5</option>');
}

// on_function:タブキーでインデント##############################################################################
function on_function(e, textarea) {
    e.preventDefault();
    var start = textarea.selectionStart;
    var end   = textarea.selectionEnd;
    var before = textarea.value.substring(0, start);
    var after  = textarea.value.substring(end, textarea.value.length);
    textarea.value = before + INDENT + after;
    textarea.selectionStart = textarea.selectionEnd = end + INDENT.length - (end - start);
}

// acordion_move:詳細メニューについて##############################################################################
function acordion_move(){
	// 詳細メニュー入力用に拡大
	if($(this).hasClass('active')){
		setWindow();
		$(this).removeClass('active');
		$(this).text('▽');
	}
	else{
		setWindow(OP_DETAILS_HEIGHT);         // 表示する際に画面の大きさを変更する
		$(this).addClass('active');       // クラスを追加
		$(this).text('△');                // テキスト変更 
	}
}

// getDateTime:日時取得用の関数##############################################################################
function getDateTime() {
  var d = new Date();
  return d.getFullYear()
         + '/' + ('0' + (d.getMonth() + 1)).slice(-2)
         + '/' + ('0' + d.getDate()).slice(-2)
         + '-' + ('0' + d.getHours()).slice(-2)
         + ':' + ('0' + d.getMinutes()).slice(-2)
         + ':' + ('0' + d.getSeconds()).slice(-2);
}