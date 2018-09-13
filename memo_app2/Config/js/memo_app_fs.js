// loadText:CSVファイルの読み込み用##############################################################################
// 引数で管理番号の０埋めをのぞいた数字を渡す(なかったら最新のメモ)
// 戻り値(1の場合は新しいメモを作成する。)
function loadText(id, new_flg, msg_hidden) {
  // var last_id = get_last_id();
  // var new_id = Number(last_id.slice(last_id.search('[^0]'))) + 1; // 新規作成する場合
  all_select_item_ini(); // select要素の初期化

  // try {
  //   if(id === undefined){
  //     id = last_id;                         // それ以外の時は最後に作成されたファイルをデフォルトで開く
  //     if(last_id === '00000'){id = '00001'} // 初めて起動したとき用
  //   }
  //   else if(new_flg === 1){
  //     var id = ('00000' + new_id).slice(-5);
  //   }
  //   else if(Number(id.slice(id.search('[^0]'))) >= new_id){
  //     id = "00001";
  //   }
  //   else if(Number(id.slice(id.search('[^0]'))) <= 0){
  //     id = last_id;
  //   }
  // }catch(e){
  //   alert("sippai");
  // }
  var new_id = 0;
  id = "00001"

  // ファイルの読み込み
  try {
    var data = file_rw(FILE + id + ".json", 0); // 読み込み権限で表示
  }catch(e) {
    file_rw(FILE + id + ".json", 1, '{"id":"' + id + '","title":"","memo":"","create_time":"' + getDateTime() + '","update_time":"","hidden_flg":0,"group1":"00:Group1","group2":"00:Group2"}');
    var data = file_rw(FILE + id + ".json", 0); // 読み込み権限で表示
    
  }


  if(Number(id.slice(id.search('[^0]'))) >= new_id){set_last_id(id)}
  alert(data + "++++++++++++++++++++");
  var data_array = JSON.parse(data); // ファイルのテキスト(json)のParse
  set_memo_items(data_array);        // 配列を画面に出力
  // if(!(msg_hidden === 1)){
  //   msg_show('更新しました。(loadText)', 'alert-success');
  // }
}

// saveText:ファイルへの保存用##############################################################################
function saveText(id,arg1, msg_hidden) {
  if(id === undefined){id = $('#memo_id').text();}
  var items_array = get_memo_json();
  file_rw(FILE + id + '.json', 2, JSON.stringify(items_array)); // ファイルがあれば開く(書き込み権限)
  if(!(msg_hidden === 1)){
    msg_show('保存しました。(saveText)', 'alert-success');
  }
}

// jsonファイルの削除##############################################################################
function delete_text(id){
  file_rw(FILE + id + '.json', 2, "");
  var last_id = get_last_id();                     // 一番最後のデータを消された場合・・
  if(id === undefined){id = $('#memo_id').text();} // 引数指定がない場合は・・
  if(id === last_id){
    var new_id = Number(last_id.slice(last_id.search('[^0]'))) -1;
    set_last_id(('00000' + new_id).slice(-5));
  }
}

// 名前を付けてファイルを保存##############################################################################
function save_as(text, file_name){
  var data = get_memo_json();
  if(text === undefined){
    text = 'タイトル:' + data['title'] + '\r\n本文' + data['memo'] 
            + '\r\ngroup1:' + data['group1'] + '\r\ngroup2:' + data['group2'] 
            + '\r\n作成日：' + data['create_time'] + '\r\n最終更新日' + data['update_time']
  }
  if(file_name === undefined){file_name = data['id'] + '_' + data['create_time'] + '.txt'}

  var b = new Blob(["\uFEFF", text]);
  if (navigator.msSaveBlob) {
      navigator.msSaveOrOpenBlob(b, file_name);
  } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.setAttribute('download', file_name);
      a.dispatchEvent(new CustomEvent('click'));
  }
}

// すべてのメモをテーブル表示する##############################################################################
function all_memo_visible(line_num, last_id){
  var files = get_file_list();
  var key_arr = ["id", "title", "memo", "create_time", "update_time", "hidden_flg", "group1", "group2"]
  // 画面用の処理
	$("#memo-input-form").addClass("hidden_group");
	$("#all-memo").removeClass("hidden_group");
  setWindow(OP_TABLE_HEIGHT, OP_TABLE_WIDTH);
  // ファイルデータをテーブルに出力
  $("#memo-table").empty(); //初期化
  var wak = '<tr id="th-group"><th>ID</th><th>Title</th><th>Memo</th><th>Create_Time</th><th>Update_Time</th><th>Hidden_flg</th><th>Group1</th><th>Group2</th></tr>';
  if(files.length < 1){return} // メモがないなら抜ける

  if(last_id === undefined){
    var i = files.length - 1;
  }
  else{
    var i = last_id;
    if(last_id >= files.length){i = files.length - 1}
  }
  
  if(line_num === undefined){
    line_num = i - 20;
  }
  else{
    line_num = i - line_num;
  }

	for (i; i >= line_num && i >= 0; i--) {
    var data_array = JSON.parse(file_rw(FILE + files[i], 0));
    wak += '<tr class="td-group">'
		for (j = 0; j < key_arr.length; j++) {
			if(j === 0){
        wak += '<td id="memo_id--' + data_array['id'] + '">';
      }
      else{
        wak += '<td>';
      }
      wak += data_array[key_arr[j]];
      wak += '</td>\n';
    }
		wak += '</tr>\n';
  }
  wak += '<tr id="visible-last-id" class="hidden_group"><td>' + i + '</td></tr>'
  $('#all-memo .latest').text(('00000' + files.length).slice(-5));
  $('#memo-table').append(wak);
}



// 一番最後に作成されたデータを取得する##############################################################################
function get_last_id(){
  var data_array = JSON.parse(file_rw(LAST_DATA_FILE, 0));
  var result = data_array["last"];
  return result;
}

// 一番最後に作成されたデータを更新する##############################################################################
function set_last_id(new_id){
  // ファイルのテキスト(json)のParse
  file_rw(LAST_DATA_FILE, 1, '{"last":"'+ new_id + '"');
}


// ファイルを読み込み権限で開き全データを返す。
function file_rw(arg_file, rw, arg_data){
  const TYPE_BINARY = 1; // バイナリ(保存データの種類-http://msdn.microsoft.com/ja-jp/library/cc389884.aspx)
  const TYPE_TEXT   = 2; // テキスト(保存データの種類)
  const READ_ALL   = -1; // 全行    (読み込み方法-http://msdn.microsoft.com/ja-jp/library/cc389881.aspx)
  const READ_LINE  = -2; // 一行ごと(読み込み方法)
  const WRITE_CHAR = 0; // 改行なし(書き込み方法-http://msdn.microsoft.com/ja-jp/library/cc389886.aspx)
  const WRITE_LINE = 1; // 改行あり(書き込み方法)
  const SAVE_TEXT       = 1; // ない場合は新規作成(ファイルの保存方法-http://msdn.microsoft.com/ja-jp/library/cc389870.aspx)
  const SAVE_WRITE_TEXT = 2; // ある場合は上書き  (ファイルの保存方法)

  var stream     = new ActiveXObject("ADODB.Stream");  // 必要なライブラリを読み込み
  stream.Type    = TYPE_TEXT;                          // 読み込みタイプをテキスト形式で
  stream.charset = "utf-8";                            // ファイルの文字コード
  stream.Mode    = 8;                                  // ファイルの読み取りモード
  stream.Open();

  if(rw === 0){
    // read
    try {
      stream.LoadFromFile(arg_file);          // ファイルを読み込み
      var data = stream.ReadText(READ_ALL); // ファイルから全データを取得する
      stream.Close();  // オブジェクトを閉じる
      stream = null;   // 後処理
      return data;   // 戻り値
    }catch(e) {
      msg_show('ファイル読み込みに失敗しました。(read_ALL)', 'alert-danger');
      return;
    }
  }else if(rw === 1) {
    // write
    try {
      stream.LoadFromFile(arg_file);          // ファイルを読み込み
      stream.SetEOS();
      stream.WriteText(arg_data, WRITE_LINE); // ファイルから全データを取得する
      stream.SaveToFile(arg_file, SAVE_WRITE_TEXT);
      stream.Close();  // オブジェクトを閉じる
      stream = null;   // 後処理
    }catch(e) {
      msg_show('ファイル書き込みに失敗しました。(read_ALL)', 'alert-danger');
      return;
    }
  }

}

function get_file_list(){
  var fso = new ActiveXObject('Scripting.FileSystemObject');
  var files = [];
  // ファイルを一つずつ処理する
  var e = new Enumerator(fso.GetFolder(FILE).Files);
  for (; !e.atEnd(); e.moveNext()) {
    var file = e.item();
    if(file.Name === 'all_task.json' || file.Name === 'last_data_file.json'){
    }
    else{
      files.push(file.Name);
    }
  }
  return files;
}